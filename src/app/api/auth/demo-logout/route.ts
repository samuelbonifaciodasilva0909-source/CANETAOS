import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ ok: true })

  response.cookies.delete("demo_user")
  response.cookies.delete("demo_auth")

  return response
}
