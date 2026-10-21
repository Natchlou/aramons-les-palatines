import type { MenageRow } from "@/components/menages-by-agent"

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function addDays(d: Date, n: number): Date {
  const c = new Date(d)
  c.setDate(c.getDate() + n)
  return c
}

export function formatName(r: MenageRow["residents"]): string {
  if (!r) return "—"
  return [r.last_name, r.first_name].filter(Boolean).join(" ").trim() || "—"
}

export function statutLabel(s: string): string {
  switch (s) {
    case "COMPLETED": return "Terminé"
    case "CANCELLED": return "Annulé"
    case "PENDING":
    case "SCHEDULED": return "Prévu"
    case "IN_PROGRESS": return "En cours"
    default: return s
  }
}

export function statutVariant(s: string): "default" | "secondary" | "destructive" | "outline" {
  switch (s) {
    case "COMPLETED": return "default"
    case "CANCELLED": return "destructive"
    case "IN_PROGRESS": return "secondary"
    default: return "outline"
  }
}

/** "Aujourd'hui", "Demain", sinon "Mer. 14" */
export function relativeDayLabel(dateStr: string, todayISO: string): string {
  const today = new Date(todayISO)
  const target = new Date(dateStr)
  const diff = Math.round((target.getTime() - today.getTime()) / 86_400_000)
  if (diff === 0) return "Aujourd'hui"
  if (diff === 1) return "Demain"
  return new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric" }).format(target)
}