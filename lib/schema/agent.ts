import { defineSchema } from "@buildnbuzz/form-core";

const AgentSchema = defineSchema({
  fields: [
    { type: "text", name: "name", label: "Prénom", required: false },
    {
      type: "number",
      name: "maxSlotsPerDay",
      label: "Ménage par jours",
      required: true,
    },
    {
      type: "checkbox",
      name: "working_days",
      label: "Jours de travail",
      required: true,
      hasMany: true,
      options: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"],
      minSelected: 4,
    },
    {
      type: "switch",
      name: "isAbsent",
      label: "Actuellement absent ?",
      defaultValue: false,
    },
  ],
});

export { AgentSchema };
