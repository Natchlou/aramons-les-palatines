"use client";
import { FormContent, FormFields, FormSubmit, Form } from "@/components/buzzform/form";
import { AgentAbscencesSchema } from "@/lib/schema";

export default function TestForm() {
    return (
        <Form schema={AgentAbscencesSchema} onSubmit={(values) => console.log(values.value)}>
            <FormContent>
                <FormFields />
                <FormSubmit>Enregistrer</FormSubmit>
            </FormContent>
        </Form>
    );
}