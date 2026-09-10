import { NextResponse } from "next/server";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import { z } from "zod";

import CleaningPlanningPdf, {
  type CleaningPlanningMonth,
  type CleaningPlanningMode,
} from "@/lib/pdf/cleaning-planning-pdf";
import { createClient } from "@/lib/server";

export const runtime = "nodejs";

// Validation schemas for planning data
export const cleaningTaskSchema = z.object({
  time: z.string().min(1, "Time is required").max(20, "Time too long"),
  resident: z.string().min(1, "Resident is required").max(200, "Resident too long"),
  room: z.string().max(20, "Room too long").optional(),
  building: z.string().max(20, "Building too long").optional(),
  type: z.enum(["menage", "hall", "plonge", "pause", "lavettes", "bureaux", "salle_animation"]).optional(),
});

const dayAbsenceStatusSchema = z.object({
  type: z.enum(["conges", "maladie", "remplacement"]),
  replacedBy: z.string().max(200, "Name too long").optional(),
});

const cleaningPlanningDaySchema = z.object({
  date: z.string().min(1, "Date is required").max(100, "Date too long"),
  tasks: z.array(cleaningTaskSchema),
  absence: dayAbsenceStatusSchema.optional(),
});

const cleaningPlanningWeekSchema = z.object({
  label: z.string().min(1, "Week label is required").max(200, "Week label too long"),
  days: z.array(cleaningPlanningDaySchema),
});

const cleaningPlanningMonthSchema = z.object({
  title: z.string().min(1, "Title is required").max(300, "Title too long"),
  subtitle: z.string().max(300, "Subtitle too long").optional(),
  agent: z.string().min(1, "Agent is required").max(200, "Agent too long"),
  weeks: z.array(cleaningPlanningWeekSchema).min(1, "At least one week is required"),
});

// Validation schema for request body
const requestBodySchema = z.object({
  planning: cleaningPlanningMonthSchema,
  mode: z.enum(["weekly", "monthly"]).optional(),
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
    const planning = validatedData.planning as CleaningPlanningMonth;
    const mode = validatedData.mode as CleaningPlanningMode | undefined;

    const document = createElement(CleaningPlanningPdf, {
      planning: planning,
      mode: mode ?? "weekly",
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