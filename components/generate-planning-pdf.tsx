"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, ChevronDown } from "lucide-react"

export interface GeneratePlanningPdfProps {
  /** ID de la ligne `planning` en DB. */
  planningId: number
  /** Année du planning (pour le nom du fichier). */
  year: number
  /** Mois 1-12 du planning (pour le nom du fichier). */
  month: number
  /**
   * Agent ciblé. Si omis, on génère un PDF global (tous agents confondus).
   * Si `agents` est fourni ET `agent` est omis, un menu déroulant apparaît.
   */
  agent?: string
  /** Liste optionnelle d'agents pour activer le menu multi-téléchargement. */
  agents?: string[]
  disabled?: boolean
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function fileName(year: number, month: number, agent?: string): string {
  const m = String(month).padStart(2, "0")
  const base = `planning-menage-${year}-${m}`
  return agent ? `${base}-${slugify(agent)}.pdf` : `${base}.pdf`
}

// ─── Téléchargement bas niveau ──────────────────────────────────────────────

async function fetchPdfBlob(
  planningId: number,
  agent: string | undefined,
): Promise<Blob> {
  const response = await fetch("/api/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ planningId, agent }),
  })

  if (!response.ok) {
    let message = "Impossible de générer le PDF."
    try {
      const data = await response.json()
      if (typeof data?.error === "string") message = data.error
    } catch {
      // Réponse non-JSON
    }
    throw new Error(message)
  }

  return response.blob()
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

// ─── Composant principal ────────────────────────────────────────────────────

export default function GeneratePlanningPdf({
  planningId,
  year,
  month,
  agent,
  agents,
  disabled = false,
}: GeneratePlanningPdfProps) {
  const [loading, setLoading] = React.useState(false)
  const [batchProgress, setBatchProgress] = React.useState<string | null>(null)

  // ─── Cas 1 : menu déroulant (plusieurs agents) ────────────────────────────
  const hasAgentMenu = !!agents && agents.length > 0 && !agent

  // ─── Téléchargement simple ────────────────────────────────────────────────
  async function handleSingle(agentName?: string) {
    if (loading || disabled) return

    try {
      setLoading(true)
      const blob = await fetchPdfBlob(planningId, agentName)
      triggerDownload(blob, fileName(year, month, agentName))
    } catch (error) {
      console.error("Erreur lors de la génération du PDF :", error)
      window.alert(
        error instanceof Error ? error.message : "Impossible de générer le PDF.",
      )
    } finally {
      setLoading(false)
    }
  }

  // ─── Téléchargement batch (tous les agents + global) ─────────────────────
  async function handleBatch(agentList: string[]) {
    if (loading || disabled) return

    try {
      setLoading(true)
      let done = 0

      // PDF global (sans filtre agent)
      setBatchProgress(`Global (${done + 1}/${agentList.length + 1})`)
      const globalBlob = await fetchPdfBlob(planningId, undefined)
      triggerDownload(globalBlob, fileName(year, month))
      done++

      // Un PDF par agent
      for (const a of agentList) {
        setBatchProgress(`${a} (${done + 1}/${agentList.length + 1})`)
        const blob = await fetchPdfBlob(planningId, a)
        triggerDownload(blob, fileName(year, month, a))
        done++

        // Petite pause pour éviter de spammer le navigateur
        await new Promise((r) => setTimeout(r, 150))
      }
    } catch (error) {
      console.error("Erreur lors de la génération des PDFs :", error)
      window.alert(
        error instanceof Error ? error.message : "Impossible de générer les PDFs.",
      )
    } finally {
      setLoading(false)
      setBatchProgress(null)
    }
  }

  // ─── Rendu ────────────────────────────────────────────────────────────────

  // Cas 1 : plusieurs agents → menu déroulant
  if (hasAgentMenu) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button type="button" variant={'outline'} disabled={disabled || loading}/>}>
            <Download className="mr-2 h-4 w-4" />
            {loading
              ? batchProgress ?? "Génération..."
              : "Exporter en PDF"}
            <ChevronDown className="ml-2 h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Exporter</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => handleSingle(undefined)}>
            📄 Planning global
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Par agent
          </DropdownMenuLabel>

          {agents.map((a) => (
            <DropdownMenuItem key={a} onClick={() => handleSingle(a)}>
              👤 {a}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleBatch(agents)}>
            📦 Tout télécharger ({agents.length + 1} PDFs)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Cas 2 : un agent unique ou global
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => handleSingle(agent)}
      disabled={disabled || loading}
    >
      <Download className="mr-2 h-4 w-4" />
      {loading ? "Génération..." : "Exporter en PDF"}
    </Button>
  )
}