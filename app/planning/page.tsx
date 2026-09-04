import PlanningMenage from "@/components/planning";
import DialogPlanning from "@/components/dialog-planning";
import { createClient } from "@/lib/client";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default async function Planning() {

  const supabase = createClient()

  // Récupérer tous les plannings disponibles
  const { data: plannings, error } = await supabase
    .from('planning')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error("Erreur lors de la récupération des plannings :", error);
    return (
      <div className="flex flex-col flex-1 min-w-7xl mx-auto px-4 py-8 font-sans dark:bg-black">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold mb-2">Votre planning en 1 click</h1>
          <DialogPlanning />
        </div>
        <div className="mt-4 p-4 bg-destructive/10 border border-destructive rounded">
          <p className="text-destructive">{error.message}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Vérifiez que la table &apos;planning&apos; existe dans votre base de données.
          </p>
        </div>
      </div>
    );
  }

  // Si aucun planning n'existe, afficher un message
  if (!plannings || plannings.length === 0) {
    return (
      <div className="flex flex-col flex-1 min-w-7xl mx-auto px-4 py-8 font-sans dark:bg-black">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold mb-2">Votre planning en 1 click</h1>
          <DialogPlanning />
        </div>
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">Aucun planning généré pour le moment.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Utilisez le bouton &apos;Générer un planning mensuel&apos; pour en créer un.
          </p>
        </div>
      </div>
    );
  }

  // Le planning le plus récent est le premier
  const latestPlanning = plannings[0];

  return (
    <div className="flex flex-col flex-1 min-w-7xl mx-auto px-4 py-8 font-sans dark:bg-black">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold mb-2">Votre planning en 1 click</h1>
        <DialogPlanning />
      </div>

      {/* Sélecteur de planning */}
      {plannings.length > 1 && (
        <div className="mb-4">
          <Select defaultValue={latestPlanning.id.toString()}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder="Sélectionnez un planning" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {plannings.map((planning) => (
                  <SelectItem key={planning.id} value={planning.id.toString()}>
                    {planning.date}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      )}

      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <PlanningMenage data={latestPlanning.data} />
      </Suspense>
    </div>
  );
}
