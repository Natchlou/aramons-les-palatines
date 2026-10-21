"use client"

import * as React from "react"
import { FileText, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export interface GenerateResidentReportPdfProps {
  /** Si vide/omis → rapport global sur tous les résidents */
  residentIds?: string[]
  /** Nom du résident, utilisé dans le nom du fichier quand un seul résident est ciblé */
  residentName?: string
  /** Mois proposé par défaut dans la modale (1-12). Défaut : mois courant. */
  month?: number
  /** Année proposée par défaut dans la modale. Défaut : année courante. */
  year?: number
  disabled?: boolean
  label?: string
}

const MONTHS = Array.from({ length: 12 }, (_, index) => ({
  value: index + 1,
  label: new Intl.DateTimeFormat("fr-FR", { month: "long" }).format(
    new Date(2000, index, 1),
  ),
}))

/** "Mme Dupont Éloïse" → "mme-dupont-eloise" */
function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

const SELECT_CLASSNAME =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm capitalize disabled:opacity-50"

export default function GenerateResidentReportPdf({
  residentIds,
  residentName,
  month,
  year,
  disabled = false,
  label,
}: GenerateResidentReportPdfProps) {
  const today = new Date()
  const defaultMonth = month ?? today.getMonth() + 1
  const defaultYear = year ?? today.getFullYear()

  const [open, setOpen] = React.useState(false)
  const [selectedMonth, setSelectedMonth] = React.useState(defaultMonth)
  const [selectedYear, setSelectedYear] = React.useState(defaultYear)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const isSingle = residentIds?.length === 1

  // 5 ans en arrière, 1 an en avant, en incluant toujours l'année par défaut.
  const years = React.useMemo(() => {
    const current = new Date().getFullYear()
    const list = new Set<number>([defaultYear])
    for (let y = current - 5; y <= current + 1; y++) list.add(y)
    return [...list].sort((a, b) => b - a)
  }, [defaultYear])

  function handleOpenChange(nextOpen: boolean) {
    if (loading) return

    if (nextOpen) {
      setSelectedMonth(defaultMonth)
      setSelectedYear(defaultYear)
      setError(null)
    }

    setOpen(nextOpen)
  }

  async function handleGenerate() {
    if (loading) return

    try {
      setLoading(true)
      setError(null)

      const res = await fetch("/api/pdf/resident-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          residentIds,
          month: selectedMonth,
          year: selectedYear,
        }),
      })

      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error ?? "Impossible de générer le rapport.")
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      const period = `${String(selectedMonth).padStart(2, "0")}-${selectedYear}`

      a.href = url
      const nameSlug = isSingle && residentName ? slugify(residentName) : ""

      a.download = isSingle
        ? `rapport-menage${nameSlug ? `-${nameSlug}` : ""}-${period}.pdf`
        : `rapports-menage-${period}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)

      setOpen(false)
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : "Erreur inconnue")
    } finally {
      setLoading(false)
    }
  }

  const triggerLabel =
    label ??
    (isSingle
      ? "Rapport mensuel"
      : residentIds?.length
        ? `Rapports mensuels (${residentIds.length})`
        : "Rapport mensuel global")

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button type="button" variant="outline" disabled={disabled} />}>
        <FileText className="mr-2 h-4 w-4" />
        {triggerLabel}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Générer un rapport mensuel</DialogTitle>
          <DialogDescription>
            Choisissez la période du rapport.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label htmlFor="report-month" className="text-sm font-medium">
              Mois
            </label>
            <select
              id="report-month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(Number(event.target.value))}
              disabled={loading}
              className={SELECT_CLASSNAME}
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="report-year" className="text-sm font-medium">
              Année
            </label>
            <select
              id="report-year"
              value={selectedYear}
              onChange={(event) => setSelectedYear(Number(event.target.value))}
              disabled={loading}
              className={SELECT_CLASSNAME}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button type="button" onClick={handleGenerate} disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            {loading ? "Génération…" : "Générer le PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}