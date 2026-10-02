import { Resident } from "@/lib/planning/types";
import SupabaseCrud from "@/lib/supabase-crud"

export default async function TestPage() {
    const residentService = new SupabaseCrud<Resident>("residents")

    const residents = await residentService.getWithFilters({
        sort: [{column: 'room', ascending: true}]
    });

    return <div className="mx-auto min-w-7xl p-4">
        <pre>
            {JSON.stringify(residents, null, ' ')}
        </pre>
    </div>
}