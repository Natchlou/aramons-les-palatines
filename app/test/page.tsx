import SinglePlanningView, {
    type AgentAbsence,
    type Menage,
} from "@/components/planning/single-planning"
import { Database } from "@/database.types"
import { createClient } from "@/lib/client"
import SupabaseCrud, { inList } from "@/lib/supabase"

export type RecentMenageRow = Database['public']['Tables']['recents_menages']['Row']
export type ResidentRow = Database['public']['Tables']['residents']['Row']
export type AgentAbsenceRow = Database['public']['Tables']['agent_absences']['Row']

/**
 * L'agent dont on affiche le planning.
 * Dans le CSV d'exemple, les absences sont pour l'agent 2 et 3 — passez
 * à 2 ou 3 pour tester le rendu des absences.
 */
export const AGENT_ID = 1

export default async function TestPage() {
    const supabase = createClient()

    const menageService = new SupabaseCrud<RecentMenageRow>(supabase, "recents_menages")
    const residentService = new SupabaseCrud<ResidentRow>(supabase, "residents")
    const absenceService = new SupabaseCrud<AgentAbsenceRow>(supabase, "agent_absences")

    const [menagesResult, absencesResult] = await Promise.all([
        menageService.getAll({
            filters: [{ column: "agent_id", operator: "eq", value: AGENT_ID }],
        }),
        absenceService.getAll({
            filters: [{ column: "agent_id", operator: "eq", value: AGENT_ID }],
        }),
    ])

    // ✅ `type` désormais présent en base ; fallback sur "menage" pour les
    //    anciennes lignes qui auraient échappé à la migration.
    const menages: Menage[] = (menagesResult.data ?? []).map((m) => ({
        ...m,
        statut: m.statut as Menage["statut"],
        type: m.type ?? "menage",
        details: (m.details ?? {}) as Menage["details"],
    }))

    const absences: AgentAbsence[] = absencesResult.data ?? []

    // ✅ Ne collecter que les ids non-null : les tâches fixes (hall, navette,
    //    pause…) ont `resident_id = null` et ne doivent pas partir dans le `in(...)`.
    const residentIds = [
        ...new Set(
            menages
                .map((m) => m.resident_id)
                .filter((id): id is string => id !== null),
        ),
    ]

    const residents = residentIds.length
        ? (await residentService.getAll({
              filters: [inList<ResidentRow>("id", residentIds)],
          })).data ?? []
        : []

    return (
        <div>
            <SinglePlanningView
                menages={menages}
                residents={residents}
                absences={absences}
                todayIso={new Date().toISOString()}
            />
        </div>
    )
}