import { generateAndSaveMonthlyPlanning } from "../lib/planningService";

async function main() {
  const year = 2026;
  const month = 10;
  console.log(`Génération du planning pour ${month}/${year}...`);
  const schedule = await generateAndSaveMonthlyPlanning({ year, month });
  console.log(`✅ Planning sauvegardé (${schedule.weeks.length} semaines).`);
}

main().catch((e) => {
  console.error("Erreur :", e);
  process.exit(1);
});