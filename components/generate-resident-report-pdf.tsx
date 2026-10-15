"use client"

import * as React from "react"
import { FileText } from "lucide-react"

import { Button } from "@/components/ui/button"

export interface GenerateResidentReportPdfProps {
  /** Si vide/omis → rapport global sur tous les résidents */
  residentIds?: string[]
  /** 1-12 */
  month: number
  year: number
  disabled?: boolean
  label?: string
}

export default function GenerateResidentReportPdf({
  residentIds,
  month,
  year,
  disabled = false,
  label,
}: GenerateResidentReportPdfProps) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const isSingle = residentIds?.length === 1

  async function handleClick() {
    if (loading) return

    try {
      setLoading(true)
      setError(null)

      const res = await fetch("/api/pdf/resident-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ residentIds, month, year }),
      })

      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(
          payload?.error ?? "Impossible de générer le rapport.",
        )
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = isSingle
        ? `rapport-menage-${month}-${year}.pdf`
        : `rapports-menage-${month}-${year}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
      setError(
        e instanceof Error ? e.message : "Erreur inconnue",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        disabled={disabled || loading}
      >
        <FileText className="mr-2 h-4 w-4" />
        {loading
          ? "Génération…"
          : label ??
            (isSingle
              ? "Rapport mensuel"
              : residentIds?.length
                ? `Rapports mensuels (${residentIds.length})`
                : "Rapport mensuel global")}
      </Button>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}