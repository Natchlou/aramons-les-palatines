import { NextResponse } from "next/server";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import { z } from "zod";

import ResidentNoticePdf, {
  type ResidentNotice,
} from "@/components/pdf/resident-notice-pdf";
import { createClient } from "@/lib/server";

export const runtime = "nodejs";

// Validation schema for ResidentNotice
const residentNoticeSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  apartment: z.string().min(1, "Apartment is required").max(20, "Apartment too long"),
  building: z.string().min(1, "Building is required").max(20, "Building too long"),
  day: z.string().min(1, "Day is required").max(50, "Day too long"),
  time: z.string().min(1, "Time is required").max(20, "Time too long"),
});

// Validation schema for request body
const requestBodySchema = z.object({
  notices: z.array(residentNoticeSchema).min(1, "At least one notice is required"),
});

export async function POST(request: Request) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    
    if (error || !data?.claims) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }
    
    const body = await request.json();
    
    // Validate request body
    const validatedData = requestBodySchema.parse(body);
    
    // Type assertion for our validated data
    const notices = validatedData.notices as ResidentNotice[];

    const document = createElement(ResidentNoticePdf, {
      notices: notices,
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