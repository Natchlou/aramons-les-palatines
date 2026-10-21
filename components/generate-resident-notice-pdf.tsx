"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"

export interface ResidentNoticePayload {
  name: string
  apartment: string
  building: string
  day: string
  time: string
}

export interface GenerateResidentNoticesProps {
  notices: ResidentNoticePayload[]
  disabled?: boolean
}

export default function GenerateResidentNotices({
  notices,
  disabled = false,
}: GenerateResidentNoticesProps) {
  const [loading, setLoading] = React.useState(false)

  async function handleGenerate() {
    if (loading || notices.length === 0) return

    try {
      setLoading(true)

      const res = await fetch("/api/pdf/resident-notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notices }),
      })

      if (!res.ok) {
        let message = "Impossible de générer les fiches."
        try {
          const d = await res.json()
          if (typeof d?.error === "string") message = d.error
        } catch {}
        throw new Error(message)
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = "fiches-menage.pdf"

      document.body.appendChild(a)
      a.click()
      a.remove()

      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
      window.alert(e instanceof Error ? e.message : "Erreur")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGenerate}
      disabled={disabled || loading || notices.length === 0}
    >
      <FileText className="mr-2 h-4 w-4" />
      {loading ? "Génération…" : `Fiches résidents (${notices.length})`}
    </Button>
  )
}