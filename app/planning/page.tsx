import PlanningMonthly from "@/components/planning";
import { createClient } from "@/lib/server";

export default async function Planning() {

  const supabase = await createClient()

  // Récupérer tous les plannings disponibles
  const { data: planning, error } = await supabase
    .from('planning')
    .select('*')
    .order('date', { ascending: false });
  console.log(planning, error)
  if (error) {
    console.error("Erreur lors de la récupération des plannings :", error);
  }
  return (
    <div className="flex flex-col flex-1 min-w-7xl mx-auto px-4 py-8 font-sans dark:bg-black">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold mb-2">Votre planning en 1 click</h1>
      </div>
      <main>
        <PlanningMonthly data={planning ? planning[0] : []}/>
      </main>
    </div>
  );
}
