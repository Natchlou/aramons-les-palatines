import { defineSchema } from "@buildnbuzz/form-core";

const now = new Date();

const months = Array.from({ length: 12 }, (_, i) => {
  const date = new Date(now.getFullYear(), now.getMonth() + i, 1);

  return {
    value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
    label: date.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    }),
  };
});

const PlanningSchema = defineSchema({
  fields: [
    {
      type: "select",
      name: "date",
      label: "Mois du planning",
      required: true,
      options: months,
    },
  ],
});

export { PlanningSchema };
