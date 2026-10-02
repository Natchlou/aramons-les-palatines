import DataList from "@/components/data-list";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

import { Database } from "@/database.types";
import { createClient } from "@/lib/server";

import { CheckCircle2, CircleCheck, ClipboardCheck } from "lucide-react";
import { notFound } from "next/navigation";

type RecentMenageRow =
    Database["public"]["Tables"]["recents_menages"]["Row"];

type ChecklistItem = {
    label: string;
    value: boolean;
};

type ChecklistSection = {
    title: string;
    items: ChecklistItem[];
};

type ChecklistDetails = ChecklistSection[];

export default async function AdminResidentDetailMenage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const supabase = await createClient();

    const { data, error } = await supabase
        .from("recents_menages")
        .select("*")
        .eq("id", id)
        .single<RecentMenageRow>();

    if (error || !data) {
        notFound();
    }

    const details = data.details as ChecklistDetails;

    const checklistSections = details.filter(
        (section) => section.title !== "Prestation supplémentaire",
    );

    const totalItems = checklistSections.reduce(
        (total, section) => total + section.items.length,
        0,
    );

    const completedItems = checklistSections.reduce(
        (total, section) =>
            total + section.items.filter((item) => item.value).length,
        0,
    );

    const progress =
        totalItems > 0
            ? Math.round((completedItems / totalItems) * 100)
            : 0;
    function formatTime(date: string | null) {
        if (!date) return "—";

        return new Date(date).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    }

    function getDuration(
        startedAt: string | null,
        completedAt: string | null,
    ) {
        if (!startedAt || !completedAt) return "—";

        const start = new Date(startedAt).getTime();
        const end = new Date(completedAt).getTime();

        const duration = Math.floor((end - start) / 1000);

        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = duration % 60;

        return [
            hours > 0 ? `${hours} h` : null,
            minutes > 0 ? `${minutes} min` : null,
            `${seconds} s`,
        ]
            .filter(Boolean)
            .join(" ");
    }
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
                    variant={
                        data.statut === "COMPLETED"
                            ? "default"
                            : "secondary"
                    }
                    className="w-fit px-3 py-1.5"
                >
                    {data.statut}
                </Badge>
            </div>

            <Separator />

            {/* Contenu */}
            <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
                {/* Checklist - GAUCHE */}
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
                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-primary transition-all"
                                        style={{
                                            width: `${progress}%`,
                                        }}
                                    />
                                </div>

                                <span className="w-10 text-right text-sm font-medium">
                                    {progress}%
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sections */}
                    <div className="grid gap-4 md:grid-cols-2">
                        {details.map((section) => {
                            const isExtraService =
                                section.title === "Prestation supplémentaire";

                            const completed = section.items.filter(
                                (item) => item.value,
                            ).length;

                            const total = section.items.length;

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
                                                        completed === total
                                                            ? "default"
                                                            : "secondary"
                                                    }
                                                    className="gap-1"
                                                >
                                                    {completed === total && (
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
                                                            checked={item.value}
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
                </section>

                {/* Informations - DROITE */}
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
                                            <Badge
                                                variant={
                                                    data.statut === "COMPLETED"
                                                        ? "default"
                                                        : "secondary"
                                                }
                                            >
                                                {data.statut}
                                            </Badge>
                                        ),
                                    },
                                    {
                                        title: "Date",
                                        value: data.date,
                                    },
                                    {
                                        title: "Heure prévue",
                                        value: data.heure,
                                    },
                                    {
                                        title: "Commencé à",
                                        value: formatTime(
                                            data.started_at,
                                        ),
                                    },
                                    {
                                        title: "Terminé à",
                                        value: formatTime(
                                            data.completed_at,
                                        ),
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