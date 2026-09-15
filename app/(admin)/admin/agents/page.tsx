import { DataTable } from "@/components/data-table";

import { createClient } from "@/lib/server";
import { columns } from "./columns";

export default async function AdminAgentsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("agent")
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
          Liste des agents d&apos;entretiens
        </h1>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">
            Aucun agent trouvé.
          </p>
        </div>
      ) : (
        <DataTable data={data} columns={columns} />
      )}
    </div>
  );
}