import { DataTable } from "@/components/data-table";

import { createClient } from "@/lib/server";
import { columns } from "./columns";
import ResidentForm from "@/components/resident/form";

export default async function AdminResidentsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("residents")
    .select("*")
    .order('room', { ascending: true });

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

        <ResidentForm />
      </div>

      {data.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">
            Aucun résident trouvé.
          </p>
        </div>
      ) : (
        <DataTable data={data} columns={columns} />
      )}
    </div>
  );
}