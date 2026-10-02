import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import ResidentForm from "@/components/resident/form";
import { Database } from "@/database.types";
import SupabaseCrud from "@/lib/supabase-crud";

type ResidentRow = Database['public']['Tables']['residents']['Row'];

export default async function AdminResidentsPage() {
  const residentsService = new SupabaseCrud<ResidentRow>("residents")

  const residents = await residentsService.getWithFilters({
    sort: [{ column: 'room' }]
  })
  const residentsData = residents.data as ResidentRow[] | null | undefined

  if (residents.error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-destructive">
          Une erreur est survenue : {residents.error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 font-sans">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-4xl font-bold">
          Liste des résidents
        </h1>

        <ResidentForm />
      </div>

      {residentsData?.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">
            Aucun résident trouvé.
          </p>
        </div>
      ) : (
        <DataTable data={residentsData || []} columns={columns} />
      )}
    </div>
  );
}