import type {
  PlanningDayNumber,
  PlanningWeek,
  Resident,
} from "./types"

export const DAYS: Record<PlanningDayNumber, string> = {
  "1": "Lundi",
  "2": "Mardi",
  "3": "Mercredi",
  "4": "Jeudi",
  "5": "Vendredi",
}

const MONTHS: Record<string, number> = {
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

export interface PlanningDateInfo {
  month: number
  year: number
}

export function parseMonthAndYear(
  title: string,
): PlanningDateInfo | null {
  const normalizedTitle = title.toLowerCase()

  const yearMatch = normalizedTitle.match(/\b(20\d{2})\b/)

  if (!yearMatch) {
    return null
  }

  const year = Number(yearMatch[1])

  const monthEntry = Object.entries(MONTHS).find(
    ([month]) => normalizedTitle.includes(month),
  )

  if (!monthEntry) {
    return null
  }

  return {
    month: monthEntry[1],
    year,
  }
}

export function getResidentName(
  resident: Resident,
): string {
  return [
    resident.prefix
      ? `${resident.prefix}.`
      : null,
    resident.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim()
}

export function getResidentService(
  resident: Resident,
): string {
  const parts = [
    resident.building
      ? `Bât. ${resident.building}`
      : null,
    resident.room
      ? `Ch. ${resident.room}`
      : null,
  ].filter(Boolean)

  return parts.join(" • ") || "—"
}

export function formatPlanningDate(
  date: Date,
): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date)
}

export function getPlanningDate(
  year: number,
  month: number,
  weekIndex: number,
  dayNumber: PlanningDayNumber,
): Date {
  const firstDayOfMonth = new Date(
    year,
    month,
    1,
  )

  const javascriptDay =
    firstDayOfMonth.getDay()

  const daysFromMonday =
    javascriptDay === 0
      ? 6
      : javascriptDay - 1

  const firstMonday = new Date(
    year,
    month,
    1 - daysFromMonday,
  )

  const dayOffset =
    Number(dayNumber) - 1

  const date = new Date(firstMonday)

  date.setDate(
    firstMonday.getDate() +
      weekIndex * 7 +
      dayOffset,
  )

  return date
}

export function getVisibleDays(
  week: PlanningWeek,
) {
  return Object.entries(DAYS).filter(
    ([dayNumber]) =>
      Boolean(
        week[
          dayNumber as PlanningDayNumber
        ],
      ),
  ) as [
    PlanningDayNumber,
    string,
  ][]
}

export function getResidentMap(
  residents: Resident[],
) {
  return new Map(
    residents.map((resident) => [
      resident.id,
      resident,
    ]),
  )
}