"use client"

import * as React from "react"
import type {
  MonthlyScheduleResponse,
  Task,
} from "@/lib/planningService"

export interface CleaningPlanningProps {
  /** Planning complet (global ou déjà filtré par `filterScheduleByAgent`). */
  schedule: MonthlyScheduleResponse
  /** Filtre optionnel : si fourni, n'affiche que les tâches de cet agent. */
  agentFilter?: string
  /** Masque les tâches fixes (pause, hall, plonge, lessives, common). */
  hideFixedTasks?: boolean
}

const TYPE_LABELS: Record<string, string> = {
  menage: "Ménage",
  hall: "Hall",
  pause: "Pause",
  plonge: "Plonge",
  lessives: "Lessives",
  common: "Parties communes",
  fixed: "—",
}

/** Libellé de la colonne "À faire" pour une tâche donnée. */
function taskLabel(task: Task): string {
  if (task.type === "menage") return TYPE_LABELS.menage
  // Pour hall / pause / etc., on affiche le libellé fourni par le service
  if (task.resident) return task.resident
  return TYPE_LABELS[task.type] ?? task.type
}

/** Libellé de la colonne "Service" (uniquement pour les ménages). */
function serviceLabel(task: Task): string {
  if (task.type !== "menage") return "—"
  const parts = [
    task.building ? `Bât. ${task.building}` : null,
    task.room ? `Ch. ${task.room}` : null,
  ].filter(Boolean)
  return parts.join(" • ") || "—"
}

export function CleaningPlanning({
  schedule,
  agentFilter,
  hideFixedTasks = false,
}: CleaningPlanningProps) {
  // --- 1. Filtrage optionnel par agent ---
  const filteredWeeks = React.useMemo(() => {
    if (!agentFilter) return schedule.weeks
    return schedule.weeks
      .map((week) => ({
        ...week,
        days: week.days
          .map((day) => ({
            ...day,
            tasks: day.tasks.filter(
              (t) => t.type === "menage" && t.agent === agentFilter,
            ),
          }))
          .filter((day) => day.tasks.length > 0),
      }))
      .filter((week) => week.days.length > 0)
  }, [schedule.weeks, agentFilter])

  // --- 2. Y a-t-il plusieurs agents dans ce planning ? ---
  const hasMultipleAgents = React.useMemo(() => {
    const agents = new Set<string>()
    for (const w of filteredWeeks) {
      for (const d of w.days) {
        for (const t of d.tasks) {
          if (t.agent) agents.add(t.agent)
        }
      }
    }
    return agents.size > 1
  }, [filteredWeeks])

  const displayAgent = agentFilter ?? schedule.agent
  const colCount = hasMultipleAgents ? 6 : 5

  return (
    <section className="space-y-6">
      {/* HEADER */}
      <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-muted-foreground">
            Planning ménage
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            {schedule.title}
          </h1>
          {schedule.subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">
              {schedule.subtitle}
            </p>
          )}
        </div>

        <div className="w-fit rounded-lg border bg-muted/40 px-4 py-2 sm:text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {agentFilter ? "Agent" : "Équipe"}
          </p>
          <p className="font-semibold">{displayAgent}</p>
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
                  Heure
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
                {hasMultipleAgents && (
                  <th className="min-w-30 border-b px-4 py-3 text-left font-semibold">
                    Agent
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {filteredWeeks.map((week, weekIndex) => (
                <React.Fragment key={`week-${weekIndex}-${week.label}`}>
                  {/* Bandeau semaine */}
                  <tr>
                    <td
                      colSpan={colCount}
                      className="border-b bg-muted/20 px-4 py-2"
                    >
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {week.label}
                      </span>
                    </td>
                  </tr>

                  {week.days.map((day) => {
                    const tasks = hideFixedTasks
                      ? day.tasks.filter((t) => t.type === "menage")
                      : day.tasks

                    if (tasks.length === 0) return null

                    return (
                      <tr
                        key={day.isoDate}
                        className="align-top transition-colors hover:bg-muted/20"
                      >
                        {/* DATE */}
                        <td className="border-b px-4 py-0">
                          <div className="flex min-h-11 items-center">
                            <span className="font-semibold capitalize">
                              {day.date}
                            </span>
                          </div>
                        </td>

                        {/* HEURE */}
                        <td className="border-b p-0">
                          <div className="divide-y">
                            {tasks.map((t, i) => (
                              <div
                                key={`time-${i}-${t.time}-${t.agent ?? ""}`}
                                className="flex min-h-11 items-center px-4 py-2 font-medium tabular-nums text-muted-foreground"
                              >
                                {t.time}
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* À FAIRE */}
                        <td className="border-b p-0">
                          <div className="divide-y">
                            {tasks.map((t, i) => {
                              const isMenage = t.type === "menage"
                              return (
                                <div
                                  key={`label-${i}-${t.time}-${t.agent ?? ""}`}
                                  className="flex min-h-11 items-center px-4 py-2"
                                >
                                  <span
                                    className={
                                      isMenage
                                        ? "font-medium"
                                        : "text-muted-foreground italic"
                                    }
                                  >
                                    {taskLabel(t)}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </td>

                        {/* NOM */}
                        <td className="border-b p-0">
                          <div className="divide-y">
                            {tasks.map((t, i) => (
                              <div
                                key={`name-${i}-${t.time}-${t.agent ?? ""}`}
                                className="flex min-h-11 items-center px-4 py-2"
                              >
                                {t.type === "menage" ? (
                                  <span className="font-bold">
                                    {t.resident ?? "—"}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* SERVICE */}
                        <td className="border-b p-0">
                          <div className="divide-y">
                            {tasks.map((t, i) => (
                              <div
                                key={`svc-${i}-${t.time}-${t.agent ?? ""}`}
                                className="flex min-h-11 items-center px-4 py-2 text-muted-foreground"
                              >
                                {serviceLabel(t)}
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* AGENT (conditionnel) */}
                        {hasMultipleAgents && (
                          <td className="border-b p-0">
                            <div className="divide-y">
                              {tasks.map((t, i) => (
                                <div
                                  key={`agent-${i}-${t.time}`}
                                  className="flex min-h-11 items-center px-4 py-2 text-xs text-muted-foreground"
                                >
                                  {t.agent ?? "—"}
                                </div>
                              ))}
                            </div>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RAPPORT (optionnel — décommenter pour debug) */}
      {/*
      <details className="rounded-lg border bg-muted/20 p-4 text-sm">
        <summary className="cursor-pointer font-semibold">
          📊 Rapport de génération
        </summary>
        <pre className="mt-2 overflow-x-auto text-xs">
          {JSON.stringify(schedule.report, null, 2)}
        </pre>
      </details>
      */}
    </section>
  )
}