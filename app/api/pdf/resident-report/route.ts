import { NextResponse } from "next/server"
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import { createElement, type ReactElement } from "react"
import { z } from "zod"

import ResidentMonthlyReportPdf from "@/components/pdf/resident-monthly-report-pdf"
import { buildResidentMonthlyReports } from "@/lib/resident-report"
import { createClient } from "@/lib/server"

export const runtime = "nodejs"

const bodySchema = z.object({
  residentIds: z.array(z.string().min(1)).optional(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
})

function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export async function POST(request: Request) {
  try {
    // Auth
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getClaims()
    if (error || !data?.claims) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { residentIds, month, year } = bodySchema.parse(body)

    const reports = await buildResidentMonthlyReports({
      residentIds,
      month,
      year,
    })

    if (reports.length === 0) {
      return NextResponse.json(
        { error: "Aucun résident trouvé pour cette période." },
        { status: 404 },
      )
    }

    const document = createElement(ResidentMonthlyReportPdf, {
      reports,
    }) as unknown as ReactElement<DocumentProps>

    const pdf = await renderToBuffer(document)

    const filename =
      reports.length === 1
        ? `rapport-menage-${slug(reports[0].resident.name)}-${month}-${year}.pdf`
        : `rapports-menage-${month}-${year}.pdf`

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("[api/pdf/resident-report]", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}