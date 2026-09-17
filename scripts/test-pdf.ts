// scripts/test-pdf.ts
import "dotenv/config";
import { writeFileSync } from "node:fs";
import { renderToBuffer } from "@react-pdf/renderer";
import {
  fetchResidentsFromSupabase,
  fetchAgentsFromSupabase,
  generateMonthlySchedule,
  filterScheduleByAgent,
} from "@/lib/planningService";
import CleaningPlanningPdf from "@/components/pdf/cleaning-planning-pdf";

async function main() {
  const [residents, agents] = await Promise.all([
    fetchResidentsFromSupabase(),
    fetchAgentsFromSupabase(),
  ]);

  const schedule = generateMonthlySchedule(residents, 2026, 10, { agents });

  // 1. PDF global
  const globalPdf = await renderToBuffer(
    CleaningPlanningPdf({ schedule }) as any,
  );
  writeFileSync("planning-global.pdf", globalPdf);
  console.log("✅ planning-global.pdf");

  // 2. Un PDF par agent
  for (const agentName of ["Christelle", "Manon", "Lana"]) {
    const personal = filterScheduleByAgent(schedule, agentName);
    const pdf = await renderToBuffer(
      CleaningPlanningPdf({ schedule: personal }) as any,
    );
    const file = `planning-${agentName.toLowerCase()}.pdf`;
    writeFileSync(file, pdf);
    console.log(`✅ ${file}`);
  }
}

main().catch(console.error);