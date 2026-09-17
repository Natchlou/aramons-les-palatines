"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import type { MonthlyScheduleResponse } from "@/lib/planningService"

export interface ResidentNoticePayload {
  name: string
  apartment: string
  building: string
  day: string
  time: string
}

export interface GenerateResidentNoticesProps {
  schedule: MonthlyScheduleResponse
  disabled?: boolean
}

/**
 * Construit la liste des notices à partir du planning.
 * Une notice par tâche "menage".
 */
function buildNotices(schedule: MonthlyScheduleResponse): ResidentNoticePayload[] {
  const notices: ResidentNoticePayload[] = []

  for (const week of schedule.weeks) {
    for (const day of week.days) {
      for (const task of day.tasks) {
        if (task.type !== "menage") continue
        if (!task.resident || !task.room) continue

        notices.push({
          name: task.resident,
          apartment: task.room,
          building: task.building ?? "1",
          day: day.date,        // ex: "Lundi 5 octobre"
          time: task.time,      // ex: "10h00"
        })
      }
    }
  }

  return notices
}

export default function GenerateResidentNotices({
  schedule,
  disabled = false,
}: GenerateResidentNoticesProps) {
  const [loading, setLoading] = React.useState(false)

  const noticesCount = React.useMemo(() => {
    return buildNotices(schedule).length
  }, [schedule])

  async function handleGenerate() {
    if (loading) return

    try {
      setLoading(true)

      const notices = buildNotices(schedule)

      if (notices.length === 0) {
        window.alert("Aucune fiche à générer pour ce planning.")
        return
      }

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
      a.download = `fiches-menage-${schedule.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}.pdf`

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
      disabled={disabled || loading || noticesCount === 0}
    >
      <FileText className="mr-2 h-4 w-4" />
      {loading
        ? "Génération…"
        : `Fiches résidents (${noticesCount})`}
    </Button>
  )
}