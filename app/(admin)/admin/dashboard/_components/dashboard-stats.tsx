import { SectionCards } from "@/components/admin/section-cards"
import { getMenagesOfMonth } from "../../_lib/queries"

export async function DashboardStats() {
  const rows = await getMenagesOfMonth()
  const total = rows.length
  const done = rows.filter((m) => m.statut === "COMPLETED").length
  const cancelled = rows.filter((m) => m.statut === "CANCELLED").length
  const pending = total - done - cancelled
  const rate = total > 0 ? Math.round((done / total) * 100) : 0
  const activeAgents = new Set(
    rows.map((m) => m.agents?.name).filter(Boolean),
  ).size

  return (
    <SectionCards
      cards={[
        {
          title: "Ménages du mois",
          value: total,
          icon: "calendar",
          hint: `${activeAgents} agent${activeAgents > 1 ? "s" : ""} impliqué${activeAgents > 1 ? "s" : ""}`,
        },
        {
          title: "Terminés",
          value: done,
          icon: "check",
          tone: "success",
          hint: `${rate}% d'avancement`,
        },
        { title: "En attente", value: pending, icon: "clock", tone: "warning" },
        { title: "Annulés", value: cancelled, icon: "x", tone: "danger" },
      ]}
    />
  )
}