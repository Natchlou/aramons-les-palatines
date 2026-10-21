import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays } from "lucide-react"
import type { MenageRow } from "@/components/menages-by-agent"
import { formatName, statutLabel, statutVariant } from "./menage-utils"

export function TodayAgenda({ menages }: { menages: MenageRow[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          Agenda du jour
        </CardTitle>
        <Badge variant="outline">{menages.length}</Badge>
      </CardHeader>
      <CardContent>
        {menages.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Aucun ménage prévu aujourd&apos;hui. Profitez-en 🌿
          </p>
        ) : (
          <ul className="divide-y">
            {menages.map((m) => (
              <li key={m.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="w-14 shrink-0 text-base font-semibold tabular-nums">
                  {m.heure.slice(0, 5)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{formatName(m.residents)}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    Ch. {m.residents?.room ?? "—"}
                    {m.residents?.building ? ` · ${m.residents.building}` : ""}
                    {m.agents?.name ? ` · ${m.agents.name}` : ""}
                  </div>
                </div>
                <Badge variant={statutVariant(m.statut)} className="shrink-0 text-[10px]">
                  {statutLabel(m.statut)}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}