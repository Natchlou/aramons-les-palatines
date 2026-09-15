// lib/actions/planning.ts
"use server";
import { generateAndSaveMonthlyPlanning } from "@/lib/planningService";

export async function generatePlanningAction(formData: FormData) {
  const year = Number(formData.get("year"));
  const month = Number(formData.get("month"));
  const plonge = formData.get("plonge") === "on";

  return generateAndSaveMonthlyPlanning({
    year,
    month,
    config: { plonge: { enabled: plonge, day: 2, building: "1" } },
    save: true,
  });
}