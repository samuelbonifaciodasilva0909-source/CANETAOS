import { NextResponse } from "next/server"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getPaymentProvider } from "@/lib/payments"
import { productSlugFromExternalId } from "@/lib/payments/cakto"
import { createAdminClient } from "@/lib/supabase/admin"
import type { WebhookEvent } from "@/lib/payments/provider"
import type { ProductSlug } from "@/types"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Corpo inválido" }, { status: 400 })

  const provider = getPaymentProvider()
  const event = provider.parseWebhook({ headers: request.headers, body })

  if (!event) {
    return NextResponse.json({ error: "Assinatura de webhook inválida" }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { data: existing } = await supabase
    .from("webhook_events")
    .select("id")
    .eq("provider", "cakto")
    .eq("event_id", event.eventId)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ received: true, deduped: true })
  }

  await supabase.from("webhook_events").insert({
    provider: "cakto",
    event_id: event.eventId,
    event_type: event.type,
    payload: event.raw,
    processed: false,
  })

  try {
    await processEvent(supabase, event)
  } catch (err) {
    console.error("Webhook Cakto: falha ao processar evento", event.eventId, err)
    // Ack anyway — Cakto would otherwise retry forever, and the raw
    // payload is already stored above (processed: false) for replay.
    return NextResponse.json({ received: true, error: "processing_failed" })
  }

  await supabase
    .from("webhook_events")
    .update({ processed: true })
    .eq("provider", "cakto")
    .eq("event_id", event.eventId)

  return NextResponse.json({ received: true })
}

async function processEvent(supabase: SupabaseClient, event: WebhookEvent) {
  const productSlug = productSlugFromExternalId(event.externalProductId)
  if (!productSlug) {
    console.error(
      `Webhook Cakto: produto externo "${event.externalProductId}" sem mapeamento — configure CAKTO_PRODUCT_ID_* no .env`
    )
    return
  }

  if (productSlug === "plus_subscription") {
    await processSubscriptionEvent(supabase, event)
  } else {
    await processPurchaseEvent(supabase, event, productSlug)
  }
}

async function processSubscriptionEvent(supabase: SupabaseClient, event: WebhookEvent) {
  if (event.providerSubscriptionId) {
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("provider", "cakto")
      .eq("provider_subscription_id", event.providerSubscriptionId)
      .maybeSingle()

    if (existingSub) {
      await supabase
        .from("subscriptions")
        .update({ status: mapSubscriptionStatus(event.status), updated_at: new Date().toISOString() })
        .eq("id", existingSub.id)
      return
    }
  }

  if (event.status !== "paid" || !event.customerEmail) return

  const userId = await findOrCreateUser(supabase, event.customerEmail, event.customerName)
  await supabase.from("subscriptions").insert({
    user_id: userId,
    provider: "cakto",
    provider_subscription_id: event.providerSubscriptionId || event.providerPaymentId,
    status: "active",
  })
}

async function processPurchaseEvent(supabase: SupabaseClient, event: WebhookEvent, productSlug: ProductSlug) {
  if (event.providerPaymentId) {
    const { data: existingPurchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("provider", "cakto")
      .eq("provider_payment_id", event.providerPaymentId)
      .maybeSingle()

    if (existingPurchase) {
      await supabase
        .from("purchases")
        .update({
          status: mapPurchaseStatus(event.status),
          paid_at: event.status === "paid" ? new Date().toISOString() : null,
        })
        .eq("id", existingPurchase.id)
      return
    }
  }

  if (event.status !== "paid" || !event.customerEmail) return

  const { data: product } = await supabase.from("products").select("id, price_cents").eq("slug", productSlug).single()
  if (!product) {
    console.error(`Webhook Cakto: produto interno "${productSlug}" não encontrado na tabela products`)
    return
  }

  const userId = await findOrCreateUser(supabase, event.customerEmail, event.customerName)
  await supabase.from("purchases").insert({
    user_id: userId,
    product_id: product.id,
    provider: "cakto",
    provider_payment_id: event.providerPaymentId,
    amount_cents: product.price_cents,
    status: "paid",
    paid_at: new Date().toISOString(),
  })
}

function mapSubscriptionStatus(status: WebhookEvent["status"]): string {
  if (status === "paid") return "active"
  if (status === "canceled" || status === "refunded") return "canceled"
  return "past_due"
}

function mapPurchaseStatus(status: WebhookEvent["status"]): string {
  if (status === "paid") return "paid"
  if (status === "refunded") return "refunded"
  if (status === "canceled") return "failed"
  return "pending"
}

/** Finds the CanetaOS user for this email, or provisions one and sends
 * a Supabase invite email so they can set a password and log in — Cakto
 * payment links are sold outside the app, so most buyers won't have an
 * account yet. Requires Supabase's SMTP/email templates to be configured
 * for the invite email to actually be delivered. */
async function findOrCreateUser(supabase: SupabaseClient, email: string, name?: string): Promise<string> {
  const existingId = await findUserIdByEmail(supabase, email)
  if (existingId) return existingId

  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: { full_name: name || null },
    redirectTo: `${SITE_URL}/login`,
  })

  if (error || !data?.user) {
    // Already-registered races (e.g. concurrent webhooks) fall back to lookup.
    const fallbackId = await findUserIdByEmail(supabase, email)
    if (fallbackId) return fallbackId
    throw new Error(`Não foi possível criar/convidar usuário "${email}": ${error?.message}`)
  }

  await supabase.from("profiles").insert({
    id: data.user.id,
    full_name: name || null,
    onboarding_completed: false,
  })

  return data.user.id
}

/** supabase-js's admin listUsers doesn't take an email filter in every
 * version, so this paginates defensively — fine at this app's scale. */
async function findUserIdByEmail(supabase: SupabaseClient, email: string): Promise<string | null> {
  const target = email.toLowerCase()
  const perPage = 200
  for (let page = 1; page <= 25; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
    if (error || !data?.users?.length) break
    const found = data.users.find((u) => u.email?.toLowerCase() === target)
    if (found) return found.id
    if (data.users.length < perPage) break
  }
  return null
}
