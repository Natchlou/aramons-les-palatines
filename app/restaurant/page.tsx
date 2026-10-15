import Pos from "@/components/pos/pos";
import { Product } from "@/components/pos/types";
import SupabaseCrud from "@/lib/supabase-crud";

export default async function RestaurantPage() {
    const productsService = new SupabaseCrud('products');

    const products = await productsService.getWithFilters({
        filters: [{
            column: 'is_available',
            operator: 'eq',
            value: true
        }]
    });
    return <Pos products={products.data as Product[]}/>
}