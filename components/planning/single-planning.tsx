"use client"

import { useSyncExternalStore, useState } from "react"
import {
    Ban,
    CalendarDays,
    CalendarOff,
    ChevronLeft,
    ChevronRight,
    Clock,
    PlayIcon,
} from "lucide-react"
import { Database } from "@/database.types"
import { Button } from "../ui/button"
import Link from "next/link"

/* ------------------------------ Types API -------------------------------- */

type MenageStatut =
    | "COMPLETED"
    | "CANCELLED"
    | "RESCHEDULED"
    | "PENDING"
    | "IN_PROGRESS"

type ChecklistSection = {
    title: string
    items: string[]
}

type Resident = Database['public']['Tables']['residents']['Row']

type MenageDetails = {
    columns?: ChecklistSection[][]
    residents?: Resident[]
    /** Renseigné pour les tâches fixes ("Hall", "Navette", "Pause repos"…). */
    label?: string
    /** Renseigné pour les halls (bâtiment). */
    building?: string
}

/** Exporté : TestPage doit pouvoir mapper ses Row vers ce type. */
export type Menage = {
    id: string
    /** `null` pour les tâches fixes (hall, navette, pause, plonge…). */
    resident_id: string | null
    agent_id: number | null
    date: string // "YYYY-MM-DD"
    heure: string // "HH:MM:SS"
    statut: MenageStatut
    /** "menage" | "hall" | "navette" | "pause" | "plonge" | "lessives" | "common" | "fixed" */
    type: string
    details: MenageDetails
    started_at: string | null
    completed_at: string | null
    duration_minutes: number | null
    completion_reason: string | null
    cancelled_at: string | null
    cancellation_reason: string | null
    reprogrammed_from_id: string | null
    created_at: string
}

/** Absence d'un agent (table `agent_absences`). */
export type AgentAbsence = {
    id: number | string
    /** "vacances" | "ecole" | "ferie" — typé `string` pour tolérer d'autres valeurs. */
    type: string | null
    motif: string | null
    /** ISO date/heure, ex. "2026-10-13 00:00:00". */
    start_date: string | null
    end_date: string | null
    created_at: string
    agent_id: number | null
}

/* ------------------------------ Styles ------------------------------------ */

type StatusStyle = {
    label: string
    color: string
    background: string
    border: string
}

const STATUS_STYLES: Record<MenageStatut, StatusStyle> = {
    COMPLETED: { label: "Terminé", color: "#15803D", background: "#F0FDF4", border: "#BBF7D0" },
    CANCELLED: { label: "Annulé", color: "#B91C1C", background: "#FEF2F2", border: "#FECACA" },
    RESCHEDULED: { label: "Reprogrammé", color: "#B45309", background: "#FFFBEB", border: "#FDE68A" },
    PENDING: { label: "À faire", color: "#1D4ED8", background: "#EFF6FF", border: "#BFDBFE" },
    IN_PROGRESS: { label: "En cours", color: "#7C3AED", background: "#F5F3FF", border: "#DDD6FE" },
}

type AbsenceType = "vacances" | "ecole" | "ferie"

const ABSENCE_STYLES: Record<AbsenceType, StatusStyle> = {
    vacances: { label: "Vacances", color: "#B45309", background: "#FFFBEB", border: "#FDE68A" },
    ecole: { label: "École", color: "#1D4ED8", background: "#EFF6FF", border: "#BFDBFE" },
    ferie: { label: "Jour férié", color: "#B91C1C", background: "#FEF2F2", border: "#FECACA" },
}

const FALLBACK_ABSENCE_STYLE: StatusStyle = {
    label: "Absence",
    color: "#475569",
    background: "#F8FAFC",
    border: "#E2E8F0",
}

/** Lookup tolérant : les valeurs `type` inconnues (ou null) ont un style neutre. */
function getAbsenceStyle(type: string | null): StatusStyle {
    if (!type) return FALLBACK_ABSENCE_STYLE
    return ABSENCE_STYLES[type as AbsenceType] ?? { ...FALLBACK_ABSENCE_STYLE, label: type }
}

const TASK_LABEL = "Ménage"

/* -------- Couleurs par type de tâche (ménage + fixes) -------------------- */

type EntryStyle = { color: string; background: string }

const ENTRY_STYLES: Record<string, EntryStyle> = {
    menage: { color: "#7C3AED", background: "#F5F3FF" }, // violet
    hall: { color: "#0369A1", background: "#F0F9FF" }, // bleu
    navette: { color: "#047857", background: "#ECFDF5" }, // vert
    pause: { color: "#6B7280", background: "#F9FAFB" }, // gris
    plonge: { color: "#0891B2", background: "#F0FDFA" }, // cyan
    lessives: { color: "#C2410C", background: "#FFF7ED" }, // orange
    common: { color: "#9333EA", background: "#FAF5FF" }, // violet vif
    fixed: { color: "#475569", background: "#F8FAFC" }, // ardoise
}

const FIXED_TYPE_LABELS: Record<string, string> = {
    hall: "Hall",
    navette: "Navette",
    pause: "Pause",
    plonge: "Plonge",
    lessives: "Lessives",
    common: "Parties communes",
    fixed: "Tâche fixe",
}

function isFixedType(type: string): boolean {
    return type !== "menage"
}

function getEntryStyle(type: string): EntryStyle {
    return ENTRY_STYLES[type] ?? ENTRY_STYLES.fixed
}

function getEntryTypeLabel(type: string): string {
    if (type === "menage") return TASK_LABEL
    return FIXED_TYPE_LABELS[type] ?? "Tâche"
}

const START_HOUR = 8
const END_HOUR = 17
const SLOT_HEIGHT = 32
const TOTAL_SLOTS = (END_HOUR - START_HOUR) * 2
const GRID_HEIGHT = TOTAL_SLOTS * SLOT_HEIGHT

/* ---------------------- Hydratation sans effet ---------------------------- */

const emptySubscribe = () => () => { }

function useIsMounted() {
    return useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false,
    )
}

/* ------------------------------ Utilitaires ------------------------------- */

function isoDate(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function formatHeure(heure: string) {
    return heure.slice(0, 5)
}

function computeEndTime(heure: string, durationMinutes: number | null): string | null {
    if (durationMinutes == null) return null
    const [h, m] = heure.split(":").map(Number)
    const total = h * 60 + m + durationMinutes
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`
}

function toMinutes(time: string) {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
}

function formatHour(minutes: number) {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}`
}

function formatDuration(totalMinutes: number | null) {
    if (totalMinutes == null) return "—"
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    if (hours === 0) return `${minutes} min`
    return minutes === 0 ? `${hours} h` : `${hours} h ${String(minutes).padStart(2, "0")}`
}

function formatDate(date: Date) {
    return new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date)
}

function isWeekend(date: Date) {
    const day = date.getDay()
    return day === 0 || day === 6
}

function normalizeWorkday(date: Date) {
    const result = new Date(date)
    if (result.getDay() === 6) result.setDate(result.getDate() + 2)
    if (result.getDay() === 0) result.setDate(result.getDate() + 1)
    return result
}

function shiftWorkday(date: Date, direction: 1 | -1) {
    const result = new Date(date)
    do {
        result.setDate(result.getDate() + direction)
    } while (isWeekend(result))
    return result
}

function getWorkWeek(date: Date) {
    const monday = new Date(date)
    const offset = (monday.getDay() + 6) % 7
    monday.setDate(monday.getDate() - offset)

    return Array.from({ length: 5 }, (_, index) => {
        const day = new Date(monday)
        day.setDate(monday.getDate() + index)
        return day
    })
}

function isSameDay(a: Date, b: Date) {
    return a.toDateString() === b.toDateString()
}

function formatResidentName(resident: Resident): string | null {
    const name = [resident.prefix, resident.last_name, resident.first_name]
        .filter(Boolean)
        .join(" ")
    return name || null
}

/** Titre adapté au type : nom du résident pour un ménage, label sinon. */
function getEntryTitle(entry: Menage, resident: Resident | null): string {
    if (!isFixedType(entry.type)) {
        return (resident && formatResidentName(resident)) || "Ménage résident"
    }
    if (entry.details?.label) return entry.details.label
    return FIXED_TYPE_LABELS[entry.type] ?? entry.type
}

function formatLocation(resident: Resident | null) {
    return [
        resident?.building && `Bâtiment ${resident.building}`,
        resident?.room && `Appt. ${resident.room}`,
    ]
        .filter(Boolean)
        .join(" · ")
}

function getChecklistSections(menage: Menage) {
    return (menage.details?.columns ?? [])
        .flat()
        .filter((section) => section.items.length > 0)
}

function getEffectiveDuration(menage: Menage): number {
    return menage.duration_minutes ?? 0
}

/* --------------------------- Absences helpers ----------------------------- */

function getAbsenceForDate(
    absences: AgentAbsence[],
    date: Date,
): AgentAbsence | null {
    const iso = isoDate(date)
    return (
        absences.find((a) => {
            if (!a.start_date || !a.end_date) return false
            const start = a.start_date.slice(0, 10)
            const end = a.end_date.slice(0, 10)
            return iso >= start && iso <= end
        }) ?? null
    )
}

function formatAbsenceRange(absence: AgentAbsence): string {
    const fmt = (iso: string) =>
        new Intl.DateTimeFormat("fr-FR", {
            day: "numeric",
            month: "short",
        }).format(new Date(iso))

    const start = absence.start_date ? fmt(absence.start_date) : null
    const end = absence.end_date ? fmt(absence.end_date) : null

    if (!start && !end) return "dates inconnues"
    if (!start) return `jusqu'au ${end}`
    if (!end) return `depuis le ${start}`
    return start === end ? `le ${start}` : `du ${start} au ${end}`
}

/* -------------------------------- Badges ---------------------------------- */

function StatusBadge({ status, size = "sm" }: { status: MenageStatut; size?: "sm" | "xs" }) {
    const style = STATUS_STYLES[status]

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full border font-semibold ${size === "xs"
                ? "px-1.5 py-px text-[10px]"
                : "px-2 py-0.5 text-[11px]"
                }`}
            style={{
                color: style.color,
                backgroundColor: style.background,
                borderColor: style.border,
            }}
        >
            <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: style.color }}
            />
            {style.label}
        </span>
    )
}

/* ------------------------------ Bandeau absence --------------------------- */

function AbsenceBanner({ absence }: { absence: AgentAbsence }) {
    const style = getAbsenceStyle(absence.type)
    return (
        <div
            className="mt-1.5 inline-flex max-w-full items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs sm:text-sm"
            style={{
                color: style.color,
                backgroundColor: style.background,
                borderColor: style.border,
            }}
            title={absence.motif ?? undefined}
        >
            <Ban className="size-3.5 shrink-0" aria-hidden />
            <span className="font-semibold">{style.label}</span>
            <span className="truncate opacity-80">
                {formatAbsenceRange(absence)}
                {absence.motif && ` · ${absence.motif}`}
            </span>
        </div>
    )
}

/* ------------------------------ État vide --------------------------------- */

type EmptyStateReason =
    | { kind: "absent"; absence: AgentAbsence }
    | { kind: "not_planned" }
    | { kind: "empty" }

function EmptyState({ reason }: { reason: EmptyStateReason }) {
    if (reason.kind === "absent") {
        const { absence } = reason
        const style = getAbsenceStyle(absence.type)
        return (
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                <span
                    className="inline-flex size-10 items-center justify-center rounded-full"
                    style={{
                        color: style.color,
                        backgroundColor: style.background,
                    }}
                >
                    <Ban className="size-5" aria-hidden />
                </span>
                <p className="text-sm font-semibold">Agent absent</p>
                <p className="text-xs text-muted-foreground">
                    {style.label} · {formatAbsenceRange(absence)}
                    {absence.motif && ` · ${absence.motif}`}
                </p>
            </div>
        )
    }

    if (reason.kind === "not_planned") {
        return (
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <CalendarOff className="size-5" />
                </span>
                <p className="text-sm font-semibold">Planning non généré</p>
                <p className="text-xs text-muted-foreground">
                    Le planning de cette période n&apos;a pas encore été établi.
                </p>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <CalendarDays className="size-5" />
            </span>
            <p className="text-sm font-semibold">Aucune tâche prévue</p>
            <p className="text-xs text-muted-foreground">
                Aucune tâche planifiée pour cette journée.
            </p>
        </div>
    )
}

/* -------------------------------- Composant ------------------------------- */

export default function SinglePlanningView({
    menages,
    residents = [],
    absences = [],
    todayIso,
}: {
    menages: Menage[]
    residents?: Resident[]
    absences?: AgentAbsence[]
    todayIso: string
}) {
    const [date, setDate] = useState(() => normalizeWorkday(new Date(todayIso)))
    const [selectedMenage, setSelectedMenage] = useState<Menage | null>(null)

    const mounted = useIsMounted()
    const today = mounted ? new Date() : new Date(todayIso)

    const residentsById: Record<string, Resident> = {}
    for (const resident of residents) {
        if (resident.id) residentsById[resident.id] = resident
    }

    function getResident(menage: Menage): Resident | null {
        if (!menage.resident_id) return null
        return (
            residentsById[menage.resident_id] ||
            menage.details?.residents?.[0] ||
            null
        )
    }

    const weekDays = getWorkWeek(date)
    const selectedIso = isoDate(date)

    const currentAbsence = getAbsenceForDate(absences, date)

    const dayEntries = menages.filter((m) => m.date === selectedIso)
    const sortedEntries = [...dayEntries].sort(
        (a, b) => toMinutes(formatHeure(a.heure)) - toMinutes(formatHeure(b.heure)),
    )

    const menageCount = dayEntries.filter((m) => m.type === "menage").length
    const fixedCount = dayEntries.length - menageCount

    const lastPlannedDate = menages.reduce(
        (max, menage) => (menage.date > max ? menage.date : max),
        "0000-00-00",
    )

    const emptyState: EmptyStateReason = currentAbsence
        ? { kind: "absent", absence: currentAbsence }
        : selectedIso > lastPlannedDate
            ? { kind: "not_planned" }
            : { kind: "empty" }

    // On ne compte les statuts que pour les ménages (les tâches fixes n'ont
    // pas de cycle de vie métier intéressant pour l'utilisateur).
    const statusCounts = {
        COMPLETED: 0,
        CANCELLED: 0,
        RESCHEDULED: 0,
        PENDING: 0,
        IN_PROGRESS: 0,
    } as Record<MenageStatut, number>
    for (const entry of dayEntries) {
        if (entry.type === "menage") statusCounts[entry.statut] += 1
    }

    const totalMinutes = dayEntries.reduce(
        (sum, m) => sum + (m.duration_minutes ?? 0),
        0,
    )
    const hasKnownDuration = dayEntries.some(
        (m) => m.type === "menage" && m.duration_minutes !== null,
    )

    const timeSlots = Array.from(
        { length: TOTAL_SLOTS + 1 },
        (_, index) => START_HOUR * 60 + index * 30,
    )

    return (
        <div className="mx-auto w-full min-w-0 space-y-4 text-foreground">
            {/* Navigation */}
            <header className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => setDate((current) => shiftWorkday(current, -1))}
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background transition hover:bg-muted"
                    aria-label="Jour ouvré précédent"
                >
                    <ChevronLeft className="size-4" />
                </button>

                <nav
                    className="grid min-w-0 flex-1 grid-cols-5 gap-1 rounded-lg border bg-muted/40 p-1"
                    aria-label="Jours de la semaine"
                >
                    {weekDays.map((day) => {
                        const selected = isSameDay(day, date)
                        const isToday = isSameDay(day, today)
                        const dayCount = menages.filter(
                            (m) => m.date === isoDate(day),
                        ).length
                        const dayAbsence = getAbsenceForDate(absences, day)
                        const absenceStyle = dayAbsence
                            ? getAbsenceStyle(dayAbsence.type)
                            : null

                        const tooltip = dayAbsence
                            ? `${absenceStyle!.label} · ${formatAbsenceRange(dayAbsence)}`
                            : undefined

                        return (
                            <button
                                key={day.toISOString()}
                                type="button"
                                onClick={() => setDate(day)}
                                aria-current={selected ? "date" : undefined}
                                title={tooltip}
                                className={`relative flex flex-col items-center rounded-md px-1 py-1.5 text-center transition ${selected
                                    ? "bg-background shadow-sm ring-1 ring-border"
                                    : "hover:bg-background/60"
                                    }`}
                            >
                                <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                    {new Intl.DateTimeFormat("fr-FR", {
                                        weekday: "short",
                                    })
                                        .format(day)
                                        .replace(".", "")}
                                </span>
                                <span
                                    className={`text-sm tabular-nums ${selected ? "font-semibold" : "font-medium"
                                        }`}
                                >
                                    {day.getDate()}
                                </span>
                                {dayCount > 0 && (
                                    <span className="absolute right-1 top-1 rounded-full bg-primary/10 px-1 text-[10px] font-semibold tabular-nums text-primary">
                                        {dayCount}
                                    </span>
                                )}
                                {isToday && (
                                    <span className="absolute bottom-1 size-1 rounded-full bg-primary" />
                                )}
                                {absenceStyle && (
                                    <span
                                        className="absolute inset-x-2 bottom-0 h-0.5 rounded-full"
                                        style={{ backgroundColor: absenceStyle.color }}
                                        aria-hidden
                                    />
                                )}
                            </button>
                        )
                    })}
                </nav>

                <button
                    type="button"
                    onClick={() => setDate((current) => shiftWorkday(current, 1))}
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background transition hover:bg-muted"
                    aria-label="Jour ouvré suivant"
                >
                    <ChevronRight className="size-4" />
                </button>
            </header>

            {/* Agenda */}
            <section className="overflow-hidden rounded-xl border bg-background shadow-sm">
                <div className="flex flex-col gap-3 border-b bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <h2 className="text-base font-semibold capitalize">
                            {formatDate(date)}
                        </h2>

                        {currentAbsence && (
                            <AbsenceBanner absence={currentAbsence} />
                        )}

                        {dayEntries.length > 0 ? (
                            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                                {menageCount} ménage{menageCount > 1 ? "s" : ""}
                                {fixedCount > 0 && (
                                    <>
                                        {" · "}
                                        {fixedCount} tâche{fixedCount > 1 ? "s" : ""} fixe{fixedCount > 1 ? "s" : ""}
                                    </>
                                )}
                                {hasKnownDuration && (
                                    <> · {formatDuration(totalMinutes)} planifiées</>
                                )}
                                {" · "}
                                {formatHour(START_HOUR * 60)} – {formatHour(END_HOUR * 60)}
                            </p>
                        ) : !currentAbsence && (
                            <p className="mt-0.5 text-xs font-medium text-amber-600 sm:text-sm">
                                {selectedIso > lastPlannedDate
                                    ? "Planning pas encore établi pour cette période"
                                    : "Aucune tâche planifiée pour cette journée"}
                            </p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            {(Object.keys(STATUS_STYLES) as MenageStatut[])
                                .filter((status) => statusCounts[status] > 0)
                                .map((status) => (
                                    <span
                                        key={status}
                                        className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground"
                                    >
                                        <span
                                            className="size-1.5 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    STATUS_STYLES[status].color,
                                            }}
                                        />
                                        {statusCounts[status]}{" "}
                                        {STATUS_STYLES[status].label.toLowerCase()}
                                    </span>
                                ))}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setDate(normalizeWorkday(new Date()))}
                        className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border bg-background px-3 text-sm font-medium transition hover:bg-muted sm:w-auto"
                    >
                        <CalendarDays className="size-4" />
                        Aujourd&apos;hui
                    </button>
                </div>

                {/* Vue mobile */}
                <div className="divide-y md:hidden">
                    {sortedEntries.length > 0 ? (
                        sortedEntries.map((entry) => {
                            const resident = getResident(entry)
                            const location = formatLocation(resident)
                            const start = formatHeure(entry.heure)
                            const end = computeEndTime(entry.heure, entry.duration_minutes)
                            const entryStyle = getEntryStyle(entry.type)
                            const isFixed = isFixedType(entry.type)

                            return (
                                <button
                                    key={entry.id}
                                    type="button"
                                    onClick={() => setSelectedMenage(entry)}
                                    className={`flex w-full items-stretch gap-3 p-3 text-left transition hover:bg-muted/40 active:bg-muted ${entry.statut === "CANCELLED"
                                        ? "opacity-60"
                                        : ""
                                        }`}
                                >
                                    <div className="flex w-12 shrink-0 flex-col items-end pt-2 text-xs font-medium tabular-nums">
                                        <span>{start}</span>
                                        {end && (
                                            <span className="mt-1 text-muted-foreground">
                                                {end}
                                            </span>
                                        )}
                                    </div>

                                    <div
                                        className="min-w-0 flex-1 rounded-lg border border-l-4 p-3"
                                        style={{
                                            borderLeftColor: entryStyle.color,
                                            backgroundColor: entryStyle.background,
                                        }}
                                    >
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span
                                                className="text-[11px] font-semibold uppercase tracking-wide"
                                                style={{ color: entryStyle.color }}
                                            >
                                                {getEntryTypeLabel(entry.type)}
                                            </span>
                                            {!isFixed && <StatusBadge status={entry.statut} />}
                                        </div>

                                        <p
                                            className={`wrap-break-word mt-0.5 text-sm font-semibold text-slate-900 ${entry.statut === "CANCELLED"
                                                ? "line-through"
                                                : ""
                                                }`}
                                        >
                                            {getEntryTitle(entry, resident)}
                                        </p>

                                        {!isFixed && location && (
                                            <p className="mt-1 text-xs text-slate-600">
                                                {location}
                                            </p>
                                        )}

                                        {!isFixed && (
                                            <p className="mt-2 flex items-center text-xs text-slate-600">
                                                <Clock className="mr-1 size-3" />
                                                {formatDuration(entry.duration_minutes)}
                                            </p>
                                        )}
                                    </div>

                                    <ChevronRight className="mt-3 size-4 shrink-0 text-muted-foreground" />
                                </button>
                            )
                        })
                    ) : (
                        <EmptyState reason={emptyState} />
                    )}
                </div>

                {/* Vue ordinateur */}
                <div className="hidden md:block">
                    <div
                        className="relative grid"
                        style={{
                            gridTemplateColumns: "72px minmax(0, 1fr)",
                            height: GRID_HEIGHT,
                        }}
                    >
                        <div className="relative">
                            {timeSlots.map((minutes) => (
                                <div
                                    key={minutes}
                                    className={`absolute right-2 -translate-y-1/2 text-xs tabular-nums ${minutes % 60 === 0
                                        ? "font-medium text-foreground/70"
                                        : "text-muted-foreground/60"
                                        }`}
                                    style={{
                                        top:
                                            ((minutes - START_HOUR * 60) / 30) *
                                            SLOT_HEIGHT,
                                    }}
                                >
                                    {formatHour(minutes)}
                                </div>
                            ))}
                        </div>

                        <div className="relative border-l">
                            {currentAbsence && (
                                <div
                                    className="pointer-events-none absolute inset-0"
                                    style={{
                                        backgroundColor:
                                            getAbsenceStyle(currentAbsence.type)
                                                .background,
                                    }}
                                    aria-hidden
                                />
                            )}

                            {timeSlots.map((minutes) => (
                                <div
                                    key={minutes}
                                    className={`absolute inset-x-0 border-t ${minutes % 60 === 0
                                        ? "border-border"
                                        : "border-dashed border-border/50"
                                        }`}
                                    style={{
                                        top:
                                            ((minutes - START_HOUR * 60) / 30) *
                                            SLOT_HEIGHT,
                                    }}
                                />
                            ))}

                            {sortedEntries.length === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <EmptyState reason={emptyState} />
                                </div>
                            )}

                            {sortedEntries.map((entry) => {
                                const start = toMinutes(formatHeure(entry.heure))
                                const duration = getEffectiveDuration(entry)
                                const height = (duration / 30) * SLOT_HEIGHT
                                const resident = getResident(entry)
                                const location = formatLocation(resident)
                                const end = computeEndTime(entry.heure, entry.duration_minutes)
                                const entryStyle = getEntryStyle(entry.type)
                                const isFixed = isFixedType(entry.type)

                                const top =
                                    ((start - START_HOUR * 60) / 30) * SLOT_HEIGHT

                                return (
                                    <button
                                        key={entry.id}
                                        type="button"
                                        onClick={() => setSelectedMenage(entry)}
                                        className={`absolute inset-x-1.5 z-10 overflow-hidden rounded-md border border-l-4 px-2.5 py-1 text-left shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${entry.statut === "CANCELLED"
                                            ? "opacity-60"
                                            : ""
                                            }`}
                                        style={{
                                            top: top + 1,
                                            height: Math.max(height - 2, 24),
                                            borderLeftColor: entryStyle.color,
                                            backgroundColor: entryStyle.background,
                                            color: "#0F172A",
                                        }}
                                    >
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                                            <span className="font-semibold tabular-nums">
                                                {formatHeure(entry.heure)}
                                                {end && <> – {end}</>}
                                            </span>
                                            <span
                                                className="font-medium"
                                                style={{ color: entryStyle.color }}
                                            >
                                                {getEntryTypeLabel(entry.type)}
                                            </span>
                                            {!isFixed && (
                                                <StatusBadge
                                                    status={entry.statut}
                                                    size={height >= SLOT_HEIGHT * 2 ? "sm" : "xs"}
                                                />
                                            )}
                                        </div>

                                        <p
                                            className={`truncate text-sm font-semibold ${entry.statut === "CANCELLED"
                                                ? "line-through"
                                                : ""
                                                }`}
                                        >
                                            {getEntryTitle(entry, resident)}
                                        </p>

                                        {!isFixed && height >= SLOT_HEIGHT * 2 && location && (
                                            <p className="truncate text-xs opacity-70">
                                                {location}
                                            </p>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Détails d'une tâche */}
            {selectedMenage && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[1px] sm:items-center sm:p-4"
                    onClick={() => setSelectedMenage(null)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="menage-title"
                        className="w-full overflow-hidden rounded-t-2xl border bg-background pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-xl sm:max-w-md sm:rounded-xl sm:pb-0"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div
                            className="h-1"
                            style={{ backgroundColor: getEntryStyle(selectedMenage.type).color }}
                        />

                        <div className="max-h-[80vh] overflow-y-auto p-5">
                            <div className="mb-4 flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p
                                        className="mb-1 text-[11px] font-semibold uppercase tracking-wide"
                                        style={{ color: getEntryStyle(selectedMenage.type).color }}
                                    >
                                        {getEntryTypeLabel(selectedMenage.type)}
                                    </p>

                                    <h3
                                        id="menage-title"
                                        className={`wrap-break-word text-lg font-semibold ${selectedMenage.statut === "CANCELLED"
                                            ? "line-through"
                                            : ""
                                            }`}
                                    >
                                        {getEntryTitle(selectedMenage, getResident(selectedMenage))}
                                    </h3>

                                    <div className="mt-2">
                                        <StatusBadge status={selectedMenage.statut} />
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="shrink-0 rounded-md border px-3 py-1.5 text-sm transition hover:bg-muted"
                                    onClick={() => setSelectedMenage(null)}
                                >
                                    Fermer
                                </button>
                            </div>

                            <dl className="divide-y rounded-lg border text-sm">
                                <div className="flex justify-between gap-4 px-3 py-2.5">
                                    <dt className="text-muted-foreground">Date</dt>
                                    <dd className="font-medium tabular-nums">
                                        {selectedMenage.date}
                                    </dd>
                                </div>

                                <div className="flex justify-between gap-4 px-3 py-2.5">
                                    <dt className="text-muted-foreground">Horaire</dt>
                                    <dd className="font-medium tabular-nums">
                                        {formatHeure(selectedMenage.heure)}
                                        {(() => {
                                            const end = computeEndTime(
                                                selectedMenage.heure,
                                                selectedMenage.duration_minutes,
                                            )
                                            return end ? <> – {end}</> : null
                                        })()}
                                    </dd>
                                </div>

                                {!isFixedType(selectedMenage.type) && (
                                    <div className="flex justify-between gap-4 px-3 py-2.5">
                                        <dt className="text-muted-foreground">Durée</dt>
                                        <dd className="font-medium">
                                            {formatDuration(selectedMenage.duration_minutes)}
                                        </dd>
                                    </div>
                                )}

                                {!isFixedType(selectedMenage.type) &&
                                    formatLocation(getResident(selectedMenage)) && (
                                        <div className="flex justify-between gap-4 px-3 py-2.5">
                                            <dt className="text-muted-foreground">
                                                Localisation
                                            </dt>
                                            <dd className="text-right font-medium">
                                                {formatLocation(getResident(selectedMenage))}
                                            </dd>
                                        </div>
                                    )}

                                {selectedMenage.started_at && (
                                    <div className="flex justify-between gap-4 px-3 py-2.5">
                                        <dt className="text-muted-foreground">Début réel</dt>
                                        <dd className="font-medium tabular-nums">
                                            {new Date(selectedMenage.started_at).toLocaleString(
                                                "fr-FR",
                                                { dateStyle: "short", timeStyle: "short" },
                                            )}
                                        </dd>
                                    </div>
                                )}

                                {selectedMenage.completed_at && (
                                    <div className="flex justify-between gap-4 px-3 py-2.5">
                                        <dt className="text-muted-foreground">Fin réelle</dt>
                                        <dd className="font-medium tabular-nums">
                                            {new Date(selectedMenage.completed_at).toLocaleString(
                                                "fr-FR",
                                                { dateStyle: "short", timeStyle: "short" },
                                            )}
                                        </dd>
                                    </div>
                                )}

                                {selectedMenage.cancellation_reason && (
                                    <div className="px-3 py-2.5">
                                        <dt className="text-muted-foreground">
                                            Motif d&apos;annulation
                                        </dt>
                                        <dd className="mt-1 wrap-break-word text-sm">
                                            {selectedMenage.cancellation_reason}
                                        </dd>
                                    </div>
                                )}

                                {selectedMenage.completion_reason && (
                                    <div className="px-3 py-2.5">
                                        <dt className="text-muted-foreground">
                                            Commentaire de clôture
                                        </dt>
                                        <dd className="mt-1 wrap-break-word text-sm">
                                            {selectedMenage.completion_reason}
                                        </dd>
                                    </div>
                                )}

                                {selectedMenage.reprogrammed_from_id && (
                                    <div className="flex justify-between gap-4 px-3 py-2.5">
                                        <dt className="text-muted-foreground">Reprogrammé de</dt>
                                        <dd className="font-mono text-xs font-medium">
                                            {selectedMenage.reprogrammed_from_id}
                                        </dd>
                                    </div>
                                )}
                            </dl>

                            {selectedMenage.type === 'menage' && <Button className='w-full mt-4'><Link href={`/menage/${selectedMenage.id}`} className="flex items-center gap-2"><PlayIcon />Démarrer le ménage</Link></Button>}

                            {getChecklistSections(selectedMenage).length > 0 && (
                                <div className="mt-4 rounded-lg border p-3">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Checklist
                                    </p>
                                    <div className="space-y-3">
                                        {getChecklistSections(selectedMenage).map(
                                            (section) => (
                                                <div key={section.title}>
                                                    <p className="text-sm font-medium">
                                                        {section.title}
                                                    </p>
                                                    <ul className="mt-1 flex flex-wrap gap-1.5">
                                                        {section.items.map((item) => (
                                                            <li
                                                                key={item}
                                                                className="rounded-md border bg-muted/50 px-2 py-0.5 text-xs"
                                                            >
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}