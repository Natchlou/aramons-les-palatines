import type { User } from "@supabase/supabase-js"

export type SidebarUser = {
  name: string
  email: string
  avatar: string
}

/**
 * Extrait un profil affichable depuis un User Supabase.
 * Robuste : gère full_name / name / display_name / email / avatar_url.
 */
export function toSidebarUser(user: User | null): SidebarUser {
  if (!user) {
    return { name: "Invité", email: "", avatar: "/default.png" }
  }

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>

  const fullName =
    (typeof meta.full_name === "string" && meta.full_name.trim()) ||
    (typeof meta.name === "string" && meta.name.trim()) ||
    (typeof meta.display_name === "string" && meta.display_name.trim()) ||
    (typeof user.email === "string" && user.email.split("@")[0]) ||
    "Utilisateur"

  const avatar =
    (typeof meta.avatar_url === "string" && meta.avatar_url) ||
    (typeof meta.picture === "string" && meta.picture) ||
    "/default.png"

  return {
    name: fullName,
    email: user.email ?? "",
    avatar,
  }
}

/** Pour le greeting : "Bonjour, Guillaume" → ne garde que le prénom. */
export function firstNameOf(name: string): string {
  return name.trim().split(/\s+/)[0] || "à vous"
}