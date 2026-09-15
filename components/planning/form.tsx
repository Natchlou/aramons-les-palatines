"use client";

import { useState } from "react";
import type { UseFormOptionsWithSchema } from "@buildnbuzz/form-react";
import {
    Form,
    FormContent,
    FormFields,
    FormSubmit,
} from "@/components/buzzform/form";
import { PlanningSchema } from "@/lib/schema";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "../ui/toast";
import type { InferType } from "@buildnbuzz/form-core";
import { Button } from "../ui/button";
import { generatePlanning } from "@/lib/actions/planning";

type PlanningFormValues = InferType<typeof PlanningSchema.fields>;

// Type dérivé de UseFormOptionsWithSchema, paramétré sur ResidentSchema.
type FormOnSubmit = UseFormOptionsWithSchema<typeof PlanningSchema>["onSubmit"];
type SubmitPayload = Parameters<NonNullable<FormOnSubmit>>[0];

export default function PlanningForm() {
    const [open, setOpen] = useState(false);

    const onSubmit = async ({ value, formApi }: SubmitPayload) => {
        const typedValue = value as PlanningFormValues;

        const { error } = await generatePlanning(typedValue);

        if (error) {
            toast.add({
                type: "error",
                title: "Erreur serveur",
            });
            return;
        }

        toast.add({
            type: "success",
            title: "Résident ajouté",
        });

            formApi.reset();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button />}>Générer un planning</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Génération d&apos;un planning
                    </DialogTitle>
                </DialogHeader>
                <Form
                    schema={PlanningSchema}
                    onSubmit={onSubmit}
                >
                    <FormContent>
                        <FormFields />
                        <FormSubmit>Enregistrer</FormSubmit>
                    </FormContent>
                </Form>
            </DialogContent>
        </Dialog>
    );
}