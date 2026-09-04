"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel, FieldTitle } from "@/components/ui/field";
import { TransferItem, TransferList } from "@/components/ui/transfer-list";
import { toast } from "./ui/toast";
import { createClient } from "@/lib/client";
import type { Database } from "@/database.types";
import { FixedTask, formatPlanningForDatabase, createResidentWithConstraints, Agent as PlanningAgent, generateWeeklyPlanning } from "@/lib/generateWeeklyPlanning";
import { Input } from "@/components/ui/input";

// Types
type ResidentRow = Database['public']['Tables']['residents']['Row'];
type ConstraintRow = Database['public']['Tables']['constraintes']['Row'];

// Validation du formulaire
const formSchema = z.object({
    agent: z.string().min(1, "Veuillez sélectionner un agent."),
    plonge: z.boolean(),
    residents: z.array(z.string()).min(1, "Veuillez sélectionner au moins un résident."),
    startDate: z.string().min(1, "Veuillez sélectionner une date de début."),
});

type FormValues = z.infer<typeof formSchema>;

// Mapping des agents
const AGENT_MAP: Record<string, PlanningAgent> = {
    manon: { id: 1, name: 'Manon', workingDays: [1, 2, 3, 4, 5], maxSlotsPerDay: 6 },
    christelle: { id: 2, name: 'Christelle', workingDays: [1, 2, 3, 4, 5], maxSlotsPerDay: 6 },
    lana: { id: 3, name: 'Lana', workingDays: [1, 2, 3, 4, 5], maxSlotsPerDay: 6 },
};

// Composant
export default function DialogPlanning() {
    const [open, setOpen] = React.useState(false);
    const [residentsList, setResidentsList] = React.useState<ResidentRow[]>([]);
    const [constraintsList, setConstraintsList] = React.useState<ConstraintRow[]>([]);
    const [available, setAvailable] = React.useState<TransferItem[]>([]);
    const [selected, setSelected] = React.useState<TransferItem[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isGenerating, setIsGenerating] = React.useState(false);

    // Agents disponibles pour le select
    const agents = [
        { label: "Manon", value: "manon" },
        { label: "Christelle", value: "christelle" },
        { label: "Lana", value: "lana" },
    ];

    // Charger les résidents et leurs contraintes
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const supabase = createClient();

                const { data: residentsData, error: residentsError } = await supabase
                    .from('residents').select('*');

                if (residentsError) {
                    console.error("Erreur résidents :", residentsError);
                    setResidentsList([]);
                    return;
                }

                const { data: constraintsData, error: constraintsError } = await supabase
                    .from('constraintes').select('*');

                if (constraintsError) {
                    console.error("Erreur contraintes :", constraintsError);
                }

                setResidentsList(residentsData || []);
                setConstraintsList(constraintsData || []);

                const formattedResidents = (residentsData || []).map((resident) => ({
                    id: resident.id.toString(),
                    label: `${resident.first_name || ''} ${resident.last_name || ''}`.trim(),
                    description: `Apt. ${resident.room || ''}, Bât. ${resident.building || ''}`
                        .replace(/,\s*,/g, ',')
                        .replace(/^,|,$/g, '')
                        .trim(),
                }));

                setAvailable(formattedResidents);
                setIsLoading(false);
            } catch (err) {
                console.error("Erreur :", err);
                setIsLoading(false);
            }
        };

        if (open) {
            fetchData();
        }
    }, [open]);

    // React Hook Form
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            agent: "",
            plonge: false,
            residents: [],
            startDate: new Date().toISOString().split('T')[0],
        },
    });

    // Valeurs observées
    const selectedAgent = useWatch({ control: form.control, name: "agent" });
    const plonge = useWatch({ control: form.control, name: "plonge" });
    const startDate = useWatch({ control: form.control, name: "startDate" });

    // Nom de l'agent sélectionné
    const agentName = agents.find((agent) => agent.value === selectedAgent)?.label ?? "aucun agent sélectionné";

    // TransferList
    const handleTransferChange = ({ available, selected }: { available: TransferItem[]; selected: TransferItem[] }) => {
        setAvailable(available);
        setSelected(selected);
        form.setValue("residents", selected.map((resident) => resident.id), { shouldValidate: true, shouldDirty: true });
    };

    // Générer et sauvegarder le planning
    const onSubmit = async (values: FormValues) => {
        setIsGenerating(true);

        try {
            // 1. Préparer les résidents avec leurs contraintes
            const selectedResidentIds = values.residents;
            const residentsWithConstraints = selectedResidentIds.map(residentId => {
                const resident = residentsList.find(r => r.id === residentId);
                const constraint = constraintsList.find(c => c.resident_id === residentId);

                if (!resident) return null;
                return createResidentWithConstraints(resident, constraint);
            }).filter(Boolean) as ReturnType<typeof createResidentWithConstraints>[];

            if (residentsWithConstraints.length === 0) {
                toast.add({
                    type: 'error',
                    title: 'Erreur',
                    description: 'Aucun résident valide sélectionné.',
                });
                return;
            }

            // 2. Préparer l'agent
            const agent = AGENT_MAP[values.agent];
            if (!agent) {
                toast.add({
                    type: 'error',
                    title: 'Erreur',
                    description: 'Agent non trouvé.',
                });
                return;
            }

            // 3. Préparer les tâches fixes
            // Note: Hall (8h-8h30) et pause (11h30-12h) sont ajoutés automatiquement dans formatPlanningForDatabase
            const fixedTasks: FixedTask[] = [];

            // Ajouter la plonge si sélectionnée
            if (values.plonge) {
                for (let day = 1; day <= 5; day++) {
                    fixedTasks.push({ dayOfWeek: day, startTime: '12:00', endTime: '14:00', type: 'plonge' });
                }
            }

            // 4. Générer le planning
            const startDateObj = new Date(values.startDate);
            const weeklyPlanning = await generateWeeklyPlanning(
                residentsWithConstraints,
                [agent],
                startDateObj
            );

            // 5. Formater pour la base de données
            const databasePlanning = formatPlanningForDatabase(weeklyPlanning, fixedTasks);

            // 6. Sauvegarder dans la base de données
            const supabase = createClient();
            const { error: saveError } = await supabase
                .from('planning')
                .insert({
                    date: values.startDate,
                    data: databasePlanning,
                });

            if (saveError) {
                toast.add({
                    type: 'error',
                    title: 'Erreur de sauvegarde',
                    description: saveError.message,
                });
                return;
            }

            // 7. Succès
            toast.add({
                type: 'success',
                title: 'Planning généré avec succès !',
                description: `Le planning pour ${agentName} a été généré et sauvegardé.`,
            });

            // Recharger la page
            window.location.reload();

        } catch (err) {
            console.error("Erreur génération :", err);
            toast.add({
                type: 'error',
                title: 'Erreur',
                description: 'Une erreur est survenue lors de la génération.',
            });
        } finally {
            setIsGenerating(false);
            // Réinitialisation
            form.reset();
            setAvailable(residentsList.map(r => ({
                id: r.id.toString(),
                label: `${r.first_name || ''} ${r.last_name || ''}`.trim(),
                description: `Apt. ${r.room || ''}, Bât. ${r.building || ''}`.replace(/,\s*,/g, ',').replace(/^,|,$/g, '').trim(),
            })));
            setSelected([]);
            setOpen(false);
        }
    };

    // Reset
    const handleOpenChange = (value: boolean) => {
        setOpen(value);
        if (!value) {
            form.reset();
            setAvailable(residentsList.map(r => ({
                id: r.id.toString(),
                label: `${r.first_name || ''} ${r.last_name || ''}`.trim(),
                description: `Apt. ${r.room || ''}, Bât. ${r.building || ''}`.replace(/,\s*,/g, ',').replace(/^,|,$/g, '').trim(),
            })));
            setSelected([]);
        } else {
            setAvailable(residentsList.map(r => ({
                id: r.id.toString(),
                label: `${r.first_name || ''} ${r.last_name || ''}`.trim(),
                description: `Apt. ${r.room || ''}, Bât. ${r.building || ''}`.replace(/,\s*,/g, ',').replace(/^,|,$/g, '').trim(),
            })));
            setSelected([]);
        }
    };

    // Render
    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger render={<Button variant="outline">Générer un planning mensuel</Button>} />

            <DialogContent className="min-w-160">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <p>Chargement des résidents...</p>
                    </div>
                ) : (
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <DialogHeader>
                            <DialogTitle>Génération du planning mensuel pour {agentName}</DialogTitle>
                            <DialogDescription>
                                Sélectionnez l&apos;agent, la date de début, la plonge et les résidents.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-6">
                            {/* Date de début */}
                            <Field>
                                <FieldLabel htmlFor="startDate">Date de début (Lundi)</FieldLabel>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => form.setValue("startDate", e.target.value, { shouldValidate: true, shouldDirty: true })}
                                />
                                {form.formState.errors.startDate && <FieldError>{form.formState.errors.startDate.message}</FieldError>}
                            </Field>

                            {/* Agent */}
                            <Field>
                                <FieldLabel htmlFor="agent">Agent d&apos;entretien</FieldLabel>
                                <Select
                                    value={selectedAgent}
                                    onValueChange={(value) => {
                                        form.setValue("agent", value ?? '', { shouldValidate: true, shouldDirty: true });
                                    }}
                                >
                                    <SelectTrigger id="agent" className="w-full">
                                        <SelectValue placeholder="Sélectionnez un agent" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {agents.map((agent) => (
                                                <SelectItem key={agent.value} value={agent.value}>
                                                    {agent.label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.agent && <FieldError>{form.formState.errors.agent.message}</FieldError>}
                            </Field>

                            {/* Plonge */}
                            <Field>
                                <Field orientation="horizontal">
                                    <Checkbox
                                        id="plonge"
                                        checked={plonge}
                                        onCheckedChange={(checked) => {
                                            form.setValue("plonge", checked === true, { shouldDirty: true, shouldValidate: true });
                                        }}
                                    />
                                    <FieldContent>
                                        <FieldLabel htmlFor="plonge">
                                            <FieldTitle>Fait la plonge ?</FieldTitle>
                                        </FieldLabel>
                                        <FieldDescription>
                                            Est-ce que l&apos;agent doit faire la plonge ?
                                        </FieldDescription>
                                    </FieldContent>
                                </Field>
                            </Field>

                            {/* Résidents */}
                            <Field>
                                <FieldLabel>Résidents à nettoyer</FieldLabel>
                                <FieldDescription>
                                    Sélectionnez les résidents qui doivent bénéficier d&apos;un ménage.
                                </FieldDescription>
                                <TransferList
                                    available={available}
                                    selected={selected}
                                    onChange={handleTransferChange}
                                />
                                {form.formState.errors.residents && (
                                    <FieldError>{form.formState.errors.residents.message}</FieldError>
                                )}
                            </Field>
                        </div>

                        <DialogFooter>
                            <DialogClose
                                render={
                                    <Button type="button" variant="outline" disabled={isGenerating}>
                                        Annuler
                                    </Button>
                                }
                            />
                            <Button type="submit" disabled={form.formState.isSubmitting || isGenerating}>
                                {isGenerating ? "Génération..." : "Générer"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
