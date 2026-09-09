import { createClient } from "@/lib/client";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default async function Planning() {

  const supabase = createClient()

  // Récupérer tous les plannings disponibles
  const { data: plannings, error } = await supabase
    .from('planning')
    .select('*')
    .order('date', { ascending: false });

    console.log(plannings)
  if (error) {
    console.error("Erreur lors de la récupération des plannings :", error);
    return (
      <div className="flex flex-col flex-1 min-w-7xl mx-auto px-4 py-8 font-sans dark:bg-black">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold mb-2">Votre planning en 1 click</h1>
          <Suspense fallback={<Skeleton />}>

          </Suspense>
        </div>
      </div>
    );
  }
}
