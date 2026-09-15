export type PlanningDay = Record<string, string>;

export type PlanningDayNumber = "1" | "2" | "3" | "4" | "5";

export type PlanningWeek = Partial<Record<PlanningDayNumber, PlanningDay>>;

export interface Resident {
  id: string;
  prefix: string | null;
  first_name: string | null;
  last_name: string | null;
  room: string | null;
  building: string | null;
  created_at?: string;
}

export interface CleaningPlanningData {
  title: string;
  agent: string;
  weeks: PlanningWeek[];
}

export interface CleaningPlanning extends CleaningPlanningData {
  id: number;
}

export type CleaningPlanningMode = "weekly" | "monthly";

export interface CleaningPlanningProps {
  title: string;
  agent: string;
  weeks: PlanningWeek[];
  residents: Resident[];
}
