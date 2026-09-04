import type { Database } from '../database.types';

// Types extraits de la base de données Supabase
type ResidentRow = Database['public']['Tables']['residents']['Row'];
type ConstraintRow = Database['public']['Tables']['constraintes']['Row'];

// Types pour le planning
export interface TimeSlot {
  start: string; // Format "HH:MM"
  end: string;   // Format "HH:MM"
}

export interface ScheduledTask {
  id: string;
  residentId: string;
  residentName: string;
  room: string;
  building: string;
  date: string; // Format "YYYY-MM-DD"
  startTime: string;
  endTime: string;
  agentId: number;
  agentName: string;
}

export interface PlanningDay {
  date: string;
  dayOfWeek: number; // 1 (Lundi) à 5 (Vendredi)
  dayName: string;
  tasks: ScheduledTask[];
}

export interface UnscheduledItem {
  resident: ResidentRow & { constraints?: ConstraintRow['data'] };
  date: string;
  reason: string;
}

export interface WeeklyPlanning {
  weekStartDate: string;
  weekEndDate: string;
  days: PlanningDay[];
  unscheduled: UnscheduledItem[];
  summary: {
    totalResidents: number;
    scheduled: number;
    unscheduled: number;
    agentWorkload: Record<number, number>;
  };
}

export interface Agent {
  id: number;
  name: string;
  workingDays?: number[]; // 1-5 (Lundi-Vendredi)
  maxSlotsPerDay?: number;
  isAbsent?: boolean;
}

// Types étendus pour les résidents avec leurs contraintes
export interface ResidentWithConstraints extends ResidentRow {
  constraints?: ConstraintRow['data'];
  frequency?: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  allowedDays?: number[];
  forbiddenDays?: number[];
  priority?: number;
  isAbsent?: boolean;
}

// Constantes de configuration
const SLOT_DURATION_MINUTES = 90; // Durée d'un créneau de ménage
const WORK_START = 8.5;      // Début de la journée : 8h30 (après le hall de 8h-8h30)
const WORK_END = 17.0;       // Fin de la journée : 17h00
const BREAK_START = 11.5;    // Début de la pause : 11h30
const BREAK_END = 12.0;      // Fin de la pause : 12h00

// Noms des jours
const DAY_NAMES: Record<number, string> = {
  1: 'Lundi',
  2: 'Mardi',
  3: 'Mercredi',
  4: 'Jeudi',
  5: 'Vendredi',
};

/**
 * Mélange un tableau de façon aléatoire (Fisher-Yates shuffle)
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Vérifie si un résident a des contraintes significatives
 */
function hasSignificantConstraints(resident: ResidentWithConstraints): boolean {
  if (!resident.constraints) return false;
  
  const { allowedDays, forbiddenDays, preferredStart, preferredEnd } = parseResidentConstraints(resident.constraints);
  
  // Le résident a des contraintes si :
  // - Il a des jours interdits
  // - Il a des jours autorisés (restrictif)
  // - Il a des horaires préférés
  return !!(forbiddenDays?.length || 
           (allowedDays?.length && allowedDays.length < 5) || 
           preferredStart || 
           preferredEnd);
}

/**
 * Obtient le nombre de ménages par semaine pour un résident
 */
function getNombreMenages(resident: ResidentWithConstraints): number {
  if (!resident.constraints) return 1;
  
  const parsed = parseResidentConstraints(resident.constraints);
  return parsed.nombre_menages || 1;
}

/**
 * Détermine quels jours de la semaine sont autorisés pour un résident
 */
function getAllowedDaysForResident(resident: ResidentWithConstraints): number[] {
  const days = [1, 2, 3, 4, 5]; // Lundi à Vendredi
  
  if (!resident.constraints) return days;
  
  const { allowedDays, forbiddenDays } = parseResidentConstraints(resident.constraints);
  
  // Appliquer les jours interdits
  let result = [...days];
  if (forbiddenDays && forbiddenDays.length > 0) {
    result = result.filter(d => !forbiddenDays.includes(d));
  }
  
  // Appliquer les jours autorisés (si spécifiés)
  if (allowedDays && allowedDays.length > 0) {
    result = result.filter(d => allowedDays.includes(d));
  }
  
  // Appliquer les contraintes directes du résident
  if (resident.forbiddenDays && resident.forbiddenDays.length > 0) {
    result = result.filter(d => !resident.forbiddenDays!.includes(d));
  }
  if (resident.allowedDays && resident.allowedDays.length > 0) {
    result = result.filter(d => resident.allowedDays!.includes(d));
  }
  
  return result;
}

/**
 * Sélectionne N jours parmi les jours autorisés pour un résident
 */
function selectDaysForResident(
  resident: ResidentWithConstraints,
  weekDates: Date[],
  nombreMenages: number
): Date[] {
  const allowedDays = getAllowedDaysForResident(resident);
  
  // Filtrer les dates de la semaine pour ne garder que les jours autorisés
  const allowedWeekDates = weekDates.filter(date => 
    allowedDays.includes(getDayOfWeek(date))
  );
  
  // Si pas assez de jours autorisés, on prend tous les jours autorisés
  if (allowedWeekDates.length <= nombreMenages) {
    return allowedWeekDates;
  }
  
  // Mélanger et sélectionner N jours
  const shuffled = shuffleArray([...allowedWeekDates]);
  return shuffled.slice(0, nombreMenages);
}

/**
 * Formate une date au format YYYY-MM-DD
 */
function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Ajoute des jours à une date
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Retourne le jour de la semaine (1=Lundi, 6=Samedi, 0=Dimanche -> 6)
 */
function getDayOfWeek(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 6 : day;
}

/**
 * Vérifie si une date est un jour de semaine (Lundi à Vendredi)
 */
function isWeekday(date: Date): boolean {
  const day = getDayOfWeek(date);
  return day >= 1 && day <= 5;
}

/**
 * Parse une heure au format "HH:MM" en nombre décimal (ex: 14:30 -> 14.5)
 */
function parseTime(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h + m / 60;
}

/**
 * Formate un nombre décimal en heure au format "HH:MM"
 */
function formatTime(decimal: number): string {
  const h = Math.floor(decimal);
  const m = Math.round((decimal - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Parse les contraintes d'un résident
 */
function parseResidentConstraints(constraints: ConstraintRow['data']): {
  preferredStart?: string;
  preferredEnd?: string;
  allowedDays?: number[];
  forbiddenDays?: number[];
  frequency?: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  nombre_menages?: number;
} {
  if (!constraints) return {};

  const result: ReturnType<typeof parseResidentConstraints> = {};

  // Parse horaires_menages (ex: "10H00", "14H00 OU 12H")
  if (constraints.horaires_menages) {
    const timeStr = constraints.horaires_menages.replace('H', ':').split(' OU ')[0];
    // On suppose que c'est l'heure de début
    result.preferredStart = timeStr;
  }

  // Parse jours_menages (ex: "PAS LE VENDREDI", "MARDI ET VENDREDI")
  if (constraints.jours_menages) {
    const daysStr = constraints.jours_menages.toUpperCase();

    // Jours interdits
    if (daysStr.includes('PAS LE')) {
      const forbiddenDay = daysStr.replace('PAS LE ', '').trim();
      const dayMap: Record<string, number> = {
        LUNDI: 1, MARDI: 2, MERCREDI: 3, JEUDI: 4, VENDREDI: 5,
      };
      if (dayMap[forbiddenDay]) {
        result.forbiddenDays = [dayMap[forbiddenDay]];
      }
    }
    // Jours autorisés
    else if (daysStr.includes('ET')) {
      const allowedDays = daysStr.split(' ET ').map(d => d.trim());
      const dayMap: Record<string, number> = {
        LUNDI: 1, MARDI: 2, MERCREDI: 3, JEUDI: 4, VENDREDI: 5,
      };
      result.allowedDays = allowedDays
        .map(day => dayMap[day])
        .filter((day): day is number => day !== undefined);
    }
  }

  // Parse nombre_menages pour la priorité
  if (constraints.nombre_menages) {
    // nombre_menages peut être un nombre ou une chaîne (ex: "2 NF" ou 1)
    const nombreMenages = constraints.nombre_menages;
    let count: number;
    
    if (typeof nombreMenages === 'number') {
      count = nombreMenages;
    } else {
      const cleaned = nombreMenages.replace(' NF', '').trim();
      count = parseInt(cleaned);
    }
    
    if (!isNaN(count)) {
      result.nombre_menages = count;
    }
  }

  return result;
}

/**
 * Génère les créneaux horaires pour un agent pour une journée
 */
function generateAgentSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  let current = WORK_START;

  while (current + SLOT_DURATION_MINUTES / 60 <= WORK_END) {
    const end = current + SLOT_DURATION_MINUTES / 60;

    // Gestion de la pause déjeuner
    if (current < BREAK_START && end > BREAK_START) {
      current = BREAK_END;
      continue;
    }
    if (current >= BREAK_START && current < BREAK_END) {
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

/**
 * Vérifie si un résident doit être nettoyé à une date donnée
 */
function shouldCleanOnDate(resident: ResidentWithConstraints, date: Date): boolean {
  if (resident.isAbsent) return false;

  const dayOfWeek = getDayOfWeek(date);

  // Si le résident a des contraintes, on les utilise
  if (resident.constraints) {
    const { allowedDays, forbiddenDays } = parseResidentConstraints(resident.constraints);

    // Vérification des jours interdits
    if (forbiddenDays && forbiddenDays.includes(dayOfWeek)) {
      return false;
    }

    // Vérification des jours autorisés
    if (allowedDays && allowedDays.length > 0 && !allowedDays.includes(dayOfWeek)) {
      return false;
    }
  }

  // Logique par défaut
  if (resident.forbiddenDays?.includes(dayOfWeek)) return false;
  if (resident.allowedDays && resident.allowedDays.length > 0) {
    return resident.allowedDays.includes(dayOfWeek);
  }

  // Par défaut, on planifie le résident
  return true;
}

/**
 * Vérifie si un jour est autorisé pour un résident
 */
function isDayAllowed(resident: ResidentWithConstraints, dayOfWeek: number): boolean {
  if (resident.isAbsent) return false;

  // Vérification des contraintes
  if (resident.constraints) {
    const { allowedDays, forbiddenDays } = parseResidentConstraints(resident.constraints);

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

/**
 * Calcule un score de difficulté pour un résident (plus le score est élevé, plus c'est prioritaire)
 */
function calculateDifficultyScore(resident: ResidentWithConstraints): number {
  let score = resident.priority || 1;

  // Contraintes depuis la table `constraintes`
  if (resident.constraints) {
    const { allowedDays, forbiddenDays } = parseResidentConstraints(resident.constraints);

    // Moins de jours autorisés = priorité plus élevée
    if (allowedDays && allowedDays.length < 5) {
      score += (5 - allowedDays.length) * 20;
    }

    // Jours interdits = priorité plus élevée
    if (forbiddenDays && forbiddenDays.length > 0) {
      score += forbiddenDays.length * 15;
    }
  }

  // Logique existante
  if (resident.allowedDays && resident.allowedDays.length < 5) {
    score += 20;
  }
  if (resident.forbiddenDays && resident.forbiddenDays.length > 0) {
    score += 10;
  }

  return score;
}

/**
 * Génère un planning hebdomadaire pour les résidents et agents donnés
 * 
 * @param residents - Liste des résidents avec leurs contraintes
 * @param agents - Liste des agents disponibles
 * @param startDate - Date de début de la semaine (peut être n'importe quel jour)
 * @returns Un objet WeeklyPlanning contenant le planning généré
 */
export async function generateWeeklyPlanning(
  residents: ResidentWithConstraints[],
  agents: Agent[],
  startDate: Date
): Promise<WeeklyPlanning> {
  const result: WeeklyPlanning = {
    weekStartDate: '',
    weekEndDate: '',
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

  // Normaliser la date de début au lundi de la semaine
  let current = new Date(startDate);
  let dayOfWeek = getDayOfWeek(current);
  
  // Si c'est un week-end, on commence le lundi suivant
  if (dayOfWeek === 6 || dayOfWeek === 0) {
    current = addDays(current, 7 - dayOfWeek + 1);
    dayOfWeek = getDayOfWeek(current);
  }
  
  // Si c'est déjà en semaine, on recule au lundi
  if (dayOfWeek > 1) {
    current = addDays(current, 1 - dayOfWeek);
  }

  // Génération des dates de la semaine (Lundi à Vendredi)
  const weekDates: Date[] = [];
  for (let i = 0; i < 5; i++) {
    weekDates.push(new Date(current));
    current = addDays(current, 1);
  }

  result.weekStartDate = formatDateISO(weekDates[0]);
  result.weekEndDate = formatDateISO(weekDates[4]);

  // Génération des créneaux pour chaque agent et chaque jour
  const agentSlots: Record<number, Record<string, TimeSlot[]>> = {};
  agents.forEach(agent => {
    agentSlots[agent.id] = {};
    weekDates.forEach(date => {
      const dateStr = formatDateISO(date);
      const day = getDayOfWeek(date);
      
      // Vérifier si l'agent travaille ce jour
      if (!agent.workingDays || agent.workingDays.includes(day)) {
        agentSlots[agent.id][dateStr] = generateAgentSlots();
      } else {
        agentSlots[agent.id][dateStr] = [];
      }
    });
  });

  // Calcul des besoins : quels résidents nettoyer à quelle date
  // Maintenant on prend en compte nombre_menages (nombre de fois par semaine)
  const needs: Array<{ resident: ResidentWithConstraints; date: Date }> = [];
  
  residents.forEach(resident => {
    // Nombre de fois que ce résident doit être nettoyé dans la semaine
    const nombreMenages = getNombreMenages(resident);
    
    // Sélectionner les jours pour ce résident (en tenant compte des contraintes)
    const selectedDates = selectDaysForResident(resident, weekDates, nombreMenages);
    
    // Ajouter un besoin pour chaque date sélectionnée
    selectedDates.forEach(date => {
      needs.push({ resident, date });
    });
  });

  // Séparer les besoins en deux groupes :
  // 1. Résidents AVEC contraintes (priorité haute - placés en premier)
  // 2. Résidents SANS contraintes (placés aléatoirement après)
  const needsWithConstraints: Array<{ resident: ResidentWithConstraints; date: Date }> = [];
  const needsWithoutConstraints: Array<{ resident: ResidentWithConstraints; date: Date }> = [];
  
  needs.forEach(need => {
    if (hasSignificantConstraints(need.resident)) {
      needsWithConstraints.push(need);
    } else {
      needsWithoutConstraints.push(need);
    }
  });

  // Trier les besoins avec contraintes par score de difficulté (priorité aux plus contraignants)
  needsWithConstraints.sort((a, b) => 
    calculateDifficultyScore(b.resident) - calculateDifficultyScore(a.resident)
  );
  
  // Mélanger les besoins sans contraintes pour un placement aléatoire
  const shuffledNeeds = shuffleArray(needsWithoutConstraints);
  
  // Combiner : d'abord les contraints, puis les aléatoires
  const orderedNeeds = [...needsWithConstraints, ...shuffledNeeds];

  // Planification des tâches
  const scheduledTasks: ScheduledTask[] = [];
  
  orderedNeeds.forEach(({ resident, date }) => {
    const dateStr = formatDateISO(date);
    const dayOfWeek = getDayOfWeek(date);

    // Vérification si le résident est déjà planifié pour cette date
    const alreadyScheduled = scheduledTasks.some(
      t => t.residentId === resident.id && t.date === dateStr
    );
    if (alreadyScheduled) return;

    // Recherche du meilleur créneau
    let bestSlot: { agentId: number; slot: TimeSlot; agentName: string; score: number } | null = null;

    // Filtrage des agents disponibles pour ce jour
    const availableAgents = agents
      .filter(a => !a.isAbsent && (a.workingDays ? a.workingDays.includes(dayOfWeek) : true))
      .map(a => {
        const currentLoad = result.summary.agentWorkload[a.id] || 0;
        const maxLoad = a.maxSlotsPerDay || 5;
        return { ...a, currentLoad, maxLoad };
      })
      .sort((a, b) => a.currentLoad - b.currentLoad); // Priorité aux agents les moins chargés

    // Parse les contraintes du résident
    const { preferredStart, preferredEnd } = resident.constraints
      ? parseResidentConstraints(resident.constraints)
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
          agentName: agent.name,
          slot: validSlots[0],
          score: totalScore
        };
      }
    }

    // Si un créneau est trouvé, on l'ajoute au planning
    if (bestSlot) {
      const { agentId, agentName, slot } = bestSlot;

      const task: ScheduledTask = {
        id: `${resident.id}-${dateStr}-${agentId}-${slot.start}`,
        residentId: resident.id,
        residentName: `${resident.first_name || ''} ${resident.last_name || ''}`.trim() || resident.id,
        room: resident.room || '',
        building: resident.building || '',
        date: dateStr,
        startTime: slot.start,
        endTime: slot.end,
        agentId,
        agentName
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
        date: formatDateISO(date),
        reason: `Aucun créneau disponible pour ${resident.last_name || resident.id} le ${formatDateISO(date)}`
      });
    }
  });

  // Construction du résultat final par jour
  weekDates.forEach(date => {
    const dateStr = formatDateISO(date);
    const dayOfWeek = getDayOfWeek(date);

    const dayTasks = scheduledTasks
      .filter(t => t.date === dateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    result.days.push({
      date: dateStr,
      dayOfWeek,
      dayName: DAY_NAMES[dayOfWeek] || `Jour ${dayOfWeek}`,
      tasks: dayTasks
    });
  });

  result.summary.totalResidents = residents.length;
  result.summary.scheduled = scheduledTasks.length;
  result.summary.unscheduled = result.unscheduled.length;

  return result;
}

/**
 * Fonction utilitaire pour créer un résident avec contraintes à partir des données Supabase
 */
export function createResidentWithConstraints(
  resident: ResidentRow,
  constraint?: ConstraintRow | null
): ResidentWithConstraints {
  return {
    ...resident,
    constraints: constraint?.data || undefined,
    frequency: 'weekly',
    allowedDays: [],
    forbiddenDays: [],
    priority: 1,
    isAbsent: false
  };
}

/**
 * Génère un planning hebdomadaire à partir des données brutes Supabase
 * 
 * @param residents - Résidents depuis la base de données
 * @param constraints - Contraintes depuis la base de données
 * @param agents - Agents disponibles
 * @param startDate - Date de début
 * @returns Un planning hebdomadaire
 */
export async function generateWeeklyPlanningFromSupabase(
  residents: ResidentRow[],
  constraints: ConstraintRow[],
  agents: Agent[],
  startDate: Date
): Promise<WeeklyPlanning> {
  // Fusionner les résidents avec leurs contraintes
  const residentsWithConstraints = residents.map(resident => {
    const constraint = constraints.find(c => c.resident_id === resident.id);
    return createResidentWithConstraints(resident, constraint);
  });

  return generateWeeklyPlanning(residentsWithConstraints, agents, startDate);
}

// ============================================
// FORMAT DE SORTIE POUR LA BASE DE DONNÉES
// ============================================

/**
 * Format d'une tâche pour la base de données
 */
export interface PlanningSlot {
  start: string;
  end: string;
  type: 'menage' | 'pause' | 'plonge' | 'hall';
  resident?: {
    name: string;
    room: string;
  };
  building?: string;
}

/**
 * Format du planning pour enregistrement en base de données
 * { "Lundi": { "08:00": { start: "08:00", end: "09:30", type: "menage", resident: {...} }, ... }, ... }
 */
export type DatabasePlanning = Record<string, Record<string, PlanningSlot>>;

/**
 * Tâche fixe à ajouter au planning (pause, plonge, hall)
 */
export interface FixedTask {
  dayOfWeek: number; // 1-5 (Lundi-Vendredi)
  startTime: string;
  endTime: string;
  type: 'pause' | 'plonge' | 'hall';
  building?: string;
}

/**
 * Convertit un WeeklyPlanning en format base de données
 * 
 * @param planning - Le planning généré par generateWeeklyPlanning
 * @param fixedTasks - Tâches fixes à ajouter (pause, plonge, hall)
 * @param options - Options de formatage
 * @returns Un objet au format { "Lundi": { "08:00": {...}, ... }, ... }
 */
export interface FormatOptions {
  includeHall?: boolean; // Toujours inclure le hall de 8h-8h30 (défaut: true)
  includePause?: boolean; // Toujours inclure la pause de 11h30-12h (défaut: true)
}

export function formatPlanningForDatabase(
  planning: WeeklyPlanning,
  fixedTasks: FixedTask[] = [],
  options: FormatOptions = { includeHall: true, includePause: true }
): DatabasePlanning {
  const { includeHall = true, includePause = true } = options;
  
  const result: DatabasePlanning = {};

  // Initialiser tous les jours de la semaine
  ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].forEach(dayName => {
    result[dayName] = {};
  });

  // Ajouter les tâches de ménage pour chaque jour
  planning.days.forEach(day => {
    const dayName = DAY_NAMES[day.dayOfWeek] || `Jour ${day.dayOfWeek}`;

    // Trier les tâches par heure de début
    const sortedTasks = [...day.tasks].sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    );

    sortedTasks.forEach(task => {
      // Formater le nom du résident (Mme/M. + NOM)
      const residentName = formatResidentName(task.residentName);
      
      // Formater la room : "Apt. {room} — Bât. {building}"
      let roomInfo = '';
      if (task.room) {
        roomInfo = `Apt. ${task.room}`;
      }
      if (task.building) {
        roomInfo = roomInfo ? `${roomInfo} — ${task.building}` : task.building;
      }

      const slot: PlanningSlot = {
        start: task.startTime,
        end: task.endTime,
        type: 'menage',
        resident: {
          name: residentName,
          room: roomInfo
        }
      };

      result[dayName][task.startTime] = slot;
    });
  });

  // Ajouter les tâches fixes (pause, plonge, hall) pour chaque jour
  ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].forEach(dayName => {
    const dayOfWeek = Object.entries(DAY_NAMES).find(
      ([, name]) => name === dayName
    )?.[0] as keyof typeof DAY_NAMES | undefined;
    
    if (!dayOfWeek) return;
    
    const dayNumber = parseInt(dayOfWeek);
    
    // Ajouter les tâches fixes pour ce jour
    fixedTasks.forEach(fixedTask => {
      if (fixedTask.dayOfWeek === dayNumber) {
        const slot: PlanningSlot = {
          start: fixedTask.startTime,
          end: fixedTask.endTime,
          type: fixedTask.type
        };
        
        // Ajouter building uniquement si présent
        if (fixedTask.building) {
          slot.building = fixedTask.building;
        }
        
        result[dayName][fixedTask.startTime] = slot;
      }
    });
  });

  // TOUJOURS ajouter le hall de 8h-8h30 si activé (par défaut: true)
  // Alterner entre Bât. 1 et Bât. 2
  if (includeHall) {
    ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].forEach((dayName, index) => {
      // Ne pas écraser si une tâche existe déjà à 8h00
      if (!result[dayName]['08:00']) {
        // Alterner: Lundi=Bât. 2, Mardi=Bât. 1, Mercredi=Bât. 2, Jeudi=Bât. 1, Vendredi=Bât. 2
        const building = index % 2 === 0 ? 'Bât. 2' : 'Bât. 1';
        const hallSlot: PlanningSlot = {
          start: '08:00',
          end: '08:30',
          type: 'hall',
          building
        };
        result[dayName]['08:00'] = hallSlot;
      }
    });
  }

  // TOUJOURS ajouter la pause de 11h30-12h00 si activé (par défaut: true)
  if (includePause) {
    ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].forEach(dayName => {
      const pauseSlot: PlanningSlot = {
        start: '11:30',
        end: '12:00',
        type: 'pause'
      };
      
      if (!result[dayName]['11:30']) {
        result[dayName]['11:30'] = pauseSlot;
      }
    });
  }

  // Trier les créneaux par heure pour chaque jour
  Object.keys(result).forEach(dayName => {
    const slots = result[dayName];
    const sortedSlots = Object.keys(slots)
      .sort((a, b) => a.localeCompare(b))
      .reduce((acc, time) => {
        acc[time] = slots[time];
        return acc;
      }, {} as Record<string, PlanningSlot>);
    
    result[dayName] = sortedSlots;
  });

  return result;
}

/**
 * Formate le nom d'un résident (ajoute Mme/M. si ce n'est pas déjà fait)
 */
function formatResidentName(name: string): string {
  if (!name) return '';
  
  // Si le nom contient déjà Mme ou M., on le garde tel quel
  if (name.includes('Mme ') || name.includes('M. ') || name.includes('Madame ') || name.includes('Monsieur ')) {
    return name;
  }
  
  // Sinon, on suppose que c'est Nom Prénom et on ajoute Mme/M.
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return name;
  
  // Si c'est un seul mot, on retourne tel quel
  if (parts.length === 1) return name;
  
  // Pour simplifier, on retourne juste le nom tel quel
  // (la formatting Mme/M. se fait côté affichage si nécessaire)
  return name;
}

/**
 * Génère et formate un planning hebdomadaire directement au format base de données
 * 
 * @param residents - Liste des résidents avec leurs contraintes
 * @param agents - Liste des agents disponibles  
 * @param startDate - Date de début de la semaine
 * @param fixedTasks - Tâches fixes à ajouter (pause, plonge, hall)
 * @returns Un planning au format { "Lundi": { "08:00": {...}, ... }, ... }
 */
export async function generateAndFormatWeeklyPlanning(
  residents: ResidentWithConstraints[],
  agents: Agent[],
  startDate: Date,
  fixedTasks: FixedTask[] = []
): Promise<DatabasePlanning> {
  const planning = await generateWeeklyPlanning(residents, agents, startDate);
  return formatPlanningForDatabase(planning, fixedTasks);
}

/**
 * Génère un planning hebdomadaire depuis Supabase et le formate pour la base de données
 * 
 * @param residents - Résidents depuis la base de données
 * @param constraints - Contraintes depuis la base de données
 * @param agents - Agents disponibles
 * @param startDate - Date de début
 * @param fixedTasks - Tâches fixes à ajouter
 * @returns Un planning au format base de données
 */
export async function generateAndFormatFromSupabase(
  residents: ResidentRow[],
  constraints: ConstraintRow[],
  agents: Agent[],
  startDate: Date,
  fixedTasks: FixedTask[] = []
): Promise<DatabasePlanning> {
  const residentsWithConstraints = residents.map(resident => {
    const constraint = constraints.find(c => c.resident_id === resident.id);
    return createResidentWithConstraints(resident, constraint);
  });

  return generateAndFormatWeeklyPlanning(residentsWithConstraints, agents, startDate, fixedTasks);
}

// ============================================
// EXEMPLE D'UTILISATION
// ============================================

/**
 * Exemple complet d'utilisation avec des données mock
 * 
 * // 1. Définir les agents
 * const agents: Agent[] = [
 *   { id: 1, name: 'Manon', workingDays: [1, 2, 3, 4, 5], maxSlotsPerDay: 6 },
 *   { id: 2, name: 'Christelle', workingDays: [1, 2, 3, 4, 5], maxSlotsPerDay: 6 },
 * ];
 *
 * // 2. Définir les résidents avec contraintes
 * const residents: ResidentWithConstraints[] = [
 *   {
 *     id: 'res-001',
 *     first_name: 'Jean',
 *     last_name: 'DUPONT',
 *     room: '202',
 *     building: 'Bât. 1',
 *     constraints: {
 *       horaires_menages: '10H00',
 *       jours_menages: 'PAS LE VENDREDI',
 *       nombre_menages: 1
 *     }
 *   },
 *   {
 *     id: 'res-002',
 *     first_name: 'Marie',
 *     last_name: 'MARTIN',
 *     room: '104',
 *     building: 'Bât. 2',
 *     constraints: {
 *       horaires_menages: '14H00',
 *       jours_menages: 'MARDI ET JEUDI'
 *     }
 *   }
 * ];
 *
 * // 3. Définir les tâches fixes (optionnel)
 * const fixedTasks: FixedTask[] = [
 *   // Pause tous les jours
 *   { dayOfWeek: 1, startTime: '11:30', endTime: '12:00', type: 'pause' },
 *   { dayOfWeek: 2, startTime: '11:30', endTime: '12:00', type: 'pause' },
 *   { dayOfWeek: 3, startTime: '11:30', endTime: '12:00', type: 'pause' },
 *   { dayOfWeek: 4, startTime: '11:30', endTime: '12:00', type: 'pause' },
 *   { dayOfWeek: 5, startTime: '11:30', endTime: '12:00', type: 'pause' },
 *   // Hall le lundi matin
 *   { dayOfWeek: 1, startTime: '08:00', endTime: '08:30', type: 'hall', building: 'Bât. 2' },
 *   // Plonge le lundi midi
 *   { dayOfWeek: 1, startTime: '12:00', endTime: '14:00', type: 'plonge' },
 * ];
 *
 * // 4. Générer et formater le planning
 * const startDate = new Date('2026-09-07'); // Lundi
 * const databasePlanning = await generateAndFormatWeeklyPlanning(
 *   residents,
 *   agents,
 *   startDate,
 *   fixedTasks
 * );
 *
 * // 5. Résultat prêt à être enregistré dans la base de données
 * // databasePlanning = {
 * //   "Lundi": {
 * //     "08:00": { start: "08:00", end: "08:30", type: "hall", building: "Bât. 2" },
 * //     "08:30": { start: "08:30", end: "10:00", type: "menage", resident: { name: "Jean DUPONT", room: "Apt. 202 — Bât. 1" } },
 * //     "11:30": { start: "11:30", end: "12:00", type: "pause" },
 * //     "12:00": { start: "12:00", end: "14:00", type: "plonge" },
 * //     "14:00": { start: "14:00", end: "15:30", type: "menage", resident: { name: "Marie MARTIN", room: "Apt. 104 — Bât. 2" } }
 * //   },
 * //   "Mardi": { ... },
 * //   ...
 * // }
 *
 * // 6. Pour enregistrer dans Supabase:
 * // const supabase = createClient();
 * // await supabase.from('recents_menages').insert({
 * //   date: startDate.toISOString().split('T')[0],
 * //   data: databasePlanning
 * // });
 */
