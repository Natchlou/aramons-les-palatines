import { defineSchema } from "@buildnbuzz/form-core";
import { addDays, startOfDay } from "date-fns";

const type = [
  { label: "Congé", value: "conge" },
  { label: "Arrêt maladie", value: "maladie" },
  { label: "Repos", value: "repos" },
  { label: "RTT", value: "rtt" },
  { label: "Vacances", value: "vacances"},
  { label: "Autre", value: "autre" },
];

const AgentAbscencesSchema = defineSchema({
  fields: [
    {
      type: "select",
      name: "type",
      label: "Type d'absence",
      options: type,
      required: true,
    },
    {
      type: "textarea",
      name: "motif",
      label: "Motif",
      required:  { $data: "/type", eq: "autre" },
      disabled: { $data: "/type", neq: "autre" },
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
