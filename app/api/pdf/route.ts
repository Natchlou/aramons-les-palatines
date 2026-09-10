import { NextResponse } from "next/server";
import {
  renderToBuffer,
  type DocumentProps,
} from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import { z } from "zod";

import CleaningPlanningPdf, {
  type CleaningPlanningMonth,
  type CleaningPlanningMode,
} from "@/lib/pdf/cleaning-planning-pdf";

import { createClient } from "@/lib/server";

export const runtime = "nodejs";

/* -------------------------------------------------------------------------- */
/*                                   SCHEMAS                                  */
/* -------------------------------------------------------------------------- */

const cleaningTaskSchema = z.object({
  time: z
    .string()
    .min(1, "Time is required")
    .max(20, "Time too long"),

  resident: z
    .string()
    .min(1, "Resident is required")
    .max(200, "Resident too long"),

  room: z
    .string()
    .max(20, "Room too long")
    .optional(),

  building: z
    .string()
    .max(20, "Building too long")
    .optional(),

  type: z
    .enum([
      "menage",
      "hall",
      "plonge",
      "pause",
      "lavettes",
      "bureaux",
      "salle_animation",
    ])
    .optional(),
});

const dayAbsenceStatusSchema = z.object({
  type: z.enum([
    "conges",
    "maladie",
    "remplacement",
  ]),

  replacedBy: z
    .string()
    .max(200, "Name too long")
    .optional(),
});

const cleaningPlanningDaySchema = z.object({
  date: z
    .string()
    .min(1, "Date is required")
    .max(100, "Date too long"),

  tasks: z.array(cleaningTaskSchema),

  absence: dayAbsenceStatusSchema.optional(),
});

const cleaningPlanningWeekSchema = z.object({
  label: z
    .string()
    .min(1, "Week label is required")
    .max(200, "Week label too long"),

  days: z.array(cleaningPlanningDaySchema),
});

const cleaningPlanningMonthSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(300, "Title too long"),

  subtitle: z
    .string()
    .max(300, "Subtitle too long")
    .optional(),

  agent: z
    .string()
    .min(1, "Agent is required")
    .max(200, "Agent too long"),

  weeks: z
    .array(cleaningPlanningWeekSchema)
    .min(1, "At least one week is required"),
});

/* -------------------------------------------------------------------------- */
/*                              REQUEST SCHEMA                                */
/* -------------------------------------------------------------------------- */

const requestBodySchema = z.object({
  planningId: z.coerce.number().int().positive(),

  mode: z
    .enum(["weekly", "monthly"])
    .optional()
    .default("weekly"),
});

/* -------------------------------------------------------------------------- */
/*                                    POST                                    */
/* -------------------------------------------------------------------------- */

export async function POST(request: Request) {
  try {
    /* ---------------------------------------------------------------------- */
    /*                              AUTHENTICATION                            */
    /* ---------------------------------------------------------------------- */

    const supabase = await createClient();

    const { data: authData, error: authError } =
      await supabase.auth.getClaims();

    if (authError || !authData?.claims) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    /* ---------------------------------------------------------------------- */
    /*                              REQUEST BODY                              */
    /* ---------------------------------------------------------------------- */

    const body = await request.json();

    const { planningId, mode } =
      requestBodySchema.parse(body);

    /* ---------------------------------------------------------------------- */
    /*                             GET PLANNING                                */
    /* ---------------------------------------------------------------------- */

    const { data: row, error: planningError } =
      await supabase
        .from("planning")
        .select("id, data")
        .eq("id", planningId)
        .single();

    if (planningError) {
      console.error(
        "Planning fetch error:",
        planningError,
      );

      return NextResponse.json(
        {
          error: "Impossible de récupérer le planning",
          details: planningError.message,
        },
        { status: 500 },
      );
    }

    if (!row) {
      return NextResponse.json(
        { error: "Planning introuvable" },
        { status: 404 },
      );
    }

    /* ---------------------------------------------------------------------- */
    /*                            VALIDATE PLANNING                            */
    /* ---------------------------------------------------------------------- */

    const planning =
      cleaningPlanningMonthSchema.parse(
        row.data,
      ) as CleaningPlanningMonth;

    /* ---------------------------------------------------------------------- */
    /*                              CREATE PDF                                 */
    /* ---------------------------------------------------------------------- */

    const document = createElement(
      CleaningPlanningPdf,
      {
        planning,
        mode: mode as CleaningPlanningMode,
      },
    ) as unknown as ReactElement<DocumentProps>;

    const pdf = await renderToBuffer(document);

    /* ---------------------------------------------------------------------- */
    /*                               RESPONSE                                  */
    /* ---------------------------------------------------------------------- */

    return new NextResponse(
      new Uint8Array(pdf),
      {
        status: 200,

        headers: {
          "Content-Type": "application/pdf",

          "Content-Disposition":
            'inline; filename="planning-menage.pdf"',

          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("PDF ERROR:", error);

    /* ---------------------------------------------------------------------- */
    /*                              ZOD ERRORS                                */
    /* ---------------------------------------------------------------------- */

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: error.issues,
        },
        { status: 400 },
      );
    }

    /* ---------------------------------------------------------------------- */
    /*                              OTHER ERRORS                               */
    /* ---------------------------------------------------------------------- */

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 },
    );
  }
}