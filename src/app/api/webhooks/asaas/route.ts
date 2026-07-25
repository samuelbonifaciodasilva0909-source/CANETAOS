import { NextResponse } from "next/server"
import { getPaymentProvider } from "@/lib/payments"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  const body = await request.json()
  const provider = getPaymentProvider()
  const event = provider.parseWebhook({ headers: request.headers, body })

  if (!event) {
    return NextResponse.json({ error: "Assinatura de webhook inválida" }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { data: existing } = await supabase
    .from("webhook_events")
    .select("id")
    .eq("provider", "asaas")
    .eq("event_id", event.eventId)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ received: true, deduped: true })
  }

  await supabase.from("webhook_events").insert({
    provider: "asaas",
    event_id: event.eventId,
    event_type: event.type,
    payload: event.raw,
    processed: false,
  })

  if (event.providerPaymentId) {
    await supabase
      .from("purchases")
      .update({
        status: event.status === "paid" ? "paid" : event.status === "refunded" ? "refunded" : "pending",
        paid_at: event.status === "paid" ? new Date().toISOString() : null,
      })
      .eq("provider", "asaas")
      .eq("provider_payment_id", event.providerPaymentId)
  }

  if (event.providerSubscriptionId) {
    await supabase
      .from("subscriptions")
      .update({
        status: event.status === "paid" ? "active" : event.status === "canceled" ? "canceled" : "past_due",
        updated_at: new Date().toISOString(),
      })
      .eq("provider", "asaas")
      .eq("provider_subscription_id", event.providerSubscriptionId)
  }

  await supabase
    .from("webhook_events")
    .update({ processed: true })
    .eq("provider", "asaas")
    .eq("event_id", event.eventId)

  return NextResponse.json({ received: true })
}
