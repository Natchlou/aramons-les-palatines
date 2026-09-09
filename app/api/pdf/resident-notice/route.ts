import { NextResponse } from "next/server";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";

import ResidentNoticePdf, {
  type ResidentNotice,
} from "@/lib/pdf/resident-notice-pdf";

export const runtime = "nodejs";

type RequestBody = {
  notices: ResidentNotice[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;

    if (!Array.isArray(body.notices)) {
      return NextResponse.json(
        { error: "Les avis sont invalides." },
        { status: 400 },
      );
    }

    if (body.notices.length === 0) {
      return NextResponse.json(
        { error: "Aucun avis à générer." },
        { status: 400 },
      );
    }

    const document = createElement(ResidentNoticePdf, {
      notices: body.notices,
    }) as unknown as ReactElement<DocumentProps>;

    const pdf = await renderToBuffer(document);

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="avis-menage.pdf"',
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