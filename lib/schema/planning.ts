import { defineSchema } from "@buildnbuzz/form-core";
import { createClient } from "../client";

const supabase = createClient();

const { data: resident } = await supabase
  .from("residents")
  .select("id, first_name, last_name")
  .order("room", { ascending: true });

const { data: agent } = await supabase.from("agent").select("id, name");

const agents =
  agent?.map((user) => ({
    value: user.id,
    label: user.name,
  })) ?? [];

const residents = resident?.map((item) => ({
  value: item.id,
  label: `${item.last_name} ${item.first_name ?? ""}`,
}));

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
    {
      type: "radio",
      name: "agent",
      label: "Agent d'entretien",
      required: true,
      options: agents,
      disabled: { $data: "/date", eq: "" },
    },
    {
      type: "select",
      name: "resident",
      label: "Résidents",
      required: true,
      options: residents,
      hasMany: true,
      ui: {
        isClearable: true,
      },
      minSelected: 1,
      disabled: { $data: "/agent", eq: "" },
    },
  ],
});

export { PlanningSchema };
