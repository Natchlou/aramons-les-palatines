"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"

interface GeneratePlanningPdfProps {
  planningId: number
  agent: string
  disabled?: boolean
}

export default function GeneratePlanningPdf({
  planningId,
  agent,
  disabled = false,
}: GeneratePlanningPdfProps) {
  const [loading, setLoading] = React.useState(false)

  async function handleGenerate() {
    if (loading || disabled) {
      return
    }

    try {
      setLoading(true)

      const response = await fetch("/api/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planningId,
          agent,
        }),
      })

      if (!response.ok) {
        let message = "Impossible de générer le PDF."

        try {
          const data = await response.json()

          if (typeof data?.error === "string") {
            message = data.error
          }
        } catch {
          // La réponse n'est probablement pas du JSON.
        }

        throw new Error(message)
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = `planning-menage-${agent
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")}.pdf`

      document.body.appendChild(link)
      link.click()
      link.remove()

      URL.revokeObjectURL(url)
    } catch (error) {
      console.error(
        "Erreur lors de la génération du PDF :",
        error,
      )

      window.alert(
        error instanceof Error
          ? error.message
          : "Impossible de générer le PDF.",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGenerate}
      disabled={disabled || loading}
    >
      {loading ? "Génération..." : "Exporter en PDF"}
    </Button>
  )
}