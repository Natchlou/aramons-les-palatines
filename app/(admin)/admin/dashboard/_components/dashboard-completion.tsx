import { CompletionCard } from "@/components/admin/completion-card"
import { getMenagesOfMonth } from "../../_lib/queries"

export async function DashboardCompletion() {
  const rows = await getMenagesOfMonth()
  const total = rows.length
  const done = rows.filter((m) => m.statut === "COMPLETED").length
  const cancelled = rows.filter((m) => m.statut === "CANCELLED").length
  const pending = total - done - cancelled
  const rate = total > 0 ? Math.round((done / total) * 100) : 0
  return <CompletionCard done={done} pending={pending} cancelled={cancelled} rate={rate} />
}