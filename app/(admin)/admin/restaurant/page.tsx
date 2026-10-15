import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { Database } from "@/database.types";
import SupabaseCrud from "@/lib/supabase-crud";

type ProductRow = Database['public']['Tables']['products']['Row'];

export default async function AdminRestaurantPage() {
  const restaurantService = new SupabaseCrud<ProductRow>("products")

  const products = await restaurantService.getAll()
  const productsData = products.data as ProductRow[] | null | undefined

  if (products.error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-destructive">
          Une erreur est survenue : {products.error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 font-sans">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-4xl font-bold">
          Liste des produits
        </h1>

        <div className="flex justify-end items-center gap-2">
        </div>
      </div>

      {productsData?.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">
            Aucun produit trouvé.
          </p>
        </div>
      ) : (
        <DataTable data={productsData || []} columns={columns} />
      )}
    </div>
  );
}