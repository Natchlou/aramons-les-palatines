import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Database } from "@/database.types"
import { createClient } from "@/lib/client"
import SupabaseCrud from "@/lib/supabase"
import { notFound } from "next/navigation"
import { Calendar, Clock, User, Home, Info } from "lucide-react"

type MenageRow = Database["public"]["Tables"]["recents_menages"]["Row"]
type ResidentRow = Database["public"]["Tables"]["residents"]["Row"]

// ─── Helpers ────────────────────────────────────────────────
const shortDateFormatter = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
})

function formatShortDate(value: string | null): string {
    if (!value) return "—"
    const date = new Date(value.length === 10 ? `${value}T12:00:00` : value)
    if (Number.isNaN(date.getTime())) return "—"
    const s = shortDateFormatter.format(date)
    return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatTime(value: string | null): string {
    if (!value) return "—"
    // "10:00:00" → "10h00"
    const [h, m] = value.split(":")
    return `${h}h${m}`
}

const STATUS_META: Record<
    string,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
    SCHEDULED: { label: "Planifié", variant: "default" },
    PENDING:   { label: "En attente", variant: "secondary" },
    DONE:      { label: "Effectué", variant: "outline" },
    CANCELLED: { label: "Annulé", variant: "destructive" },
}

// ─── Page ───────────────────────────────────────────────────

export default async function MenageShowPage({
    params,
}: {
    params: Promise<{ uuid: string }>
}) {
    const { uuid } = await params
    const supabase = createClient()

    // 1. Récupérer le ménage
    const menageService = new SupabaseCrud<MenageRow>(
        supabase,
        "recents_menages"
    )
    const menage = await menageService.getById(uuid)

    if (!menage.data) notFound()

    // 2. Récupérer le résident
    let resident: ResidentRow | null = null
    if (menage.data.resident_id) {
        const { data } = await supabase
            .from("residents")
            .select("*")
            .eq("id", menage.data.resident_id)
            .single()
        resident = data
    }

    const status = menage.data.statut ?? "SCHEDULED"
    const statusMeta = STATUS_META[status] ?? {
        label: status,
        variant: "secondary" as const,
    }
    const isCancelled = status === "CANCELLED"
    const isDone = status === "COMPLETED"

    const residentName =
        [resident?.first_name, resident?.last_name]
            .filter(Boolean)
            .join(" ") || "—"

    return (
        <div className="mx-auto flex w-full max-w-lg flex-col gap-6 p-4 sm:p-6">
            {/* ─── Header ─── */}
            <header className="text-center">
                <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    Intervention ménage
                </p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight">
                    {residentName}
                </h1>
                <div className="mt-3 flex justify-center">
                    <Badge variant={statusMeta.variant} className="px-3 py-1 text-sm">
                        {statusMeta.label}
                    </Badge>
                </div>
            </header>

            {/* ─── Alerte annulation ─── */}
            {isCancelled && (
                <Alert variant="destructive">
                    <AlertTitle>Ménage annulé</AlertTitle>
                    <AlertDescription>
                        Cette intervention a été annulée. Vous ne devez pas
                        effectuer ce ménage.
                    </AlertDescription>
                </Alert>
            )}

            {/* ─── Bloc date/heure ─── */}
            <Card>
                <CardContent className="flex items-center justify-between gap-4 p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Date
                            </p>
                            <p className="text-lg font-semibold leading-tight">
                                {formatShortDate(menage.data.date)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Heure
                            </p>
                            <p className="text-lg font-semibold leading-tight tabular-nums">
                                {formatTime(menage.data.heure)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ─── Bloc résident ─── */}
            {resident && (
                <Card>
                    <CardContent className="space-y-3 p-6">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Résident
                        </p>

                        <div className="flex items-start gap-3">
                            <User className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                            <div>
                                <p className="font-semibold">{residentName}</p>
                                {resident.prefix && (
                                    <p className="text-sm text-muted-foreground">
                                        {resident.prefix}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Home className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                            <p className="text-sm">
                                <span className="font-medium">
                                    Chambre {resident.room ?? "—"}
                                </span>
                                {resident.building && (
                                    <span className="text-muted-foreground">
                                        {" "}
                                        • Bâtiment {resident.building}
                                    </span>
                                )}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ─── Bloc instructions ─── */}
            <Card>
                <CardContent className="space-y-2 p-6">
                    <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-muted-foreground" />
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Instructions
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Aucune consigne particulière. Suivez la procédure
                        standard de ménage.
                    </p>
                </CardContent>
            </Card>

            {/* ─── Actions ─── */}
            {!isCancelled && !isDone && (
                <div className="flex flex-col gap-3">
                </div>
            )}

            {isDone && (
                <Alert>
                    <AlertTitle>✅ Ménage marqué comme effectué</AlertTitle>
                    <AlertDescription>
                        Merci, votre intervention a bien été enregistrée.
                    </AlertDescription>
                </Alert>
            )}

            {/* ─── Footer ─── */}
            <p className="text-center text-xs text-muted-foreground">
                Référence #{menage.data.id}
            </p>
        </div>
    )
}