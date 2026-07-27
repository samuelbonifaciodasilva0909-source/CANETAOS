import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const cookieStore = await cookies()
  const demoAuth = cookieStore.get("demo_auth")?.value

  if (demoAuth === "true") {
    const demoUserCookie = cookieStore.get("demo_user")?.value
    if (demoUserCookie) {
      try {
        const user = JSON.parse(demoUserCookie)
        return NextResponse.json({ user })
      } catch {
        // ignore
      }
    }
    return NextResponse.json({ user: null })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ user: null })

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single()

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      full_name: (profile as { full_name: string | null } | null)?.full_name || null,
    },
  })
}
