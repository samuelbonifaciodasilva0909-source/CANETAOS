import { createServerClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"

function isDemoMode(request: NextRequest): boolean {
  return request.cookies.get("demo_auth")?.value === "true"
}

function getDemoUser(request: NextRequest) {
  const demoUserCookie = request.cookies.get("demo_user")?.value
  if (!demoUserCookie) return null
  try {
    return JSON.parse(demoUserCookie)
  } catch {
    return null
  }
}

/** Any paid purchase or active/trialing subscription counts as paid access — see [[funnel-monetization]]. */
async function hasPaidAccess(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const [{ count: purchaseCount }, { count: subCount }] = await Promise.all([
    supabase.from("purchases").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "paid"),
    supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("user_id", userId).in("status", ["active", "trialing"]),
  ])
  return (purchaseCount || 0) > 0 || (subCount || 0) > 0
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const isDemo = isDemoMode(request)
  const demoUser = getDemoUser(request)

  let realUser = null
  let supabase: SupabaseClient | null = null

  if (!isDemo) {
    try {
      supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) =>
                request.cookies.set(name, value)
              )
              supabaseResponse = NextResponse.next({
                request,
              })
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              )
            },
          },
        }
      )

      const { data } = await supabase.auth.getUser()
      realUser = data.user
    } catch {
      // Supabase not configured, continue without auth
    }
  }

  const user = isDemo ? demoUser : realUser
  const pathname = request.nextUrl.pathname

  const publicPaths = ["/", "/login", "/register", "/forgot-password", "/reset-password"]
  const isPublicPath = publicPaths.includes(pathname)

  const protectedPrefixes = ["/app", "/settings", "/billing", "/admin"]
  const isProtectedPath = protectedPrefixes.some((prefix) => pathname.startsWith(prefix))

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  // Paywall: no free navigable preview of the product. Demo mode and /admin
  // (internal, role-gated separately) are exempt — everything else under
  // /app or /billing requires at least one paid purchase or active subscription.
  const paywalledPrefixes = ["/app", "/billing"]
  const isPaywalledPath = paywalledPrefixes.some((prefix) => pathname.startsWith(prefix))

  if (isPaywalledPath && realUser && !isDemo && supabase) {
    const paid = await hasPaidAccess(supabase, realUser.id)
    if (!paid) {
      const url = request.nextUrl.clone()
      url.pathname = "/checkout"
      return NextResponse.redirect(url)
    }
  }

  if (user && isPublicPath && pathname !== "/") {
    const url = request.nextUrl.clone()
    url.pathname = "/app"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
