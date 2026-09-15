// app/planning/page.tsx

import {CleaningPlanning} from "@/components/planning";
import { createClient } from "@/lib/client";

// import { useEffect, useState } from "react";

export default async function PlanningPage() {

  const supabase = createClient()

  const {data} = await supabase.from("planning").select('data').limit(1).single();
  const {data: residents} = await supabase.from("residents").select('*');

  // const [plannings, setPlannings] = useState<any>(null);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   fetch("/api/generate-planning?mois=Septembre&année=2026")
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setPlannings(data);
  //       setLoading(false);
  //     });
  // }, []);

  // if (loading) return <p>Chargement...</p>;

  return (
    <div className="flex flex-col flex-1 min-w-7xl mx-auto px-4 py-8 font-sans dark:bg-black">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Votre planning en quelques clicks</h1>
        {/* <PlanningForm /> */}
      </div>
      <main>
        <CleaningPlanning title={data.data[0].title} agent={data.data[0].agent} weeks={data.data[0].weeks} residents={residents}/>
        {/* <pre>{JSON.stringify(data.data[0], null, 2)}</pre> */}
      </main>
    </div>
  );
}
