import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

type Role = "admin" | "manager" | "agent"

const PUBLIC_ROUTES = [
  "/login",
  "/unauthorized",
]

const ROUTE_ROLES: Record<string, Role[]> = {
  "/admin": ["admin"],
  "/planning": ["admin", "manager"],
  "/cleaning": ["admin", "manager", "agent"],
}

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some(
    (route) =>
      pathname === route || pathname.startsWith(`${route}/`),
  )
}

function getRequiredRoles(pathname: string) {
  const matchingRoute = Object.keys(ROUTE_ROLES)
    .sort((a, b) => b.length - a.length)
    .find(
      (route) =>
        pathname === route || pathname.startsWith(`${route}/`),
    )

  return matchingRoute ? ROUTE_ROLES[matchingRoute] : null
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })

          response = NextResponse.next({
            request,
          })

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  /*
   * Important :
   * getUser() vérifie réellement la session auprès de Supabase.
   * Évite de faire confiance uniquement aux données présentes
   * dans le cookie JWT.
   */
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  /*
   * Routes publiques
   */
  if (isPublicRoute(pathname)) {
    return response
  }

  /*
   * Route nécessitant un rôle particulier
   */
  const requiredRoles = getRequiredRoles(pathname)

  /*
   * Si la route n'est pas protégée par un rôle,
   * on laisse simplement passer.
   */
  if (!requiredRoles) {
    return response
  }

  /*
   * Pas connecté
   */
  if (!user) {
    const loginUrl = new URL("/login", request.url)

    loginUrl.searchParams.set(
      "redirect",
      pathname,
    )

    return NextResponse.redirect(loginUrl)
  }

  /*
   * Récupération du rôle depuis profiles
   */
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  /*
   * Profil inexistant ou erreur Supabase
   */
  if (error || !profile) {
    console.error("Impossible de récupérer le profil :", error)

    return NextResponse.redirect(
      new URL("/unauthorized", request.url),
    )
  }

  const role = profile.role as Role

  /*
   * Vérification du rôle
   */
  if (!requiredRoles.includes(role)) {
    return NextResponse.redirect(
      new URL("/unauthorized", request.url),
    )
  }

  return response
}