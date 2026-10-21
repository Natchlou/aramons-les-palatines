import { getCurrentUser } from "../../_lib/queries"

function extractName(user: Awaited<ReturnType<typeof getCurrentUser>>): string {
  if (!user) return "à vous"
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>
  const raw =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    (typeof meta.display_name === "string" && meta.display_name) ||
    (typeof user.email === "string" && user.email.split("@")[0]) ||
    "à vous"
  return raw.trim()
}

function greetingForHour(h: number): string {
  if (h < 6) return "Bonne nuit"
  if (h < 12) return "Bonjour"
  if (h < 18) return "Bon après-midi"
  return "Bonsoir"
}

export async function DashboardGreeting() {
  const user = await getCurrentUser()
  const fullName = extractName(user)
  const firstName = fullName.split(/\s+/)[0]

  const now = new Date()
  const todayLabel = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now)
  const monthLabel = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(now)

  return (
    <header className="px-4 lg:px-6">
      <h1 className="text-3xl font-bold tracking-tight">
        {greetingForHour(now.getHours())}, {firstName} 👋
      </h1>
      <p className="mt-1 text-sm capitalize text-muted-foreground">
        {todayLabel} — {monthLabel}
      </p>
    </header>
  )
}