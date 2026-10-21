import type { MenageRow } from "@/components/menages-by-agent"

/** Forme brute renvoyée par Supabase (relations en tableaux). */
type RawResident = {
  first_name: string | null
  last_name: string | null
  room: string | null
  building: string | null
}

type RawAgent = { name: string }

export type RawMenageRow = {
  id: string
  date: string
  heure: string
  duration_minutes: number | null
  statut: string
  details: { label?: string } | null
  residents: RawResident[] | RawResident | null
  agents: RawAgent[] | RawAgent | null
}

/** Extrait le premier élément d'une relation Supabase (array ou objet). */
function firstOf<T>(rel: T[] | T | null | undefined): T | null {
  if (!rel) return null
  if (Array.isArray(rel)) return rel[0] ?? null
  return rel
}

export function toMenageRow(raw: RawMenageRow): MenageRow {
  return {
    id: raw.id,
    date: raw.date,
    heure: raw.heure,
    duration_minutes: raw.duration_minutes,
    statut: raw.statut,
    details: raw.details,
    residents: firstOf(raw.residents),
    agents: firstOf(raw.agents),
  }
}

export function toMenageRows(raw: RawMenageRow[] | null | undefined): MenageRow[] {
  return (raw ?? []).map(toMenageRow)
}