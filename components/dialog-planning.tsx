"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Checkbox } from "@/components/ui/checkbox";

import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldLabel,
    FieldTitle,
} from "@/components/ui/field";

import {
    TransferItem,
    TransferList,
} from "@/components/ui/transfer-list";
import { toast } from "./ui/toast";


// ─────────────────────────────────────────────
// Validation du formulaire
// ─────────────────────────────────────────────

const formSchema = z.object({
    agent: z.string().min(1, "Veuillez sélectionner un agent."),

    plonge: z.boolean(),

    residents: z
        .array(z.string())
        .min(1, "Veuillez sélectionner au moins un résident."),
});

type FormValues = z.infer<typeof formSchema>;


// ─────────────────────────────────────────────
// Composant
// ─────────────────────────────────────────────

export default function DialogPlanning() {
    const [open, setOpen] = React.useState(false);

    // Agents disponibles
    const agents = [
        {
            label: "Manon",
            value: "manon",
        },
        {
            label: "Christelle",
            value: "christelle",
        },
        {
            label: "Lana",
            value: "lana",
        },
    ];

    // Résidents disponibles
    const residents: TransferItem[] = [
        {
            id: "1",
            label: "Jean Dupont",
            description: "Chambre 102 · Bâtiment A",
        },
        {
            id: "2",
            label: "Marie Martin",
            description: "Chambre 205 · Bâtiment B",
        },
        {
            id: "3",
            label: "Paul Durand",
            description: "Chambre 301 · Bâtiment A",
        },
    ];

    // Résidents disponibles dans le TransferList
    const [available, setAvailable] =
        React.useState<TransferItem[]>(residents);

    // Résidents sélectionnés
    const [selected, setSelected] =
        React.useState<TransferItem[]>([]);


    // ─────────────────────────────────────────────
    // React Hook Form
    // ─────────────────────────────────────────────

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),

        defaultValues: {
            agent: "",
            plonge: false,
            residents: [],
        },
    });


    // ─────────────────────────────────────────────
    // Valeurs observées
    // ─────────────────────────────────────────────

    const selectedAgent = useWatch({
        control: form.control,
        name: "agent",
    });

    const plonge = useWatch({
        control: form.control,
        name: "plonge",
    });


    // Nom de l'agent sélectionné
    const agentName =
        agents.find(
            (agent) => agent.value === selectedAgent
        )?.label ?? "aucun agent sélectionné";


    // ─────────────────────────────────────────────
    // TransferList
    // ─────────────────────────────────────────────

    const handleTransferChange = ({
        available,
        selected,
    }: {
        available: TransferItem[];
        selected: TransferItem[];
    }) => {
        setAvailable(available);
        setSelected(selected);

        // On synchronise le TransferList avec React Hook Form
        form.setValue(
            "residents",
            selected.map((resident) => resident.id),
            {
                shouldValidate: true,
                shouldDirty: true,
            }
        );
    };


    // ─────────────────────────────────────────────
    // Submit
    // ─────────────────────────────────────────────

    const onSubmit = async (values: FormValues) => {
        console.log("Données du formulaire :", values);
        toast.add({
            type: 'success',
            title: 'Données du formulaire',
            description: JSON.stringify(values)
        })

        // Ton appel API ici
        // await fetch(...);

        // Nettoyage du formulaire
        form.reset();

        // Nettoyage du TransferList
        setAvailable(residents);
        setSelected([]);

        // Fermeture du Dialog
        setOpen(false);
    };

    // ─────────────────────────────────────────────
    // Reset
    // ─────────────────────────────────────────────

    const handleOpenChange = (value: boolean) => {
        setOpen(value);

        if (!value) {
            form.reset();
            setAvailable(residents);
            setSelected([]);
        }
    };


    // ─────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────

    return (
        <Dialog
            open={open}
            onOpenChange={handleOpenChange}
        >
            <DialogTrigger
                render={
                    <Button variant="outline">
                        Générer un planning mensuel
                    </Button>
                }
            />

            <DialogContent className="min-w-160">
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <DialogHeader>
                        <DialogTitle>
                            Génération du planning mensuel pour{" "}
                            {agentName}
                        </DialogTitle>

                        <DialogDescription>
                            Sélectionnez l&apos;agent d&apos;entretien,
                            indiquez s&apos;il doit faire la plonge et
                            sélectionnez les résidents nécessitant un
                            ménage.
                        </DialogDescription>
                    </DialogHeader>


                    <div className="space-y-6 py-6">

                        {/* ─────────────────────────────── */}
                        {/* Agent */}
                        {/* ─────────────────────────────── */}

                        <Field>
                            <FieldLabel htmlFor="agent">
                                Agent d&apos;entretien
                            </FieldLabel>

                            <Select
                                value={selectedAgent}
                                onValueChange={(value) => {
                                    if (!value) return;

                                    form.setValue(
                                        "agent",
                                        value,
                                        {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                        }
                                    );
                                }}
                            >
                                <SelectTrigger
                                    id="agent"
                                    className="w-full"
                                >
                                    <SelectValue
                                        placeholder="Sélectionnez un agent"
                                    />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectGroup>
                                        {agents.map((agent) => (
                                            <SelectItem
                                                key={agent.value}
                                                value={agent.value}
                                            >
                                                {agent.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>

                            {form.formState.errors.agent && (
                                <FieldError>
                                    {
                                        form.formState.errors.agent
                                            .message
                                    }
                                </FieldError>
                            )}
                        </Field>


                        {/* ─────────────────────────────── */}
                        {/* Plonge */}
                        {/* ─────────────────────────────── */}

                        <Field>
                            <Field
                                orientation="horizontal"
                            >
                                <Checkbox
                                    id="plonge"
                                    checked={plonge}
                                    onCheckedChange={(checked) => {
                                        form.setValue(
                                            "plonge",
                                            checked === true,
                                            {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            }
                                        );
                                    }}
                                />

                                <FieldContent>
                                    <FieldLabel htmlFor="plonge">
                                        <FieldTitle>
                                            Fait la plonge ?
                                        </FieldTitle>
                                    </FieldLabel>

                                    <FieldDescription>
                                        Est-ce que l&apos;agent d&apos;entretien
                                        doit faire la plonge ?
                                    </FieldDescription>
                                </FieldContent>
                            </Field>
                        </Field>


                        {/* ─────────────────────────────── */}
                        {/* Résidents */}
                        {/* ─────────────────────────────── */}

                        <Field>
                            <FieldLabel>
                                Résidents à nettoyer
                            </FieldLabel>

                            <FieldDescription>
                                Sélectionnez les résidents qui doivent
                                bénéficier d&apos;un ménage.
                            </FieldDescription>

                            <TransferList
                                available={available}
                                selected={selected}
                                onChange={handleTransferChange}
                            />

                            {form.formState.errors.residents && (
                                <FieldError>
                                    {
                                        form.formState.errors.residents
                                            .message
                                    }
                                </FieldError>
                            )}
                        </Field>
                    </div>


                    {/* ─────────────────────────────── */}
                    {/* Footer */}
                    {/* ─────────────────────────────── */}

                    <DialogFooter>
                        <DialogClose
                            render={
                                <Button
                                    type="button"
                                    variant="outline"
                                >
                                    Annuler
                                </Button>
                            }
                        />

                        <Button
                            type="submit"
                            disabled={
                                form.formState.isSubmitting
                            }
                        >
                            {form.formState.isSubmitting
                                ? "Génération..."
                                : "Générer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}