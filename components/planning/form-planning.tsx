"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormContent,
    FormFields,
    FormSubmit,
} from "../buzzform/form"
import { PlanningSchema } from "@/lib/schema"
import { generateAndSaveMonthlyPlanning } from "@/lib/planningService"

export default function FormPlanning() {
    const onSubmit = async ({ value }: any) => {
        const [year, month] = value.date.split("-").map(Number)

        await generateAndSaveMonthlyPlanning({
            year,
            month,
        })
    }

    return (
        <Dialog>
            <DialogTrigger render={<Button />}>
                Générer un nouveau planning
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Générer un nouveau planning
                    </DialogTitle>

                    <DialogDescription>
                        Sélectionnez le mois et l&apos;année pour le planning.
                    </DialogDescription>
                </DialogHeader>

                <Form
                    schema={PlanningSchema}
                    onSubmit={onSubmit}
                >
                    <FormContent>
                        <FormFields />

                        <FormSubmit>
                            Générer
                        </FormSubmit>
                    </FormContent>
                </Form>
            </DialogContent>
        </Dialog>
    )
}