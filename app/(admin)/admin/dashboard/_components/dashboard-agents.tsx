import { AgentsOverview, type AgentStat } from "@/components/admin/agents-overview"
import { getMenagesOfMonth } from "../../_lib/queries"

export async function DashboardAgents() {
  const rows = await getMenagesOfMonth()

  const perAgent = new Map<string, AgentStat>()
  for (const m of rows) {
    const name = m.agents?.name ?? "Non assigné"
    if (!perAgent.has(name)) {
      perAgent.set(name, { name, total: 0, done: 0, cancelled: 0, pending: 0 })
    }
    const s = perAgent.get(name)!
    s.total++
    if (m.statut === "COMPLETED") s.done++
    else if (m.statut === "CANCELLED") s.cancelled++
    else s.pending++
  }

  const stats = Array.from(perAgent.values())
  const activeAgents = stats.filter((a) => a.name !== "Non assigné").length
  return <AgentsOverview agents={stats} activeAgents={activeAgents} />
}