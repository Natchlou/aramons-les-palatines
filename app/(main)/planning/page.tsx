import GenerateResidentNotices from "@/components/generate-resident-notice-pdf"
import { PlanningTabs } from "@/components/planning-tabs"
import FormPlanning from "@/components/planning/form-planning"
import { MonthlyScheduleResponse } from "@/lib/planningService"

import { createClient } from "@/lib/server"

export default async function Test1Page() {
  const supabase =
    await createClient()

  /* ------------------------------------------------------------------------ */
  /* PLANNING                                                                 */
  /* ------------------------------------------------------------------------ */

  const {
    data: PlanningRow,
    error: planningError,
  } =
    await supabase
      .from("planning")
      .select("*")
      .limit(1)
      .single()

  if (
    planningError ||
    !PlanningRow
  ) {
    console.error(
      "Planning error:",
      planningError,
    )

    return (
      <main className="p-8">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Impossible de récupérer
          le planning.
        </div>
      </main>
    )
  }
  /* ------------------------------------------------------------------------ */
  /* PARSING                                                                   */
  /* ------------------------------------------------------------------------ */

  // `data` doit être un objet avec un tableau `weeks` non vide
  const rawData = PlanningRow.data

  if (
    !rawData ||
    typeof rawData !== "object" ||
    Array.isArray(rawData) ||
    !Array.isArray((rawData as { weeks?: unknown }).weeks)
  ) {
    console.error("Format planning invalide:", rawData)

    return (
      <main className="p-8">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Le format des données du planning est invalide.
        </div>
      </main>
    )
  }

  // On peut maintenant caster sans risque
  const schedule = rawData as unknown as MonthlyScheduleResponse

  const seen = new Set<string>()
  const residentsInPlanning = []

  for (const w of schedule.weeks) {
    for (const d of w.days) {
      for (const t of d.tasks) {
        if (t.type !== "menage" || !t.room) continue
        if (seen.has(t.room)) continue
        seen.add(t.room)
        residentsInPlanning.push({
          id: t.room,
          nom: t.resident ?? "—",
          room: t.room,
        })
      }
    }
  }

  residentsInPlanning.sort((a, b) => a.nom.localeCompare(b.nom))
  /* ------------------------------------------------------------------------ */
  /* PAGE                                                                      */
  /* ------------------------------------------------------------------------ */

  return (
    <main className="mx-auto w-full max-w-400 space-y-10 p-6 lg:p-8">
      <header className="border-b pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Administration</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Plannings ménage
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {schedule.title}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <FormPlanning />
            <GenerateResidentNotices
              schedule={schedule}
            />
          </div>
        </div>
      </header>

      <PlanningTabs
        schedule={schedule}
        planningId={PlanningRow.id}
        year={PlanningRow.year}
        month={PlanningRow.month}
      />
    </main>
  )
}