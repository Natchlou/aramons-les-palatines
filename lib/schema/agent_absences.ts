import { defineSchema } from "@buildnbuzz/form-core";
import { createClient } from "../client";
import { addDays, startOfDay } from "date-fns";

const supabase = createClient();
const { data: agent } = await supabase.from("agent").select("id, name");

const agents =
  agent?.map((user) => ({
    value: user.id,
    label: user.name,
  })) ?? [];

const type = [
  { label: "Congé", value: "conge" },
  { label: "Arrêt maladie", value: "maladie" },
  { label: "Repos", value: "repos" },
  { label: "RTT", value: "rtt" },
  { label: "Autre", value: "autre" },
];

const AgentAbscencesSchema = defineSchema({
  fields: [
    {
      type: "radio",
      name: "agent",
      label: "Agent d'entretien",
      required: true,
      options: agents,
    },
    {
      type: "select",
      name: "type",
      label: "Type d'absence",
      options: type,
      required: true,
      disabled: { $data: "/agent", eq: "" },
    },
    {
      type: "textarea",
      name: "motif",
      label: "Motif",
      required:  { $data: "/type", eq: "autre" },
      disabled: { $data: "/type", eq: "autre" },
    },
    {
      type: "date",
      name: "start_date",
      label: "Début",
      required: true,
      disabled: { $data: "/type", eq: "" },
      ui: {
        format: "dd/MM/yyyy",
        presets: [
          {
            label: "Aujourd'hui",
            value: () => startOfDay(new Date()).toISOString(),
          },
          {
            label: "1 semaine",
            value: () => addDays(new Date(), 7).toISOString(),
          },
        ],
      },
    },
    {
      type: "date",
      name: "end_date",
      label: "Fin",
      required: true,
      disabled: { $data: "/start_date", eq: "" },
      ui: {
        format: "dd/MM/yyyy",
        presets: [
          {
            label: "Aujourd'hui",
            value: () => startOfDay(new Date()).toISOString(),
          },
          {
            label: "1 semaine",
            value: () => addDays(new Date(), 7).toISOString(),
          },
        ],
      },
    },
  ],
});

export { AgentAbscencesSchema };
