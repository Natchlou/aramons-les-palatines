import { NextResponse } from "next/server";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";

import CleaningPlanningPdf, {
  type CleaningPlanningMonth,
  type CleaningPlanningMode,
} from "@/lib/pdf/cleaning-planning-pdf";

export const runtime = "nodejs";

type RequestBody = {
  planning: CleaningPlanningMonth;
  mode?: CleaningPlanningMode;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;

    if (!body.planning || !Array.isArray(body.planning.weeks)) {
      return NextResponse.json(
        { error: "Le planning est invalide." },
        { status: 400 },
      );
    }

    if (body.planning.weeks.length === 0) {
      return NextResponse.json(
        { error: "Le planning est vide." },
        { status: 400 },
      );
    }

    const document = createElement(CleaningPlanningPdf, {
      planning: body.planning,
      mode: body.mode ?? "weekly",
    }) as unknown as ReactElement<DocumentProps>;

    const pdf = await renderToBuffer(document);

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="planning-menage.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("PDF ERROR:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}