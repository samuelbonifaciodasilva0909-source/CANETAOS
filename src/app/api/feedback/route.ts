import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from("feedback_entries").insert({
      user_id: user?.id || null,
      difficulty: body.difficulty || null,
      feature_request: body.featureRequest || null,
      willingness_to_pay: body.willingnessToPay || null,
    })

    if (error) {
      console.error("Feedback error:", error)
      return NextResponse.json({ ok: false }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
