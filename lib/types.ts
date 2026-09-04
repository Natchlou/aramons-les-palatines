// types.ts
export interface ResidentConstraint {
  horaires_menages?: string; // Ex: "10H00", "14H00 OU 12H"
  jours_menages?: string;   // Ex: "PAS LE VENDREDI", "MARDI ET VENDREDI", "1X1H30 + 3X1H"
  services_supp?: string;   // Ex: "POUBELLES", "LIT/POUBELLES/JOURNAL"
  prelevement?: number;     // Ex: 5, 10
  envoi_facture?: string;   // Ex: "MAILS", "DUPLICATA + MAILS"
  nombre_menages?: string;  // Ex: "2 NF", "4"
}

export interface Resident {
  id: string;
  first_name?: string;
  last_name?: string;
  room?: string;
  building?: string;
  frequency?: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number; // 1 (Lundi) à 5 (Vendredi)
  dayOfMonth?: number;
  preferredStart?: string; // Ex: "10:00"
  preferredEnd?: string;   // Ex: "12:00"
  priority?: number;
  allowedDays?: number[]; // Jours autorisés (1-5)
  forbiddenDays?: number[]; // Jours interdits (1-5)
  isAbsent?: boolean;
  constraints?: ResidentConstraint; // Contraintes depuis la table `constraintes`
}

export interface Agent {
  id: number;
  name: string;
  workingDays?: number[]; // Jours de travail (1-5)
  maxSlotsPerDay?: number; // Nombre max de créneaux par jour
  isAbsent?: boolean;
}

export interface TimeSlot {
  start: string; // Ex: "10:00"
  end: string;   // Ex: "11:30"
}

export interface ScheduledTask {
  id: string;
  residentId: string;
  agentId: number;
  date: string; // Format: YYYY-MM-DD
  startTime: string;
  endTime: string;
}

export interface UnscheduledItem {
  resident: Resident;
  date: string;
  reason: string;
}

export interface PlanningDay {
  date: string;
  dayOfWeek: number;
  tasks: ScheduledTask[];
}

export interface PlanningResult {
  days: PlanningDay[];
  unscheduled: UnscheduledItem[];
  summary: {
    totalResidents: number;
    scheduled: number;
    unscheduled: number;
    agentWorkload: Record<number, number>;
  };
}