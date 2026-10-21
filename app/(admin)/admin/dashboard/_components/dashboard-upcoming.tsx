import { UpcomingMenages } from "@/components/admin/upcoming-menages"
import { addDays, toISODate } from "@/components/admin/menage-utils"
import { getMenagesOfMonth } from "../../_lib/queries"

export async function DashboardUpcoming() {
  const rows = await getMenagesOfMonth()
  const now = new Date()
  const todayISO = toISODate(now)
  const weekEnd = toISODate(addDays(now, 7))
  const upcoming = rows.filter((m) => m.date > todayISO && m.date <= weekEnd)
  return <UpcomingMenages menages={upcoming} todayISO={todayISO} />
}