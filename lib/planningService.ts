// ============================================
// Types

import { createClient } from "./client";

// ============================================
type Day = "Lundi" | "Mardi" | "Mercredi" | "Jeudi" | "Vendredi";
type TimeSlot = "7h45" | "8h00" | "8h30" | "10h00" | "11h30" | "12h00" | "13h30" | "14h00" | "15h00" | "15h30" | "16h00";
type Agent = "Christelle" | "Manon" | "Lana";

interface ResidentConstraint {
  resident_id: string;
  allowed_days?: Day[];
  disallowed_days?: Day[];
  schedule_hours?: TimeSlot[];
}

interface PlanningDay {
  [time: string]: string;
}

interface PlanningWeek {
  [day: number]: PlanningDay;
}

interface MonthlyPlanning {
  title: string;
  agent: Agent;
  weeks: PlanningWeek[];
}

// ============================================
// Configuration
// ============================================
// Semaines où Lana travaille (À MODIFIER selon tes besoins)
const LANA_ACTIVE_WEEKS: number[] = [1, 3]; // Exemple : semaines 1 et 3 du mois

// Liste des résidents sans contraintes (à remplir avec tes données)
let UNCONSTRAINED_RESIDENTS: string[] = [];

// ============================================
// Templates des agents
// ============================================
const AGENT_TEMPLATES: Record<Agent, Record<Day, Record<TimeSlot, string>>> = {
  Christelle: {
    Lundi: {
      "8h00": "Hall 1 ou 2",
      "8h30": "Ménage",
      "10h00": "Ménage",
      "11h30": "Pause repos",
      "12h00": "Ménage",
      "13h30": "Ménage",
      "15h00": "Parties communes",
      "16h00": "Fin",
    },
    Mardi: {
      "8h00": "Hall 1 ou 2",
      "8h30": "Ménage",
      "10h00": "Ménage",
      "11h30": "Pause repos",
      "12h00": "Ménage",
      "13h30": "Ménage",
      "15h00": "Parties communes",
      "16h00": "Fin",
    },
    Mercredi: {
      "8h00": "Hall 1 ou 2",
      "8h30": "Ménage",
      "10h00": "Ménage",
      "11h30": "Fin",
    },
    Jeudi: {
      "7h45": "Hall 1 ou 2",
      "8h30": "Ménage",
      "10h00": "Ménage",
      "11h30": "Pause repos",
      "12h00": "Ménage",
      "13h30": "Ménage",
      "15h00": "Parties communes",
      "16h00": "Fin",
    },
    Vendredi: {
      "8h00": "Hall 1 ou 2",
      "8h30": "Ménage",
      "10h00": "Navette",
      "11h30": "Lessives",
      "12h00": "Fin",
    },
  },
  Manon: {
    Lundi: {
      "8h00": "Hall 1 ou 2",
      "8h30": "Ménage",
      "10h00": "Ménage",
      "11h30": "Pause repos",
      "12h00": "Plonge",
      "14h00": "Ménage",
      "15h30": "Fin",
    },
    Mardi: {
      "8h00": "Hall 1 ou 2",
      "8h30": "Ménage",
      "10h00": "Ménage",
      "11h30": "Pause repos",
      "12h00": "Plonge",
      "14h00": "Ménage",
      "15h30": "Fin",
    },
    Mercredi: {
      "8h00": "Hall 1 ou 2",
      "8h30": "Ménage",
      "10h00": "Ménage",
      "11h30": "Pause repos",
      "12h00": "Plonge",
      "14h00": "Ménage",
      "15h30": "Fin",
    },
    Jeudi: {
      "8h00": "Hall 1 ou 2",
      "8h30": "Ménage",
      "10h00": "Ménage",
      "11h30": "Pause repos",
      "12h00": "Plonge",
      "14h00": "Ménage",
      "15h30": "Fin",
    },
    Vendredi: {
      "8h00": "Hall 1 ou 2",
      "8h30": "Ménage",
      "10h00": "Ménage",
      "11h30": "Pause repos",
      "12h00": "Plonge",
      "14h00": "Ménage",
      "15h30": "Fin",
    },
  },
  Lana: {
    Lundi: {
      "8h00": "Hall 1 ou 2",
      "8h30": "Ménage",
      "10h00": "Ménage",
      "11h30": "Pause repos",
      "12h00": "Plonge",
      "14h00": "Ménage",
      "15h30": "Fin",
    },
    Mardi: {
      "8h00": "Hall 1 ou 2",
      "8h30": "Ménage",
      "10h00": "Ménage",
      "11h30": "Pause repos",
      "12h00": "Plonge",
      "14h00": "Ménage",
      "15h30": "Fin",
    },
    Mercredi: {
      "8h00": "Hall 1 ou 2",
      "8h30": "Ménage",
      "10h00": "Ménage",
      "11h30": "Pause repos",
      "12h00": "Plonge",
      "14h00": "Ménage",
      "15h30": "Fin",
    },
    Jeudi: {
      "8h00": "Hall 1 ou 2",
      "8h30": "Ménage",
      "10h00": "Ménage",
      "11h30": "Pause repos",
      "12h00": "Plonge",
      "14h00": "Ménage",
      "15h30": "Fin",
    },
    Vendredi: {
      "8h00": "Hall 1 ou 2",
      "8h30": "Ménage",
      "10h00": "Ménage",
      "11h30": "Pause repos",
      "12h00": "Plonge",
      "14h00": "Ménage",
      "15h30": "Fin",
    },
  },
};

// ============================================
// Fonctions Supabase
// ============================================

const supabase = createClient();

/**
 * Récupérer les contraintes des résidents depuis Supabase.
 */
async function fetchResidentConstraints(): Promise<ResidentConstraint[]> {
  const { data, error } = await supabase
    .from('constraintes')
    .select('resident_id, allowed_days, disallowed_days, schedule_hours');

  if (error) {
    throw new Error(`Erreur lors de la récupération des contraintes : ${error.message}`);
  }

  return data || [];
}

/**
 * Récupérer la liste des résidents sans contraintes.
 * (Optionnel : si tu as une table `residents` sans contraintes)
 */
async function fetchUnconstrainedResidents(): Promise<string[]> {
  const { data, error } = await supabase
    .from('residents')
    .select('resident_id')
    .not('constraintes.resident_id', 'is', null); // Exemple : résidents sans entrée dans `constraintes`

  if (error) {
    throw new Error(`Erreur lors de la récupération des résidents : ${error.message}`);
  }

  return data.map((row: any) => row.resident_id);
}

// ============================================
// Fonctions utilitaires
// ============================================

function getWeeksInMonth(mois: string, année: number): number[] {
  const monthIndex = new Date(`${mois} 1, ${année}`).getMonth();
  const firstDay = new Date(année, monthIndex, 1);
  const lastDay = new Date(année, monthIndex + 1, 0);

  const firstDayOfYear = new Date(année, 0, 1);
  const daysBetweenFirstDayAndFirstDayOfYear = (firstDay.getTime() - firstDayOfYear.getTime()) / (1000 * 60 * 60 * 24);
  const firstWeekOfMonth = Math.ceil((daysBetweenFirstDayAndFirstDayOfYear + firstDayOfYear.getDay() + 1) / 7);

  const daysBetweenLastDayAndFirstDayOfYear = (lastDay.getTime() - firstDayOfYear.getTime()) / (1000 * 60 * 60 * 24);
  const lastWeekOfMonth = Math.ceil((daysBetweenLastDayAndFirstDayOfYear + firstDayOfYear.getDay() + 1) / 7);

  return Array.from({ length: lastWeekOfMonth - firstWeekOfMonth + 1 }, (_, i) => i + firstWeekOfMonth);
}

function findAvailableResident(
  constraints: ResidentConstraint[],
  day: Day,
  timeSlot: TimeSlot,
  usedResidents: Set<string>
): string | null {
  const constrainedResidents = constraints.filter((c) => {
    if (c.disallowed_days && c.disallowed_days.includes(day)) return false;
    if (c.allowed_days && !c.allowed_days.includes(day)) return false;
    if (c.schedule_hours && !c.schedule_hours.includes(timeSlot)) return false;
    return true;
  });

  for (const resident of constrainedResidents) {
    if (!usedResidents.has(resident.resident_id)) {
      return resident.resident_id;
    }
  }

  for (const residentId of UNCONSTRAINED_RESIDENTS) {
    if (!usedResidents.has(residentId)) {
      return residentId;
    }
  }

  return null;
}

function generateWeekPlanning(
  agent: Agent,
  weekNumber: number,
  constraints: ResidentConstraint[]
): PlanningWeek {
  const weekPlanning: PlanningWeek = {};
  const days: Day[] = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
  let hallNumber = 1;

  for (const dayIndex in days) {
    const day = days[dayIndex];
    const dayPlanning: PlanningDay = {};
    const usedResidents = new Set<string>();

    const template = AGENT_TEMPLATES[agent][day];

    for (const [timeSlot, task] of Object.entries(template)) {
      if (timeSlot === "8h00" || timeSlot === "7h45") {
        const hall = `Hall ${hallNumber}`;
        dayPlanning[timeSlot as TimeSlot] = hall;
        hallNumber = hallNumber === 1 ? 2 : 1;
      } else if (task === "Ménage" || task === "Plonge") {
        const resident = findAvailableResident(
          constraints,
          day,
          timeSlot as TimeSlot,
          usedResidents
        );
        if (resident) {
          dayPlanning[timeSlot as TimeSlot] = resident;
          usedResidents.add(resident);
        } else {
          dayPlanning[timeSlot as TimeSlot] = task;
        }
      } else {
        dayPlanning[timeSlot as TimeSlot] = task;
      }
    }

    weekPlanning[parseInt(dayIndex) + 1] = dayPlanning;
  }

  return weekPlanning;
}

function redistributeLanaTasks(
  plannings: MonthlyPlanning[],
  weeksInMonth: number[],
  lanaActiveWeeks: number[]
): void {
  const christellePlanning = plannings.find((p) => p.agent === "Christelle")!;
  const manonPlanning = plannings.find((p) => p.agent === "Manon")!;

  const inactiveWeeks = weeksInMonth.filter((w) => !lanaActiveWeeks.includes(w));

  for (const weekNumber of inactiveWeeks) {
    const lanaWeekPlanning = generateWeekPlanning("Lana", weekNumber, []);

    for (const dayNumber in lanaWeekPlanning) {
      const lanaDayPlanning = lanaWeekPlanning[parseInt(dayNumber)];

      for (const [timeSlot, task] of Object.entries(lanaDayPlanning)) {
        if (task === "Ménage" || task === "Plonge") {
          const targetAgent = parseInt(dayNumber) % 2 === 0 ? "Christelle" : "Manon";
          const targetPlanning = targetAgent === "Christelle" ? christellePlanning : manonPlanning;
          const targetWeek = targetPlanning.weeks[weekNumber - 1];
          if (targetWeek && targetWeek[parseInt(dayNumber)]) {
            const targetDay = targetWeek[parseInt(dayNumber)];
            if (targetDay && (targetDay[timeSlot as TimeSlot] === "Ménage" || targetDay[timeSlot as TimeSlot] === "Plonge")) {
              targetDay[timeSlot as TimeSlot] = `Ménage (Lana)`;
            }
          }
        }
      }
    }
  }
}

// ============================================
// Fonction principale
// ============================================
async function generateMonthlyPlannings(
  mois: string,
  année: number
): Promise<MonthlyPlanning[]> {
  // 1. Récupérer les contraintes depuis Supabase
  const constraints = await fetchResidentConstraints();

  // 2. Récupérer les résidents sans contraintes (optionnel)
  const unconstrainedResidents = await fetchUnconstrainedResidents();
  UNCONSTRAINED_RESIDENTS = unconstrainedResidents;

  // 3. Obtenir les semaines du mois
  const weeksInMonth = getWeeksInMonth(mois, année);

  // 4. Initialiser les plannings
  const plannings: MonthlyPlanning[] = [
    { title: `Planning ménage - ${mois} ${année}`, agent: "Christelle", weeks: [] },
    { title: `Planning ménage - ${mois} ${année}`, agent: "Manon", weeks: [] },
    { title: `Planning ménage - ${mois} ${année}`, agent: "Lana", weeks: [] },
  ];

  // 5. Générer le planning pour chaque semaine et chaque agent
  for (const weekNumber of weeksInMonth) {
    const isLanaActive = LANA_ACTIVE_WEEKS.includes(weekNumber);

    for (const planning of plannings) {
      if (planning.agent === "Lana" && !isLanaActive) continue;

      const weekPlanning = generateWeekPlanning(planning.agent, weekNumber, constraints);
      planning.weeks.push(weekPlanning);
    }
  }

  // 6. Redistribuer les tâches de Lana
  redistributeLanaTasks(plannings, weeksInMonth, LANA_ACTIVE_WEEKS);

  return plannings;
}

// ============================================
// Exécution
// ============================================
(async () => {
  try {
    // Générer les plannings pour septembre 2026
    const plannings = await generateMonthlyPlannings("Septembre", 2026);

    // Afficher le résultat
    console.log(JSON.stringify(plannings, null, 2));

    // Optionnel : Enregistrer en base de données
    // await savePlanningsToDatabase(plannings);
  } catch (error) {
    console.error("Erreur :", error);
  }
})();