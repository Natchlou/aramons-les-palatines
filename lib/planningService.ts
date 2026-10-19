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
  | "navette"
  | "pause"
  | "plonge"
  | "lessives"
  | "common";

export interface TemplateSlot {
  hour: string;
  type: SlotType;
  label?: string;
  building?: string;
  /** Durée en minutes — si défini, prime sur le calcul par gap. */
  duration?: number;
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
  /**
   * Règle de rotation optionnelle (semaines on/off).
   * `null` / `undefined` = pas de rotation (agent travaille toutes les semaines).
   */
  rotation?: RotationRule | null;
}

const HALL_B1: TemplateSlot = { hour: "8h00", type: "hall", building: "1", duration: 30 };
const HALL_B2: TemplateSlot = { hour: "8h00", type: "hall", building: "2", duration: 30 };

const CHRISTELLE_FULL: DayTemplate = [
  HALL_B1,
  { hour: "8h30",  type: "menage" },
  { hour: "10h00", type: "menage" },
  { hour: "11h30", type: "pause", label: "Pause repas", duration: 30 },
  { hour: "12h00", type: "menage" },
  { hour: "13h30", type: "menage" },
  { hour: "15h00", type: "common", label: "Parties communes", duration: 60 },
];

const CHRISTELLE_MERCREDI: DayTemplate = [
  HALL_B1,
  { hour: "8h30",  type: "menage" },
  { hour: "10h00", type: "menage" },
  // Marqueur de fin de journée → pas de durée.
  { hour: "11h30", type: "pause", label: "Fin 11h30" },
];

const CHRISTELLE_JEUDI: DayTemplate = [
  { hour: "8h00",  type: "hall", building: "1", duration: 30 },
  { hour: "8h30",  type: "menage" },
  { hour: "10h00", type: "menage" },
  { hour: "11h30", type: "pause", label: "Pause repas", duration: 30 },
  { hour: "12h00", type: "menage" },
  { hour: "13h30", type: "menage" },
  { hour: "15h00", type: "common", label: "Parties communes", duration: 60 },
];

const CHRISTELLE_VENDREDI: DayTemplate = [
  HALL_B1,
  { hour: "8h30",  type: "menage" },
  { hour: "10h00", type: "navette", duration: 90 },
  { hour: "11h30", type: "lessives", label: "Lessives", duration: 30 },
];

const MANON_DAY: DayTemplate = [
  HALL_B2,
  { hour: "8h30",  type: "menage" },
  { hour: "10h00", type: "menage" },
  { hour: "11h30", type: "pause", label: "Pause repas", duration: 30 },
  { hour: "12h00", type: "plonge", label: "Plonge cuisine", duration: 120 },
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
  },
  Manon: {
    name: "Manon",
    week: {
      lundi: MANON_DAY, mardi: MANON_DAY, mercredi: MANON_DAY,
      jeudi: MANON_DAY, vendredi: MANON_DAY,
    },
  },
  Lana: {
    name: "Lana",
    week: {
      lundi: MANON_DAY, mardi: MANON_DAY, mercredi: MANON_DAY,
      jeudi: MANON_DAY, vendredi: MANON_DAY,
    },
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
    case "navette":  return "Navette";
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

/**
 * Plage d'absence d'un agent — source : table `agent_absences`.
 * Bornes incluses, comparées en date-part (aligné avec le frontend).
 */
export interface AbsencePeriod {
  /** "vacances" | "ecole" | "ferie" | … (string pour tolérer l'inconnu). */
  type: string;
  /** ISO datetime, ex. "2026-10-13 00:00:00". */
  start_date: string;
  /** ISO datetime, ex. "2026-10-20 00:00:00". */
  end_date: string;
  motif: string | null;
}

export interface Agent {
  id: number;
  name: string;
  isAbsent: boolean;
  config: AgentConfig;
  /**
   * Plages d'absence. Optionnel pour ne pas casser d'anciens call-sites ;
   * `undefined` / `[]` = aucune absence.
   */
  absences?: AbsencePeriod[];
}

export interface Task {
  time: string;
  resident?: string;
  room?: string;
  building?: string;
  type: string;
  agent?: string;
  /** Durée explicite en minutes (fixes uniquement, prime sur le gap). */
  duration?: number;
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
  target: number;
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

/** Convertit "8h00" (format template) → "08:00:00" (type `time` Postgres). */
function hourToTimeString(h: string): string {
  const m = h.match(/^(\d{1,2})h(\d{2})$/);
  if (!m) return "00:00:00";
  return `${m[1].padStart(2, "0")}:${m[2]}:00`;
}

function fixedTypeFromLabel(label: string): string {
  const l = label.toLowerCase();
  if (l.includes("hall")) return "hall";
  if (l.includes("navette")) return "navette";
  if (l.includes("pause") || l.includes("fin")) return "pause";
  if (l.includes("plonge")) return "plonge";
  if (l.includes("lessives")) return "lessives";
  if (l.includes("parties communes")) return "common";
  return "fixed";
}

/**
 * Vrai si `dateObj` tombe dans l'une des plages d'absence de l'agent.
 * Comparaison en date-part (`YYYY-MM-DD`), bornes incluses.
 */
function isAbsentOn(agent: Agent, dateObj: Date): boolean {
  const list = agent.absences;
  if (!list || list.length === 0) return false;
  const iso = dayKey(dateObj);
  return list.some((a) => {
    const start = a.start_date.slice(0, 10);
    const end = a.end_date.slice(0, 10);
    return iso >= start && iso <= end;
  });
}

function agentWorksOn(agent: Agent, dateObj: Date): boolean {
  if (agent.isAbsent) return false;
  if (isAbsentOn(agent, dateObj)) return false;

  const isoDay = getISODay(dateObj);
  if (!getDayTemplate(agent.config, isoDay)) return false;

  const rule = agent.config.rotation ?? null;
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

  if (residentsRes.error) {
    const e = residentsRes.error;
    console.error(
      "[planning] Impossible de charger les résidents :",
      `\n  code    : ${e.code ?? "?"}`,
      `\n  message : ${e.message ?? "?"}`,
      `\n  details : ${e.details ?? "—"}`,
    );
    throw residentsRes.error;
  }
  if (constraintsRes.error) {
    const e = constraintsRes.error;
    console.error(
      "[planning] Impossible de charger les contraintes :",
      `\n  code    : ${e.code ?? "?"}`,
      `\n  message : ${e.message ?? "?"}`,
      `\n  details : ${e.details ?? "—"}`,
    );
  }

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

/**
 * Récupère toutes les absences et les regroupe par `agent_id`.
 * Retourne une `Map` vide en cas d'erreur (le planning continue sans
 * filtrage d'absence, ce qui est préférable à un crash).
 */
export async function fetchAgentAbsencesFromSupabase(): Promise<
  Map<number, AbsencePeriod[]>
> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("agent_absences")
    .select("agent_id, type, start_date, end_date, motif");

  if (error) {
    const e = error;
    console.error(
      "[planning] Impossible de charger les absences :",
      `\n  code    : ${e.code ?? "?"}`,
      `\n  message : ${e.message ?? "?"}`,
      `\n  details : ${e.details ?? "—"}`,
    );
    return new Map();
  }

  const byAgent = new Map<number, AbsencePeriod[]>();
  for (const row of data ?? []) {
    if (row.agent_id == null) continue;
    const period: AbsencePeriod = {
      type: row.type ?? "absence",
      start_date: String(row.start_date),
      end_date: String(row.end_date),
      motif: row.motif ?? null,
    };
    const list = byAgent.get(row.agent_id);
    if (list) list.push(period);
    else byAgent.set(row.agent_id, [period]);
  }
  return byAgent;
}

export async function fetchAgentsFromSupabase(): Promise<Agent[]> {
  const supabase = createClient();

  const [agentsRes, absencesByAgent] = await Promise.all([
    supabase.from("agents").select("id, name"),
    fetchAgentAbsencesFromSupabase(),
  ]);

  if (agentsRes.error) {
    const e = agentsRes.error;
    console.error(
      "[planning] Impossible de charger les agents :",
      `\n  code    : ${e.code ?? "?"}`,
      `\n  message : ${e.message ?? "?"}`,
      `\n  details : ${e.details ?? "—"}`,
      `\n  hint    : ${e.hint ?? "—"}`,
    );
    return [];
  }

  return (agentsRes.data ?? [])
    .filter((a) => !!a.name)
    .map((a) => {
      const config = getAgentConfig(a.name as string);
      if (!config) {
        console.warn(`[planning] Pas de template pour "${a.name}" — ignoré.`);
        return null;
      }
      return {
        id: a.id,
        name: a.name as string,
        isAbsent: false,
        config,
        absences: absencesByAgent.get(a.id) ?? [],
      };
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
    .lte("date", to)
    // Exclure les tâches fixes (resident_id NULL) : elles ne participent pas
    // à la mémoire des assignations mensuelles par résident.
    .not("resident_id", "is", null);

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

  // --- 2. CIBLES par agent (équilibrage itératif) ---
  const agentNames = Object.keys(slotsByAgent);
  const totalDemand = residents.reduce((acc, r) => acc + r.nb, 0);
  const targets: Record<string, number> = {};
  for (const name of agentNames) targets[name] = 0;

  const sortedByCapacity = [...agentNames].sort(
    (a, b) => slotsByAgent[b].total - slotsByAgent[a].total,
  );

  let remaining = totalDemand;
  let pending = [...sortedByCapacity];

  while (remaining > 0 && pending.length > 0) {
    const share = Math.ceil(remaining / pending.length);
    const nextPending: string[] = [];

    for (const name of pending) {
      const room = slotsByAgent[name].total - targets[name];
      if (room <= 0) continue;
      const add = Math.min(share, room, remaining);
      targets[name] += add;
      remaining -= add;
      if (targets[name] < slotsByAgent[name].total) nextPending.push(name);
    }

    if (nextPending.length === pending.length && remaining > 0) break;
    pending = nextPending;
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

  /**
   * Nombre de résidents encore en attente qui peuvent prétendre à ce
   * créneau (mêmes jour/heure autorisés). Mesure la "rareté" du slot.
   */
  function cellRarity(cell: Cell, stillPending: Resident[]): number {
    const iso = getISODay(cell.date);
    let n = 0;
    for (const r of stillPending) {
      if (r.allowedDays.length > 0 && !r.allowedDays.includes(iso)) continue;
      if (r.scheduleHours.length > 0 && !r.scheduleHours.includes(cell.hour)) continue;
      n++;
    }
    return n;
  }

  // --- 4. Choix équilibré + rareté ---
  function pickBalancedCell(
    candidates: Cell[],
    resident: Resident,
    stillPending: Resident[],
  ): Cell {
    const constrained =
      resident.scheduleHours.length > 0 || resident.allowedDays.length < 5;

    const scored = candidates.map((c) => {
      const balance = (targets[c.agent] ?? 0) - slotsByAgent[c.agent].used;
      const rarity = cellRarity(c, stillPending);
      const score = balance * 10 + (constrained ? rarity : -rarity);
      return { cell: c, score };
    });

    const maxScore = Math.max(...scored.map((s) => s.score));
    const best = scored.filter((s) => s.score === maxScore);
    return best[Math.floor(Math.random() * best.length)].cell;
  }

  // --- 5. Tri initial ---
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

  // --- 6. Multi-passes ---
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

        let pool = candidates;
        if (res.nb <= NB_WEEKLY_LIMIT_THRESHOLD) {
          const preferred = candidates.filter(
            (c) => weekly.get(c.date, res.room) < 1,
          );
          if (preferred.length > 0) pool = preferred;
        }

        const stillPending = residents.filter((r) => r.assigned < r.nb);
        const chosen = pickBalancedCell(pool, res, stillPending);

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
    const isoDay = getISODay(day);

    for (const agent of agents) {
      const row = inst[agent.name]?.[dk];
      if (!row) continue;

      // Lookup des durées explicites depuis le template du jour.
      const dayTpl = getDayTemplate(agent.config, isoDay);
      const durationByHour = new Map<string, number>();
      if (dayTpl) {
        for (const slot of dayTpl) {
          if (slot.duration != null) {
            durationByHour.set(slot.hour, slot.duration);
          }
        }
      }

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
            resident: val, // label transporté ("Hall", "Navette", …)
            agent: agent.name,
            // undefined si le slot n'a pas de durée explicite → gap fera le job
            duration: durationByHour.get(hour),
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

/**
 * Ne garde que les jours où l'agent a au moins une tâche (ménage OU fixe),
 * et filtre ses tâches.
 */
export function filterScheduleByAgent(
  schedule: MonthlyScheduleResponse,
  agentName: string,
): MonthlyScheduleResponse {
  const weeks: WeekSchedule[] = [];

  for (const week of schedule.weeks) {
    const days: DayScheduleFormatted[] = [];

    for (const day of week.days) {
      const hasAnyTask = day.tasks.some((t) => t.agent === agentName);
      if (!hasAnyTask) continue;

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
        if (t.agent) names.add(t.agent);
      }
    }
  }
  return [...names].sort();
}

// ============================================================================
// 12. AFFICHAGE DU RAPPORT
// ============================================================================

export interface ReportContext {
  year: number;
  month: number;
  agents: Agent[];
}

export function printReport(
  report: PlanningReport,
  context?: ReportContext,
): void {
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

  if (context) {
    const { year, month, agents } = context;
    const first = `${year}-${String(month).padStart(2, "0")}-01`;
    const last = format(new Date(year, month, 1), "yyyy-MM-dd");

    const relevant = agents
      .map((a) => ({
        name: a.name,
        periods: (a.absences ?? []).filter(
          (p) =>
            p.end_date.slice(0, 10) >= first &&
            p.start_date.slice(0, 10) < last,
        ),
      }))
      .filter((x) => x.periods.length > 0);

    if (relevant.length > 0) {
      console.log(`\n  🚫 Absences sur le mois :`);
      for (const { name, periods } of relevant) {
        for (const p of periods) {
          const label = p.motif ? `${p.type} (${p.motif})` : p.type;
          console.log(
            `     • ${name.padEnd(12)} ${p.start_date.slice(0, 10)} → ${p.end_date.slice(0, 10)}  [${label}]`,
          );
        }
      }
    } else {
      console.log(`\n  ✅ Aucune absence ce mois.`);
    }
  }

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
// 13. PERSISTANCE — recents_menages (une ligne par tâche)
// ============================================================================

/** Types fixes autorisés par la contrainte CHECK de la table. */
const FIXED_SLOT_TYPES = [
  "hall", "navette", "pause", "plonge", "lessives", "common", "fixed",
] as const;

type FixedSlotType = typeof FIXED_SLOT_TYPES[number];

function isFixedSlotType(type: string): type is FixedSlotType {
  return (FIXED_SLOT_TYPES as readonly string[]).includes(type);
}

export interface SaveRecentsMenagesOptions {
  /** Durée par défaut pour un slot sans successeur et sans durée explicite. Défaut : 90. */
  defaultDurationMinutes?: number;
  /** Bornes de durée pour le gap (ménages et fixes sans durée explicite). Défaut : [15, 180]. */
  durationBounds?: [number, number];
  /**
   * Statuts préservés lors de la régénération.
   * Défaut : [`COMPLETED`, `IN_PROGRESS`, `CANCELLED`, `RESCHEDULED`].
   * Mettre `[]` pour tout remplacer (perte d'historique).
   */
  preserveStatuses?: string[];
  /** Checklist par défaut injectée dans `details.columns` sur les ménages. Vide par défaut. */
  defaultChecklist?: { title: string; items: string[] }[][];
}

export interface SaveRecentsMenagesResult {
  inserted: number;
  deleted: number;
  skipped: { task: string; reason: string }[];
  protectedSlots: number;
  /** Détail : nb de ménages vs nb de tâches fixes insérés. */
  breakdown: { menage: number; fixed: number };
}

/**
 * Calcule une durée par tâche (ménages ET fixes SANS durée explicite) :
 * écart au prochain slot du même agent, borné par `durationBounds`,
 * `defaultDuration` pour le dernier slot de la journée.
 *
 * Les tâches fixes avec `task.duration` défini (ex. plonge 120, navette 90)
 * ne passent pas par ce calcul — leur durée explicite est utilisée à l'insertion.
 */
function computeTaskDurations(
  tasks: Task[],
  defaultDuration: number,
  bounds: [number, number],
): Map<Task, number> {
  const result = new Map<Task, number>();
  const byAgent = new Map<string, Task[]>();
  for (const t of tasks) {
    if (!t.agent) continue;
    const list = byAgent.get(t.agent);
    if (list) list.push(t);
    else byAgent.set(t.agent, [t]);
  }

  for (const list of byAgent.values()) {
    for (let i = 0; i < list.length; i++) {
      const t = list[i];
      const current = hourToMin(t.time);
      const next = list[i + 1];
      const raw = next ? hourToMin(next.time) - current : defaultDuration;
      result.set(t, Math.min(Math.max(raw, bounds[0]), bounds[1]));
    }
  }
  return result;
}

/**
 * Persiste un `MonthlyScheduleResponse` dans `recents_menages` :
 *   - 1 ligne par ménage   (`type = 'menage'`, `resident_id` renseigné)
 *   - 1 ligne par tâche fixe (`type = hall|navette|pause|plonge|lessives|common|fixed`,
 *     `resident_id = NULL`, label dans `details.label`)
 *
 * Durées :
 *   - ménages → gap au prochain slot du même agent (borné).
 *   - tâches fixes → `task.duration` (durée explicite du template) si défini,
 *     sinon gap calculé (borné).
 *   - marqueurs "Fin XXh" → pas de durée.
 *
 * Idempotent : supprime les lignes de statut non préservé du mois pour les
 * agents concernés, puis insère le nouveau planning. Les lignes préservées
 * (`COMPLETED`, etc.) verrouillent leur créneau `(agent, date, heure)`.
 */
export async function saveMonthlyPlanningToRecentsMenages(
  schedule: MonthlyScheduleResponse,
  year: number,
  month: number,
  residents: Resident[],
  agents: Agent[],
  options: SaveRecentsMenagesOptions = {},
): Promise<SaveRecentsMenagesResult> {
  const {
    defaultDurationMinutes = 90,
    durationBounds = [15, 180],
    preserveStatuses = ["COMPLETED", "IN_PROGRESS", "CANCELLED", "RESCHEDULED"],
    defaultChecklist = [],
  } = options;

  const residentIdByNom = new Map(residents.map((r) => [r.nom, r.id]));
  const agentIdByName = new Map(agents.map((a) => [a.name, a.id]));

  type Row = {
    resident_id: string | null;
    agent_id: number;
    date: string;
    heure: string;
    statut: "PENDING";
    type: "menage" | FixedSlotType;
    details: {
      columns: unknown[];
      residents: unknown[];
      label?: string;
    };
    duration_minutes: number | null;
  };

  const rows: Row[] = [];
  const skipped: { task: string; reason: string }[] = [];
  const seen = new Set<string>();
  const breakdown = { menage: 0, fixed: 0 };

  for (const week of schedule.weeks) {
    for (const day of week.days) {
      const durations = computeTaskDurations(
        day.tasks,
        defaultDurationMinutes,
        durationBounds,
      );

      for (const task of day.tasks) {
        const label = `${day.isoDate} ${task.time}`;

        // 1. Agent obligatoire
        if (!task.agent) {
          skipped.push({ task: label, reason: "agent manquant" });
          continue;
        }
        const agentId = agentIdByName.get(task.agent);
        if (agentId === undefined) {
          skipped.push({ task: `${label} (${task.agent})`, reason: "agent introuvable" });
          continue;
        }

        // 2. Dédoublonnage (agent, date, heure)
        const heure = hourToTimeString(task.time);
        const key = `${agentId}|${day.isoDate}|${heure}`;
        if (seen.has(key)) {
          skipped.push({ task: `${label} (${task.agent})`, reason: "doublon interne" });
          continue;
        }
        seen.add(key);

        // 3a. Ménage → resident_id renseigné
        if (task.type === "menage") {
          if (!task.resident) {
            skipped.push({ task: label, reason: "résident manquant sur ménage" });
            continue;
          }
          const residentId = residentIdByNom.get(task.resident);
          if (!residentId) {
            skipped.push({
              task: `${label} (${task.resident})`,
              reason: "résident introuvable",
            });
            continue;
          }
          rows.push({
            resident_id: residentId,
            agent_id: agentId,
            date: day.isoDate,
            heure,
            statut: "PENDING",
            type: "menage",
            details: { columns: defaultChecklist, residents: [] },
            duration_minutes: durations.get(task) ?? null,
          });
          breakdown.menage++;
          continue;
        }

        // 3b. Tâche fixe → resident_id NULL
        const safeType: FixedSlotType = isFixedSlotType(task.type) ? task.type : "fixed";

        // Les "Fin XXh" sont des marqueurs de fin de service, pas des tâches
        // chronométrées → on n'y attache pas de durée.
        const isEndMarker =
          safeType === "pause" && /^fin\b/i.test(task.resident ?? "");

        // Priorité : durée explicite du template → gap calculé → null.
        const duration = isEndMarker
          ? null
          : (task.duration ?? durations.get(task) ?? null);

        rows.push({
          resident_id: null,
          agent_id: agentId,
          date: day.isoDate,
          heure,
          statut: "PENDING",
          type: safeType,
          details: {
            columns: [],
            residents: [],
            label: task.resident ?? undefined,
          },
          duration_minutes: duration,
        });
        breakdown.fixed++;
      }
    }
  }

  if (rows.length === 0) {
    return { inserted: 0, deleted: 0, skipped, protectedSlots: 0, breakdown };
  }

  const supabase = createClient();
  const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = format(new Date(year, month, 0), "yyyy-MM-dd");
  const agentIds = agents.map((a) => a.id);

  if (agentIds.length === 0) {
    return { inserted: 0, deleted: 0, skipped, protectedSlots: 0, breakdown };
  }

  // --- Lecture des créneaux préservés + suppression des PENDING ---
  const preservedSelect = preserveStatuses.length > 0
    ? supabase
        .from("recents_menages")
        .select("agent_id, date, heure")
        .gte("date", firstDay)
        .lte("date", lastDay)
        .in("agent_id", agentIds)
        .in("statut", preserveStatuses)
    : Promise.resolve({
        data: [] as { agent_id: number; date: string; heure: string }[],
        error: null,
      });

  let deleteQuery = supabase
    .from("recents_menages")
    .delete({ count: "exact" })
    .gte("date", firstDay)
    .lte("date", lastDay)
    .in("agent_id", agentIds);

  if (preserveStatuses.length > 0) {
    deleteQuery = deleteQuery.not(
      "statut",
      "in",
      `(${preserveStatuses.join(",")})`,
    );
  }

  const [preservedRes, deleteRes] = await Promise.all([
    preservedSelect,
    deleteQuery,
  ]);

  if (preservedRes.error) {
    throw new Error(
      `Lecture des créneaux préservés échouée : ${preservedRes.error.message} ` +
      `(code ${preservedRes.error.code})`,
    );
  }
  if (deleteRes.error) {
    throw new Error(
      `Suppression recents_menages échouée : ${deleteRes.error.message} ` +
      `(code ${deleteRes.error.code})`,
    );
  }

  const deleted = deleteRes.count ?? 0;

  const protectedSlots = new Set<string>();
  for (const row of preservedRes.data ?? []) {
    protectedSlots.add(`${row.agent_id}|${row.date}|${row.heure}`);
  }

  const filteredRows = rows.filter((r) => {
    const key = `${r.agent_id}|${r.date}|${r.heure}`;
    if (protectedSlots.has(key)) {
      skipped.push({
        task: `${r.date} ${r.heure} (agent ${r.agent_id})`,
        reason: "créneau verrouillé par un statut préservé",
      });
      return false;
    }
    return true;
  });

  // Recalcul du breakdown après filtrage préservé.
  const finalBreakdown = { menage: 0, fixed: 0 };
  for (const r of filteredRows) {
    if (r.type === "menage") finalBreakdown.menage++;
    else finalBreakdown.fixed++;
  }

  const BATCH = 500;
  for (let i = 0; i < filteredRows.length; i += BATCH) {
    const chunk = filteredRows.slice(i, i + BATCH);
    const { error } = await supabase.from("recents_menages").insert(chunk);
    if (error) {
      throw new Error(
        `Insert recents_menages échoué (batch ${Math.floor(i / BATCH) + 1}) : ` +
        `${error.message} (code ${error.code})`,
      );
    }
  }

  return {
    inserted: filteredRows.length,
    deleted,
    skipped,
    protectedSlots: protectedSlots.size,
    breakdown: finalBreakdown,
  };
}

// ─── Snapshot JSON optionnel dans la table `planning` ──────────────────────

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
  /** true = écrit dans recents_menages. Défaut : true. */
  save?: boolean;
  /** true = écrit aussi un snapshot JSON dans planning. Défaut : false. */
  savePlanningSnapshot?: boolean;
  /** Options de persistance recents_menages (durée, statuts préservés…). */
  saveOptions?: SaveRecentsMenagesOptions;
}

export async function generateAndSaveMonthlyPlanning({
  year,
  month,
  save = true,
  savePlanningSnapshot = false,
  saveOptions,
}: GeneratePlanningParams): Promise<MonthlyScheduleResponse> {
  const [residents, agents, previous] = await Promise.all([
    fetchResidentsFromSupabase(),
    fetchAgentsFromSupabase(),
    fetchPreviousMonthAssignments(year, month),
  ]);

  if (agents.length === 0) {
    throw new Error(
      "Aucun agent chargeable. Vérifiez les logs serveur " +
      "(nom de colonne isAbsent, policies RLS, env vars Supabase).",
    );
  }

  const schedule = generateMonthlySchedule(residents, year, month, {
    agents,
    previousMonthAssignments: previous,
  });

  printReport(schedule.report, { year, month, agents });

  if (save) {
    const result = await saveMonthlyPlanningToRecentsMenages(
      schedule,
      year,
      month,
      residents,
      agents,
      saveOptions,
    );

    console.log(
      `\n  💾 recents_menages : ${result.inserted} ligne(s) insérée(s) ` +
      `(${result.breakdown.menage} ménage(s) + ${result.breakdown.fixed} tâche(s) fixe(s)), ` +
      `${result.deleted} ligne(s) supprimée(s), ` +
      `${result.protectedSlots} créneau(x) préservé(s).`,
    );
    if (result.skipped.length > 0) {
      console.warn(`  ⚠️  ${result.skipped.length} tâche(s) ignorée(s) :`);
      for (const s of result.skipped.slice(0, 10)) {
        console.warn(`     - ${s.task} → ${s.reason}`);
      }
      if (result.skipped.length > 10) {
        console.warn(`     … et ${result.skipped.length - 10} autres.`);
      }
    }
  }

  if (savePlanningSnapshot) {
    await savePlanningToSupabase(schedule, year, month);
    console.log(`  💾 Snapshot JSON sauvegardé dans planning (${year}/${month}).`);
  }

  return schedule;
}