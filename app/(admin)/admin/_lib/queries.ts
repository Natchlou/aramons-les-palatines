import { cache } from "react"
import { createClient } from "@/lib/server"
import type { MenageRow } from "@/components/menages-by-agent"
import { toISODate } from "@/components/admin/menage-utils"
import { RawMenageRow, toMenageRows } from "@/lib/menages"

/**
 * Utilisateur courant (dédupliqué par requête grâce à cache()).
 * Retourne null si non authentifié.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  return data.user
})

/**
 * Ménages du mois courant, filtrés sur type="menage".
 * cache() → un seul aller-retour Supabase même si 5 composants l'appellent.
 */
export const getMenagesOfMonth = cache(async (): Promise<MenageRow[]> => {
  const supabase = await createClient()
  const now = new Date()
  const monthStart = toISODate(new Date(now.getFullYear(), now.getMonth(), 1))
  const monthEnd = toISODate(new Date(now.getFullYear(), now.getMonth() + 1, 1))

  const { data, error } = await supabase
    .from("recents_menages")
    .select(`
      id, date, heure, duration_minutes, statut, details,
      residents ( first_name, last_name, room, building ),
      agents ( name )
    `)
    .eq("type", "menage")
    .gte("date", monthStart)
    .lt("date", monthEnd)
    .order("date", { ascending: true })
    .order("heure", { ascending: true })

  if (error) throw error
  return toMenageRows(data as RawMenageRow[] | null)
})