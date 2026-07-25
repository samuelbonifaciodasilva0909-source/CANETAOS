import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ ok: true })

  response.cookies.set("demo_user", JSON.stringify({
    id: "demo-user-id",
    email: "demo@canetaos.com",
    full_name: "Usuário Demo",
  }), {
    path: "/",
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
  })

  response.cookies.set("demo_auth", "true", {
    path: "/",
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
  })

  return response
}
