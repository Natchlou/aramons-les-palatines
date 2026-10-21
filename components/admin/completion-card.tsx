import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function CompletionCard({
  done, pending, cancelled, rate,
}: {
  done: number
  pending: number
  cancelled: number
  rate: number
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Avancement du mois</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold tabular-nums">{rate}%</span>
            <span className="text-xs text-muted-foreground">terminés</span>
          </div>
          <Progress value={rate} className="mt-2 h-2" />
        </div>
        <ul className="space-y-1.5 text-sm">
          <li className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Terminés
            </span>
            <span className="tabular-nums text-muted-foreground">{done}</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              En attente
            </span>
            <span className="tabular-nums text-muted-foreground">{pending}</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              Annulés
            </span>
            <span className="tabular-nums text-muted-foreground">{cancelled}</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  )
}