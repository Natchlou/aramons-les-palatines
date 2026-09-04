// planningEngine.ts
import { Resident, Agent, TimeSlot, PlanningResult, PlanningDay, UnscheduledItem, ScheduledTask, ResidentConstraint } from './types';

// Constantes
const DURATION_MINUTES = 90; // Durée d'un créneau en minutes
const BREAK_START = 11.5;    // Début de la pause (11h30)
const BREAK_END = 12.0;      // Fin de la pause (12h00)
const WORK_START = 8.0;      // Début de la journée (8h00)
const WORK_END = 17.0;       // Fin de la journée (17h00)

// Fonctions utilitaires (inchangées)
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getDayOfWeek(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 6 : day; // Dimanche (0) → 6, Samedi (6) → 6
}

function isWeekday(date: Date): boolean {
  const day = getDayOfWeek(date);
  return day >= 1 && day <= 5; // Lundi (1) à Vendredi (5)
}

function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

function parseTime(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h + m / 60;
}

function formatTime(decimal: number): string {
  const h = Math.floor(decimal);
  const m = Math.round((decimal - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// ─────────────────────────────────────────────
// Parsing des contraintes
// ─────────────────────────────────────────────
function parseConstraints(constraints: ResidentConstraint): {
  preferredStart?: string;
  preferredEnd?: string;
  allowedDays?: number[];
  forbiddenDays?: number[];
  frequency?: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number;
  dayOfMonth?: number;
} {
  const result: ReturnType<typeof parseConstraints> = {};

  // Parsing de `horaires_menages` (ex: "10H00", "14H00 OU 12H")
  if (constraints.horaires_menages) {
    const timeStr = constraints.horaires_menages.replace('H', ':').split(' OU ')[0];
    result.preferredStart = timeStr;
  }

  // Parsing de `jours_menages` (ex: "PAS LE VENDREDI", "MARDI ET VENDREDI", "1X1H30 + 3X1H")
  if (constraints.jours_menages) {
    const daysStr = constraints.jours_menages.toUpperCase();

    // Cas 1: Jours interdits (ex: "PAS LE VENDREDI")
    if (daysStr.includes('PAS LE')) {
      const forbiddenDay = daysStr.replace('PAS LE ', '').trim();
      const dayMap: Record<string, number> = {
        LUNDI: 1,
        MARDI: 2,
        MERCREDI: 3,
        JEUDI: 4,
        VENDREDI: 5,
      };
      if (dayMap[forbiddenDay]) {
        result.forbiddenDays = [dayMap[forbiddenDay]];
      }
    }

    // Cas 2: Jours autorisés (ex: "MARDI ET VENDREDI")
    else if (daysStr.includes('ET')) {
      const allowedDays = daysStr.split(' ET ').map(d => d.trim());
      const dayMap: Record<string, number> = {
        LUNDI: 1,
        MARDI: 2,
        MERCREDI: 3,
        JEUDI: 4,
        VENDREDI: 5,
      };
      result.allowedDays = allowedDays
        .map(day => dayMap[day])
        .filter(day => day !== undefined) as number[];
    }

    // Cas 3: Fréquence (ex: "1X1H30 + 3X1H" → fréquence personnalisée)
    // (À adapter selon tes besoins)
    if (daysStr.includes('X')) {
      result.frequency = 'weekly'; // Par défaut, on suppose une fréquence hebdomadaire
    }
  }

  // Parsing de `nombre_menages` (ex: "2 NF", "4")
  if (constraints.nombre_menages) {
    const count = parseInt(constraints.nombre_menages.replace(' NF', ''));
    if (!isNaN(count)) {
      result.priority = count; // Plus le nombre de ménages est élevé, plus la priorité est haute
    }
  }

  return result;
}

// ─────────────────────────────────────────────
// Génération des créneaux horaires pour un agent
// ─────────────────────────────────────────────
function generateAgentSlots(agent: Agent): TimeSlot[] {
  const slots: TimeSlot[] = [];
  let current = WORK_START;

  while (current + DURATION_MINUTES / 60 <= WORK_END) {
    const end = current + DURATION_MINUTES / 60;

    // Gestion de la pause déjeuner
    if (current < BREAK_START && end > BREAK_START) {
      current = BREAK_END;
      continue;
    }
    if (current >= BREAK_START && current < BREAK_END) {
      current = BREAK_END;
      continue;
    }
    if (end > BREAK_END && current < BREAK_END) {
      current = BREAK_END;
      continue;
    }

    slots.push({
      start: formatTime(current),
      end: formatTime(end)
    });

    current = end;
  }

  return slots;
}

// ─────────────────────────────────────────────
// Vérification si un résident doit être nettoyé à une date donnée
// ─────────────────────────────────────────────
function shouldCleanOnDate(resident: Resident, date: Date): boolean {
  if (resident.isAbsent) return false;

  const dayOfWeek = getDayOfWeek(date);
  const dayOfMonth = date.getDate();

  // Si le résident a des contraintes, on les utilise
  if (resident.constraints) {
    const { preferredStart, preferredEnd, allowedDays, forbiddenDays, frequency, dayOfWeek: constraintDayOfWeek, dayOfMonth: constraintDayOfMonth } = parseConstraints(resident.constraints);

    // Vérification des jours interdits
    if (forbiddenDays && forbiddenDays.includes(dayOfWeek)) {
      return false;
    }

    // Vérification des jours autorisés
    if (allowedDays && allowedDays.length > 0 && !allowedDays.includes(dayOfWeek)) {
      return false;
    }

    // Vérification de la fréquence
    if (frequency) {
      switch (frequency) {
        case 'daily':
          return isWeekday(date);
        case 'weekly':
          if (constraintDayOfWeek && dayOfWeek === constraintDayOfWeek) {
            return true;
          }
          return false;
        case 'monthly':
          if (constraintDayOfMonth && dayOfMonth === constraintDayOfMonth) {
            return true;
          }
          return false;
        default:
          return false;
      }
    }
  }

  // Logique par défaut (sans contraintes)
  switch (resident.frequency) {
    case 'daily':
      return isWeekday(date);
    case 'weekly':
      if (!resident.dayOfWeek) return false;
      return dayOfWeek === resident.dayOfWeek && isWeekday(date);
    case 'monthly':
      if (!resident.dayOfMonth) return false;
      if (dayOfMonth === resident.dayOfMonth) return true;

      const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      if (resident.dayOfMonth > lastDayOfMonth) {
        return dayOfMonth === lastDayOfMonth;
      }
      return false;
    default:
      return false;
  }
}

// ─────────────────────────────────────────────
// Vérification si un jour est autorisé pour un résident
// ─────────────────────────────────────────────
function isDayAllowed(resident: Resident, dayOfWeek: number): boolean {
  if (resident.isAbsent) return false;

  // Vérification des contraintes
  if (resident.constraints) {
    const { allowedDays, forbiddenDays } = parseConstraints(resident.constraints);

    if (forbiddenDays && forbiddenDays.includes(dayOfWeek)) {
      return false;
    }
    if (allowedDays && allowedDays.length > 0) {
      return allowedDays.includes(dayOfWeek);
    }
  }

  // Logique par défaut
  if (resident.forbiddenDays?.includes(dayOfWeek)) return false;
  if (resident.allowedDays && resident.allowedDays.length > 0) {
    return resident.allowedDays.includes(dayOfWeek);
  }
  return true;
}

// ─────────────────────────────────────────────
// Génération du planning
// ─────────────────────────────────────────────
export async function generatePlanning(
  residents: Resident[],
  agents: Agent[],
  startDate: Date
): Promise<PlanningResult> {
  const result: PlanningResult = {
    days: [],
    unscheduled: [],
    summary: {
      totalResidents: 0,
      scheduled: 0,
      unscheduled: 0,
      agentWorkload: {}
    }
  };

  if (residents.length === 0 || agents.length === 0) {
    return result;
  }

  // Génération des dates de la semaine (Lundi à Vendredi)
  const weekDates: Date[] = [];
  let current = new Date(startDate);
  const dayOfWeek = getDayOfWeek(current);

  // Si la date de départ est un week-end, on commence le lundi suivant
  if (dayOfWeek === 6 || dayOfWeek === 0) {
    current = addDays(current, 7 - dayOfWeek + 1);
  }

  for (let i = 0; i < 5; i++) {
    weekDates.push(new Date(current));
    current = addDays(current, 1);
  }

  // Génération des créneaux pour chaque agent et chaque jour
  const agentSlots: Record<number, Record<string, TimeSlot[]>> = {};
  agents.forEach(agent => {
    agentSlots[agent.id] = {};
    weekDates.forEach(date => {
      const dateStr = formatDateISO(date);
      if (!agent.workingDays || agent.workingDays.includes(getDayOfWeek(date))) {
        agentSlots[agent.id][dateStr] = generateAgentSlots(agent);
      } else {
        agentSlots[agent.id][dateStr] = [];
      }
    });
  });

  // Calcul des besoins (résidents à nettoyer pour chaque date)
  const needs: Array<{ resident: Resident; date: Date }> = [];
  residents.forEach(resident => {
    weekDates.forEach(date => {
      if (shouldCleanOnDate(resident, date) && isDayAllowed(resident, getDayOfWeek(date))) {
        needs.push({ resident, date });
      }
    });
  });

  // Tri des besoins par score de difficulté (priorité aux résidents les plus contraignants)
  needs.sort((a, b) => calculateDifficultyScore(b.resident) - calculateDifficultyScore(a.resident));

  // Planification des tâches
  const scheduledTasks: ScheduledTask[] = [];
  needs.forEach(({ resident, date }) => {
    const dateStr = formatDateISO(date);
    const dayOfWeek = getDayOfWeek(date);

    // Vérification si le résident est déjà planifié pour cette date
    const alreadyScheduled = scheduledTasks.some(t => t.residentId === resident.id && t.date === dateStr);
    if (alreadyScheduled) return;

    // Recherche du meilleur créneau
    let bestSlot: { agentId: number; slot: TimeSlot; score: number } | null = null;

    // Filtrage des agents disponibles pour ce jour
    const availableAgents = agents
      .filter(a => !a.isAbsent && (a.workingDays ? a.workingDays.includes(dayOfWeek) : true))
      .map(a => {
        const currentLoad = result.summary.agentWorkload[a.id] || 0;
        const maxLoad = a.maxSlotsPerDay || 5;
        return { ...a, currentLoad, maxLoad };
      })
      .sort((a, b) => a.currentLoad - b.currentLoad); // Priorité aux agents les moins chargés

    // Parsing des contraintes du résident
    const { preferredStart, preferredEnd } = resident.constraints
      ? parseConstraints(resident.constraints)
      : { preferredStart: undefined, preferredEnd: undefined };

    // Recherche du meilleur créneau pour chaque agent
    for (const agent of availableAgents) {
      const slots = agentSlots[agent.id][dateStr];
      if (!slots || slots.length === 0) continue;

      // Filtrage des créneaux compatibles avec les contraintes du résident
      const validSlots = slots.filter(slot => {
        const start = parseTime(slot.start);
        const end = parseTime(slot.end);

        // Vérification des horaires préférés
        if (preferredStart) {
          const prefStart = parseTime(preferredStart.replace('H', ':'));
          if (start < prefStart) return false;
        }

        if (preferredEnd) {
          const prefEnd = parseTime(preferredEnd.replace('H', ':'));
          if (end > prefEnd) return false;
        }

        return true;
      });

      if (validSlots.length === 0) continue;

      // Calcul du score pour ce créneau
      const currentAgentLoad = result.summary.agentWorkload[agent.id] || 0;
      const maxLoad = agent.maxSlotsPerDay || 5;
      const loadPenalty = currentAgentLoad >= maxLoad ? 1000 : currentAgentLoad * 10;
      const slotScore = validSlots[0].start === preferredStart?.replace('H', ':') ? 50 : 0;
      const totalScore = slotScore - loadPenalty;

      if (!bestSlot || totalScore > bestSlot.score) {
        bestSlot = {
          agentId: agent.id,
          slot: validSlots[0],
          score: totalScore
        };
      }
    }

    // Si un créneau est trouvé, on l'ajoute au planning
    if (bestSlot) {
      const { agentId, slot } = bestSlot;

      const task: ScheduledTask = {
        id: `${resident.id}-${dateStr}-${agentId}-${slot.start}`,
        residentId: resident.id,
        agentId: agentId,
        date: dateStr,
        startTime: slot.start,
        endTime: slot.end
      };

      scheduledTasks.push(task);
      result.summary.agentWorkload[agentId] = (result.summary.agentWorkload[agentId] || 0) + 1;

      // Retrait du créneau utilisé pour cet agent et cette date
      const agentSlotList = agentSlots[agentId][dateStr];
      const index = agentSlotList.findIndex(s => s.start === slot.start);
      if (index !== -1) {
        agentSlotList.splice(index, 1);
      }
    } else {
      // Si aucun créneau n'est disponible, on ajoute le résident à la liste des non-planifiés
      result.unscheduled.push({
        resident,
        date: dateStr,
        reason: `Aucun créneau disponible pour ${resident.last_name || resident.id} le ${dateStr}`
      });
    }
  });

  // Construction du résultat final
  weekDates.forEach(date => {
    const dateStr = formatDateISO(date);
    const dayOfWeek = getDayOfWeek(date);

    const dayTasks = scheduledTasks
      .filter(t => t.date === dateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    result.days.push({
      date: dateStr,
      dayOfWeek,
      tasks: dayTasks
    });
  });

  result.summary.totalResidents = residents.length;
  result.summary.scheduled = scheduledTasks.length;
  result.summary.unscheduled = result.unscheduled.length;

  return result;
}

// ─────────────────────────────────────────────
// Calcul du score de difficulté pour un résident
// ─────────────────────────────────────────────
function calculateDifficultyScore(resident: Resident): number {
  let score = resident.priority || 1;

  // Contraintes depuis la table `constraintes`
  if (resident.constraints) {
    const { allowedDays, forbiddenDays, preferredStart, preferredEnd } = parseConstraints(resident.constraints);

    // Moins de jours autorisés → priorité plus élevée
    if (allowedDays && allowedDays.length < 5) {
      score += (5 - allowedDays.length) * 20;
    }

    // Jours interdits → priorité plus élevée
    if (forbiddenDays && forbiddenDays.length > 0) {
      score += forbiddenDays.length * 15;
    }

    // Horaires préférés très restricts → priorité plus élevée
    if (preferredStart && preferredEnd) {
      const start = parseTime(preferredStart.replace('H', ':'));
      const end = parseTime(preferredEnd.replace('H', ':'));
      const duration = end - start;
      if (duration < 1.5) {
        score += 30;
      }
    }
  }

  // Logique existante
  if (resident.allowedDays && resident.allowedDays.length < 5) {
    score += 20;
  }
  if (resident.forbiddenDays && resident.forbiddenDays.length > 0) {
    score += 10;
  }
  if (resident.frequency === 'weekly' || resident.frequency === 'monthly') {
    score += 10;
  }

  return score;
}