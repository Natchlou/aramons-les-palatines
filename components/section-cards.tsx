import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/client"
import SupabaseCrud, { eq, getDataOrDefault } from "@/lib/supabase"

export async function SectionCards() {
  const supabase = createClient();

  const menageService = new SupabaseCrud(supabase, 'recents_menages');

  const [menageRes, doneRes, cancelledRes] = await Promise.all([
    menageService.count([eq("type", "menage")]),
    menageService.count([eq("type", "menage"), eq("statut", "COMPLETED")]),
    menageService.count([eq("type", "menage"), eq("statut", "CANCELLED")]),
  ])

  const menageCount = getDataOrDefault(menageRes, 0)
  const doneCount = getDataOrDefault(doneRes, 0)
  const cancelledCount = getDataOrDefault(cancelledRes, 0)

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Nombre de ménages dans le mois</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {menageCount}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Ménage effectués</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-green-500">
            {doneCount}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Ménage refusé ou annulé</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-destructive">
            {cancelledCount}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}
