import { TodayAgenda } from "@/components/admin/today-agenda"
import { toISODate } from "@/components/admin/menage-utils"
import { getMenagesOfMonth } from "../../_lib/queries"

export async function DashboardToday() {
  const rows = await getMenagesOfMonth()
  const today = toISODate(new Date())
  const todayRows = rows.filter((m) => m.date === today)
  return <TodayAgenda menages={todayRows} />
}