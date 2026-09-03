// import PlanningViewer from "@/components/planning-viewer";
// import { agents, residents } from "@/lib/mockData";
// import { generatePlanning } from "@/lib/planningEngine";

import PlanningMenage from "@/components/planning";

export default function Planning() {
  // const startDate = new Date('2026-08-29');
  
  // Génération du planning
  // const result = generatePlanning(residents, agents, startDate);
  return (
    <div className="flex flex-col flex-1 min-w-7xl mx-auto px-4 py-8 font-sans dark:bg-black">
      <h1 className="text-4xl font-bold mb-2">Votre planning en 1 click</h1>
      {/* <PlanningViewer agents={agents} residents={residents} result={result}/> */}
      <PlanningMenage />
    </div>
  );
}
