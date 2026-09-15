import { defineSchema } from "@buildnbuzz/form-core";

const ResidentSchema = defineSchema({
  fields: [
    {
      type: "select",
      name: "prefix",
      label: "Préfixe",
      required: true,
      options: [
        { label: "Monsieur", value: "M" },
        { label: "Madame", value: "Mme" },
      ],
    },
    { type: "text", name: "first_name", label: "Prénom", required: false },
    { type: "text", name: "last_name", label: "Nom", required: true },
    { type: "text", name: "room", label: "Appartement", required: true },
    {
      type: "select",
      name: "building",
      label: "Bâtiment",
      required: true,
      options: [
        { label: "Bâtiment 1", value: "1" },
        { label: "Bâtiment 2", value: "2" },
      ],
    },
  ],
});

export { ResidentSchema };
