// app/api/pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/server";
import { filterScheduleByAgent } from "@/lib/planningService";
import { CleaningPlanningPdf } from "@/components/pdf/cleaning-planning-pdf";
import type { MonthlyScheduleResponse } from "@/lib/planningService";

export async function POST(req: NextRequest) {
  try {
    const { planningId, agent } = await req.json();

    if (typeof planningId !== "number") {
      return NextResponse.json(
        { error: "planningId requis (number)." },
        { status: 400 },
      );
    }

    // 1. Récupérer le planning
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("planning")
      .select("id, year, month, data")
      .eq("id", planningId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Planning introuvable." },
        { status: 404 },
      );
    }

    const fullSchedule = data.data as MonthlyScheduleResponse;

    // 2. Filtrer si un agent est précisé
    const schedule = agent
      ? filterScheduleByAgent(fullSchedule, agent)
      : fullSchedule;

    // 3. Vérifier qu'il y a du contenu
    if (schedule.weeks.length === 0) {
      return NextResponse.json(
        { error: `Aucun ménage trouvé pour ${agent ?? "ce planning"}.` },
        { status: 404 },
      );
    }

    // 4. Générer le PDF
    const buffer = await renderToBuffer(
      CleaningPlanningPdf({ schedule }) as any,
    );

    // 5. Nom du fichier
    const mm = String(data.month).padStart(2, "0");
    const filename = agent
      ? `planning-menage-${data.year}-${mm}-${agent
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "-")}.pdf`
      : `planning-menage-${data.year}-${mm}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[api/pdf] Erreur :", err);
    return NextResponse.json(
      { error: "Erreur serveur lors de la génération du PDF." },
      { status: 500 },
    );
  }
}