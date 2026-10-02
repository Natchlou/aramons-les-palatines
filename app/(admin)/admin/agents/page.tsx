import { DataTable } from "@/components/data-table";

import { columns } from "./columns";
import { Database } from "@/database.types";
import SupabaseCrud from "@/lib/supabase-crud";

type AgentRow = Database['public']['Tables']['agent']['Row'];

export default async function AdminAgentsPage() {
  const agentsService = new SupabaseCrud<AgentRow>('agent')

  const agents = await agentsService.getAll()
  const agentsData = agents.data as AgentRow[] | null | undefined

  if (agents.error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-destructive">
          Une erreur est survenue : {agents.error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 font-sans">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-4xl font-bold">
          Liste des agents d&apos;entretiens
        </h1>
      </div>

      {agentsData?.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">
            Aucun agent trouvé.
          </p>
        </div>
      ) : (
        <DataTable data={agentsData || []} columns={columns} />
      )}
    </div>
  );
}