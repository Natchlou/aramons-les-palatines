import DataList from "@/components/data-list"
import GenerateResidentReportPdf from "@/components/generate-resident-report-pdf"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import type { Database } from "@/database.types"
import { createClient } from "@/lib/client"
import SupabaseCrud, { desc, eq, inList } from "@/lib/supabase"
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock,
    Users,
    XCircle,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

type ResidentRow = Database["public"]["Tables"]["residents"]["Row"]
type AgentRow = Database["public"]["Tables"]["agents"]["Row"]
type ConstraintRow = Database["public"]["Tables"]["constraintes"]["Row"]
type RecentMenageRow =
    Database["public"]["Tables"]["recents_menages"]["Row"]

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
})

function formatDate(value: string | null) {
    if (!value) return "—"

    return dateFormatter.format(new Date(`${value.slice(0, 10)}T12:00:00`))
}

function formatTime(value: string | null) {
    if (!value) return "—"

    return value.slice(0, 5)
}

function formatDuration(minutes: number | null) {
    if (minutes == null) return "—"

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (hours === 0) return `${remainingMinutes} min`

    return remainingMinutes
        ? `${hours} h ${remainingMinutes} min`
        : `${hours} h`
}

function getStatusVariant(status: string) {
    switch (status) {
        case "COMPLETED":
            return "default" as const
        case "IN_PROGRESS":
            return "secondary" as const
        case "CANCELLED":
        case "RESCHEDULED":
            return "destructive" as const
        default:
            return "outline" as const
    }
}

function getStatusLabel(status: string) {
    const labels: Record<string, string> = {
        PENDING: "En attente",
        IN_PROGRESS: "En cours",
        COMPLETED: "Terminé",
        CANCELLED: "Annulé",
        RESCHEDULED: "Reprogrammé",
    }

    return labels[status] ?? status
}

export default async function AdminResidentShow({
    params,
}: {
    params: Promise<{ uuid: string }>
}) {
    const { uuid } = await params
    const now = new Date()
    const supabase = createClient()

    const residentService = new SupabaseCrud<ResidentRow>(supabase, "residents")
    const constraintesService =
        new SupabaseCrud<ConstraintRow>(supabase, "constraintes")
    const menagesService =
        new SupabaseCrud<RecentMenageRow>(supabase, "recents_menages")

    // Chargement des informations du résident et de son historique.
    const [residentResult, constraintesResult, menagesResult] =
        await Promise.all([
            residentService.getById(uuid),
            constraintesService.getFirst({
                filters: [
                    {
                        column: "resident_id",
                        operator: "eq",
                        value: uuid,
                    },
                ]
            }),
            menagesService.getWithFilters({
                filters: [eq("resident_id", uuid)],
                sort: [desc("date"), desc("heure")],
            }),
        ])

    if (
        residentResult.error ||
        constraintesResult.error ||
        menagesResult.error
    ) {
        const error =
            residentResult.error ??
            constraintesResult.error ??
            menagesResult.error

        return (
            <div className="flex flex-1 items-center justify-center p-8">
                <p className="text-destructive">
                    Une erreur est survenue : {error?.message}
                </p>
            </div>
        )
    }

    const resident = residentResult.data
    const constraintes = constraintesResult.data
    const menages = menagesResult.data ?? []

    // Récupération des agents associés aux ménages.
    // La relation peut être ajoutée directement à Supabase
    // ultérieurement si nécessaire.
    const agentIds = [
        ...new Set(
            menages
                .map((menage) => menage.agent_id)
                .filter((id): id is number => id !== null),
        ),
    ]

    let agents: AgentRow[] = []

    if (agentIds.length > 0) {
        const { data, error } = await new SupabaseCrud<AgentRow>(supabase, "agents")
            .getAll({
                filters: [inList("id", agentIds)],
            })

        if (!error && data) {
            agents = data
        }
    }

    const agentNames = new Map(
        agents.map((agent) => [agent.id, agent.name]),
    )

    const completedCount = menages.filter(
        (menage) => menage.statut === "COMPLETED",
    ).length

    const pendingCount = menages.filter(
        (menage) => menage.statut === "PENDING",
    ).length

    const cancelledCount = menages.filter(
        (menage) => menage.statut === "CANCELLED",
    ).length

    function splitCamelCaseArray(days: string[]): string[] {
        return days.flatMap((value) =>
            value.split(/(?=[A-Z])/).map(
                (day) => day.charAt(0).toUpperCase() + day.slice(1).toLowerCase(),
            ),
        )
    }

    if (!resident) {
        return (
            <div className="flex flex-1 items-center justify-center p-8">
                <p className="text-muted-foreground">
                    Résident introuvable.
                </p>
            </div>
        )
    }

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8">
            {/* En-tête */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Image
                        src="/default.png"
                        alt=""
                        width={64}
                        height={64}
                        className="size-16 rounded-full bg-primary/10 object-cover"
                    />

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            {resident.prefix} {resident.last_name}{" "}
                            {resident.first_name}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Fiche du résident · Chambre {resident.room}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button variant="link">
                        <Link href="/admin/residents">
                            <ArrowLeft className="mr-2 size-4" />
                            Retour
                        </Link>
                    </Button>

                    <GenerateResidentReportPdf
                        residentIds={[uuid]}
                        residentName={[resident.prefix, resident.last_name, resident.first_name]
                            .filter(Boolean)
                            .join(" ")}
                        month={now.getMonth() + 1}
                        year={now.getFullYear()}
                    />
                </div>
            </div>

            {/* Statistiques */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="flex items-center justify-between p-5">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Total des ménages
                            </p>
                            <p className="text-2xl font-bold">
                                {menages.length}
                            </p>
                        </div>
                        <CalendarDays className="size-8 text-muted-foreground" />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center justify-between p-5">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Terminés
                            </p>
                            <p className="text-2xl font-bold">
                                {completedCount}
                            </p>
                        </div>
                        <CheckCircle2 className="size-8 text-muted-foreground" />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center justify-between p-5">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                En attente
                            </p>
                            <p className="text-2xl font-bold">
                                {pendingCount}
                            </p>
                        </div>
                        <Clock className="size-8 text-muted-foreground" />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center justify-between p-5">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Annulés
                            </p>
                            <p className="text-2xl font-bold">
                                {cancelledCount}
                            </p>
                        </div>
                        <XCircle className="size-8 text-muted-foreground" />
                    </CardContent>
                </Card>
            </div>

            {/* Contraintes */}
            {constraintes &&
                (constraintes.disallow_days ||
                    constraintes.schedule_hours) && (
                    <Alert variant="destructive">
                        <AlertTitle>
                            Contraintes de ménage
                        </AlertTitle>
                        <AlertDescription className="space-y-1">
                            {constraintes.disallow_days && (
                                <p>
                                    Jours concernés :{" "}
                                    {splitCamelCaseArray(
                                        constraintes.disallow_days,
                                    ).join(", ")}
                                </p>
                            )}

                            {constraintes.schedule_hours && (
                                <p>
                                    Horaires : {constraintes.schedule_hours}
                                </p>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

            <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
                {/* Historique */}
                <Card className="min-w-0">
                    <CardHeader>
                        <CardTitle>Historique des ménages</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Tous les créneaux enregistrés, y compris les
                            annulations et les reprogrammations.
                        </p>
                    </CardHeader>

                    <CardContent>
                        {menages.length === 0 ? (
                            <div className="py-10 text-center">
                                <CalendarDays className="mx-auto mb-3 size-10 text-muted-foreground" />
                                <p className="font-medium">
                                    Aucun ménage enregistré
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    L&apos;historique apparaîtra ici.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Heure</TableHead>
                                            <TableHead>Agent</TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead>Durée</TableHead>
                                            <TableHead className="text-right">
                                                Détails
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {menages.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="whitespace-nowrap font-medium">
                                                    {formatDate(item.date)}
                                                </TableCell>

                                                <TableCell>
                                                    {formatTime(item.heure)}
                                                </TableCell>

                                                <TableCell>
                                                    {item.agent_id
                                                        ? agentNames.get(item.agent_id) ??
                                                        "Agent introuvable"
                                                        : "Non attribué"}
                                                </TableCell>

                                                <TableCell>
                                                    <Badge
                                                        variant={getStatusVariant(
                                                            item.statut ?? "PENDING",
                                                        )}
                                                    >
                                                        {getStatusLabel(
                                                            item.statut ?? "PENDING",
                                                        )}
                                                    </Badge>
                                                </TableCell>

                                                <TableCell className="whitespace-nowrap">
                                                    {formatDuration(
                                                        item.duration_minutes,
                                                    )}
                                                </TableCell>

                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                    >
                                                        <Link
                                                            href={`/admin/residents/${resident.id}/${item.id}`}
                                                        >
                                                            Voir
                                                        </Link>
                                                    </Button>
                                                </TableCell>

                                                {(item.cancellation_reason ||
                                                    item.completion_reason) && (
                                                        <TableCell
                                                            colSpan={6}
                                                            className="whitespace-normal bg-muted/30 text-sm text-muted-foreground"
                                                        >
                                                            {item.cancellation_reason && (
                                                                <p>
                                                                    <strong>
                                                                        Motif d&apos;annulation :
                                                                    </strong>{" "}
                                                                    {item.cancellation_reason}
                                                                </p>
                                                            )}

                                                            {item.completion_reason && (
                                                                <p>
                                                                    <strong>
                                                                        Motif de durée :
                                                                    </strong>{" "}
                                                                    {item.completion_reason}
                                                                </p>
                                                            )}
                                                        </TableCell>
                                                    )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Informations */}
                <div className="flex flex-col gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations</CardTitle>
                        </CardHeader>

                        <CardContent>
                            <DataList
                                data={[
                                    {
                                        title: "Appartement",
                                        value: resident.room,
                                    },
                                    {
                                        title: "Bâtiment",
                                        value: resident.building,
                                    },
                                    {
                                        title: "Facture",
                                        value: constraintes?.bill ?? "À définir",
                                    },
                                    {
                                        title: "Prélèvement",
                                        value: `Tous les ${constraintes?.debiting ?? "(à définir)"
                                            } du mois`,
                                    },
                                    {
                                        title: "Ménages par mois",
                                        value:
                                            constraintes?.per_month ??
                                            "À définir",
                                    },
                                ]}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Équipe d&apos;entretien</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                                    <Users className="size-5 text-primary" />
                                </div>

                                <div>
                                    <p className="font-medium">
                                        Agents affectés
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Set(
                                            menages
                                                .map((item) => item.agent_id)
                                                .filter(Boolean),
                                        ).size}{" "}
                                        agent(s) dans l&apos;historique
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
