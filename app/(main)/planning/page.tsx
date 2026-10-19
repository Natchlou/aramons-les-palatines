import SinglePlanningView, {
    type AgentAbsence,
    type Menage,
} from "@/components/planning/single-planning"
import { Database } from "@/database.types"
import { createClient } from "@/lib/client"
import { createClient as authClient } from "@/lib/server"
import { inList, SupabaseCrud } from "@/lib/supabase"
import { redirect } from "next/navigation"

type AgentRow = Database['public']['Tables']['agents']['Row']
type RecentMenageRow = Database['public']['Tables']['recents_menages']['Row']
type ResidentRow = Database['public']['Tables']['residents']['Row']
type AgentAbsenceRow = Database['public']['Tables']['agent_absences']['Row']

export default async function PlanningPage() {
    const supabase = createClient()

    // 1. Auth : un seul await, client explicite.
    const authSupabase = await authClient()
    const {
        data: { user },
    } = await authSupabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    // 2. Agent : pas de Promise.all pour une seule requête.
    const agentService = new SupabaseCrud<AgentRow>(supabase, "agents")
    const agentResult = await agentService.getFirst({
        filters: [{ column: "user_id", operator: "eq", value: user.id }],
    })

    // 3. Pas de page blanche : message lisible si l'utilisateur n'a pas
    //    d'agent rattaché (ou redirection si vous préférez).
    if (!agentResult.success || !agentResult.data) {
        return (
            <div className="p-4">
                <h1 className="text-2xl">Aucun agent associé</h1>
                <p className="text-sm text-muted-foreground">
                    Votre compte n&apos;est rattaché à aucun agent.
                    Contactez un administrateur.
                </p>
            </div>
        )
    }

    const agent = agentResult.data

    const menageService = new SupabaseCrud<RecentMenageRow>(supabase, "recents_menages")
    const residentService = new SupabaseCrud<ResidentRow>(supabase, "residents")
    const absenceService = new SupabaseCrud<AgentAbsenceRow>(supabase, "agent_absences")

    const [menagesResult, absencesResult] = await Promise.all([
        menageService.getAll({
            filters: [{ column: "agent_id", operator: "eq", value: agent.id }],
        }),
        absenceService.getAll({
            filters: [{ column: "agent_id", operator: "eq", value: agent.id }],
        }),
    ])

    // `type` présent en base, fallback sur "menage" pour les anciennes lignes.
    const menages: Menage[] = (menagesResult.data ?? []).map((m) => ({
        ...m,
        statut: m.statut as Menage["statut"],
        type: m.type ?? "menage",
        details: (m.details ?? {}) as Menage["details"],
    }))

    const absences: AgentAbsence[] = absencesResult.data ?? []

    // Les tâches fixes ont `resident_id = null` → exclues du `in(...)`.
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
        <div className="p-4">
            <h1 className="text-2xl">Bonjour, {agent.name}</h1>
            <p className="text-sm">Voici votre planning de la journée</p>
            <div className="mt-4">
                <SinglePlanningView
                    menages={menages}
                    residents={residents}
                    absences={absences}
                    todayIso={new Date().toISOString()}
                />
            </div>
        </div>
    )
}