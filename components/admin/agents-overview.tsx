import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

export type AgentStat = {
  name: string
  total: number
  done: number
  cancelled: number
  pending: number
}

export function AgentsOverview({
  agents,
  activeAgents,
}: {
  agents: AgentStat[]
  activeAgents: number
}) {
  const sorted = [...agents].sort((a, b) => b.total - a.total)
  const max = sorted[0]?.total ?? 1

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-muted-foreground" />
          Charge par agent
        </CardTitle>
        <span className="text-xs text-muted-foreground">
          {activeAgents} actif{activeAgents > 1 ? "s" : ""}
        </span>
      </CardHeader>
      <CardContent className="space-y-3">
        {sorted.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucun agent sur ce mois.</p>
        )}
        {sorted.map((a) => (
          <div key={a.name} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="truncate font-medium">{a.name}</span>
              <span className="tabular-nums text-muted-foreground">
                {a.total} · {Math.round((a.done / a.total) * 100) || 0}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(a.total / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}