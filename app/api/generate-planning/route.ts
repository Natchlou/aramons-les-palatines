import { createClient } from "@/lib/server"
import { NextResponse } from "next/server"

// ============================================
// Types
// ============================================

type Day =
  | "Lundi"
  | "Mardi"
  | "Mercredi"
  | "Jeudi"
  | "Vendredi"

type TimeSlot =
  | "7h45"
  | "8h00"
  | "8h30"
  | "10h00"
  | "11h30"
  | "12h00"
  | "13h30"
  | "14h00"
  | "15h00"
  | "15h30"
  | "16h00"

type Agent =
  | "Christelle"
  | "Manon"
  | "Lana"

interface ResidentConstraint {
  resident_id: string
  allowed_days?: Day[]
  disallow_days?: Day[]
  schedule_hours?: TimeSlot[]
  per_month: number
}

interface PlanningDay {
  [time: string]: string
}

interface PlanningWeek {
  [day: number]: PlanningDay
}

interface MonthlyPlanning {
  title: string
  agent: Agent
  weeks: PlanningWeek[]
}

interface ResidentAssignmentStats {
  target: number
  assignments: number
  lastAssignmentOrder: number
}

interface PlanningSlot {
  agent: Agent
  weekNumber: number
  dayNumber: number
  day: Day
  timeSlot: TimeSlot
}

interface Assignment {
  residentId: string
  slot: PlanningSlot
}

// ============================================
// Configuration
// ============================================

const LANA_ACTIVE_WEEKS: number[] = [1, 2]

const DAYS: Day[] = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
]

const AGENTS: Agent[] = [
  "Christelle",
  "Manon",
  "Lana",
]

// ============================================
// Templates des agents
// ============================================

const AGENT_TEMPLATES: Record<
  Agent,
  Record<Day, Partial<Record<TimeSlot, string>>>
> = {
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
      "10h00": "Ménage",
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
}

// ============================================
// Parsing des contraintes
// ============================================

function parseJsonArray<T>(value: string): T[] | undefined {
  if (!value) {
    return undefined
  }

  try {
    const cleanedValue = value.replace(/\\"/g, '"')
    const parsed = JSON.parse(cleanedValue)

    return Array.isArray(parsed)
      ? (parsed as T[])
      : undefined
  } catch (error) {
    console.error(
      `[Planning] Erreur parsing JSON "${value}" :`,
      error,
    )

    return undefined
  }
}

function parseDaysOrHours<T>(
  value: unknown,
): T[] | undefined {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return undefined
  }

  if (Array.isArray(value)) {
    return value as T[]
  }

  if (typeof value === "string") {
    const trimmed = value.trim()

    if (!trimmed) {
      return undefined
    }

    if (
      trimmed.startsWith("[") &&
      trimmed.endsWith("]")
    ) {
      return parseJsonArray<T>(trimmed)
    }

    return [trimmed as T]
  }

  return undefined
}

// ============================================
// Supabase — contraintes
// ============================================

async function fetchResidentConstraints(): Promise<
  ResidentConstraint[]
> {
  const supabase = await createClient()

  const {
    data,
    error,
  } = await supabase
    .from("constraintes")
    .select(
      "resident_id, allowed_days, disallow_days, schedule_hours, per_month",
    )

  if (error) {
    throw new Error(
      `Erreur lors de la récupération des contraintes : ${error.message}`,
    )
  }

  return (data ?? [])
    .filter(
      (row) =>
        typeof row.resident_id === "string" &&
        row.resident_id.length > 0,
    )
    .map((row) => ({
      resident_id: row.resident_id,

      allowed_days:
        parseDaysOrHours<Day>(
          row.allowed_days,
        ),

      disallow_days:
        parseDaysOrHours<Day>(
          row.disallow_days,
        ),

      schedule_hours:
        parseDaysOrHours<TimeSlot>(
          row.schedule_hours,
        ),

      per_month: Math.max(
        0,
        Number(row.per_month ?? 0),
      ),
    }))
}

// ============================================
// Supabase — tous les résidents
// ============================================

async function fetchAllResidents(): Promise<string[]> {
  const supabase = await createClient()

  const {
    data,
    error,
  } = await supabase
    .from("residents")
    .select("id")

  if (error) {
    throw new Error(
      `Erreur lors de la récupération des résidents : ${error.message}`,
    )
  }

  return [
    ...new Set(
      (data ?? [])
        .map((row) => row.id)
        .filter(
          (
            id,
          ): id is string =>
            typeof id === "string" &&
            id.length > 0,
        ),
    ),
  ]
}

// ============================================
// Mois
// ============================================

function getMonthIndex(mois: string): number {
  const months: Record<string, number> = {
    janvier: 0,
    février: 1,
    fevrier: 1,
    mars: 2,
    avril: 3,
    mai: 4,
    juin: 5,
    juillet: 6,
    août: 7,
    aout: 7,
    septembre: 8,
    octobre: 9,
    novembre: 10,
    décembre: 11,
    decembre: 11,
  }

  const normalized = mois
    .trim()
    .toLowerCase()

  const index = months[normalized]

  if (index === undefined) {
    throw new Error(
      `Mois invalide : "${mois}"`,
    )
  }

  return index
}

function getWeeksInMonth(
  mois: string,
  année: number,
): number[] {
  const monthIndex = getMonthIndex(mois)

  const firstDay = new Date(
    année,
    monthIndex,
    1,
  )

  const lastDay = new Date(
    année,
    monthIndex + 1,
    0,
  )

  const firstDayOffset =
    (firstDay.getDay() + 6) % 7

  const lastDayNumber =
    lastDay.getDate()

  const numberOfWeeks = Math.ceil(
    (firstDayOffset + lastDayNumber) / 7,
  )

  return Array.from(
    {
      length: numberOfWeeks,
    },
    (_, index) => index + 1,
  )
}

// ============================================
// Contraintes
// ============================================

function isResidentAvailable(
  constraint:
    | ResidentConstraint
    | undefined,
  day: Day,
  timeSlot: TimeSlot,
): boolean {
  if (!constraint) {
    return true
  }

  if (
    constraint.disallow_days?.includes(day)
  ) {
    return false
  }

  if (
    constraint.allowed_days &&
    constraint.allowed_days.length > 0 &&
    !constraint.allowed_days.includes(day)
  ) {
    return false
  }

  if (
    constraint.schedule_hours &&
    constraint.schedule_hours.length > 0 &&
    !constraint.schedule_hours.includes(
      timeSlot,
    )
  ) {
    return false
  }

  return true
}

// ============================================
// Statistiques
// ============================================

function createAssignmentStats(
  allResidents: string[],
  constraintsByResident: Map<
    string,
    ResidentConstraint
  >,
): Map<
  string,
  ResidentAssignmentStats
> {
  const stats = new Map<
    string,
    ResidentAssignmentStats
  >()

  for (const residentId of allResidents) {
    const constraint =
      constraintsByResident.get(
        residentId,
      )

    /*
     * Si une contrainte existe :
     * on respecte strictement per_month.
     *
     * Si aucune contrainte n'existe :
     * 1 ménage par mois par défaut.
     */
    const target =
      constraint?.per_month ?? 1

    stats.set(residentId, {
      target: Math.max(0, target),
      assignments: 0,
      lastAssignmentOrder: -1,
    })
  }

  return stats
}

// ============================================
// Score d'un résident
// ============================================

function getResidentCompatibleSlotCount(
  residentId: string,
  slots: PlanningSlot[],
  constraintsByResident: Map<
    string,
    ResidentConstraint
  >,
  usedDates: Set<string>,
): number {
  const constraint =
    constraintsByResident.get(
      residentId,
    )

  let count = 0

  for (const slot of slots) {
    const dateKey =
      `${slot.weekNumber}-${slot.dayNumber}`

    if (usedDates.has(dateKey)) {
      continue
    }

    if (
      !isResidentAvailable(
        constraint,
        slot.day,
        slot.timeSlot,
      )
    ) {
      continue
    }

    count++
  }

  return count
}

// ============================================
// Génération des créneaux
// ============================================

function generatePlanningSlots(
  weeksInMonth: number[],
): PlanningSlot[] {
  const slots: PlanningSlot[] = []

  for (const weekNumber of weeksInMonth) {
    const lanaActive =
      LANA_ACTIVE_WEEKS.includes(
        weekNumber,
      )

    for (
      let dayIndex = 0;
      dayIndex < DAYS.length;
      dayIndex++
    ) {
      const day = DAYS[dayIndex]
      const dayNumber = dayIndex + 1

      for (const agent of AGENTS) {
        if (
          agent === "Lana" &&
          !lanaActive
        ) {
          continue
        }

        const template =
          AGENT_TEMPLATES[agent][day]

        for (const [
          timeSlot,
          task,
        ] of Object.entries(template)) {
          if (task !== "Ménage") {
            continue
          }

          slots.push({
            agent,
            weekNumber,
            dayNumber,
            day,
            timeSlot:
              timeSlot as TimeSlot,
          })
        }
      }
    }
  }

  return slots
}

// ============================================
// Création des plannings vides
// ============================================

function createEmptyPlannings(
  mois: string,
  année: number,
  weeksInMonth: number[],
): MonthlyPlanning[] {
  return AGENTS.map((agent) => ({
    title: `Planning ménage - ${mois} ${année}`,
    agent,
    weeks: weeksInMonth
      .filter(
        (weekNumber) =>
          agent !== "Lana" ||
          LANA_ACTIVE_WEEKS.includes(
            weekNumber,
          ),
      )
      .map(() => ({})),
  }))
}

// ============================================
// Construction du planning
// ============================================

function initializePlanningTemplates(
  plannings: MonthlyPlanning[],
  weeksInMonth: number[],
): void {
  for (const planning of plannings) {
    const isLana =
      planning.agent === "Lana"

    const activeWeeks =
      isLana
        ? weeksInMonth.filter((week) =>
            LANA_ACTIVE_WEEKS.includes(
              week,
            ),
          )
        : weeksInMonth

    planning.weeks =
      activeWeeks.map(
        (weekNumber) => {
          const weekPlanning: PlanningWeek =
            {}

          let hallNumber = 1

          for (
            let dayIndex = 0;
            dayIndex < DAYS.length;
            dayIndex++
          ) {
            const day = DAYS[dayIndex]

            const template =
              AGENT_TEMPLATES[
                planning.agent
              ][day]

            const dayPlanning: PlanningDay =
              {}

            for (const [
              timeSlot,
              task,
            ] of Object.entries(
              template,
            )) {
              if (
                timeSlot === "8h00" ||
                timeSlot === "7h45"
              ) {
                dayPlanning[timeSlot] =
                  `Hall ${hallNumber}`

                hallNumber =
                  hallNumber === 1
                    ? 2
                    : 1

                continue
              }

              dayPlanning[timeSlot] =
                task
            }

            weekPlanning[
              dayIndex + 1
            ] = dayPlanning
          }

          return weekPlanning
        },
      )
  }
}

// ============================================
// Affectation d'un résident
// ============================================

function assignResidentToSlot(
  residentId: string,
  slot: PlanningSlot,
  plannings: MonthlyPlanning[],
  assignmentStats: Map<
    string,
    ResidentAssignmentStats
  >,
  assignmentOrder: number,
): void {
  const planning = plannings.find(
    (item) =>
      item.agent === slot.agent,
  )

  if (!planning) {
    return
  }

  const weekIndex =
    planning.agent === "Lana"
      ? LANA_ACTIVE_WEEKS.indexOf(
          slot.weekNumber,
        )
      : slot.weekNumber - 1

  if (weekIndex < 0) {
    return
  }

  const week =
    planning.weeks[weekIndex]

  if (!week) {
    return
  }

  const day =
    week[slot.dayNumber]

  if (!day) {
    return
  }

  day[slot.timeSlot] =
    residentId

  const stats =
    assignmentStats.get(
      residentId,
    )

  if (stats) {
    stats.assignments++
    stats.lastAssignmentOrder =
      assignmentOrder
  }
}

// ============================================
// Génération globale
// ============================================

function generateAssignments(
  allResidents: string[],
  constraintsByResident: Map<
    string,
    ResidentConstraint
  >,
  assignmentStats: Map<
    string,
    ResidentAssignmentStats
  >,
  slots: PlanningSlot[],
  plannings: MonthlyPlanning[],
): Assignment[] {
  const assignments: Assignment[] = []

  /*
   * Un résident ne peut être affecté
   * qu'une seule fois à une date donnée.
   *
   * Exemple :
   *
   * 2026-10-12
   *
   * Christelle → résident A
   * Manon      → résident B
   * Lana       → résident C
   *
   * mais jamais :
   *
   * Christelle → résident A
   * Manon      → résident A
   */
  const usedDatesByResident =
    new Map<string, Set<string>>()

  for (const residentId of allResidents) {
    usedDatesByResident.set(
      residentId,
      new Set(),
    )
  }

  /*
   * On mélange légèrement les créneaux
   * pour éviter de toujours favoriser
   * le même agent.
   *
   * Le tri reste ensuite déterministe.
   */
  const shuffledSlots = [
    ...slots,
  ].sort(() => Math.random() - 0.5)

  /*
   * On répète plusieurs passes.
   *
   * À chaque passe, les résidents ayant
   * encore beaucoup de retard sont prioritaires.
   */
  let assignmentOrder = 0

  const maxPasses = Math.max(
    ...allResidents.map(
      (residentId) =>
        assignmentStats.get(
          residentId,
        )?.target ?? 0,
    ),
    0,
  )

  for (
    let pass = 0;
    pass < maxPasses;
    pass++
  ) {
    /*
     * Résidents encore sous leur objectif.
     */
    const residentsToAssign =
      allResidents
        .filter((residentId) => {
          const stats =
            assignmentStats.get(
              residentId,
            )

          return (
            stats &&
            stats.target > 0 &&
            stats.assignments <
              stats.target
          )
        })
        .sort((a, b) => {
          const statsA =
            assignmentStats.get(a)!

          const statsB =
            assignmentStats.get(b)!

          /*
           * 1. Priorité au plus gros retard
           */
          const remainingA =
            statsA.target -
            statsA.assignments

          const remainingB =
            statsB.target -
            statsB.assignments

          if (
            remainingA !==
            remainingB
          ) {
            return (
              remainingB -
              remainingA
            )
          }

          /*
           * 2. Les résidents les plus
           * contraints passent avant.
           */
          const availableA =
            getResidentCompatibleSlotCount(
              a,
              shuffledSlots,
              constraintsByResident,
              usedDatesByResident.get(
                a,
              )!,
            )

          const availableB =
            getResidentCompatibleSlotCount(
              b,
              shuffledSlots,
              constraintsByResident,
              usedDatesByResident.get(
                b,
              )!,
            )

          if (
            availableA !==
            availableB
          ) {
            return (
              availableA -
              availableB
            )
          }

          /*
           * 3. Rotation.
           */
          const lastA =
            assignmentStats.get(
              a,
            )!.lastAssignmentOrder

          const lastB =
            assignmentStats.get(
              b,
            )!.lastAssignmentOrder

          return lastA - lastB
        })

    let assignedSomething = false

    for (const residentId of residentsToAssign) {
      const stats =
        assignmentStats.get(
          residentId,
        )

      if (!stats) {
        continue
      }

      if (
        stats.assignments >=
        stats.target
      ) {
        continue
      }

      const usedDates =
        usedDatesByResident.get(
          residentId,
        )!

      const constraint =
        constraintsByResident.get(
          residentId,
        )

      /*
       * On cherche les créneaux
       * compatibles avec ce résident.
       */
      const compatibleSlots =
        shuffledSlots.filter(
          (slot) => {
            const dateKey =
              `${slot.weekNumber}-${slot.dayNumber}`

            /*
             * Une seule fois par jour.
             */
            if (
              usedDates.has(
                dateKey,
              )
            ) {
              return false
            }

            /*
             * Contraintes.
             */
            if (
              !isResidentAvailable(
                constraint,
                slot.day,
                slot.timeSlot,
              )
            ) {
              return false
            }

            /*
             * Le créneau doit encore
             * être libre.
             */
            const planning =
              plannings.find(
                (item) =>
                  item.agent ===
                  slot.agent,
              )

            if (!planning) {
              return false
            }

            const weekIndex =
              planning.agent === "Lana"
                ? LANA_ACTIVE_WEEKS.indexOf(
                    slot.weekNumber,
                  )
                : slot.weekNumber - 1

            const week =
              planning.weeks[
                weekIndex
              ]

            if (!week) {
              return false
            }

            const day =
              week[
                slot.dayNumber
              ]

            if (!day) {
              return false
            }

            return (
              day[
                slot.timeSlot
              ] === "Ménage"
            )
          },
        )

      if (
        compatibleSlots.length ===
        0
      ) {
        continue
      }

      /*
       * On choisit le meilleur créneau.
       *
       * Priorité :
       *
       * 1. agent le moins chargé
       * 2. date la plus éloignée
       * 3. rotation
       */
      const agentLoad = new Map<
        Agent,
        number
      >()

      for (const agent of AGENTS) {
        agentLoad.set(agent, 0)
      }

      for (const assignment of assignments) {
        agentLoad.set(
          assignment.slot.agent,
          (agentLoad.get(
            assignment.slot.agent,
          ) ?? 0) + 1,
        )
      }

      compatibleSlots.sort(
        (a, b) => {
          const loadA =
            agentLoad.get(
              a.agent,
            ) ?? 0

          const loadB =
            agentLoad.get(
              b.agent,
            ) ?? 0

          if (loadA !== loadB) {
            return loadA - loadB
          }

          /*
           * Préférence pour les semaines
           * différentes entre deux passages.
           */
          if (
            a.weekNumber !==
            b.weekNumber
          ) {
            return (
              a.weekNumber -
              b.weekNumber
            )
          }

          return (
            a.dayNumber -
            b.dayNumber
          )
        },
      )

      const selectedSlot =
        compatibleSlots[0]

      if (!selectedSlot) {
        continue
      }

      const dateKey =
        `${selectedSlot.weekNumber}-${selectedSlot.dayNumber}`

      assignResidentToSlot(
        residentId,
        selectedSlot,
        plannings,
        assignmentStats,
        assignmentOrder++,
      )

      usedDates.add(dateKey)

      assignments.push({
        residentId,
        slot: selectedSlot,
      })

      assignedSomething = true
    }

    /*
     * Si aucune affectation n'a été possible
     * pendant cette passe, inutile de continuer.
     */
    if (!assignedSomething) {
      break
    }
  }

  return assignments
}

// ============================================
// Statistiques finales
// ============================================

function logAssignmentStatistics(
  allResidents: string[],
  assignmentStats: Map<
    string,
    ResidentAssignmentStats
  >,
  slots: PlanningSlot[],
  assignments: Assignment[],
): void {
  let residentsReachedTarget = 0
  let residentsNotReachedTarget = 0
  let totalTarget = 0
  let totalAssignments = 0

  for (const residentId of allResidents) {
    const stats =
      assignmentStats.get(
        residentId,
      )

    if (!stats) {
      continue
    }

    totalTarget += stats.target
    totalAssignments +=
      stats.assignments

    if (
      stats.assignments >=
      stats.target
    ) {
      residentsReachedTarget++
    } else {
      residentsNotReachedTarget++
    }

    if (
      stats.assignments <
      stats.target
    ) {
      console.warn(
        `[Planning] SOUS OBJECTIF ${residentId} : ${stats.assignments}/${stats.target}`,
      )
    }
  }

  console.log(
    "============================================",
  )

  console.log(
    `[Planning] Résidents : ${allResidents.length}`,
  )

  console.log(
    `[Planning] Objectif total : ${totalTarget}`,
  )

  console.log(
    `[Planning] Créneaux disponibles : ${slots.length}`,
  )

  console.log(
    `[Planning] Affectations réalisées : ${totalAssignments}`,
  )

  console.log(
    `[Planning] Résidents atteignant leur objectif : ${residentsReachedTarget}/${allResidents.length}`,
  )

  console.log(
    `[Planning] Résidents sous objectif : ${residentsNotReachedTarget}`,
  )

  console.log(
    `[Planning] Créneaux encore libres : ${
      slots.length -
      assignments.length
    }`,
  )

  console.log(
    "============================================",
  )
}

// ============================================
// Génération mensuelle
// ============================================

async function generateMonthlyPlannings(
  mois: string,
  année: number,
): Promise<MonthlyPlanning[]> {
  const [
    constraints,
    allResidents,
  ] = await Promise.all([
    fetchResidentConstraints(),
    fetchAllResidents(),
  ])

  // ==========================================
  // Vérification
  // ==========================================

  if (
    allResidents.length ===
    0
  ) {
    throw new Error(
      "Aucun résident trouvé dans la table residents.",
    )
  }

  console.log(
    `[Planning] ${allResidents.length} résidents trouvés.`,
  )

  // ==========================================
  // Index des contraintes
  // ==========================================

  const constraintsByResident =
    new Map<
      string,
      ResidentConstraint
    >()

  for (const constraint of constraints) {
    /*
     * Si plusieurs lignes existent pour
     * le même résident, la dernière est
     * utilisée.
     */
    constraintsByResident.set(
      constraint.resident_id,
      constraint,
    )
  }

  const constrainedResidentIds =
    new Set(
      constraints.map(
        (constraint) =>
          constraint.resident_id,
      ),
    )

  const unconstrainedResidents =
    allResidents.filter(
      (residentId) =>
        !constrainedResidentIds.has(
          residentId,
        ),
    )

  console.log(
    `[Planning] ${constraintsByResident.size} résidents avec contraintes.`,
  )

  console.log(
    `[Planning] ${unconstrainedResidents.length} résidents sans contraintes.`,
  )

  // ==========================================
  // Semaines
  // ==========================================

  const weeksInMonth =
    getWeeksInMonth(
      mois,
      année,
    )

  console.log(
    `[Planning] Semaines générées : ${weeksInMonth.join(", ")}`,
  )

  // ==========================================
  // Statistiques
  // ==========================================

  const assignmentStats =
    createAssignmentStats(
      allResidents,
      constraintsByResident,
    )

  // ==========================================
  // Plannings
  // ==========================================

  const plannings =
    createEmptyPlannings(
      mois,
      année,
      weeksInMonth,
    )

  initializePlanningTemplates(
    plannings,
    weeksInMonth,
  )

  // ==========================================
  // Créneaux
  // ==========================================

  const slots =
    generatePlanningSlots(
      weeksInMonth,
    )

  console.log(
    `[Planning] ${slots.length} créneaux ménage disponibles.`,
  )

  // ==========================================
  // Affectation globale
  // ==========================================

  const assignments =
    generateAssignments(
      allResidents,
      constraintsByResident,
      assignmentStats,
      slots,
      plannings,
    )

  // ==========================================
  // Statistiques
  // ==========================================

  logAssignmentStatistics(
    allResidents,
    assignmentStats,
    slots,
    assignments,
  )

  // ==========================================
  // Résidents jamais affectés
  // ==========================================

  const neverAssigned =
    allResidents.filter(
      (residentId) => {
        const stats =
          assignmentStats.get(
            residentId,
          )

        return (
          stats &&
          stats.assignments === 0 &&
          stats.target > 0
        )
      },
    )

  if (
    neverAssigned.length > 0
  ) {
    console.warn(
      `[Planning] ${neverAssigned.length} résident(s) n'ont reçu aucune affectation :`,
      neverAssigned,
    )
  }

  return plannings
}

// ============================================
// Endpoint GET
// ============================================

export async function GET(
  request: Request,
) {
  const {
    searchParams,
  } = new URL(
    request.url,
  )

  const mois =
    searchParams.get("mois") ||
    "Septembre"

  const année = parseInt(
    searchParams.get(
      "année",
    ) || "2026",
    10,
  )

  if (
    Number.isNaN(année)
  ) {
    return NextResponse.json(
      {
        error:
          "L'année fournie est invalide.",
      },
      {
        status: 400,
      },
    )
  }

  try {
    const plannings =
      await generateMonthlyPlannings(
        mois,
        année,
      )

    return NextResponse.json(
      plannings,
    )
  } catch (error) {
    console.error(
      "Erreur détaillée :",
      error,
    )

    return NextResponse.json(
      {
        error:
          `Erreur lors de la génération du planning : ${
            error instanceof Error
              ? error.message
              : String(error)
          }`,
      },
      {
        status: 500,
      },
    )
  }
}