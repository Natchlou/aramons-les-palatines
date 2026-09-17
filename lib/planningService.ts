import "dotenv/config";
import {
  getDaysInMonth,
  getISODay,
  getISOWeek,
  getISOWeekYear,
  format,
  isWeekend,
  subMonths,
} from "date-fns";
import { fr } from "date-fns/locale";
import { createClient } from "./client";

// ============================================================================
// 1. TEMPLATES D'AGENTS
// ============================================================================

export type DayName = "lundi" | "mardi" | "mercredi" | "jeudi" | "vendredi";

export type SlotType =
  | "hall"
  | "menage"
  | "pause"
  | "plonge"
  | "lessives"
  | "common";

export interface TemplateSlot {
  hour: string;
  type: SlotType;
  label?: string;
  building?: string;
}

export type DayTemplate = TemplateSlot[];
export type WeekTemplate = Partial<Record<DayName, DayTemplate>>;

export interface RotationRule {
  anchorWeek: number;
  weeksOn: number;
  weeksOff: number;
}

export interface AgentConfig {
  name: string;
  week: WeekTemplate;
  rotation: RotationRule | null;
}

const HALL_B1: TemplateSlot = { hour: "8h00", type: "hall", building: "1" };
const HALL_B2: TemplateSlot = { hour: "8h00", type: "hall", building: "2" };

const CHRISTELLE_FULL: DayTemplate = [
  HALL_B1,
  { hour: "8h30",  type: "menage" },
  { hour: "10h00", type: "menage" },
  { hour: "11h30", type: "pause", label: "Pause repos" },
  { hour: "12h00", type: "menage" },
  { hour: "13h30", type: "menage" },
  { hour: "15h00", type: "common", label: "Parties communes" },
];

const CHRISTELLE_MERCREDI: DayTemplate = [
  HALL_B1,
  { hour: "8h30",  type: "menage" },
  { hour: "10h00", type: "menage" },
  { hour: "11h30", type: "pause", label: "Fin 11h30" },
];

const CHRISTELLE_JEUDI: DayTemplate = [
  { hour: "7h45",  type: "hall", building: "1" },
  { hour: "8h30",  type: "menage" },
  { hour: "10h00", type: "menage" },
  { hour: "11h30", type: "pause", label: "Pause repos" },
  { hour: "12h00", type: "menage" },
  { hour: "13h30", type: "menage" },
  { hour: "15h00", type: "common", label: "Parties communes" },
];

const CHRISTELLE_VENDREDI: DayTemplate = [
  HALL_B1,
  { hour: "8h30",  type: "menage" },
  { hour: "10h00", type: "menage" },
  { hour: "11h30", type: "lessives", label: "Lessives" },
];

const MANON_DAY: DayTemplate = [
  HALL_B2,
  { hour: "8h30",  type: "menage" },
  { hour: "9h30",  type: "menage" },
  { hour: "10h00", type: "menage" },
  { hour: "11h30", type: "pause", label: "Pause repos" },
  { hour: "12h00", type: "plonge", label: "Plonge cuisine" },
  { hour: "14h00", type: "menage" },
];

export const AGENT_CONFIGS: Record<string, AgentConfig> = {
  Christelle: {
    name: "Christelle",
    week: {
      lundi:    CHRISTELLE_FULL,
      mardi:    CHRISTELLE_FULL,
      mercredi: CHRISTELLE_MERCREDI,
      jeudi:    CHRISTELLE_JEUDI,
      vendredi: CHRISTELLE_VENDREDI,
    },
    rotation: null,
  },
  Manon: {
    name: "Manon",
    week: {
      lundi: MANON_DAY, mardi: MANON_DAY, mercredi: MANON_DAY,
      jeudi: MANON_DAY, vendredi: MANON_DAY,
    },
    rotation: null,
  },
  Lana: {
    name: "Lana",
    week: {
      lundi: MANON_DAY, mardi: MANON_DAY, mercredi: MANON_DAY,
      jeudi: MANON_DAY, vendredi: MANON_DAY,
    },
    rotation: { anchorWeek: 40, weeksOn: 2, weeksOff: 2 },
  },
};

const DAY_NAME_FROM_ISO: Record<number, DayName> = {
  1: "lundi", 2: "mardi", 3: "mercredi", 4: "jeudi", 5: "vendredi",
};

export function getAgentConfig(name: string): AgentConfig | null {
  const key = name.trim().toLowerCase();
  const found = Object.keys(AGENT_CONFIGS).find(
    (k) =>
      k.toLowerCase() === key ||
      k.toLowerCase() === key.split(/\s+/)[0],
  );
  return found ? AGENT_CONFIGS[found] : null;
}

export function getDayTemplate(
  config: AgentConfig,
  isoDay: number,
): DayTemplate | null {
  const dayName = DAY_NAME_FROM_ISO[isoDay];
  if (!dayName) return null;
  return config.week[dayName] ?? null;
}

export function defaultLabelFor(type: SlotType): string {
  switch (type) {
    case "hall":     return "Hall";
    case "pause":    return "Pause";
    case "plonge":   return "Plonge";
    case "lessives": return "Lessives";
    case "common":   return "Parties communes";
    case "menage":   return "";
  }
}

// ============================================================================
// 2. TYPES PUBLICS
// ============================================================================

export interface Resident {
  id: string;
  room: string;
  nom: string;
  building: string;
  nb: number;
  allowedDays: number[];
  disallowDays: number[];
  scheduleHours: string[];
  additionalService: string | null;
  assigned: number;
  priority: number;
}

export interface Agent {
  id: number;
  name: string;
  isAbsent: boolean;
  config: AgentConfig;
}

export interface Task {
  time: string;
  resident?: string;
  room?: string;
  building?: string;
  type: string;
  agent?: string;
}

export interface DayScheduleFormatted {
  date: string;
  isoDate: string;
  tasks: Task[];
}

export interface WeekSchedule {
  label: string;
  days: DayScheduleFormatted[];
}

// ─── Rapport ────────────────────────────────────────────────────────────────

export interface UnplacedResident {
  nom: string;
  room: string;
  assigned: number;
  nb: number;
  priority: number;
  scheduleHours: string[];
  allowedDays: number[];
  disallowDays: number[];
  reason: string;
}

export interface ResidentStatus {
  nom: string;
  room: string;
  target: number;
  assigned: number;
  priority: number;
  ok: boolean;
}

export interface PriorityGroup {
  priority: number;
  count: number;
  placed: number;
}

export interface AgentSlotStats {
  used: number;
  total: number;
  fillRate: number;
  /** Cible équilibrée calculée au prorata de la demande. */
  target: number;
  /** Écart : target - used. Positif = sous-utilisé, négatif = sur-utilisé. */
  gap: number;
}

export interface PlanningReport {
  residents: { placed: number; total: number; percentage: number };
  demand: { placed: number; total: number; percentage: number };
  unplaced: UnplacedResident[];
  allResidents: ResidentStatus[];
  byPriority: PriorityGroup[];
  slotsByAgent: Record<string, AgentSlotStats>;
  passes: number;
  generatedAt: string;
}

export interface MonthlyScheduleResponse {
  title: string;
  subtitle: string;
  agent: string;
  weeks: WeekSchedule[];
  report: PlanningReport;
}

// ============================================================================
// 3. TABLEAU DE PLACEMENT
// ============================================================================

export type PlacementRow = Record<string, string | null>;
export type PlacementDay = Record<number, PlacementRow>;
export type PlacementTable = Record<string, PlacementDay>;

type MonthInstance = Record<string, Record<string, PlacementRow>>;

export function buildEmptyPlacementTable(agents: Agent[]): PlacementTable {
  const table: PlacementTable = {};

  for (const agent of agents) {
    if (agent.isAbsent) continue;
    table[agent.name] = {};

    for (const isoDay of [1, 2, 3, 4, 5]) {
      const dayTpl = getDayTemplate(agent.config, isoDay);
      if (!dayTpl) continue;

      const row: PlacementRow = {};
      for (const slot of dayTpl) {
        row[slot.hour] =
          slot.type === "menage"
            ? null
            : (slot.label ?? defaultLabelFor(slot.type));
      }
      table[agent.name][isoDay] = row;
    }
  }
  return table;
}

// ============================================================================
// 4. UTILITAIRES
// ============================================================================

const DEFAULT_PER_MONTH = 4;
const NB_WEEKLY_LIMIT_THRESHOLD = 5;
const MAX_PASSES = 5;

function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const dayKey = (d: Date) => format(d, "yyyy-MM-dd");
const weekKey = (d: Date) =>
  `${getISOWeekYear(d)}-W${String(getISOWeek(d)).padStart(2, "0")}`;

function pgArray<T = unknown>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

const DAY_NAMES: Record<string, number> = {
  lundi: 1, mardi: 2, mercredi: 3, jeudi: 4, vendredi: 5, samedi: 6, dimanche: 7,
  lun: 1, mar: 2, mer: 3, jeu: 4, ven: 5, sam: 6, dim: 7,
};

function toDayNumber(value: unknown): number | null {
  if (typeof value === "number") return value >= 1 && value <= 7 ? value : null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  const n = Number(trimmed);
  if (Number.isInteger(n) && n >= 1 && n <= 7) return n;
  const key = trimmed.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return DAY_NAMES[key] ?? null;
}

function normalizeHour(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const m = value.trim().toUpperCase().replace(/\s+/g, "").match(/^(\d{1,2})[H:](\d{2})$/);
  if (!m) return null;
  return `${String(Number(m[1]))}h${m[2]}`;
}

function hourToMin(h: string): number {
  const m = h.match(/^(\d{1,2})h(\d{2})$/);
  if (!m) return 0;
  return Number(m[1]) * 60 + Number(m[2]);
}

function fixedTypeFromLabel(label: string): string {
  const l = label.toLowerCase();
  if (l.includes("hall")) return "hall";
  if (l.includes("pause") || l.includes("fin")) return "pause";
  if (l.includes("plonge")) return "plonge";
  if (l.includes("lessives")) return "lessives";
  if (l.includes("parties communes")) return "common";
  return "fixed";
}

function agentWorksOn(agent: Agent, dateObj: Date): boolean {
  if (agent.isAbsent) return false;
  const isoDay = getISODay(dateObj);
  if (!getDayTemplate(agent.config, isoDay)) return false;

  const rule = agent.config.rotation;
  if (rule) {
    const week = getISOWeek(dateObj);
    const cycle = rule.weeksOn + rule.weeksOff;
    const diff = ((week - rule.anchorWeek) % cycle + cycle) % cycle;
    if (diff >= rule.weeksOn) return false;
  }
  return true;
}

const DAY_LABEL_SHORT = ["", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

// ============================================================================
// 5. PRIORITÉ
// ============================================================================

function computePriority(
  scheduleHours: string[],
  allowedDays: number[],
  disallowDays: number[],
  nb: number,
): number {
  let priority = 0;

  if (scheduleHours.length > 0) {
    priority += 10;
    if (scheduleHours.length <= 2) priority += 5;
  }

  if (allowedDays.length > 0 && allowedDays.length < 5) {
    priority += 10;
    if (allowedDays.length <= 3) priority += 5;
    if (allowedDays.length <= 1) priority += 5;
  }

  if (disallowDays.length > 0) priority += 3;

  if (nb >= 6) priority += 3;
  else if (nb >= 4) priority += 1;

  return priority;
}

// ============================================================================
// 6. FETCH SUPABASE
// ============================================================================

export async function fetchResidentsFromSupabase(): Promise<Resident[]> {
  const supabase = createClient();
  const [residentsRes, constraintsRes] = await Promise.all([
    supabase.from("residents").select("id, room, first_name, last_name, building"),
    supabase
      .from("constraintes")
      .select(
        "resident_id, per_month, schedule_hours, allowed_days, disallow_days, additional_service",
      ),
  ]);

  if (residentsRes.error) throw residentsRes.error;
  if (constraintsRes.error) console.error("Erreur contraintes :", constraintsRes.error);

  const byResident = new Map<string, Record<string, unknown>>();
  for (const c of constraintsRes.data ?? []) {
    if (c.resident_id) byResident.set(c.resident_id as string, c);
  }

  const residents: Resident[] = [];
  for (const item of residentsRes.data ?? []) {
    if (!item.room) continue;
    const fullName =
      [item.first_name, item.last_name].filter(Boolean).join(" ") || item.room;
    if (fullName.includes("Test User")) continue;

    const c = byResident.get(item.id);
    const nb = Number(c?.per_month ?? DEFAULT_PER_MONTH);
    if (!Number.isFinite(nb) || nb <= 0) continue;

    const allowedDays = pgArray(c?.allowed_days)
      .map(toDayNumber)
      .filter((n): n is number => n !== null);

    const disallowDays = pgArray(c?.disallow_days)
      .map(toDayNumber)
      .filter((n): n is number => n !== null);

    const scheduleHours = pgArray(c?.schedule_hours)
      .map(normalizeHour)
      .filter((h): h is string => !!h);

    residents.push({
      id: item.id,
      room: item.room,
      nom: fullName,
      building: item.building ?? "1",
      nb,
      allowedDays,
      disallowDays,
      scheduleHours,
      additionalService:
        typeof c?.additional_service === "string" ? c.additional_service : null,
      assigned: 0,
      priority: computePriority(scheduleHours, allowedDays, disallowDays, nb),
    });
  }
  return residents;
}

export async function fetchAgentsFromSupabase(): Promise<Agent[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("agent")
    .select("id, name, isAbsent");

  if (error) {
    console.error("Erreur récupération agents :", error);
    return [];
  }

  return (data ?? [])
    .filter((a) => !!a.name && !a.isAbsent)
    .map((a) => {
      const config = getAgentConfig(a.name as string);
      if (!config) {
        console.warn(`[planning] Pas de template pour "${a.name}" — ignoré.`);
        return null;
      }
      return { id: a.id, name: a.name as string, isAbsent: false, config };
    })
    .filter((a): a is Agent => a !== null);
}

export async function fetchPreviousMonthAssignments(
  year: number,
  month: number,
): Promise<Map<string, Set<string>>> {
  const supabase = createClient();
  const prev = subMonths(new Date(year, month - 1, 1), 1);
  const from = format(new Date(prev.getFullYear(), prev.getMonth(), 1), "yyyy-MM-dd");
  const to = format(new Date(prev.getFullYear(), prev.getMonth() + 1, 0), "yyyy-MM-dd");

  const { data, error } = await supabase
    .from("recents_menages")
    .select("resident_id, date, residents:resident_id (room)")
    .gte("date", from)
    .lte("date", to);

  if (error) return new Map();

  const result = new Map<string, Set<string>>();
  for (const row of data ?? []) {
    const room = (row as any).residents?.room as string | undefined;
    if (!room || !row.date) continue;
    const k = weekKey(new Date(row.date));
    if (!result.has(room)) result.set(room, new Set());
    result.get(room)!.add(k);
  }
  return result;
}

// ============================================================================
// 7. GÉNÉRATION — Construction du mois
// ============================================================================

export interface GenerateOptions {
  agents?: Agent[];
  previousMonthAssignments?: Map<string, Set<string>>;
}

function expandToMonth(
  template: PlacementTable,
  agents: Agent[],
  workDays: Date[],
): MonthInstance {
  const inst: MonthInstance = {};

  for (const agent of agents) {
    if (agent.isAbsent) continue;
    inst[agent.name] = {};

    for (const day of workDays) {
      if (!agentWorksOn(agent, day)) continue;
      const isoDay = getISODay(day);
      const tplRow = template[agent.name]?.[isoDay];
      if (!tplRow) continue;
      inst[agent.name][dayKey(day)] = { ...tplRow };
    }
  }
  return inst;
}

// ============================================================================
// 8. REMPLISSAGE — Priorités + équilibrage agents
// ============================================================================

interface FillStats {
  residentsPlaced: number;
  totalResidents: number;
  totalPlaced: number;
  totalDemand: number;
  unplaced: UnplacedResident[];
  slotsByAgent: Record<string, { used: number; total: number }>;
  targets: Record<string, number>;
  passes: number;
  allResidents: ResidentStatus[];
  byPriority: PriorityGroup[];
}

function fillMonthInstance(
  inst: MonthInstance,
  residents: Resident[],
  workDays: Date[],
  weekly: { inc: (d: Date, r: string) => void; get: (d: Date, r: string) => number },
): FillStats {
  type Cell = { agent: string; date: Date; dk: string; hour: string };

  // --- 1. Toutes les cellules "menage" du mois ---
  const cells: Cell[] = [];
  const slotsByAgent: Record<string, { used: number; total: number }> = {};

  for (const agentName of Object.keys(inst)) {
    slotsByAgent[agentName] = { used: 0, total: 0 };
    for (const dk of Object.keys(inst[agentName])) {
      const date = workDays.find((d) => dayKey(d) === dk)!;
      for (const [hour, val] of Object.entries(inst[agentName][dk])) {
        if (val === null) {
          cells.push({ agent: agentName, date, dk, hour });
          slotsByAgent[agentName].total++;
        }
      }
    }
  }

  const dayRooms = new Map<string, Set<string>>();
  for (const day of workDays) dayRooms.set(dayKey(day), new Set());

  // --- 2. CIBLES par agent (équilibrage) ---
  // Distribution itérative : on attribue d'abord une part égale, plafonnée
  // par la capacité de chaque agent, en commençant par les agents les plus
  // capacitaires.
  const agentNames = Object.keys(slotsByAgent);
  const totalDemand = residents.reduce((acc, r) => acc + r.nb, 0);
  const targets: Record<string, number> = {};

  const sortedByCapacity = [...agentNames].sort(
    (a, b) => slotsByAgent[b].total - slotsByAgent[a].total,
  );
  let remaining = totalDemand;
  let remainingAgents = agentNames.length;

  for (const name of sortedByCapacity) {
    const ideal = Math.ceil(remaining / remainingAgents);
    const capped = Math.min(slotsByAgent[name].total, ideal);
    targets[name] = capped;
    remaining -= capped;
    remainingAgents--;
  }

  // --- 3. Cellules compatibles pour un résident ---
  function compatibleCells(res: Resident): Cell[] {
    return cells.filter((c) => {
      if (inst[c.agent][c.dk][c.hour] !== null) return false;
      if (dayRooms.get(c.dk)!.has(res.room)) return false;
      const iso = getISODay(c.date);
      if (res.disallowDays.includes(iso)) return false;
      if (res.allowedDays.length > 0 && !res.allowedDays.includes(iso)) {
        return false;
      }
      if (res.scheduleHours.length > 0 && !res.scheduleHours.includes(c.hour)) {
        return false;
      }
      return true;
    });
  }

  // --- 4. Choix équilibré d'une cellule ---
  function pickBalancedCell(candidates: Cell[]): Cell {
    const scored = candidates.map((c) => ({
      cell: c,
      balance: (targets[c.agent] ?? 0) - slotsByAgent[c.agent].used,
    }));
    const maxBalance = Math.max(...scored.map((s) => s.balance));
    const best = scored.filter((s) => s.balance === maxBalance);
    return best[Math.floor(Math.random() * best.length)].cell;
  }

  // --- 5. Tri initial : PRIORITÉ → flexibilité → nb ---
  const scored = residents.map((res) => ({
    res,
    flex: compatibleCells(res).length,
  }));

  scored.sort((a, b) => {
    if (a.res.priority !== b.res.priority) {
      return b.res.priority - a.res.priority;
    }
    if (a.flex !== b.flex) return a.flex - b.flex;
    return b.res.nb - a.res.nb;
  });

  // --- 6. Multi-passes avec re-tri dynamique ---
  let passes = 0;
  let progress = true;

  while (progress && passes < MAX_PASSES) {
    passes++;
    progress = false;

    const currentOrder = scored
      .map((entry) => ({
        res: entry.res,
        flex: compatibleCells(entry.res).length,
      }))
      .sort((a, b) => {
        if (a.flex === 0 && b.flex !== 0) return 1;
        if (b.flex === 0 && a.flex !== 0) return -1;
        if (a.res.priority !== b.res.priority) {
          return b.res.priority - a.res.priority;
        }
        if (a.flex !== b.flex) return a.flex - b.flex;
        return b.res.nb - a.res.nb;
      });

    for (const { res } of currentOrder) {
      while (res.assigned < res.nb) {
        const candidates = compatibleCells(res);
        if (candidates.length === 0) break;

        // Priorité : semaine où le résident n'est pas déjà placé
        let pool = candidates;
        if (res.nb <= NB_WEEKLY_LIMIT_THRESHOLD) {
          const preferred = candidates.filter(
            (c) => weekly.get(c.date, res.room) < 1,
          );
          if (preferred.length > 0) pool = preferred;
        }

        // Choix équilibré par agent
        const chosen = pickBalancedCell(pool);

        inst[chosen.agent][chosen.dk][chosen.hour] = res.nom;
        res.assigned++;
        dayRooms.get(chosen.dk)!.add(res.room);
        weekly.inc(chosen.date, res.room);
        slotsByAgent[chosen.agent].used++;
        progress = true;
      }
    }
  }

  // --- 7. Bilan ---
  const unplaced: UnplacedResident[] = scored
    .filter(({ res }) => res.assigned < res.nb)
    .map(({ res }) => {
      const remaining = compatibleCells(res).length;
      let reason: string;
      if (res.scheduleHours.length > 0 && remaining === 0) {
        reason = `Aucun créneau ${res.scheduleHours.join("/")} compatible ce mois`;
      } else if (res.allowedDays.length > 0 && remaining === 0) {
        reason = `Aucun jour autorisé compatible`;
      } else if (remaining === 0) {
        reason = `Toutes les cellules sont déjà occupées`;
      } else {
        reason = `Conflit avec d'autres résidents sur les mêmes créneaux`;
      }
      return {
        nom: res.nom,
        room: res.room,
        assigned: res.assigned,
        nb: res.nb,
        priority: res.priority,
        scheduleHours: res.scheduleHours,
        allowedDays: res.allowedDays,
        disallowDays: res.disallowDays,
        reason,
      };
    });

  const allResidents: ResidentStatus[] = scored.map(({ res }) => ({
    nom: res.nom,
    room: res.room,
    target: res.nb,
    assigned: res.assigned,
    priority: res.priority,
    ok: res.assigned >= res.nb,
  }));

  const byPriorityMap = new Map<number, { count: number; placed: number }>();
  for (const r of allResidents) {
    const e = byPriorityMap.get(r.priority) ?? { count: 0, placed: 0 };
    e.count++;
    if (r.ok) e.placed++;
    byPriorityMap.set(r.priority, e);
  }
  const byPriority: PriorityGroup[] = [...byPriorityMap.entries()]
    .map(([priority, { count, placed }]) => ({ priority, count, placed }))
    .sort((a, b) => b.priority - a.priority);

  return {
    residentsPlaced: scored.filter(({ res }) => res.assigned >= res.nb).length,
    totalResidents: scored.length,
    totalPlaced: scored.reduce((acc, { res }) => acc + res.assigned, 0),
    totalDemand: scored.reduce((acc, { res }) => acc + res.nb, 0),
    unplaced,
    slotsByAgent,
    targets,
    passes,
    allResidents,
    byPriority,
  };
}

// ============================================================================
// 9. CONVERSION TABLEAU → PLANNING
// ============================================================================

function instanceToSchedule(
  inst: MonthInstance,
  agents: Agent[],
  residents: Resident[],
  workDays: Date[],
  year: number,
  month: number,
  stats: FillStats,
): MonthlyScheduleResponse {
  const resByNom = new Map<string, Resident>();
  for (const r of residents) resByNom.set(r.nom, r);

  const weeksMap = new Map<string, DayScheduleFormatted[]>();

  for (const day of workDays) {
    const dk = dayKey(day);
    const k = weekKey(day);
    if (!weeksMap.has(k)) weeksMap.set(k, []);

    const tasks: Task[] = [];
    const seenFixed = new Set<string>();

    for (const agent of agents) {
      const row = inst[agent.name]?.[dk];
      if (!row) continue;

      for (const [hour, val] of Object.entries(row)) {
        if (val === null) continue;
        const res = resByNom.get(val);

        if (res) {
          tasks.push({
            time: hour,
            type: "menage",
            resident: val,
            room: res.room,
            building: res.building,
            agent: agent.name,
          });
        } else {
          const key = `${agent.name}|${hour}|${val}`;
          if (seenFixed.has(key)) continue;
          seenFixed.add(key);
          tasks.push({
            time: hour,
            type: fixedTypeFromLabel(val),
            resident: val,
            agent: agent.name,
          });
        }
      }
    }

    tasks.sort((a, b) => hourToMin(a.time) - hourToMin(b.time));

    const frenchDateStr = format(day, "EEEE d MMMM", { locale: fr });
    const formattedDate =
      frenchDateStr.charAt(0).toUpperCase() + frenchDateStr.slice(1);

    weeksMap.get(k)!.push({ date: formattedDate, isoDate: dk, tasks });
  }

  const sortedWeeks = [...weeksMap.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  );

  const formattedWeeks: WeekSchedule[] = [];
  for (const [, days] of sortedWeeks) {
    if (days.length === 0) continue;
    const first = days[0].date.split(" ");
    const last = days[days.length - 1].date.split(" ");
    formattedWeeks.push({
      label: `Semaine du ${first[1]} au ${last[1]} ${last[2]}`,
      days,
    });
  }

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
  ];

  const activeAgents = agents.filter((a) => !a.isAbsent);
  const agentLabel =
    activeAgents.length === 1
      ? activeAgents[0].name
      : `Équipe (${activeAgents.map((a) => a.name).join(", ")})`;

  // --- Rapport ---
  const slotsByAgentReport: Record<string, AgentSlotStats> = {};
  for (const [name, { used, total }] of Object.entries(stats.slotsByAgent)) {
    const target = stats.targets[name] ?? 0;
    slotsByAgentReport[name] = {
      used,
      total,
      fillRate: total > 0 ? Math.round((used / total) * 100) : 0,
      target,
      gap: target - used,
    };
  }

  const report: PlanningReport = {
    residents: {
      placed: stats.residentsPlaced,
      total: stats.totalResidents,
      percentage:
        stats.totalResidents > 0
          ? Math.round((stats.residentsPlaced / stats.totalResidents) * 100)
          : 0,
    },
    demand: {
      placed: stats.totalPlaced,
      total: stats.totalDemand,
      percentage:
        stats.totalDemand > 0
          ? Math.round((stats.totalPlaced / stats.totalDemand) * 100)
          : 0,
    },
    unplaced: stats.unplaced,
    allResidents: stats.allResidents,
    byPriority: stats.byPriority,
    slotsByAgent: slotsByAgentReport,
    passes: stats.passes,
    generatedAt: new Date().toISOString(),
  };

  return {
    title: `Planning ménage — ${monthNames[month - 1]} ${year}`,
    subtitle: "Résidence Séniors Aramons / Les Palatines",
    agent: agentLabel,
    weeks: formattedWeeks,
    report,
  };
}

// ============================================================================
// 10. POINT D'ENTRÉE PRINCIPAL
// ============================================================================

export function generateMonthlySchedule(
  residentsInput: Resident[],
  year: number,
  month: number,
  options: GenerateOptions = {},
): MonthlyScheduleResponse {
  const agents = (options.agents ?? []).filter((a) => !a.isAbsent);

  if (agents.length === 0) {
    return {
      title: `Planning ménage — ${month}/${year}`,
      subtitle: "Résidence Séniors Aramons / Les Palatines",
      agent: "Aucun agent disponible",
      weeks: [],
      report: {
        residents: { placed: 0, total: 0, percentage: 0 },
        demand: { placed: 0, total: 0, percentage: 0 },
        unplaced: [],
        allResidents: [],
        byPriority: [],
        slotsByAgent: {},
        passes: 0,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  const totalDays = getDaysInMonth(new Date(year, month - 1));
  const workDays: Date[] = [];
  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(year, month - 1, day);
    if (!isWeekend(d)) workDays.push(d);
  }

  const residents = residentsInput.map((r) => ({ ...r, assigned: 0 }));

  const template = buildEmptyPlacementTable(agents);
  const inst = expandToMonth(template, agents, workDays);

  const weeklyMap = new Map<string, Map<string, number>>();
  const weekly = {
    inc: (d: Date, room: string) => {
      const k = weekKey(d);
      let m = weeklyMap.get(k);
      if (!m) weeklyMap.set(k, (m = new Map()));
      m.set(room, (m.get(room) ?? 0) + 1);
    },
    get: (d: Date, room: string) =>
      weeklyMap.get(weekKey(d))?.get(room) ?? 0,
  };

  const stats = fillMonthInstance(inst, residents, workDays, weekly);

  return instanceToSchedule(inst, agents, residents, workDays, year, month, stats);
}

// ============================================================================
// 11. FILTRAGE PAR AGENT
// ============================================================================

export function filterScheduleByAgent(
  schedule: MonthlyScheduleResponse,
  agentName: string,
): MonthlyScheduleResponse {
  const weeks: WeekSchedule[] = [];

  for (const week of schedule.weeks) {
    const days: DayScheduleFormatted[] = [];

    for (const day of week.days) {
      // L'agent a-t-il au moins un ménage ce jour-là ?
      const hasMenage = day.tasks.some(
        (t) => t.type === "menage" && t.agent === agentName,
      );
      if (!hasMenage) continue;

      // On garde : les ménages de l'agent ET ses tâches fixes
      const tasks = day.tasks.filter((t) => t.agent === agentName);

      days.push({ ...day, tasks });
    }

    if (days.length > 0) weeks.push({ ...week, days });
  }

  return { ...schedule, agent: agentName, weeks };
}

export function listAgentsInSchedule(
  schedule: MonthlyScheduleResponse,
): string[] {
  const names = new Set<string>();
  for (const w of schedule.weeks) {
    for (const d of w.days) {
      for (const t of d.tasks) {
        if (t.type === "menage" && t.agent) names.add(t.agent);
      }
    }
  }
  return [...names].sort();
}

// ============================================================================
// 12. AFFICHAGE DU RAPPORT
// ============================================================================

export function printReport(report: PlanningReport): void {
  const line = "═".repeat(66);

  console.log(`\n${line}`);
  console.log("  📊 RAPPORT DE GÉNÉRATION DU PLANNING");
  console.log(line);

  const { placed: rp, total: rt, percentage: rpct } = report.residents;
  const rIcon = rp === rt ? "✅" : rp / rt >= 0.9 ? "⚠️ " : "❌";
  console.log(`\n  ${rIcon} Résidents placés : ${rp} / ${rt}  (${rpct}%)`);

  const { placed: dp, total: dt, percentage: dpct } = report.demand;
  const dIcon = dp === dt ? "✅" : dp / dt >= 0.9 ? "⚠️ " : "❌";
  console.log(`  ${dIcon} Ménages placés  : ${dp} / ${dt}  (${dpct}%)`);

  // Capacité par agent + cible
  console.log(`\n  🧹 Capacité par agent (cible = quota équilibré) :`);
  for (const [name, { used, total, target, gap, fillRate }] of Object.entries(report.slotsByAgent)) {
    const bar = "█".repeat(Math.round(fillRate / 5)).padEnd(20, "░");
    const gapIcon = gap === 0 ? "✅" : gap > 0 ? "⚠️ " : "＋ ";
    console.log(
      `     ${gapIcon} ${name.padEnd(12)} ${bar} ${used}/${total} (${fillRate}%)`,
    );
    const gapLabel =
      gap === 0
        ? `cible ${target} atteinte`
        : gap > 0
          ? `${gap} de moins que la cible (${target})`
          : `${-gap} de plus que la cible (${target})`;
    console.log(`        ${gapLabel}`);
  }

  // Priorités
  if (report.byPriority.length > 0) {
    console.log(`\n  🎯 Placement par priorité (haut = plus contraint) :`);
    for (const { priority, count, placed } of report.byPriority) {
      const icon = placed === count ? "✅" : placed / count >= 0.9 ? "⚠️ " : "❌";
      const label = priority === 0 ? "flexible" : `prio ${priority}`;
      console.log(
        `     ${icon} ${label.padEnd(12)} ${placed}/${count} résidents placés`,
      );
    }
  }

  console.log(`\n  🔄 Passes d'optimisation : ${report.passes}`);

  // Sous-effectifs
  const partial = report.allResidents.filter((r) => !r.ok);
  if (partial.length > 0) {
    console.log(`\n  📋 ${partial.length} résident(s) en sous-effectif :\n`);
    for (const r of partial.sort((a, b) => b.priority - a.priority)) {
      const u = report.unplaced.find((x) => x.room === r.room);
      const constraints: string[] = [];
      if (u?.scheduleHours.length) constraints.push(`heures: ${u.scheduleHours.join("/")}`);
      if (u?.allowedDays.length && u.allowedDays.length < 5) {
        constraints.push(
          `jours OK: ${u.allowedDays.map((n) => DAY_LABEL_SHORT[n]).join(",")}`,
        );
      }
      if (u?.disallowDays.length) {
        constraints.push(
          `jours ✕: ${u.disallowDays.map((n) => DAY_LABEL_SHORT[n]).join(",")}`,
        );
      }
      const cstr = constraints.length ? ` [${constraints.join(" · ")}]` : "";
      console.log(
        `     • [prio ${String(r.priority).padStart(2)}] ${r.nom} (Ch. ${r.room}) — ${r.assigned}/${r.target}${cstr}`,
      );
      if (u) console.log(`       → ${u.reason}`);
    }
  } else {
    console.log(`\n  ✅ Tous les résidents ont reçu leur quota exact.`);
  }

  console.log(`\n${line}\n`);
}

// ============================================================================
// 13. PERSISTANCE SUPABASE
// ============================================================================

export async function savePlanningToSupabase(
  schedule: MonthlyScheduleResponse,
  year: number,
  month: number,
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("planning")
    .upsert(
      {
        year,
        month,
        date: new Date().toISOString().split("T")[0],
        data: schedule,
      },
      { onConflict: "year,month" },
    )
    .select()
    .single();

  if (error) {
    if (error.code === "42P10") {
      throw new Error(
        "La contrainte UNIQUE (year, month) n'existe pas sur la table planning. " +
        "Exécute : ALTER TABLE public.planning " +
        "ADD CONSTRAINT planning_year_month_unique UNIQUE (year, month);"
      );
    }
    console.error("Erreur sauvegarde planning :", error);
    throw error;
  }
  return data;
}

// ============================================================================
// 14. POINT D'ENTRÉE HAUT NIVEAU
// ============================================================================

export interface GeneratePlanningParams {
  year: number;
  month: number;
  save?: boolean;
}

export async function generateAndSaveMonthlyPlanning({
  year,
  month,
  save = true,
}: GeneratePlanningParams): Promise<MonthlyScheduleResponse> {
  const [residents, agents, previous] = await Promise.all([
    fetchResidentsFromSupabase(),
    fetchAgentsFromSupabase(),
    fetchPreviousMonthAssignments(year, month),
  ]);

  const schedule = generateMonthlySchedule(residents, year, month, {
    agents,
    previousMonthAssignments: previous,
  });

  printReport(schedule.report);

  if (save) await savePlanningToSupabase(schedule, year, month);
  return schedule;
}