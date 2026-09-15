import GeneratePlanningPdf from "@/components/pdf/generate-planning-pdf"
import { CleaningPlanning } from "@/components/planning/cleaning-planning"

import type {
  CleaningPlanning as CleaningPlanningType,
  CleaningPlanningData,
  Resident,
} from "@/lib/planning/types"

import { createClient } from "@/lib/server"

export default async function Test1Page() {
  const supabase =
    await createClient()

  /* ------------------------------------------------------------------------ */
  /* PLANNING                                                                 */
  /* ------------------------------------------------------------------------ */

  const {
    data: planningRow,
    error: planningError,
  } =
    await supabase
      .from("planning")
      .select("id, data")
      .limit(1)
      .single()

  if (
    planningError ||
    !planningRow
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
  /* AGENTS                                                                    */
  /* ------------------------------------------------------------------------ */

  const planningData =
    planningRow.data

  if (
    !Array.isArray(
      planningData,
    )
  ) {
    console.error(
      "Format planning invalide:",
      planningData,
    )

    return (
      <main className="p-8">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Le format des données
          du planning est invalide.
        </div>
      </main>
    )
  }

  const agentPlannings =
    planningData as CleaningPlanningData[]

  /* ------------------------------------------------------------------------ */
  /* RESIDENTS                                                                 */
  /* ------------------------------------------------------------------------ */

  const {
    data: residentsData,
    error: residentsError,
  } =
    await supabase
      .from("residents")
      .select(
        "id, prefix, first_name, last_name, room, building, created_at",
      )
      .order("last_name", {
        ascending: true,
      })

  if (residentsError) {
    console.error(
      "Residents error:",
      residentsError,
    )

    return (
      <main className="p-8">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Impossible de récupérer
          les résidents.
        </div>
      </main>
    )
  }

  const residents =
    (residentsData ??
      []) as Resident[]

  /* ------------------------------------------------------------------------ */
  /* PAGE                                                                      */
  /* ------------------------------------------------------------------------ */

  return (
    <main className="mx-auto w-full max-w-400 space-y-10 p-6 lg:p-8">
      {/* PAGE HEADER */}
      <header className="border-b pb-6">
        <p className="text-sm font-medium text-muted-foreground">
          Administration
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Plannings ménage
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Gestion et export des
          plannings des agents.
        </p>
      </header>

      {/* AGENTS */}
      {agentPlannings.map(
        (agentPlanning) => {
          const planning: CleaningPlanningType =
          {
            id: planningRow.id,
            ...agentPlanning,
          }

          return (
            <section
              key={
                planning.agent
              }
              className="space-y-6"
            >
              {/* AGENT HEADER */}
              <div className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Agent
                  </p>

                  <h2 className="text-xl font-bold">
                    {
                      planning.agent
                    }
                  </h2>
                </div>

                <div className="flex flex-wrap gap-2">
                  <GeneratePlanningPdf
                    planningId={planning.id}
                    agent={planning.agent}
                    disabled={planning.weeks.length === 0}
                  />
                </div>
              </div>

              {/* PLANNING */}
              <CleaningPlanning
                title={
                  planning.title
                }
                agent={
                  planning.agent
                }
                weeks={
                  planning.weeks
                }
                residents={
                  residents
                }
              />
            </section>
          )
        },
      )}
    </main>
  )
}