import DataList from "@/components/data-list";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

import type { Database } from "@/database.types";
import { createClient } from "@/lib/server";

import { CheckCircle2, CircleCheck, ClipboardCheck } from "lucide-react";
import { notFound } from "next/navigation";

// ============================================================================
// TYPES
// ============================================================================

type RecentMenageRow = Database["public"]["Tables"]["recents_menages"]["Row"];

type ChecklistItem = { label: string; value: boolean };
type ChecklistSection = { title: string; items: ChecklistItem[] };
type ChecklistDetails = ChecklistSection[];

// ============================================================================
// HELPERS STATUT
// ============================================================================

const EXTRA_SERVICE_TITLE = "Prestation supplémentaire";

const STATUS_LABELS: Record<string, string> = {
    PENDING: "En attente",
    IN_PROGRESS: "En cours",
    COMPLETED: "Terminé",
    CANCELLED: "Annulé",
    RESCHEDULED: "Reprogrammé",
};

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

function getStatusLabel(status: string | null): string {
    if (!status) return "—";
    return STATUS_LABELS[status] ?? status;
}

function getStatusVariant(status: string | null): BadgeVariant {
    switch (status) {
        case "COMPLETED":
            return "default";
        case "IN_PROGRESS":
            return "secondary";
        case "CANCELLED":
        case "RESCHEDULED":
            return "destructive";
        default:
            return "outline";
    }
}

// ============================================================================
// HELPERS DATE / DURÉE (formatters hoistés au niveau module → 1 seule instance)
// ============================================================================

const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
});

function formatTime(value: string | null): string {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return timeFormatter.format(date);
}

function formatDate(value: string | null): string {
    if (!value) return "—";
    // Colonne `date` typée DATE → on force midi pour éviter le décalage UTC
    const date = new Date(
        value.length === 10 ? `${value}T12:00:00` : value,
    );
    if (Number.isNaN(date.getTime())) return "—";
    return dateFormatter.format(date);
}

function getDuration(
    startedAt: string | null,
    completedAt: string | null,
): string {
    if (!startedAt || !completedAt) return "—";

    const seconds = Math.max(
        0,
        Math.floor(
            (new Date(completedAt).getTime() -
                new Date(startedAt).getTime()) /
                1000,
        ),
    );

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    // Type guard explicite → plus besoin de `.filter(Boolean)` bancal
    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours} h`);
    if (minutes > 0) parts.push(`${minutes} min`);
    parts.push(`${secs} s`);

    return parts.join(" ");
}

// ============================================================================
// PARSE SÛR DE `details`
// ============================================================================

function isChecklistItem(value: unknown): value is ChecklistItem {
    return (
        typeof value === "object" &&
        value !== null &&
        "label" in value &&
        typeof (value as { label: unknown }).label === "string" &&
        "value" in value &&
        typeof (value as { value: unknown }).value === "boolean"
    );
}

function isChecklistSection(value: unknown): value is ChecklistSection {
    return (
        typeof value === "object" &&
        value !== null &&
        "title" in value &&
        typeof (value as { title: unknown }).title === "string" &&
        "items" in value &&
        Array.isArray((value as { items: unknown }).items) &&
        (value as { items: unknown[] }).items.every(isChecklistItem)
    );
}

/**
 * Convertit la colonne JSON `details` en structure typée.
 * Ne lève jamais : retourne `[]` si la donnée est absente ou mal formée.
 */
function parseChecklist(raw: unknown): ChecklistDetails {
    if (!Array.isArray(raw)) return [];
    return raw.filter(isChecklistSection);
}

// ============================================================================
// COMPOSANT
// ============================================================================

export default async function AdminResidentDetailMenage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    // `.maybeSingle()` plutôt que `.single()` :
    // évite une erreur PostgREST bruitée si la ligne est absente.
    const { data, error } = await supabase
        .from("recents_menages")
        .select("*")
        .eq("id", id)
        .maybeSingle<RecentMenageRow>();

    if (error || !data) {
        notFound();
    }

    const details = parseChecklist(data.details);

    // Sections prises en compte dans la progression
    const scoredSections = details.filter(
        (s) => s.title !== EXTRA_SERVICE_TITLE,
    );

    // Une seule passe sur les sections
    const { total: totalItems, completed: completedItems } =
        scoredSections.reduce(
            (acc, section) => {
                acc.total += section.items.length;
                acc.completed += section.items.reduce(
                    (n, item) => n + (item.value ? 1 : 0),
                    0,
                );
                return acc;
            },
            { total: 0, completed: 0 },
        );

    const progress =
        totalItems > 0
            ? Math.round((completedItems / totalItems) * 100)
            : 0;

    const statusVariant = getStatusVariant(data.statut);
    const statusLabel = getStatusLabel(data.statut);

    return (
        <div className="mx-auto w-full max-w-7xl space-y-8 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ClipboardCheck className="size-4" />
                        Ménage
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight">
                        Détail du ménage
                    </h1>

                    <p className="text-muted-foreground">
                        Consultez les informations et la checklist du ménage.
                    </p>
                </div>

                <Badge
                    variant={statusVariant}
                    className="w-fit px-3 py-1.5"
                >
                    {statusLabel}
                </Badge>
            </div>

            <Separator />

            {/* Contenu */}
            <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
                {/* Checklist — GAUCHE */}
                <section className="min-w-0 space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold">
                            Checklist du ménage
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Vérification des différentes tâches effectuées.
                        </p>
                    </div>

                    {/* Progression */}
                    <Card>
                        <CardContent className="space-y-3 p-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CircleCheck className="size-4 text-primary" />
                                    <span className="text-sm font-medium">
                                        Progression
                                    </span>
                                </div>

                                <span className="text-sm text-muted-foreground">
                                    {completedItems}/{totalItems} tâches
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div
                                    role="progressbar"
                                    aria-valuenow={progress}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
                                >
                                    <div
                                        className="h-full rounded-full bg-primary transition-all"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <span className="w-10 text-right text-sm font-medium">
                                    {progress}%
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sections */}
                    {details.length === 0 ? (
                        <Card>
                            <CardContent className="py-10 text-center text-sm text-muted-foreground">
                                Aucune checklist disponible pour ce ménage.
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {details.map((section) => {
                                const isExtraService =
                                    section.title === EXTRA_SERVICE_TITLE;
                                const total = section.items.length;
                                const completed = section.items.reduce(
                                    (n, item) => n + (item.value ? 1 : 0),
                                    0,
                                );
                                const isFull = total > 0 && completed === total;

                                return (
                                    <Card
                                        key={section.title}
                                        className="overflow-hidden"
                                    >
                                        <CardHeader className="border-b bg-muted/30">
                                            <div className="flex items-center justify-between gap-3">
                                                <CardTitle className="text-base">
                                                    {section.title}
                                                </CardTitle>

                                                {isExtraService ? (
                                                    <Badge variant="outline">
                                                        Optionnel
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant={
                                                            isFull
                                                                ? "default"
                                                                : "secondary"
                                                        }
                                                        className="gap-1"
                                                    >
                                                        {isFull && (
                                                            <CheckCircle2 className="size-3.5" />
                                                        )}
                                                        {completed}/{total}
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardHeader>

                                        <CardContent className="p-0">
                                            <div className="divide-y">
                                                {section.items.map(
                                                    (item, index) => (
                                                        <label
                                                            key={`${section.title}-${index}`}
                                                            className="flex cursor-default items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/30"
                                                        >
                                                            <Checkbox
                                                                checked={
                                                                    item.value
                                                                }
                                                                disabled
                                                            />

                                                            <span
                                                                className={
                                                                    item.value
                                                                        ? "text-sm text-muted-foreground line-through"
                                                                        : "text-sm"
                                                                }
                                                            >
                                                                {item.label ||
                                                                    "Prestation supplémentaire"}
                                                            </span>

                                                            {item.value && (
                                                                <CheckCircle2 className="ml-auto size-4 shrink-0 text-primary" />
                                                            )}
                                                        </label>
                                                    ),
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Informations — DROITE */}
                <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
                    <div>
                        <h2 className="text-xl font-semibold">
                            Informations du ménage
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Détails de l&apos;intervention.
                        </p>
                    </div>

                    <Card>
                        <CardContent className="p-6">
                            <DataList
                                data={[
                                    {
                                        title: "Statut",
                                        value: (
                                            <Badge variant={statusVariant}>
                                                {statusLabel}
                                            </Badge>
                                        ),
                                    },
                                    {
                                        title: "Date",
                                        value: formatDate(data.date),
                                    },
                                    {
                                        title: "Heure prévue",
                                        value: formatTime(data.heure),
                                    },
                                    {
                                        title: "Commencé à",
                                        value: formatTime(data.started_at),
                                    },
                                    {
                                        title: "Terminé à",
                                        value: formatTime(data.completed_at),
                                    },
                                    {
                                        title: "Durée",
                                        value: getDuration(
                                            data.started_at,
                                            data.completed_at,
                                        ),
                                    },
                                ]}
                            />
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </div>
    );
}