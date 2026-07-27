import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ ok: true })

  // Not httpOnly on purpose: this holds no real session, just a flag and
  // fake demo profile data, and client components read it via document.cookie
  // to decide whether to load demo data instead of hitting Supabase.
  response.cookies.set("demo_user", JSON.stringify({
    id: "demo-user-id",
    email: "demo@canetaos.com",
    full_name: "Usuário Demo",
  }), {
    path: "/",
    httpOnly: false,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
  })

  response.cookies.set("demo_auth", "true", {
    path: "/",
    httpOnly: false,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
  })

  return response
}
