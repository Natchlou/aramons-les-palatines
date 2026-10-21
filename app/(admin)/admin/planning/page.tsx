import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/server"
import { MenagesByAgent } from "@/components/menages-by-agent"
import FormPlanning from "@/components/planning/form-planning"
import { RawMenageRow, toMenageRows } from "@/lib/menages"

type Test1PageProps = {
  // Next.js 15+ : searchParams est une Promise (sur Next 14, retire le Promise<> et le await)
  searchParams: Promise<{ year?: string; month?: string }>
}

function toInt(value: string | undefined): number | null {
  if (!value) return null
  const n = Number(value)
  return Number.isInteger(n) ? n : null
}

function monthHref(year: number, month: number) {
  // new Date(y, -1, 1) => décembre de l'année précédente, idem pour +1
  const d = new Date(year, month, 1)
  return `?year=${d.getFullYear()}&month=${d.getMonth()}`
}

export default async function Test1Page({ searchParams }: Test1PageProps) {
  const supabase = await createClient()
  const params = await searchParams

  // Mois courant réel (pour fallback + bouton "aujourd'hui")
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() // 0-indexé

  // Mois affiché (depuis l'URL, sinon mois courant)
  const yearParam = toInt(params.year)
  const monthParam = toInt(params.month)

  const year = yearParam && yearParam > 1970 ? yearParam : currentYear
  const month =
    monthParam !== null && monthParam >= 0 && monthParam <= 11
      ? monthParam
      : currentMonth

  // ⚠️ Utiliser Date.UTC pour éviter le décalage horaire du toISOString()
  const monthStart = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10)
  const monthEnd = new Date(Date.UTC(year, month + 1, 1)).toISOString().slice(0, 10)

  const { data: menages, error } = await supabase
    .from("recents_menages")
    .select(`
      id,
      date,
      heure,
      duration_minutes,
      statut,
      details,
      residents ( first_name, last_name, room, building ),
      agents ( name )
    `)
    .eq("type", "menage")
    .gte("date", monthStart)
    .lt("date", monthEnd)
    .order("date", { ascending: true })
    .order("heure", { ascending: true })

  if (error) {
    console.error("Erreur recents_menages:", error)
    return (
      <main className="p-8">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Impossible de récupérer les ménages.
        </div>
      </main>
    )
  }

  const monthLabel = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month, 1))

  const isCurrentMonth = year === currentYear && month === currentMonth
  const count = menages?.length ?? 0

  return (
    <main className="mx-auto w-full max-w-400 space-y-10 p-6 lg:p-8">
      <header className="border-b pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Administration</p>

            <div className="mt-1 flex items-center gap-2">
              <Link
                href={monthHref(year, month - 1)}
                aria-label="Mois précédent"
                className="rounded-md border p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ChevronLeft className="h-5 w-5" />
              </Link>

              <h1 className="min-w-64 text-center text-2xl font-bold tracking-tight capitalize sm:min-w-80 sm:text-3xl">
                Plannings ménage — {monthLabel}
              </h1>

              <Link
                href={monthHref(year, month + 1)}
                aria-label="Mois suivant"
                className="rounded-md border p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
              <span>
                {count} ménage{count > 1 ? "s" : ""} ce mois-ci
              </span>
              {!isCurrentMonth && (
                <Link
                  href="?"  // préserve le chemin, efface les searchParams
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Revenir au mois courant
                </Link>
              )}
            </div>
          </div>

          <FormPlanning />
        </div>
      </header>

      <MenagesByAgent menages={toMenageRows(menages as RawMenageRow[] | null)} year={year} month={month} />
    </main>
  )
}