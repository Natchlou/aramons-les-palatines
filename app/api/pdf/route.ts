import { NextResponse } from "next/server";

import { renderToBuffer } from "@react-pdf/renderer";

import { createElement, type ReactElement } from "react";

import { z } from "zod";

import CleaningPlanningPdf from "@/lib/pdf/cleaning-planning-pdf";

import type {
  CleaningPlanning,
  CleaningPlanningData,
  Resident,
} from "@/lib/planning/types";

import { createClient } from "@/lib/server";

export const runtime = "nodejs";

const requestSchema = z.object({
  planningId: z.number().int().positive(),
  agent: z.string().trim().min(1),
});

const planningDataSchema = z.object({
  title: z.string(),
  agent: z.string(),
  weeks: z.array(
    z.record(
      z.enum(["1", "2", "3", "4", "5"]),
      z.record(z.string(), z.string()),
    ),
  ),
});

const residentSchema = z.object({
  id: z.string(),
  prefix: z.string().nullable(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  room: z.string().nullable(),
  building: z.string().nullable(),
  created_at: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims();

    if (claimsError || !claimsData?.claims) {
      return NextResponse.json(
        {
          error: "Vous devez être connecté.",
        },
        {
          status: 401,
        },
      );
    }

    const body = await request.json();

    const parsedRequest = requestSchema.safeParse(body);

    if (!parsedRequest.success) {
      return NextResponse.json(
        {
          error: "Requête invalide.",
          details: parsedRequest.error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    const { planningId, agent } = parsedRequest.data;

    const { data: planningRow, error: planningError } = await supabase
      .from("planning")
      .select("id, data")
      .eq("id", planningId)
      .single();

    if (planningError) {
      console.error("Erreur récupération planning :", planningError);

      return NextResponse.json(
        {
          error: "Impossible de récupérer le planning.",
        },
        {
          status: 500,
        },
      );
    }

    if (!planningRow) {
      return NextResponse.json(
        {
          error: "Planning introuvable.",
        },
        {
          status: 404,
        },
      );
    }

    const parsedPlanningData = z
      .array(planningDataSchema)
      .safeParse(planningRow.data);

    if (!parsedPlanningData.success) {
      console.error(
        "Format planning.data invalide :",
        parsedPlanningData.error,
      );

      return NextResponse.json(
        {
          error: "Le format des données du planning est invalide.",
        },
        {
          status: 500,
        },
      );
    }

    const agentPlanning = parsedPlanningData.data.find(
      (item) => item.agent.trim().toLowerCase() === agent.trim().toLowerCase(),
    );

    if (!agentPlanning) {
      return NextResponse.json(
        {
          error: `Aucun planning trouvé pour l'agent "${agent}".`,
        },
        {
          status: 404,
        },
      );
    }

    const planning: CleaningPlanning = {
      id: planningRow.id,
      title: agentPlanning.title,
      agent: agentPlanning.agent,
      weeks: agentPlanning.weeks,
    };

    const { data: residentsData, error: residentsError } = await supabase
      .from("residents")
      .select("id, prefix, first_name, last_name, room, building, created_at")
      .order("last_name", {
        ascending: true,
      });

    if (residentsError) {
      console.error("Erreur récupération résidents :", residentsError);

      return NextResponse.json(
        {
          error: "Impossible de récupérer les résidents.",
        },
        {
          status: 500,
        },
      );
    }

    const parsedResidents = z
      .array(residentSchema)
      .safeParse(residentsData ?? []);

    if (!parsedResidents.success) {
      console.error("Format residents invalide :", parsedResidents.error);

      return NextResponse.json(
        {
          error: "Le format des résidents est invalide.",
        },
        {
          status: 500,
        },
      );
    }

    const residents: Resident[] = parsedResidents.data;

    const pdfElement = createElement(CleaningPlanningPdf, {
      planning,
      residents,
    }) as ReactElement;

    const buffer = await renderToBuffer(pdfElement);

    const filename = `planning-menage-${planning.agent
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")}.pdf`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Erreur génération PDF :", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la génération du PDF.",
      },
      {
        status: 500,
      },
    );
  }
}
