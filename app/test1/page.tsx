import GeneratePlanningPdf from "@/components/pdf/generate-planning-pdf";
import GenerateResidentNoticePdf from "@/components/pdf/generate-resident-notice-pdf";
import { createClient } from "@/lib/server";
import { Details, Planning } from "@/components/planning";
import { ResidentNotice } from "@/lib/pdf/resident-notice-pdf";

export default async function Test1Page() {
    const supabase = await createClient()
    const { data: planning } = await supabase.
        from('planning').
        select('*').limit(1).single<Planning>()

    if (!planning) {
        return <div>Erreur</div>
    }

    console.log(planning)

    function extractAllTasks(weeks: Details['weeks']): ResidentNotice[] {
        const flatList: ResidentNotice[] = [];

        for (const week of weeks) {
            for (const day of week.days) {
                for (const task of day.tasks) {
                    // On ignore les pauses si vous ne souhaitez que les vraies tâches/résidents
                    if (task.type === "pause") continue;
                    if (task.type === "hall") continue;
                    if (task.type === "plonge") continue;
                    if (task.type === "lavettes") continue;

                    flatList.push({
                        day: day.date,
                        time: task.time,
                        name: task.resident,
                        apartment: task.room ?? '',
                        building: task.building ?? ''
                    });
                }
            }
        }

        return flatList;
    }

    return <div className="mx-auto pt-8 flex flex-col space-y-8">
        <div className="border-2 p-4 rounded text-center">
            <p className="text-xl font-bold mb-2">Planning mensuelle</p>
            <GeneratePlanningPdf mode="monthly" planning={planning} />
        </div>
        <div className="border-2 p-4 rounded text-center">
            <p className="text-xl font-bold mb-2">Planning hebdomadaire</p>
            <GeneratePlanningPdf mode="weekly" planning={planning} />
        </div>
        <div className="border-2 p-4 rounded text-center">
            <p className="text-xl font-bold mb-2">Fiche ménage</p>
            <GenerateResidentNoticePdf notices={extractAllTasks(planning.data.weeks)} />
        </div>
    </div>
}