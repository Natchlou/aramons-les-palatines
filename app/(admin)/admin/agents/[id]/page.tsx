import AgentForm from "@/components/agents/agentForm"
import DataList from "@/components/data-list"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardAction,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import type { Database } from "@/database.types"
import { createClient } from "@/lib/server"
import SupabaseCrud from "@/lib/supabase-crud"
import { ArrowLeftIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

type AgentRow = Database["public"]["Tables"]["agent"]["Row"]
type AgentAbsencesRow =
    Database["public"]["Tables"]["agent_absences"]["Row"]

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
})

const weekDays: Record<string, string> = {
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi",
    thursday: "Jeudi",
    friday: "Vendredi",
    saturday: "Samedi",
    sunday: "Dimanche",
}

export default async function AdminAgentShow({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const supabase = await createClient()

    const agentAbsencesService =
        new SupabaseCrud<AgentAbsencesRow>("agent_absences")

    const [agentResult, absencesResult] = await Promise.all([
        supabase
            .from("agent")
            .select("*")
            .eq("id", id)
            .single<AgentRow>(),

        agentAbsencesService.getWithFilters({
            filters: [
                {
                    column: "agent_id",
                    operator: "eq",
                    value: id,
                },
            ],
        }),
    ])

    const { data: agent, error: agentError } = agentResult

    const absences: AgentAbsencesRow[] = Array.isArray(absencesResult.data)
        ? absencesResult.data.flat()
        : []

    if (agentError || absencesResult.error) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <p className="text-destructive">
                    Une erreur est survenue :{" "}
                    {agentError?.message || absencesResult.error?.message}
                </p>
            </div>
        )
    }

    if (!agent) {
        notFound()
    }

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-8">
            {/* En-tête */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Image
                        src="/default.png"
                        alt={`Photo de ${agent.name}`}
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-full bg-primary/10 object-cover"
                        loading="eager"
                    />

                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {agent.name}
                        </h1>

                        <p className="text-sm text-muted-foreground">
                            Fiche de l&apos;agent d&apos;entretien
                        </p>
                    </div>
                </div>

                <Button variant="link">
                    <Link
                        href="/admin/agents"
                        className="flex items-center gap-1"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                        Retour
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_350px]">
                {/* Absences */}
                <Card>
                    <CardHeader>
                        <CardTitle>Absences / Congés</CardTitle>

                        <CardAction>
                            <AgentForm />
                        </CardAction>
                    </CardHeader>

                    <CardContent>
                        {absences.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Début</TableHead>
                                        <TableHead>Fin</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Motif</TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {absences.map((absence) => (
                                        <TableRow key={absence.id}>
                                            <TableCell className="font-medium">
                                                {absence.start_date
                                                    ? dateFormatter.format(new Date(absence.start_date))
                                                    : "—"}
                                            </TableCell>

                                            <TableCell>
                                                {absence.end_date
                                                    ? dateFormatter.format(new Date(absence.end_date))
                                                    : "—"}
                                            </TableCell>

                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {absence.type?.toUpperCase()}
                                                </Badge>
                                            </TableCell>

                                            <TableCell>
                                                {absence.motif || "—"}
                                            </TableCell>

                                            <TableCell className="text-right">
                                                {/* Actions */}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Aucune absence ou congé enregistré pour le
                                moment.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Informations */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informations</CardTitle>
                    </CardHeader>

                    <CardContent className="text-sm">
                        <DataList
                            data={[
                                {
                                    title: "Actuellement absent ?",
                                    value: (
                                        <Badge
                                            variant={
                                                agent.isAbsent
                                                    ? "destructive"
                                                    : "outline"
                                            }
                                        >
                                            {agent.isAbsent ? "Oui" : "Non"}
                                        </Badge>
                                    ),
                                },
                                {
                                    title: "Jours de travail",
                                    value: agent.working_days?.length ? (
                                        <span className="flex flex-wrap gap-1">
                                            {agent.working_days.map((day) => (
                                                <Badge
                                                    variant="outline"
                                                    key={day}
                                                >
                                                    {weekDays[day] ?? day}
                                                </Badge>
                                            ))}
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground">
                                            Non renseigné
                                        </span>
                                    ),
                                },
                            ]}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}