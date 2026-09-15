"use client"

import * as React from "react"

export type PlanningDay = Record<string, string>

export type PlanningWeek = Partial<
  Record<"1" | "2" | "3" | "4" | "5", PlanningDay>
>

export interface Resident {
  id: string
  prefix: string | null
  first_name: string | null
  last_name: string | null
  room: string | null
  building: string | null
  created_at?: string
}

export interface CleaningPlanningProps {
  title: string
  agent: string
  weeks: PlanningWeek[]
  residents: Resident[]
}

const DAYS = {
  "1": "Lundi",
  "2": "Mardi",
  "3": "Mercredi",
  "4": "Jeudi",
  "5": "Vendredi",
} as const

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

/**
 * Récupère le mois et l'année depuis le titre.
 *
 * Exemple :
 * "Planning ménage - Septembre 2026"
 * → { month: 8, year: 2026 }
 */
function parseMonthAndYear(title: string) {
  const normalizedTitle = title.toLowerCase()

  const yearMatch = normalizedTitle.match(/\b(20\d{2})\b/)

  if (!yearMatch) {
    return null
  }

  const year = Number(yearMatch[1])

  const monthEntry = Object.entries(MONTHS).find(([month]) =>
    normalizedTitle.includes(month),
  )

  if (!monthEntry) {
    return null
  }

  return {
    month: monthEntry[1],
    year,
  }
}

/**
 * Retourne le nom complet du résident.
 */
function getResidentName(resident: Resident) {
  return [resident.prefix + '. ', resident.first_name, resident.last_name]
    .filter(Boolean)
    .join(" ")
    .trim()
}

/**
 * Retourne les informations de service du résident.
 */
function getResidentService(resident: Resident) {
  const parts = [
    resident.building ? `Bât. ${resident.building}` : null,
    resident.room ? `Ch. ${resident.room}` : null,
  ].filter(Boolean)

  return parts.join(" • ") || "—"
}

/**
 * Formate une date :
 *
 * Mardi 1 septembre
 */
function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date)
}

/**
 * Calcule la date correspondant à une journée du planning.
 *
 * Les clés du planning sont :
 * 1 = lundi
 * 2 = mardi
 * 3 = mercredi
 * 4 = jeudi
 * 5 = vendredi
 *
 * Le premier lundi utilisé est celui de la semaine contenant
 * le premier jour du mois.
 */
function getPlanningDate(
  year: number,
  month: number,
  weekIndex: number,
  dayNumber: string,
) {
  const firstDayOfMonth = new Date(year, month, 1)

  /**
   * getDay():
   * 0 = dimanche
   * 1 = lundi
   * ...
   * 6 = samedi
   */
  const javascriptDay = firstDayOfMonth.getDay()

  /**
   * Nombre de jours à retirer pour revenir au lundi.
   */
  const daysFromMonday = javascriptDay === 0 ? 6 : javascriptDay - 1

  const firstMonday = new Date(year, month, 1 - daysFromMonday)

  const dayOffset = Number(dayNumber) - 1

  const date = new Date(firstMonday)

  date.setDate(
    firstMonday.getDate() +
      weekIndex * 7 +
      dayOffset,
  )

  return date
}

export function CleaningPlanning({
  title,
  agent,
  weeks,
  residents,
}: CleaningPlanningProps) {
  /**
   * Index des résidents par UUID.
   *
   * Exemple :
   *
   * "97ea71d7-..." → Resident
   */
  const residentMap = React.useMemo(
    () =>
      new Map(
        residents.map((resident) => [
          resident.id,
          resident,
        ]),
      ),
    [residents],
  )

  /**
   * Extraction du mois et de l'année depuis le title.
   */
  const dateInfo = React.useMemo(
    () => parseMonthAndYear(title),
    [title],
  )

  return (
    <section className="space-y-6">
      {/* HEADER */}
      <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-muted-foreground">
            Planning ménage
          </p>

          <h1 className="text-2xl font-bold tracking-tight">
            {title}
          </h1>
        </div>

        <div className="w-fit rounded-lg border bg-muted/40 px-4 py-2 sm:text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Agent
          </p>

          <p className="font-semibold">
            {agent}
          </p>
        </div>
      </header>

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-237.5 border-collapse text-sm">
            <thead>
              <tr className="bg-muted/60">
                <th className="w-47.5 border-b px-4 py-3 text-left font-semibold">
                  Date
                </th>

                <th className="w-30 border-b px-4 py-3 text-left font-semibold">
                  HEURE
                </th>

                <th className="w-55 border-b px-4 py-3 text-left font-semibold">
                  À faire
                </th>

                <th className="min-w-60 border-b px-4 py-3 text-left font-semibold">
                  Nom
                </th>

                <th className="min-w-47.5 border-b px-4 py-3 text-left font-semibold">
                  Service
                </th>
              </tr>
            </thead>

            <tbody>
              {weeks.map((week, weekIndex) => {
                const visibleDays = Object.entries(DAYS).filter(
                  ([dayNumber]) =>
                    Boolean(
                      week[
                        dayNumber as keyof PlanningWeek
                      ],
                    ),
                )

                if (visibleDays.length === 0) {
                  return null
                }

                return (
                  <React.Fragment key={`week-${weekIndex}`}>
                    {/* SEMAINE */}
                    <tr>
                      <td
                        colSpan={5}
                        className="border-b bg-muted/20 px-4 py-2"
                      >
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Semaine {weekIndex + 1}
                        </span>
                      </td>
                    </tr>

                    {visibleDays.map(
                      ([dayNumber, dayName]) => {
                        const planning =
                          week[
                            dayNumber as keyof PlanningWeek
                          ]

                        if (!planning) {
                          return null
                        }

                        const entries =
                          Object.entries(planning)

                        const planningDate = dateInfo
                          ? getPlanningDate(
                              dateInfo.year,
                              dateInfo.month,
                              weekIndex,
                              dayNumber,
                            )
                          : null

                        return (
                          <tr
                            key={`${weekIndex}-${dayNumber}`}
                            className="align-top transition-colors hover:bg-muted/20"
                          >
                            {/* DATE */}
                            <td className="border-b px-4 py-0">
                              <div className="flex min-h-11 items-center">
                                {planningDate ? (
                                  <div className="flex flex-col">
                                    <span className="font-semibold capitalize">
                                      {formatDate(
                                        planningDate,
                                      )}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="font-semibold">
                                    {dayName}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* HEURE */}
                            <td className="border-b p-0">
                              <div className="divide-y">
                                {entries.map(
                                  ([time]) => (
                                    <div
                                      key={time}
                                      className="flex min-h-11 items-center px-4 py-2 font-medium tabular-nums text-muted-foreground"
                                    >
                                      {time}
                                    </div>
                                  ),
                                )}
                              </div>
                            </td>

                            {/* À FAIRE */}
                            <td className="border-b p-0">
                              <div className="divide-y">
                                {entries.map(
                                  ([time, task]) => {
                                    const resident =
                                      residentMap.get(
                                        task,
                                      )

                                    return (
                                      <div
                                        key={time}
                                        className="flex min-h-11 items-center px-4 py-2"
                                      >
                                        {resident ? (
                                          <span className="font-medium">
                                            Ménage
                                          </span>
                                        ) : (
                                          <span
                                            className={
                                              task
                                                .toLowerCase()
                                                .includes(
                                                  "pause",
                                                ) ||
                                              task
                                                .toLowerCase()
                                                .includes(
                                                  "fin",
                                                )
                                                ? "text-muted-foreground"
                                                : "font-medium"
                                            }
                                          >
                                            {task}
                                          </span>
                                        )}
                                      </div>
                                    )
                                  },
                                )}
                              </div>
                            </td>

                            {/* NOM */}
                            <td className="border-b p-0">
                              <div className="divide-y">
                                {entries.map(
                                  ([time, task]) => {
                                    const resident =
                                      residentMap.get(
                                        task,
                                      )

                                    return (
                                      <div
                                        key={time}
                                        className="flex min-h-11 items-center px-4 py-2"
                                      >
                                        {resident ? (
                                          <div className="flex flex-col">
                                            <span className="font-bold">
                                              {getResidentName(
                                                resident,
                                              ) ||
                                                "—"}
                                            </span>
                                          </div>
                                        ) : (
                                          <span className="text-muted-foreground">
                                            —
                                          </span>
                                        )}
                                      </div>
                                    )
                                  },
                                )}
                              </div>
                            </td>

                            {/* SERVICE */}
                            <td className="border-b p-0">
                              <div className="divide-y">
                                {entries.map(
                                  ([time, task]) => {
                                    const resident =
                                      residentMap.get(
                                        task,
                                      )

                                    return (
                                      <div
                                        key={time}
                                        className="flex min-h-11 items-center px-4 py-2"
                                      >
                                        {resident ? (
                                          <span className="text-muted-foreground">
                                            {getResidentService(
                                              resident,
                                            )}
                                          </span>
                                        ) : (
                                          <span className="text-muted-foreground">
                                            —
                                          </span>
                                        )}
                                      </div>
                                    )
                                  },
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      },
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message si le title ne permet pas de déterminer la date */}
      {!dateInfo && (
        <p className="text-sm text-muted-foreground">
          Impossible de déterminer le mois et l&apos;année à
          partir du titre. Utilisez par exemple{" "}
          <span className="font-medium">
            Planning ménage - Septembre 2026
          </span>
          .
        </p>
      )}
    </section>
  )
}