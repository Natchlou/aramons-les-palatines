import { createClient } from "@/lib/server"
import type {
  ResidentMonthlyReport,
  ResidentMonthlyReportCleaning,
} from "@/components/pdf/resident-monthly-report-pdf"

interface BuildOptions {
  /** Si vide ou omis → tous les résidents */
  residentIds?: string[]
  month: number
  year: number
}

export async function buildResidentMonthlyReports({
  residentIds,
  month,
  year,
}: BuildOptions): Promise<ResidentMonthlyReport[]> {
  const supabase = await createClient()

  // Sécurité : `.in()` avec un tableau vide ne renvoie rien.
  if (residentIds && residentIds.length === 0) {
    return []
  }

  // --- Résidents ---
  let residentsQuery = supabase
    .from("residents")
    .select("id, first_name, last_name, prefix, room, building")
    .order("room", { ascending: true })

  if (residentIds && residentIds.length > 0) {
    residentsQuery = residentsQuery.in("id", residentIds)
  }

  const { data: residents, error: residentsError } = await residentsQuery
  if (residentsError) throw residentsError
  if (!residents || residents.length === 0) return []

  // --- Ménages de la période ---
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(
    lastDay,
  ).padStart(2, "0")}`

  const { data: cleanings, error: cleaningsError } = await supabase
    .from("recents_menages")
    .select(
      "id, resident_id, date, heure, statut, started_at, completed_at",
    )
    .in(
      "resident_id",
      residents.map((r) => r.id),
    )
    .gte("date", startDate)
    .lte("date", endDate)

  if (cleaningsError) throw cleaningsError

  // --- Regroupement ---
  const cleaningsByResident = new Map<string, NonNullable<typeof cleanings>>()

  for (const c of cleanings ?? []) {
    if (!c.resident_id) continue
    const arr = cleaningsByResident.get(c.resident_id) ?? []
    arr.push(c)
    cleaningsByResident.set(c.resident_id, arr)
  }

  return residents.map((r) => {
    const fullName =
      [r.prefix, r.first_name, r.last_name]
        .filter(Boolean)
        .join(" ")
        .trim() || "Résident"

    const list: ResidentMonthlyReportCleaning[] = (
      cleaningsByResident.get(r.id) ?? []
    ).map((c) => ({
      id: c.id,
      date: c.date ?? "",
      time: c.heure ?? "",
      status: (c.statut ??
        "PENDING") as ResidentMonthlyReportCleaning["status"],
      startedAt: c.started_at,
      completedAt: c.completed_at,
    }))

    return {
      resident: {
        id: r.id,
        name: fullName,
        room: r.room,
        building: r.building,
      },
      period: { month, year },
      cleanings: list,
    }
  })
}