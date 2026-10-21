import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarRange } from "lucide-react"
import type { MenageRow } from "@/components/menages-by-agent"
import { formatName, relativeDayLabel, statutLabel, statutVariant } from "./menage-utils"

export function UpcomingMenages({
  menages,
  todayISO,
}: {
  menages: MenageRow[]
  todayISO: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarRange className="h-4 w-4 text-muted-foreground" />
          Les 7 prochains jours
        </CardTitle>
        <Badge variant="outline">{menages.length}</Badge>
      </CardHeader>
      <CardContent>
        {menages.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Rien de planifié dans les 7 prochains jours.
          </p>
        ) : (
          <ul className="divide-y">
            {menages.map((m) => (
              <li key={m.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="w-20 shrink-0 text-xs font-medium capitalize text-muted-foreground">
                  {relativeDayLabel(m.date, todayISO)}
                </div>
                <div className="w-12 shrink-0 text-sm font-semibold tabular-nums">
                  {m.heure.slice(0, 5)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{formatName(m.residents)}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    Ch. {m.residents?.room ?? "—"}
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