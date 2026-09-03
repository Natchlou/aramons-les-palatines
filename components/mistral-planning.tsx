"use client";
import React, { useState, useMemo } from "react";

/* ============================================================
 * GÉNÉRATEUR AUTOMATIQUE DE PLANNING DE MÉNAGE
 * ============================================================
 *
 * Algorithme de planification multi-agents avec:
 *  - Créneaux standards de 1h30 (08h-17h, pause 11h30-12h)
 *  - Fréquences daily / weekly / monthly
 *  - Contraintes horaires (preferredStart / preferredEnd)
 *  - Jours autorisés / interdits
 *  - Priorités
 *  - Répartition équitable entre agents (scoring + rééquilibrage)
 *  - Backtracking léger pour les placements difficiles
 *  - Gestion des résidents impossibles à placer
 *
 * Complexité: O(D * R * S * A) par itération, avec
 *   D = jours (5), R = résidents, S = créneaux (<=5), A = agents (<=3)
 *   soit ~O(R) à O(R log R) en pratique. Le backtracking
 *   reste borné par un plafond d'itérations → robuste jusqu'à
 *   quelques centaines de résidents.
 * ============================================================
 */

/* ---------- Types de base ---------- */

export type Frequency = "daily" | "weekly" | "monthly";

export type Resident = {
  id: number;
  name: string;
  apartment: string;
  building: 1 | 2;

  frequency: Frequency;

  // Pour "weekly": 1=lun ... 5=ven
  dayOfWeek?: number;
  // Pour "monthly": jour du mois (1-31). Gestion des mois courts: si le jour
  // n'existe pas dans le mois ciblé, on prend le DERNIER jour du mois.
  dayOfMonth?: number;

  // Contraintes de JOUR (prioritaires sur la fréquence pour daily)
  allowedDays?: number[]; // ex [2,4] = mar,jeu uniquement
  forbiddenDays?: number[]; // ex [3] = pas le mercredi

  // Contraintes HORAIRES "HH:MM" - le créneau 1h30 doit tenir dedans
  preferredStart?: string;
  preferredEnd?: string;

  // Priorité de placement: plus élevé = placé en priorité (défaut 5)
  priority?: number;

  // Absences: plage de dates (ISO yyyy-mm-dd) pendant laquelle on saute
  absenceFrom?: string;
  absenceTo?: string;

  // Indisponibilités ponctuelles (dates ISO à ignorer)
  unavailableDates?: string[];
};

export type Agent = {
  id: number;
  name: string;

  // Jours travaillés: 1=lun ... 5=ven (défaut [1,2,3,4,5])
  workingDays?: number[];
  // Plage de travail "HH:MM" (défaut 08:00-17:00)
  workStart?: string;
  workEnd?: string;
  // Nombre max de ménages par jour (défaut = max selon créneaux)
  maxCleaningsPerDay?: number;
  // Indisponibilités (dates ISO)
  unavailableDates?: string[];
  // Préférence de bâtiment (optionnelle, n'exclut rien)
  preferredBuilding?: 1 | 2;
};

export type Slot = {
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  startMin: number; // minutes depuis 00:00 (précalcul)
  endMin: number;
};

export type Cleaning = {
  id: string;
  resident: { id: number; name: string; apartment: string; building: 1 | 2 };
  agent: { id: number; name: string };
  start: string;
  end: string;
};

export type PlanningDay = {
  date: string; // ISO yyyy-mm-dd
  dayOfWeek: number; // 1-5
  cleanings: Cleaning[];
};

export type UnscheduledResident = {
  resident: Resident;
  date: string;
  reason: string;
};

export type Planning = {
  days: PlanningDay[];
  unscheduled: UnscheduledResident[];
  stats: {
    totalScheduled: number;
    totalUnscheduled: number;
    perAgent: { agentId: number; agentName: string; count: number }[];
    perDay: { date: string; count: number }[];
  };
};

/* ---------- Utilitaires temps ---------- */

const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const toHHMM = (min: number): string => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const toISODate = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const addDays = (d: Date, n: number): Date => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

// dayOfWeek JS: 0=dim ... 6=sam. Notre convention: 1=lun ... 5=ven
const jsDowToOur = (jsDow: number): number =>
  jsDow === 0 ? 7 : jsDow;

const isWeekday = (jsDow: number): boolean => jsDow >= 1 && jsDow <= 5;

const MONTH_DAYS = (year: number, month0: number): number =>
  new Date(year, month0 + 1, 0).getDate();

// formatDateFR: "LUNDI 31 AOÛT"
const DAYS_FR = ["DIMANCHE", "LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"];
const MONTHS_FR = [
  "JANVIER", "FÉVRIER", "MARS", "AVRIL", "MAI", "JUIN",
  "JUILLET", "AOÛT", "SEPTEMBRE", "OCTOBRE", "NOVEMBRE", "DÉCEMBRE",
];
const formatDayHeader = (iso: string): string => {
  const d = new Date(iso + "T00:00:00");
  return `${DAYS_FR[d.getDay()]} ${d.getDate()} ${MONTHS_FR[d.getMonth()]}`;
};

/* ---------- Génération des créneaux standards ---------- */

/**
 * Génère les créneaux de 1h30 pour un agent, en évitant la pause 11h30-12h00.
 *
 * Règle: un créneau ne doit pas traverser la pause. On découpe donc la journée
 * en deux blocs: matin (avant 11h30) et après-midi (à partir de 12h00), et on
 * génère des créneaux de 90 min dans chaque bloc. On ne déborde JAMAIS la pause.
 *
 * Le créneau 11h00-12h30 serait invalide → on le rejette.
 * Le créneau 10h30-12h00 serait invalide (traverse 11h30) → rejeté.
 * Le créneau 11h00-11h30 est trop court (30 min < 90 min) → non généré.
 */
export function generateSlots(agent: Agent): Slot[] {
  const workStart = agent.workStart ?? "08:00";
  const workEnd = agent.workEnd ?? "17:00";
  const DURATION = 90; // 1h30
  const PAUSE_START = toMinutes("11:30");
  const PAUSE_END = toMinutes("12:00");

  const startMin = toMinutes(workStart);
  const endMin = toMinutes(workEnd);

  const slots: Slot[] = [];
  let cursor = startMin;

  // Bloc matin: jusqu'à PAUSE_START (un créneau doit finir <= PAUSE_START)
  while (cursor + DURATION <= PAUSE_START && cursor + DURATION <= endMin) {
    slots.push({ start: toHHMM(cursor), end: toHHMM(cursor + DURATION), startMin: cursor, endMin: cursor + DURATION });
    cursor += DURATION;
  }

  // Bloc après-midi: à partir de PAUSE_END
  cursor = Math.max(cursor, PAUSE_END);
  while (cursor + DURATION <= endMin) {
    slots.push({ start: toHHMM(cursor), end: toHHMM(cursor + DURATION), startMin: cursor, endMin: cursor + DURATION });
    cursor += DURATION;
  }

  // Plafond maxCleaningsPerDay
  const max = agent.maxCleaningsPerDay ?? slots.length;
  return slots.slice(0, max);
}

/* ---------- Résolution du jour cible d'un résident ---------- */

/**
 * Détermine si un résident doit être nettoyé à la date `dateISO`.
 * Retourne true si oui, false sinon.
 *
 * Règles:
 *  - allowedDays/forbiddenDays ont la priorité (filtrent d'abord).
 *  - daily: tous les jours ouvrés (1-5), sauf forbidden.
 *  - weekly: le jour précis (dayOfWeek), sauf forbidden.
 *  - monthly: le jour précis (dayOfMonth), avec gestion des mois courts:
 *      si dayOfMonth > nb jours du mois → on prend le DERNIER jour du mois.
 *      Ex: dayOfMonth=31 en février → placé le 28 (ou 29).
 *      On applique cette logique UNIQUEMENT si dayOfMonth dépasse la fin du mois.
 *  - absence (absenceFrom..absenceTo): on saute la plage.
 *  - unavailableDates: on saute ces dates ponctuelles.
 */
/**
 * Calcule la date réelle d'exécution d'un ménage monthly.
 *
 * Stratégie pour les mois courts et les weekends:
 *  1. dayOfMonth > dernier jour du mois → on prend le DERNIER jour du mois.
 *     Ex: 31 en février → 28 (ou 29).
 *  2. Si le jour cible tombe un SAMEDI ou DIMANCHE, on recule au VENDREDI
 *     précédent le plus proche (jamais au-delà du 1er du mois).
 *     Ex: monthly le 31, mais le 31/01 est un samedi → placé le 30/01 (vendredi).
 *     Ex: monthly le 15, mais le 15/02 tombe un dimanche → placé le 13/02 (vendredi).
 *
 * Justification: un ménage mensuel ne peut pas glisser au mois suivant (cela
 * créerait un décalage permanent), ni tomber un weekend (agents en congé).
 * Le repli sur le vendredi précédent est l'option la moins perturbante pour
 * le résident.
 */
function resolveMonthlyTargetDate(year: number, month0: number, dayOfMonth: number): Date | null {
  const lastDay = MONTH_DAYS(year, month0);
  const targetDay = dayOfMonth > lastDay ? lastDay : dayOfMonth;
  const target = new Date(year, month0, targetDay);

  // Si le jour cible est déjà un jour ouvré, on l'utilise tel quel.
  if (isWeekday(target.getDay())) return target;

  // Sinon (samedi/dimanche), on tente d'abord un RECUl vers le vendredi
  // précédent — tant qu'on reste dans le MÊME mois.
  let back = new Date(target);
  let attempts = 0;
  while (!isWeekday(back.getDay()) && attempts < 4) {
    back = addDays(back, -1);
    attempts++;
  }
  if (back.getMonth() === month0 && isWeekday(back.getDay())) return back;

  // Si le recul sort du mois (ex: 1er du mois tombe un dimanche), on AVANCE
  // vers le lundi suivant à la place.
  let fwd = new Date(target);
  attempts = 0;
  while (!isWeekday(fwd.getDay()) && attempts < 4) {
    fwd = addDays(fwd, 1);
    attempts++;
  }
  if (fwd.getMonth() === month0 && isWeekday(fwd.getDay())) return fwd;

  return null;
}

function shouldCleanOn(resident: Resident, dateISO: string, jsDow: number): boolean {
  const ourDow = jsDowToOur(jsDow);
  if (!isWeekday(jsDow)) return false; // jamais le weekend

  // forbiddenDays (prioritaire sur tout, même sur la fréquence)
  if (resident.forbiddenDays?.includes(ourDow)) return false;

  // allowedDays: restreint aux jours listés
  if (resident.allowedDays && !resident.allowedDays.includes(ourDow)) return false;

  // Absence plage
  if (resident.absenceFrom && resident.absenceTo) {
    if (dateISO >= resident.absenceFrom && dateISO <= resident.absenceTo) return false;
  }

  // Indispos ponctuels
  if (resident.unavailableDates?.includes(dateISO)) return false;

  const d = new Date(dateISO + "T00:00:00");

  switch (resident.frequency) {
    case "daily":
      return true; // déjà filtré par forbidden/allowed/weekday
    case "weekly":
      return resident.dayOfWeek === ourDow;
    case "monthly": {
      const target = resolveMonthlyTargetDate(d.getFullYear(), d.getMonth(), resident.dayOfMonth ?? 1);
      if (!target) return false;
      return toISODate(target) === dateISO;
    }
    default:
      return false;
  }
}

/* ---------- Compatibilité créneau / résident ---------- */

/**
 * Vérifie qu'un créneau respecte les contraintes horaires du résident.
 * - preferredStart: le créneau doit commencer >= preferredStart
 * - preferredEnd:   le créneau doit finir <= preferredEnd
 */
function slotFitsResident(slot: Slot, resident: Resident): boolean {
  if (resident.preferredStart) {
    if (slot.startMin < toMinutes(resident.preferredStart)) return false;
  }
  if (resident.preferredEnd) {
    if (slot.endMin > toMinutes(resident.preferredEnd)) return false;
  }
  return true;
}

/* ---------- Score d'un placement ---------- */

/**
 * Score d'affectation (résident, agent, créneau). Plus haut = meilleur.
 *
 * Composantes (toutes normalisées pour rester comparables):
 *  + priorité du résident (×10)            → favorise les résidents prioritaires
 *  + respect des contraintes horaires      → bonus si dans preferredStart/End exact
 *  + équilibre entre agents (anti-surch.)  → pénalité proportionnelle à la charge
 *  + préférence horaire tôt                → léger bonus pour les créneaux du matin
 *    (libère l'après-midi pour les contraintes horaires strictes)
 *  - surcharge d'un agent                  → -par ménage déjà attribué au-delà de l'idéal
 *
 * Le "weight" du résident (rareté) est géré en amont (ordre de placement),
 * pas dans ce score: on place d'abord les résidents rares, puis on choisit
 * le meilleur (agent, créneau) pour chacun via ce score.
 */
type ScoredPlacement = {
  agent: Agent;
  slot: Slot;
  score: number;
};

function scorePlacement(
  resident: Resident,
  agent: Agent,
  slot: Slot,
  agentLoad: number,
  totalCleaningsTarget: number
): number {
  let score = 0;

  // 1. Priorité du résident
  const priority = resident.priority ?? 5;
  score += priority * 10;

  // 2. Respect exact des contraintes horaires (bonus)
  if (resident.preferredStart || resident.preferredEnd) {
    const ps = resident.preferredStart ? toMinutes(resident.preferredStart) : 0;
    const pe = resident.preferredEnd ? toMinutes(resident.preferredEnd) : 24 * 60;
    const slack = (slot.startMin - ps) + (pe - slot.endMin);
    score += Math.max(0, 20 - slack / 30); // plus c'est tendu, plus le bonus est fort
  }

  // 3. Équilibre entre agents: pénalité si l'agent est déjà surchargé
  // totalCleaningsTarget = charge cible par agent pour la journée
  const overTarget = Math.max(0, agentLoad - totalCleaningsTarget + 1);
  score -= overTarget * 25; // forte pénalité pour surcharge

  // 4. Léger bonus pour les créneaux du matin (libère l'après-midi)
  if (slot.startMin < toMinutes("11:30")) {
    score += 3;
  }

  // 5. Préférence de bâtiment (agent) - bonus léger, n'exclut rien
  if (agent.preferredBuilding && agent.preferredBuilding === resident.building) {
    score += 5;
  }

  return score;
}

/* ---------- Cible de charge par agent ---------- */

function targetLoadPerAgent(numCleanings: number, numAgents: number): number {
  if (numAgents <= 0) return 0;
  return Math.ceil(numCleanings / numAgents);
}

/* ---------- Algorithme principal ---------- */

const SLOT_DURATION = 90;

/**
 * Génère le planning d'une semaine (lun-ven) à partir de startDate.
 *
 * Stratégie:
 *  1. On normalise startDate sur le LUNDI de sa semaine.
 *  2. Pour chaque jour ouvré:
 *     a. On liste les résidents à nettoyer ce jour (shouldCleanOn).
 *     b. On trie ces résidents par "difficulté de placement" (rareté):
 *        - contraintes horaires strictes d'abord (peu de créneaux possibles)
 *        - priorité élevée
 *        - allowedDays réduits
 *     c. Pour chaque résident (dans cet ordre), on énumère (agent × créneau)
 *        compatibles et on choisit le meilleur score. On marque créneau+agent
 *        comme occupé.
 *     d. Si aucun placement possible → unscheduled.
 *  3. Rééquilibrage léger: après le greedy, on vérifie les écarts de charge
 *     entre agents par jour. Si un agent a ≥2 ménages de plus qu'un autre et
 *     qu'un déplacement est possible (même créneau libre ailleurs), on
 *     déplace. Backtracking borné (max ~3 passes).
 *
 * La "rareté" remplace un tri pur par priorité: un résident daily sans
 * contrainte est facile à placer n'importe quand → on le place en dernier.
 * Un résident monthly le 31 avec preferredStart=13:00 est rare → placé en
 * premier. Cela évite que les résidents flexibles ne monopolisent les
 * créneaux restreints.
 */
export function generatePlanning(
  residents: Resident[],
  agents: Agent[],
  startDate: Date
): Planning {
  const result: Planning = {
    days: [],
    unscheduled: [],
    stats: {
      totalScheduled: 0,
      totalUnscheduled: 0,
      perAgent: [],
      perDay: [],
    },
  };

  // Cas: aucun agent
  if (agents.length === 0) {
    // Tous les résidents à nettoyer deviennent unscheduled
    const weekStart = normalizeToMonday(startDate);
    for (let i = 0; i < 5; i++) {
      const d = addDays(weekStart, i);
      const jsDow = d.getDay();
      if (!isWeekday(jsDow)) continue;
      const iso = toISODate(d);
      for (const r of residents) {
        if (shouldCleanOn(r, iso, jsDow)) {
          result.unscheduled.push({ resident: r, date: iso, reason: "Aucun agent disponible" });
        }
      }
      result.days.push({ date: iso, dayOfWeek: jsDowToOur(jsDow), cleanings: [] });
    }
    recomputeStats(result, agents);
    return result;
  }

  const weekStart = normalizeToMonday(startDate);

  // Précalcule des créneaux par agent (constants pour la semaine)
  const agentSlots = new Map<number, Slot[]>();
  for (const a of agents) agentSlots.set(a.id, generateSlots(a));

  // Compteurs de charge cumulée (pour stats + équilibre global)
  const agentTotalLoad = new Map<number, number>();
  for (const a of agents) agentTotalLoad.set(a.id, 0);

  for (let i = 0; i < 5; i++) {
    const d = addDays(weekStart, i);
    const jsDow = d.getDay();
    const iso = toISODate(d);
    const ourDow = jsDowToOur(jsDow);

    const dayCleanings: Cleaning[] = [];

    if (!isWeekday(jsDow)) {
      result.days.push({ date: iso, dayOfWeek: ourDow, cleanings: [] });
      continue;
    }

    // Agents travaillant ce jour
    const dayAgents = agents.filter((a) => {
      const wd = a.workingDays ?? [1, 2, 3, 4, 5];
      if (!wd.includes(ourDow)) return false;
      if (a.unavailableDates?.includes(iso)) return false;
      return true;
    });

    // Résidents à nettoyer ce jour
    const todo = residents.filter((r) => shouldCleanOn(r, iso, jsDow));

    if (dayAgents.length === 0) {
      // Personne ne travaille → tout est unscheduled
      for (const r of todo) {
        result.unscheduled.push({ resident: r, date: iso, reason: "Aucun agent travaillant ce jour" });
      }
      result.days.push({ date: iso, dayOfWeek: ourDow, cleanings: [] });
      continue;
    }

    if (todo.length === 0) {
      result.days.push({ date: iso, dayOfWeek: ourDow, cleanings: [] });
      continue;
    }

    // Tri par rareté (difficulté de placement)
    const ordered = orderByRarity(todo, dayAgents, agentSlots);

    // État d'occupation: occupied[agentId][slotIdx] = true
    const occupied = new Map<number, boolean[]>();
    for (const a of dayAgents) {
      occupied.set(a.id, new Array(agentSlots.get(a.id)!.length).fill(false));
    }
    // Charge du jour par agent
    const dayLoad = new Map<number, number>();
    for (const a of dayAgents) dayLoad.set(a.id, 0);

    const target = targetLoadPerAgent(todo.length, dayAgents.length);

    const unscheduledToday: UnscheduledResident[] = [];

    for (const resident of ordered) {
      const candidates: ScoredPlacement[] = [];

      for (const agent of dayAgents) {
        const slots = agentSlots.get(agent.id)!;
        const occ = occupied.get(agent.id)!;
        const load = dayLoad.get(agent.id)!;
        for (let s = 0; s < slots.length; s++) {
          if (occ[s]) continue;
          const slot = slots[s];
          if (!slotFitsResident(slot, resident)) continue;
          const sc = scorePlacement(resident, agent, slot, load, target);
          candidates.push({ agent, slot, score: sc });
        }
      }

      if (candidates.length === 0) {
        unscheduledToday.push({
          resident,
          date: iso,
          reason: explainUnscheduled(resident, dayAgents, agentSlots),
        });
        continue;
      }

      // Meilleur placement
      candidates.sort((a, b) => b.score - a.score);
      const best = candidates[0];

      // Marque occupé
      const occ = occupied.get(best.agent.id)!;
      const slots = agentSlots.get(best.agent.id)!;
      const sIdx = slots.findIndex(
        (s) => s.startMin === best.slot.startMin
      );
      occ[sIdx] = true;
      dayLoad.set(best.agent.id, dayLoad.get(best.agent.id)! + 1);
      agentTotalLoad.set(best.agent.id, agentTotalLoad.get(best.agent.id)! + 1);

      dayCleanings.push({
        id: `${iso}-${best.agent.id}-${best.slot.start}-${resident.id}`,
        resident: {
          id: resident.id,
          name: resident.name,
          apartment: resident.apartment,
          building: resident.building,
        },
        agent: { id: best.agent.id, name: best.agent.name },
        start: best.slot.start,
        end: best.slot.end,
      });
    }

    // Rééquilibrage léger (backtracking borné) — on passe todo pour
    // vérifier les contraintes horaires lors des déplacements.
    rebalanceDay(dayCleanings, dayAgents, agentSlots, occupied, dayLoad, todo);

    result.days.push({ date: iso, dayOfWeek: ourDow, cleanings: dayCleanings });
    result.unscheduled.push(...unscheduledToday);
  }

  recomputeStats(result, agents);
  return result;
}

/* ---------- Normalisation sur lundi ---------- */

function normalizeToMonday(startDate: Date): Date {
  const jsDow = startDate.getDay(); // 0=dim, 1=lun, ..., 6=sam
  // lundi = jsDow 1. Si on est sur un autre jour, recule jusqu'à lundi.
  const diff = jsDow === 0 ? -6 : 1 - jsDow;
  return addDays(startDate, diff);
}

/* ---------- Tri par rareté ---------- */

/**
 * Ordonne les résidents à placer du plus "rare" au plus "flexible".
 *
 * Score de rareté (desc):
 *  - nombre de créneaux compatibles (sur TOUS les agents) — moins = plus rare
 *  - contrainte horaire stricte (preferredStart+preferredEnd) — bonus
 *  - allowedDays réduit — bonus (mais ici on est déjà sur un jour précis)
 *  - priorité élevée — bonus
 *  - monthly > weekly > daily (un monthly n'a qu'un seul jour dans le mois)
 *
 * Justification: placer d'abord les résidents à contraintes fortes évite
 * qu'un résident flexible "vole" le seul créneau qu'un résident contraint
 * pouvait utiliser. C'est une heuristique classique d'ordonnancement
 * (Least Flexible First).
 */
function orderByRarity(
  todo: Resident[],
  agents: Agent[],
  agentSlots: Map<number, Slot[]>
): Resident[] {
  const rarityOf = (r: Resident): number => {
    let compatibleSlots = 0;
    for (const a of agents) {
      const slots = agentSlots.get(a.id)!;
      for (const s of slots) {
        if (slotFitsResident(s, r)) compatibleSlots++;
      }
    }

    let rarity = 0;

    // Moins de créneaux compatibles = plus rare
    if (compatibleSlots === 0) rarity += 100000; // impossible, placé en premier (sera unscheduled)
    else rarity += (1000 / compatibleSlots) * 100;

    // Contrainte horaire stricte
    if (r.preferredStart && r.preferredEnd) rarity += 200;
    else if (r.preferredStart || r.preferredEnd) rarity += 100;

    // Fréquence
    if (r.frequency === "monthly") rarity += 50;
    else if (r.frequency === "weekly") rarity += 20;

    // Priorité
    rarity += (r.priority ?? 5) * 5;

    // allowedDays réduit (plus de jours autorisés = plus flexible = moins rare)
    if (r.allowedDays && r.allowedDays.length === 1) rarity += 80;

    return rarity;
  };

  return [...todo].sort((a, b) => rarityOf(b) - rarityOf(a));
}

/* ---------- Explication d'un échec de placement ---------- */

function explainUnscheduled(
  resident: Resident,
  agents: Agent[],
  agentSlots: Map<number, Slot[]>
): string {
  // Vérifie si la contrainte horaire est physiquement impossible
  if (resident.preferredStart && resident.preferredEnd) {
    const ps = toMinutes(resident.preferredStart);
    const pe = toMinutes(resident.preferredEnd);
    if (pe - ps < SLOT_DURATION) {
      return `Fenêtre horaire trop courte (${resident.preferredStart}-${resident.preferredEnd} < 1h30)`;
    }
  }

  // Vérifie si un seul créneau compatible existe
  let compat = 0;
  for (const a of agents) {
    const slots = agentSlots.get(a.id)!;
    for (const s of slots) if (slotFitsResident(s, resident)) compat++;
  }
  if (compat === 0) {
    if (resident.preferredStart || resident.preferredEnd) {
      return "Aucun créneau compatible avec les contraintes horaires";
    }
    return "Aucun créneau disponible (capacité saturée)";
  }
  return "Tous les créneaux compatibles déjà occupés";
}

/* ---------- Rééquilibrage léger (backtracking borné) ---------- */

/**
 * Après le greedy, vérifie si un agent est nettement surchargé par rapport
 * à un autre (différence >= 2). Si oui, tente de déplacer un de ses ménages
 * vers l'agent sous-chargé sur un créneau libre compatible.
 *
 * Backtracking borné: au maximum 3 passes, et on ne déplace que vers un agent
 * moins chargé. Cela garantit la terminaison (la dispersion globale ne fait
 * que diminuer) et reste O(A² × S) par passe — négligeable.
 */
function rebalanceDay(
  cleanings: Cleaning[],
  agents: Agent[],
  agentSlots: Map<number, Slot[]>,
  occupied: Map<number, boolean[]>,
  dayLoad: Map<number, number>,
  residents: Resident[]
): void {
  const MAX_PASSES = 3;
  const residentById = new Map(residents.map((r) => [r.id, r]));

  for (let pass = 0; pass < MAX_PASSES; pass++) {
    // Trouve agent max et agent min (parmi les agents actifs du jour)
    let maxAgent = agents[0];
    let minAgent = agents[0];
    for (const a of agents) {
      if (dayLoad.get(a.id)! > dayLoad.get(maxAgent.id)!) maxAgent = a;
      if (dayLoad.get(a.id)! < dayLoad.get(minAgent.id)!) minAgent = a;
    }
    if (dayLoad.get(maxAgent.id)! - dayLoad.get(minAgent.id)! < 2) break;

    // Cherche un ménage de maxAgent déplaçable vers minAgent
    const minSlots = agentSlots.get(minAgent.id)!;
    const minOcc = occupied.get(minAgent.id)!;
    const maxSlots = agentSlots.get(maxAgent.id)!;

    let moved = false;
    for (let ci = 0; ci < cleanings.length; ci++) {
      const c = cleanings[ci];
      if (c.agent.id !== maxAgent.id) continue;

      // Récupère le résident pour vérifier ses contraintes horaires
      const resident = residentById.get(c.resident.id);
      if (!resident) continue;

      const oldSlot = maxSlots.find((s) => s.start === c.start);
      if (!oldSlot) continue;

      // Cherche un créneau libre chez minAgent, COMPATIBLE avec les
      // contraintes horaires du résident (sinon le déplacement violerait
      // une contrainte preferredStart/preferredEnd).
      for (let s = 0; s < minSlots.length; s++) {
        if (minOcc[s]) continue;
        const newSlot = minSlots[s];
        if (resident && !slotFitsResident(newSlot, resident)) continue;

        const maxOcc = occupied.get(maxAgent.id)!;
        const maxIdx = maxSlots.findIndex((s) => s.start === oldSlot.start);
        maxOcc[maxIdx] = false;
        minOcc[s] = true;
        c.agent = { id: minAgent.id, name: minAgent.name };
        c.start = newSlot.start;
        c.end = newSlot.end;
        c.id = `${c.id.split("-")[0]}-${c.id.split("-")[1]}-${minAgent.id}-${newSlot.start}-${c.id.split("-").slice(-1)[0]}`;
        dayLoad.set(maxAgent.id, dayLoad.get(maxAgent.id)! - 1);
        dayLoad.set(minAgent.id, dayLoad.get(minAgent.id)! + 1);
        moved = true;
        break;
      }
      if (moved) break;
    }
    if (!moved) break;
  }
}

/* ---------- Stats ---------- */

function recomputeStats(result: Planning, agents: Agent[]): void {
  let scheduled = 0;
  for (const day of result.days) scheduled += day.cleanings.length;

  result.stats.totalScheduled = scheduled;
  result.stats.totalUnscheduled = result.unscheduled.length;

  const perAgent = new Map<number, number>();
  for (const a of agents) perAgent.set(a.id, 0);
  for (const day of result.days) {
    for (const c of day.cleanings) {
      perAgent.set(c.agent.id, (perAgent.get(c.agent.id) ?? 0) + 1);
    }
  }
  result.stats.perAgent = agents.map((a) => ({
    agentId: a.id,
    agentName: a.name,
    count: perAgent.get(a.id) ?? 0,
  }));

  result.stats.perDay = result.days.map((d) => ({
    date: d.date,
    count: d.cleanings.length,
  }));
}

/* ============================================================
 * DONNÉES DE TEST
 * ============================================================ */

const AGENTS_TEST: Agent[] = [
  { id: 1, name: "Sophie" },
  { id: 2, name: "Thomas" },
  { id: 3, name: "Julie", workingDays: [1, 2, 4, 5] }, // pas le mercredi
];

function buildResidents(count: number): Resident[] {
  const residents: Resident[] = [];
  const firstNames = ["M. Dupont", "Mme Martin", "M. Bernard", "Mme Petit", "M. Robert", "Mme Richard", "M. Durand", "Mme Leroy", "M. Moreau", "Mme Simon"];
  const buildings: (1 | 2)[] = [1, 2];

  for (let i = 1; i <= count; i++) {
    const base: Resident = {
      id: i,
      name: `${firstNames[(i - 1) % firstNames.length]} ${i}`,
      apartment: `${100 + (i % 50)}${i > 50 ? "b" : ""}`,
      building: buildings[(i - 1) % 2],
      frequency: "daily",
    };

    // --- Cas spéciaux (résidents 1-15): contraintes variées ---
    if (i === 1) {
      base.priority = 10; // priorité haute
    }
    if (i === 2) {
      base.preferredStart = "13:00";
      base.preferredEnd = "16:30";
      base.priority = 8;
    }
    if (i === 3) {
      base.allowedDays = [2, 4];
      base.priority = 7;
    }
    if (i === 4) {
      base.forbiddenDays = [3]; // pas le mercredi
    }
    if (i === 5) {
      base.frequency = "weekly";
      base.dayOfWeek = 1;
    }
    if (i === 6) {
      base.frequency = "weekly";
      base.dayOfWeek = 3;
    }
    if (i === 7) {
      base.frequency = "weekly";
      base.dayOfWeek = 5;
    }
    if (i === 8) {
      base.frequency = "monthly";
      base.dayOfMonth = 15;
    }
    if (i === 9) {
      base.frequency = "monthly";
      base.dayOfMonth = 31; // test mois courts + repli weekend
    }
    if (i === 10) {
      base.preferredStart = "16:00";
      base.preferredEnd = "16:30"; // fenêtre impossible
    }
    if (i === 11) {
      base.preferredStart = "12:00"; // après-midi uniquement
    }
    if (i === 12) {
      base.preferredEnd = "11:00"; // matin uniquement
    }
    if (i === 13) {
      base.priority = 1; // priorité basse
    }
    if (i === 14) {
      base.allowedDays = [2]; // uniquement mardi
    }
    // (i === 15: emplacement libre pour cas futurs)

    // --- Distribution réaliste pour les résidents au-delà de 15 ---
    // Mélange daily / weekly / monthly pour éviter une saturation immédiate
    // quand count est grand, et tester la robustesse à grande échelle.
    if (i > 15) {
      const mod = i % 6;
      if (mod === 0) {
        base.frequency = "weekly";
        base.dayOfWeek = (i % 5) + 1; // réparti sur lun-ven
      } else if (mod === 1) {
        base.frequency = "monthly";
        base.dayOfMonth = (i % 28) + 1; // 1-28 (évite le 29-31)
      } else {
        base.frequency = "daily"; // ~67% daily
      }
      // Une contrainte horaire sur ~1 résident sur 7
      if (i % 7 === 0) {
        base.preferredStart = i % 2 === 0 ? "12:00" : "13:30";
        base.preferredEnd = i % 2 === 0 ? "17:00" : "16:30";
      }
      // Un jour interdit sur ~1 sur 9
      if (i % 9 === 0) {
        base.forbiddenDays = [(i % 5) + 1];
      }
      // Une priorité variable
      if (i % 5 === 0) base.priority = 8;
      else if (i % 5 === 4) base.priority = 2;
    }

    residents.push(base);
  }
  return residents;
}

/* ============================================================
 * COMPOSANT REACT DE DÉMONSTRATION
 * ============================================================ */

const COLORS_AGENT: Record<number, string> = {
  1: "bg-sky-50 border-sky-200",
  2: "bg-emerald-50 border-emerald-200",
  3: "bg-violet-50 border-violet-200",
};
const DOT_AGENT: Record<number, string> = {
  1: "bg-sky-500",
  2: "bg-emerald-500",
  3: "bg-violet-500",
};
const TEXT_AGENT: Record<number, string> = {
  1: "text-sky-700",
  2: "text-emerald-700",
  3: "text-violet-700",
};

function MistralPlanning() {
  const [residentCount, setResidentCount] = useState(30);
  const [agentCount, setAgentCount] = useState(3);
  const [activeDay, setActiveDay] = useState(0);

  const residents = useMemo(() => buildResidents(residentCount), [residentCount]);
  const agents = useMemo(() => AGENTS_TEST.slice(0, agentCount), [agentCount]);

  // startDate: lundi de la semaine courante (calcul déterministe via new Date)
  const startDate = useMemo(() => {
    const now = new Date();
    const jsDow = now.getDay();
    const diff = jsDow === 0 ? -6 : 1 - jsDow;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    return monday;
  }, []);

  const planning = useMemo(
    () => generatePlanning(residents, agents, startDate),
    [residents, agents, startDate]
  );

  const day = planning.days[activeDay] ?? planning.days[0];

  // Regroupe les ménages par agent
  const byAgent = useMemo(() => {
    const map = new Map<number, Cleaning[]>();
    for (const a of agents) map.set(a.id, []);
    for (const c of day?.cleanings ?? []) {
      if (!map.has(c.agent.id)) map.set(c.agent.id, []);
      map.get(c.agent.id)!.push(c);
    }
    // Tri par start
    for (const [k, v] of map) {
      v.sort((a, b) => a.start.localeCompare(b.start));
      map.set(k, v);
    }
    return map;
  }, [day, agents]);

  // Créneaux de référence (premier agent) pour afficher la grille complète
  const refSlots = useMemo(() => {
    if (agents.length === 0) return [];
    return generateSlots(agents[0]);
  }, [agents]);

  const unscheduledToday = planning.unscheduled.filter(
    (u) => u.date === day?.date
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-bold text-slate-900">
            🧹 Générateur de planning de ménage
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Algorithme greedy + scoring + rééquilibrage borné · semaine du{" "}
            {toISODate(startDate)}
          </p>

          {/* Contrôles */}
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-slate-600">Résidents</span>
              <select
                value={residentCount}
                onChange={(e) => setResidentCount(Number(e.target.value))}
                className="border border-slate-300 rounded-md px-2 py-1 text-sm bg-white"
              >
                {[10, 20, 30, 50, 100, 200].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-slate-600">Agents</span>
              <select
                value={agentCount}
                onChange={(e) => setAgentCount(Number(e.target.value))}
                className="border border-slate-300 rounded-md px-2 py-1 text-sm bg-white"
              >
                {[0, 1, 2, 3].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>

            {/* Stats rapides */}
            <div className="flex items-center gap-3 ml-auto text-sm">
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                {planning.stats.totalScheduled} planifiés
              </span>
              {planning.stats.totalUnscheduled > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 font-medium">
                  {planning.stats.totalUnscheduled} non planifiés
                </span>
              )}
            </div>
          </div>

          {/* Charge par agent */}
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-600">
            {planning.stats.perAgent.map((a) => (
              <span key={a.agentId} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${DOT_AGENT[a.agentId] ?? "bg-slate-400"}`} />
                {a.agentName}: <strong className="text-slate-800">{a.count}</strong>
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Onglets jours */}
      <nav className="bg-white border-b border-slate-200 px-6">
        <div className="max-w-7xl mx-auto flex gap-1">
          {planning.days.map((d, i) => {
            const active = i === activeDay;
            return (
              <button
                key={d.date}
                onClick={() => setActiveDay(i)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  active
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {formatDayHeader(d.date)}
                <span className="ml-2 text-xs text-slate-400">
                  ({d.cleanings.length})
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Grille par agent */}
        {agents.length === 0 ? (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 text-rose-700">
            Aucun agent sélectionné. Tous les résidents à nettoyer apparaissent en
            « non planifiés ».
          </div>
        ) : (
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${agents.length}, minmax(0, 1fr))` }}>
            {agents.map((agent) => {
              const cleanings = byAgent.get(agent.id) ?? [];
              const slots = generateSlots(agent);
              const isOff = !(agent.workingDays ?? [1, 2, 3, 4, 5]).includes(day?.dayOfWeek ?? 1) ||
                agent.unavailableDates?.includes(day?.date ?? "");

              return (
                <div key={agent.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  {/* En-tête agent */}
                  <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${DOT_AGENT[agent.id]}`} />
                    <span className="font-semibold text-slate-800">{agent.name}</span>
                    {isOff && (
                      <span className="ml-auto text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                        Congé
                      </span>
                    )}
                    {!isOff && (
                      <span className="ml-auto text-xs text-slate-400">
                        {cleanings.length}/{slots.length}
                      </span>
                    )}
                  </div>

                  {/* Grille créneaux */}
                  <div className="p-3 space-y-2">
                    {isOff ? (
                      <div className="text-center text-sm text-slate-400 py-8 italic">
                        Agent non travaillé ce jour
                      </div>
                    ) : (
                      slots.map((slot, idx) => {
                        const cleaning = cleanings.find((c) => c.start === slot.start);
                        const isPause = slot.startMin >= toMinutes("11:30") - 1 && slot.start === "11:30";

                        return (
                          <div key={idx}>
                            {cleaning ? (
                              <div className={`rounded-md border p-2.5 ${COLORS_AGENT[agent.id]}`}>
                                <div className="text-xs font-mono text-slate-500 mb-1">
                                  {slot.start} → {slot.end}
                                </div>
                                <div className="font-medium text-slate-800 text-sm leading-tight">
                                  {cleaning.resident.name}
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                  App. {cleaning.resident.apartment} · Bât. {cleaning.resident.building}
                                </div>
                              </div>
                            ) : (
                              <div className="rounded-md border border-dashed border-slate-200 p-2.5">
                                <div className="text-xs font-mono text-slate-400">
                                  {slot.start} → {slot.end}
                                </div>
                                <div className="text-xs text-slate-300 mt-1">Libre</div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bloc pause (rappel visuel) */}
        <div className="mt-4 text-center text-xs text-slate-400">
          ⏸ Pause obligatoire 11:30 → 12:00 (aucun ménage ne traverse la pause)
        </div>

        {/* Non planifiés du jour */}
        {unscheduledToday.length > 0 && (
          <div className="mt-6 bg-rose-50 border border-rose-200 rounded-lg p-4">
            <h3 className="font-semibold text-rose-700 text-sm mb-2">
              ⚠ {unscheduledToday.length} résident(s) non planifié(s) ce jour
            </h3>
            <ul className="space-y-1.5 text-sm">
              {unscheduledToday.map((u, i) => (
                <li key={i} className="flex items-start gap-2 text-rose-800">
                  <span className="font-medium">{u.resident.name}</span>
                  <span className="text-rose-500">·</span>
                  <span className="text-rose-600">
                    App. {u.resident.apartment}, Bât. {u.resident.building},{" "}
                    {u.resident.frequency}
                    {u.resident.preferredStart || u.resident.preferredEnd
                      ? ` · ${u.resident.preferredStart ?? "?"}-${u.resident.preferredEnd ?? "?"}`
                      : ""}
                  </span>
                  <span className="ml-auto text-xs bg-rose-100 px-2 py-0.5 rounded text-rose-700">
                    {u.reason}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Récap semaine */}
        <div className="mt-6 bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="font-semibold text-slate-800 text-sm mb-3">
            Récapitulatif de la semaine
          </h3>
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            {planning.days.map((d) => (
              <div key={d.date} className="p-2 rounded bg-slate-50 border border-slate-100">
                <div className="font-medium text-slate-700">
                  {DAYS_FR[new Date(d.date + "T00:00:00").getDay()].slice(0, 3)}
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-1">
                  {d.cleanings.length}
                </div>
                <div className="text-slate-400">ménages</div>
              </div>
            ))}
          </div>
        </div>

        <footer className="mt-6 text-xs text-slate-400 text-center pb-6">
          Complexité ≈ O(D·R·S·A) par itération · backtracking borné à 3 passes ·
          robuste jusqu&apos;à ~200 résidents
        </footer>
      </main>
    </div>
  );
}

export default MistralPlanning;