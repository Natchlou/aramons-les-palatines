import { defineSchema } from "@buildnbuzz/form-core";
import { createClient } from "../client";

const supabase = createClient();

const { data } = await supabase
  .from("residents")
  .select("id, first_name, last_name");

const options =
  data?.map((user) => ({
    value: user.id,
    label: `${user.first_name ?? ""} ${user.last_name}`,
  })) ?? [];

const ConstraintSchema = defineSchema({
  fields: [
    {
      type: "select",
      name: "resident_id",
      label: "Résident",
      options: options,
      required: true,
    },
    {
      type: "checkbox",
      name: "allow_days",
      label: "Jours de ménage",
      hasMany: true,
      options: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"],
      minSelected: 1,
    },
    {
      type: "checkbox",
      name: "schedule_hours",
      label: "Heure du ménage",
      hasMany: true,
      options: ["8h30", "10h00", "12h00", "13h30"],
      minSelected: 1,
    },
  ],
});

export { ConstraintSchema };
