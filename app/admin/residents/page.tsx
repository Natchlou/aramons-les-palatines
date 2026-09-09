import ResidentDialog from "@/components/resident-dialog";
import ResidentsTable from "@/components/residents-table";

import { Database } from "@/database.types";
import { createClient } from "@/lib/client";

type ResidentRow = Database['public']['Tables']['residents']['Row'];

export default async function AdminResidentsPage() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("residents")
    .select("*");

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-destructive">
          Une erreur est survenue : {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-w-7xl flex-1 flex-col px-4 py-8 font-sans">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-4xl font-bold">
          Liste des résidents
        </h1>

        <ResidentDialog />
      </div>

      {data.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">
            Aucun résident trouvé.
          </p>
        </div>
      ) : (
        <ResidentsTable residents={data as ResidentRow[]} />
      )}
    </div>
  );
}