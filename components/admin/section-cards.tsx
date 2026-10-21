import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, CheckCircle2, Clock, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export type SectionCard = {
  title: string
  value: number | string
  icon: "calendar" | "check" | "clock" | "x"
  tone?: "default" | "success" | "warning" | "danger"
  hint?: string
}

const icons = {
  calendar: CalendarDays,
  check: CheckCircle2,
  clock: Clock,
  x: XCircle,
} as const

const tones: Record<NonNullable<SectionCard["tone"]>, string> = {
  default: "text-muted-foreground",
  success: "text-emerald-600",
  warning: "text-amber-600",
  danger: "text-rose-600",
}

export function SectionCards({ cards }: { cards: SectionCard[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 px-4 lg:grid-cols-4 lg:px-6">
      {cards.map((c) => {
        const Icon = icons[c.icon]
        return (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {c.title}
              </CardTitle>
              <Icon className={cn("h-4 w-4", tones[c.tone ?? "default"])} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{c.value}</div>
              {c.hint && (
                <p className="mt-0.5 text-xs text-muted-foreground">{c.hint}</p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}