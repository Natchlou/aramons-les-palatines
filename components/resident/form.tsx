"use client";

import { useState } from "react";
import type { UseFormOptionsWithSchema } from "@buildnbuzz/form-react";
import {
    Form,
    FormContent,
    FormFields,
    FormSubmit,
} from "@/components/buzzform/form";
import { ResidentSchema } from "@/lib/schema";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Database } from "@/database.types";
import { toast } from "../ui/toast";
import { upsertResident } from "@/lib/actions/residents";
import type { InferType } from "@buildnbuzz/form-core";
import { Button } from "../ui/button";
import { PencilIcon } from "lucide-react";

type Resident = Database["public"]["Tables"]["residents"]["Row"];
type ResidentFormValues = InferType<typeof ResidentSchema.fields>;

type Props = {
    resident?: Resident;
};

// Type dérivé de UseFormOptionsWithSchema, paramétré sur ResidentSchema.
type FormOnSubmit = UseFormOptionsWithSchema<typeof ResidentSchema>["onSubmit"];
type SubmitPayload = Parameters<NonNullable<FormOnSubmit>>[0];

export default function ResidentForm({ resident }: Props) {
    const [open, setOpen] = useState(false);
    const isEditing = !!resident;

    const onSubmit = async ({ value, formApi }: SubmitPayload) => {
        const typedValue = value as ResidentFormValues;

        const { error } = await upsertResident(typedValue, resident?.id);

        if (error) {
            toast.add({
                type: "error",
                title: "Erreur serveur",
            });
            return;
        }

        toast.add({
            type: "success",
            title: isEditing ? "Résident modifié" : "Résident ajouté",
        });

        if (!isEditing) {
            formApi.reset();
        }
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button size={isEditing ? 'icon' : 'default'} variant={isEditing ? 'secondary' : 'default'} />}>{isEditing ? <PencilIcon /> : "Ajouter un résident"}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Modifier" : "Ajouter"} un résident
                    </DialogTitle>
                </DialogHeader>
                <Form
                    schema={ResidentSchema}
                    defaultValues={resident}
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