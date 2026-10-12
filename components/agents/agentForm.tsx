"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Form,
  FormContent,
  FormFields,
  FormSubmit,
} from "@/components/buzzform/form";

import { AgentAbscencesSchema } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

import SupabaseCrud from "@/lib/supabase-crud";
import { Database } from "@/database.types";

type AgentAbsences =
  Database["public"]["Tables"]["agent_absences"]["Row"];

type AgentAbsencesInsert =
  Database["public"]["Tables"]["agent_absences"]["Insert"];

export default function AgentForm({agent_id}: {agent_id: number}) {
  const agentAbsencesService =
    new SupabaseCrud<AgentAbsences>(
      "agent_absences",
    );

  const onSubmit = async ({
    value,
  }: {
    value: AgentAbsencesInsert;
  }) => {
    const result =
      await agentAbsencesService.create({...value, agent_id: agent_id});

    if (!result.success) {
      console.error(result.error);
      return;
    }

    console.log("Absence créée :", result.data);
  };

  return (
    <Dialog>
      <DialogTrigger render={<Button />}>
        <PlusIcon />
        Ajouter
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
  );
}