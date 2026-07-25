import { NextResponse } from "next/server"
import { cookies } from "next/headers"

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
  }

  return NextResponse.json({ user: null })
}
