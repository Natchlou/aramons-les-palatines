"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormContent, FormFields, FormSubmit } from "@/components/buzzform/form";
import { AgentAbscencesSchema } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export default function AgentForm() {
    const onSubmit = () => {

    }
    return <Dialog>
        <DialogTrigger render={<Button />}>
            <PlusIcon /> Ajouter
        </DialogTrigger>

        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    Ajouter un créneau de congés
                </DialogTitle>
            </DialogHeader>

            <Form
                schema={AgentAbscencesSchema}
                onSubmit={onSubmit}
            >
                <FormContent>
                    <FormFields />

                    <FormSubmit>
                        Ajouter
                    </FormSubmit>
                </FormContent>
            </Form>
        </DialogContent>
    </Dialog>
}