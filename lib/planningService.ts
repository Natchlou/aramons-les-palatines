import "dotenv/config";
import {
  getDaysInMonth,
  getDay,
  format,
  getISOWeek,
  isWeekend,
} from "date-fns";
import { fr } from "date-fns/locale";
import { createClient } from "./client";

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export interface SupabaseResidentJoin {
  id: string;
  room: string;
  first_name: string | null;
  last_name: string | null;
  building: string | null;
}

export interface Resident {
  id: string;
  room: string;
  nom: string;
  building: string;
  nb: number;
  time: string;
  day: string;
  assigned: number;
}

export interface Task {
  time: string;
  resident?: string;
  room?: string;
  building?: string;
  type: string;
}

export interface DayScheduleFormatted {
  date: string;
  tasks: Task[];
  absence?: {
    type: string;
    replacedBy: string;
  };
}

export interface WeekSchedule {
  label: string;
  days: DayScheduleFormatted[];
}

export interface MonthlyScheduleResponse {
  title: string;
  subtitle: string;
  agent: string;
  weeks: WeekSchedule[];
}

export interface DaySlots {
  1: string | null; // 08H30
  2: string | null; // 10H00
  3: string | null; // 12H00
  4: string | null; // 13H30
}

// ==========================================
// 3. RÉCUPÉRATION DES DONNÉES DEPUIS SUPABASE
// ==========================================

export async function fetchResidentsFromSupabase(): Promise<Resident[]> {
  const supabase = createClient();

  // 1. Récupérer tous les résidents
  const { data: residentsData, error: resError } = await supabase
    .from("residents")
    .select("id, room, first_name, last_name, building");

  if (resError) {
    console.error("Erreur lors de la récupération des résidents :", resError);
    throw resError;
  }

  // 2. Récupérer toutes les contraintes
  const { data: constraintsData, error: constError } = await supabase
    .from("constraintes")
    .select(
      "resident_id, per_month, schedule_hours, allowed_days, disallow_days, additional_service",
    );

  if (constError) {
    console.error(
      "Erreur lors de la récupération des contraintes :",
      constError,
    );
  }

  const constraintsMap = new Map<string, any>();
  if (constraintsData) {
    for (const c of constraintsData) {
      constraintsMap.set(c.resident_id, c);
    }
  }

  const residents: Resident[] = [];

  for (const item of residentsData || []) {
    const fullName =
      [item.first_name, item.last_name].filter(Boolean).join(" ") || item.room;

    if (!item.room || fullName.includes("Test User")) {
      continue;
    }

    const c = constraintsMap.get(item.id) || null;

    const nb = c?.per_month ?? 2;
    if (nb === 0) continue;

    const scheduleHours =
      c?.schedule_hours && Array.isArray(c.schedule_hours)
        ? c.schedule_hours.join(" ").toUpperCase()
        : "";

    let dayConstraint = "";
    if (c?.disallow_days && Array.isArray(c.disallow_days)) {
      dayConstraint += `PAS LE ${c.disallow_days.join(" ").toUpperCase()} `;
    }
    if (c?.allowed_days && Array.isArray(c.allowed_days)) {
      dayConstraint += c.allowed_days.join(" ").toUpperCase();
    }
    if (c?.additional_service) {
      dayConstraint += ` ${c.additional_service.toUpperCase()}`;
    }

    residents.push({
      id: item.id,
      room: item.room,
      nom: fullName,
      building: item.building || "1",
      nb,
      time: scheduleHours,
      day: dayConstraint.trim(),
      assigned: 0,
    });
  }

  return residents;
}

// ==========================================
// 4. ALGORITHME DE GÉNÉRATION DU PLANNING
// ==========================================

export function canAssign(
  resident: Resident,
  dateObj: Date,
  slot: 1 | 2 | 3 | 4,
  daySchedule: DaySlots,
): boolean {
  const weekday = getDay(dateObj); // 0: Dimanche, 1: Lundi, ..., 5: Vendredi

  const dayC = resident.day;
  if (dayC.includes("VENDREDI") && dayC.includes("PAS") && weekday === 5)
    return false;
  if (dayC.includes("MARDI") && dayC.includes("PAS") && weekday === 2)
    return false;

  for (const s of [1, 2, 3, 4] as const) {
    if (daySchedule[s] === resident.room) {
      return false;
    }
  }

  return true;
}

export function generateMonthlySchedule(
  residents: Resident[],
  year: number,
  month: number,
  plonge: boolean = false,
): MonthlyScheduleResponse {
  const totalDays = getDaysInMonth(new Date(year, month - 1));
  const workDays: Date[] = [];

  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(year, month - 1, day);
    if (!isWeekend(d)) {
      workDays.push(d);
    }
  }

  const scheduleMap = new Map<string, DaySlots>();
  workDays.forEach((d) => {
    scheduleMap.set(d.toISOString(), { 1: null, 2: null, 3: null, 4: null });
  });

  // Mélange initial des résidents pour éviter l'ordre alphabétique ou d'ID
  const shuffledResidents = [...residents].sort(() => Math.random() - 0.5);

  // Tri souple : on place les contraintes prioritaires en premier, mais mélangées
  shuffledResidents.sort((a, b) => {
    const aHasConstraint = (a.time ? 1 : 0) + (a.day ? 1 : 0);
    const bHasConstraint = (b.time ? 1 : 0) + (b.day ? 1 : 0);
    if (bHasConstraint !== aHasConstraint) {
      return bHasConstraint - aHasConstraint;
    }
    return b.nb - a.nb;
  });

  for (const res of shuffledResidents) {
    while (res.assigned < res.nb) {
      let assignedInLoop = false;

      // Mélange des jours de travail à chaque résident pour briser l'alignement linéaire
      const shuffledWorkDays = [...workDays].sort(() => Math.random() - 0.5);

      // Passe 1 : Recherche sur les jours mélangés
      for (const d of shuffledWorkDays) {
        if (res.assigned >= res.nb) break;
        const daySchedule = scheduleMap.get(d.toISOString())!;

        // Mélange des créneaux (slots 1 à 4) pour ne pas toujours assigner la même heure
        const slots: (1 | 2 | 3 | 4)[] = [1, 2, 3, 4].sort(() => Math.random() - 0.5) as any;

        for (const slot of slots) {
          if (
            daySchedule[slot] === null &&
            canAssign(res, d, slot, daySchedule)
          ) {
            const currentWeek = getISOWeek(d);
            const weekAssignedCount = workDays
              .filter((wd) => getISOWeek(wd) === currentWeek)
              .reduce((acc, wd) => {
                const s = scheduleMap.get(wd.toISOString())!;
                return (
                  acc +
                  ([1, 2, 3, 4] as const).filter(
                    (slotKey) => s[slotKey] === res.room,
                  ).length
                );
              }, 0);

            if (res.nb <= 5 && weekAssignedCount >= 1) {
              continue;
            }

            daySchedule[slot] = res.room;
            res.assigned++;
            assignedInLoop = true;
            break;
          }
        }
        if (assignedInLoop) break;
      }

      // Passe 2 : Repli si nécessaire avec mélange des jours
      if (!assignedInLoop) {
        const shuffledWorkDays2 = [...workDays].sort(() => Math.random() - 0.5);
        for (const d of shuffledWorkDays2) {
          if (res.assigned >= res.nb) break;
          const daySchedule = scheduleMap.get(d.toISOString())!;
          const slots: (1 | 2 | 3 | 4)[] = [1, 2, 3, 4].sort(() => Math.random() - 0.5) as any;

          for (const slot of slots) {
            if (
              daySchedule[slot] === null &&
              canAssign(res, d, slot, daySchedule)
            ) {
              daySchedule[slot] = res.room;
              res.assigned++;
              assignedInLoop = true;
              break;
            }
          }
          if (assignedInLoop) break;
        }
      }

      if (!assignedInLoop) break;
    }
  }

  const residentMap = new Map(residents.map((r) => [r.room, { nom: r.nom, building: r.building }]));
  const weeksMap = new Map<number, DayScheduleFormatted[]>();

  workDays.forEach((d) => {
    const isoWeek = getISOWeek(d);
    if (!weeksMap.has(isoWeek)) {
      weeksMap.set(isoWeek, []);
    }

    const daySchedule = scheduleMap.get(d.toISOString())!;
    const tasks: Task[] = [];
    const weekday = getDay(d);

    if (weekday === 1 || weekday === 5) {
      const bld = weekday === 1 ? "1" : "2";
      tasks.push({ time: "08H00", resident: "Hall d'entrée", building: bld, type: "hall" });
    }

    if (daySchedule[1]) {
      const resInfo = residentMap.get(daySchedule[1]);
      tasks.push({ time: "08H30", resident: resInfo?.nom || "", room: daySchedule[1], building: resInfo?.building || "1", type: "menage" });
    }
    if (daySchedule[2]) {
      const resInfo = residentMap.get(daySchedule[2]);
      tasks.push({ time: "10H00", resident: resInfo?.nom || "", room: daySchedule[2], building: resInfo?.building || "1", type: "menage" });
    }

    tasks.push({ time: "11H30", resident: "—", type: "pause" });

    if (daySchedule[3]) {
      const resInfo = residentMap.get(daySchedule[3]);
      tasks.push({ time: "12H00", resident: resInfo?.nom || "", room: daySchedule[3], building: resInfo?.building || "1", type: "menage" });
    }
    if (plonge && weekday === 2) {
      tasks.push({ time: "12H00", resident: "Plonge cuisine", building: "1", type: "plonge" });
    }
    if (daySchedule[4]) {
      const resInfo = residentMap.get(daySchedule[4]);
      tasks.push({ time: "13H30", resident: resInfo?.nom || "", room: daySchedule[4], building: resInfo?.building || "1", type: "menage" });
    }

    const frenchDateStr = format(d, "EEEE d MMMM", { locale: fr });
    const formattedDate = frenchDateStr.charAt(0).toUpperCase() + frenchDateStr.slice(1);

    weeksMap.get(isoWeek)!.push({ date: formattedDate, tasks });
  });

  const formattedWeeks: WeekSchedule[] = [];
  for (const [weekNum, days] of weeksMap.entries()) {
    if (days.length === 0) continue;
    const firstDayStr = days[0].date;
    const lastDayStr = days[days.length - 1].date;
    formattedWeeks.push({
      label: `Semaine du ${firstDayStr.split(" ")[1]} au ${lastDayStr.split(" ")[1]}`,
      days,
    });
  }

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  return {
    title: `Planning ménage — ${monthNames[month - 1]} ${year}`,
    subtitle: "Résidence Séniors Aramons / Les Palatines",
    agent: "Sophie MARTIN",
    weeks: formattedWeeks,
  };
}

// ==========================================
// 5. FONCTIONS DE SAUVEGARDE ET EXÉCUTION
// ==========================================

export async function savePlanningToSupabase(
  schedule: MonthlyScheduleResponse,
) {
  const supabase = createClient();
  const { data, error } = await supabase.from("planning").insert([
    {
      date: new Date().toISOString().split("T")[0],
      data: schedule,
    },
  ]);

  if (error) {
    console.error("Erreur sauvegarde planning :", error);
    throw error;
  }

  return data;
}

export async function generateAndSaveMonthlyPlanning(
  year: number,
  month: number,
  plonge: boolean = false,
) {
  const residents = await fetchResidentsFromSupabase();
  const schedule = generateMonthlySchedule(residents, year, month, plonge);
  await savePlanningToSupabase(schedule);
  return schedule;
}
