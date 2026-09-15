"use client"

import * as React from "react"

import {
  DAYS,
  formatPlanningDate,
  getPlanningDate,
  getResidentMap,
  getResidentName,
  getResidentService,
  getVisibleDays,
  parseMonthAndYear,
} from "@/lib/planning/utils"

import type {
  CleaningPlanningProps,
  PlanningDayNumber,
} from "@/lib/planning/types"

export type {
  CleaningPlanningProps,
}

export function CleaningPlanning({
  title,
  agent,
  weeks,
  residents,
}: CleaningPlanningProps) {
  const residentMap = React.useMemo(
    () => getResidentMap(residents),
    [residents],
  )

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
              {weeks.map(
                (week, weekIndex) => {
                  const visibleDays =
                    getVisibleDays(week)

                  if (
                    visibleDays.length === 0
                  ) {
                    return null
                  }

                  return (
                    <React.Fragment
                      key={`week-${weekIndex}`}
                    >
                      {/* SEMAINE */}
                      <tr>
                        <td
                          colSpan={5}
                          className="border-b bg-muted/20 px-4 py-2"
                        >
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Semaine{" "}
                            {weekIndex + 1}
                          </span>
                        </td>
                      </tr>

                      {visibleDays.map(
                        ([
                          dayNumber,
                          dayName,
                        ]) => {
                          const planning =
                            week[
                              dayNumber
                            ]

                          if (!planning) {
                            return null
                          }

                          const entries =
                            Object.entries(
                              planning,
                            )

                          const planningDate =
                            dateInfo
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
                                        {formatPlanningDate(
                                          planningDate,
                                        )}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="font-semibold">
                                      {
                                        dayName
                                      }
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
                                        key={
                                          time
                                        }
                                        className="flex min-h-11 items-center px-4 py-2 font-medium tabular-nums text-muted-foreground"
                                      >
                                        {
                                          time
                                        }
                                      </div>
                                    ),
                                  )}
                                </div>
                              </td>

                              {/* À FAIRE */}
                              <td className="border-b p-0">
                                <div className="divide-y">
                                  {entries.map(
                                    ([
                                      time,
                                      task,
                                    ]) => {
                                      const resident =
                                        residentMap.get(
                                          task,
                                        )

                                      const isMuted =
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

                                      return (
                                        <div
                                          key={
                                            time
                                          }
                                          className="flex min-h-11 items-center px-4 py-2"
                                        >
                                          {resident ? (
                                            <span className="font-medium">
                                              Ménage
                                            </span>
                                          ) : (
                                            <span
                                              className={
                                                isMuted
                                                  ? "text-muted-foreground"
                                                  : "font-medium"
                                              }
                                            >
                                              {
                                                task
                                              }
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
                                    ([
                                      time,
                                      task,
                                    ]) => {
                                      const resident =
                                        residentMap.get(
                                          task,
                                        )

                                      return (
                                        <div
                                          key={
                                            time
                                          }
                                          className="flex min-h-11 items-center px-4 py-2"
                                        >
                                          {resident ? (
                                            <span className="font-bold">
                                              {getResidentName(
                                                resident,
                                              ) ||
                                                "—"}
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

                              {/* SERVICE */}
                              <td className="border-b p-0">
                                <div className="divide-y">
                                  {entries.map(
                                    ([
                                      time,
                                      task,
                                    ]) => {
                                      const resident =
                                        residentMap.get(
                                          task,
                                        )

                                      return (
                                        <div
                                          key={
                                            time
                                          }
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
                },
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!dateInfo && (
        <p className="text-sm text-muted-foreground">
          Impossible de déterminer le
          mois et l&apos;année à partir du
          titre. Utilisez par exemple{" "}
          <span className="font-medium">
            Planning ménage - Septembre 2026
          </span>
          .
        </p>
      )}
    </section>
  )
}