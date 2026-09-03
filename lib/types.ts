// types.ts
export type Frequency = 'daily' | 'weekly' | 'monthly';

export interface Resident {
  id: number;
  name: string;
  apartment: string;
  building: 1 | 2;
  frequency: Frequency;
  dayOfWeek?: number;
  dayOfMonth?: number;
  preferredStart?: string;
  preferredEnd?: string;
  allowedDays?: number[];
  forbiddenDays?: number[];
  priority?: number;
  maxWeeklySlots?: number;
  isAbsent?: boolean;
}

export interface Agent {
  id: number;
  name: string;
  workingDays?: number[];
  maxSlotsPerDay?: number;
  preferredStart?: string;
  isAbsent?: boolean;
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface ScheduledTask {
  id: string;
  residentId: number;
  agentId: number;
  date: string;
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