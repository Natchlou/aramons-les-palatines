"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface MenageRow {
    id: string
    date: string
    heure: string
    duration_minutes: number | null
    statut: string
    details: { label?: string } | null
    residents:
    | { first_name: string | null; last_name: string | null; room: string | null; building: string | null }
    | null
    agents: { name: string } | null
}

export interface MenagesByAgentProps {
    menages: MenageRow[]
    year: number
    month: number // 0-indexé
}

const DAY_NAMES_SHORT = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]
const MONTH_NAMES = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre",
]

/* ---------- helpers ---------- */

function parseDate(dateStr: string): Date {
    const [y, m, d] = dateStr.split("-").map(Number)
    return new Date(y, m - 1, d)
}

function toISODate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

/** Lundi de la semaine contenant `d` (pour repérer les changements de semaine) */
function mondayOf(d: Date): Date {
    const copy = new Date(d)
    const day = copy.getDay()
    copy.setDate(copy.getDate() + (day === 0 ? -6 : 1 - day))
    return copy
}

function formatTime(heure: string): string {
    return heure.slice(0, 5).replace(":", "h")
}

function residentName(r: MenageRow["residents"]): string {
    if (!r) return "—"
    return [r.last_name, r.first_name].filter(Boolean).join(" ").trim() || "—"
}

/** Regroupe les ménages par date, triés par date puis par heure */
function groupByDate(menages: MenageRow[]): Map<string, MenageRow[]> {
    const map = new Map<string, MenageRow[]>()
    const sorted = [...menages].sort((a, b) =>
        a.date === b.date ? a.heure.localeCompare(b.heure) : a.date.localeCompare(b.date)
    )
    for (const m of sorted) {
        if (!map.has(m.date)) map.set(m.date, [])
        map.get(m.date)!.push(m)
    }
    return map
}

/* ---------- sous-composants ---------- */

function AgendaItem({ m, showAgent }: { m: MenageRow; showAgent?: boolean }) {
    const r = m.residents
    const hasMeta = Boolean(m.duration_minutes || m.details?.label)

    return (
        <li className="flex items-start gap-3 rounded-md border bg-card px-3 py-2 text-sm shadow-sm">
            <span className="w-12 shrink-0 font-semibold tabular-nums">
                {formatTime(m.heure)}
            </span>

            <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="font-medium">{residentName(r)}</span>
                    {r?.room && (
                        <span className="text-xs text-muted-foreground">
                            Ch. {r.room}
                            {r.building ? ` · ${r.building}` : ""}
                        </span>
                    )}
                </div>

                {(hasMeta || (showAgent && m.agents?.name)) && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {m.duration_minutes ? <span>{m.duration_minutes} min</span> : null}
                        {m.details?.label ? <span>{m.details.label}</span> : null}
                        {showAgent && m.agents?.name ? (
                            <span className="ml-auto rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-medium text-foreground">
                                {m.agents.name}
                            </span>
                        ) : null}
                    </div>
                )}
            </div>

            <Badge variant="outline" className="shrink-0 text-[10px]">
                {m.statut}
            </Badge>
        </li>
    )
}

function DaySection({
    date,
    events,
    showAgent,
    isToday,
}: {
    date: string
    events: MenageRow[]
    showAgent: boolean
    isToday: boolean
}) {
    const d = parseDate(date)
    const weekday = DAY_NAMES_SHORT[d.getDay()]
    const monthShort = MONTH_NAMES[d.getMonth()].slice(0, 4)

    return (
        <section className="flex gap-4">
            {/* Pastille date (colonne de gauche) */}
            <div
                className={cn(
                    "flex w-16 shrink-0 flex-col items-center self-start rounded-md py-2",
                    isToday ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
            >
                <span className="text-[10px] font-medium uppercase tracking-wide">{weekday}</span>
                <span className="text-2xl font-bold leading-none">{d.getDate()}</span>
                <span className="text-[10px] capitalize">{monthShort}.</span>
            </div>

            {/* Liste des ménages du jour */}
            <ul className="flex-1 space-y-1.5">
                {events.map((m) => (
                    <AgendaItem key={m.id} m={m} showAgent={showAgent} />
                ))}
            </ul>
        </section>
    )
}

/* ---------- composant principal ---------- */

export function MenagesByAgent({ menages, year, month }: MenagesByAgentProps) {
    const today = toISODate(new Date())

    const byAgent = React.useMemo(() => {
        const map = new Map<string, MenageRow[]>()
        for (const m of menages) {
            const agent = m.agents?.name ?? "Inconnu"
            if (!map.has(agent)) map.set(agent, [])
            map.get(agent)!.push(m)
        }
        return new Map([...map.entries()].sort(([a], [b]) => a.localeCompare(b)))
    }, [menages])


    // Si l'agent actif disparaît (changement de mois), on retombe sur "all"
    const agents = [...byAgent.keys()]

    // On garde le choix de l'utilisateur tel quel…
    const [selectedTab, setSelectedTab] = React.useState<string>("all")

    // …mais on dérive l'onglet effectivement affiché au rendu.
    // Si l'agent sélectionné n'existe plus (changement de mois), on affiche "all".
    const activeTab =
        selectedTab === "all" || agents.includes(selectedTab) ? selectedTab : "all"

    if (menages.length === 0) {
        const monthLabel = MONTH_NAMES[month]
        return (
            <p className="text-sm text-muted-foreground">
                Aucun ménage enregistré en {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)} {year}.
            </p>
        )
    }

    const views = [
        { key: "all", label: "Tous", rows: menages },
        ...agents.map((a) => ({ key: a, label: a, rows: byAgent.get(a)! })),
    ]

    return (
        <Tabs value={activeTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList className="flex-wrap">
                {views.map((v) => (
                    <TabsTrigger key={v.key} value={v.key}>
                        {v.label} ({v.rows.length})
                    </TabsTrigger>
                ))}
            </TabsList>

            {views.map((view) => {
                const entries = [...groupByDate(view.rows).entries()]
                const showAgent = view.key === "all"

                return (
                    <TabsContent key={view.key} value={view.key}>
                        {entries.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Aucun ménage pour cet agent.</p>
                        ) : (
                            <div className="space-y-4">
                                {entries.map(([date, events], i) => {
                                    const week = toISODate(mondayOf(parseDate(date)))
                                    const prevWeek =
                                        i > 0 ? toISODate(mondayOf(parseDate(entries[i - 1][0]))) : null
                                    const showWeekSeparator = i > 0 && week !== prevWeek

                                    return (
                                        <React.Fragment key={date}>
                                            {showWeekSeparator && (
                                                <hr className="my-2 border-dashed border-border/70" />
                                            )}
                                            <DaySection
                                                date={date}
                                                events={events}
                                                showAgent={showAgent}
                                                isToday={date === today}
                                            />
                                        </React.Fragment>
                                    )
                                })}
                            </div>
                        )}
                    </TabsContent>
                )
            })}
        </Tabs>
    )
}