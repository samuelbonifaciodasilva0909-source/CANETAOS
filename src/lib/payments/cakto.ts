import type { PaymentProvider, WebhookEvent } from "./provider"
import type { ProductSlug } from "@/types"

/** Cakto sells through pre-made payment links configured in their
 * dashboard, not a create-charge API — so "checkout" here just resolves
 * the static link for the product instead of calling out to Cakto. */
const CHECKOUT_URL_ENV: Record<ProductSlug, string> = {
  frontend: "CAKTO_CHECKOUT_URL_FRONTEND",
  recipes_bump: "CAKTO_CHECKOUT_URL_RECIPES_BUMP",
  desmame: "CAKTO_CHECKOUT_URL_DESMAME",
  plus_subscription: "CAKTO_CHECKOUT_URL_PLUS_SUBSCRIPTION",
}

function checkoutUrlFor(productSlug: ProductSlug, email?: string): string {
  const envVar = CHECKOUT_URL_ENV[productSlug]
  const base = envVar && process.env[envVar]
  if (!base) {
    throw new Error(`Link de pagamento da Cakto não configurado para "${productSlug}" (defina ${envVar} no .env)`)
  }
  try {
    const url = new URL(base)
    if (email) url.searchParams.set("email", email)
    return url.toString()
  } catch {
    return base
  }
}

/** Maps Cakto's `data.product.id` (a stable id per product in their
 * dashboard) to our internal ProductSlug. Fill these env vars once the
 * real product ids are known — see CAKTO_PRODUCT_ID_* in .env.example. */
export function productSlugFromExternalId(externalId: string | undefined): ProductSlug | null {
  if (!externalId) return null
  const entries: Array<[string | undefined, ProductSlug]> = [
    [process.env.CAKTO_PRODUCT_ID_FRONTEND, "frontend"],
    [process.env.CAKTO_PRODUCT_ID_RECIPES_BUMP, "recipes_bump"],
    [process.env.CAKTO_PRODUCT_ID_DESMAME, "desmame"],
    [process.env.CAKTO_PRODUCT_ID_PLUS_SUBSCRIPTION, "plus_subscription"],
  ]
  const match = entries.find(([id]) => !!id && id === externalId)
  return match ? match[1] : null
}

interface CaktoWebhookPayload {
  secret?: string
  event?: string
  data?: {
    id?: string
    customer?: { name?: string; email?: string }
    product?: { id?: string; name?: string }
    subscription?: { id?: string } | null
    status?: string
    paidAt?: string | null
    refundedAt?: string | null
    chargedbackAt?: string | null
    canceledAt?: string | null
  }
}

export const caktoProvider: PaymentProvider = {
  async createOneTimeCheckout({ productSlug, email }) {
    return { providerPaymentId: "", checkoutUrl: checkoutUrlFor(productSlug, email) }
  },

  async createSubscriptionCheckout({ productSlug, email }) {
    return { providerPaymentId: "", checkoutUrl: checkoutUrlFor(productSlug, email) }
  },

  async cancelSubscription() {
    throw new Error("Cancelamento de assinatura Cakto ainda não é feito por API — cancele pelo painel da Cakto.")
  },

  parseWebhook({ body }): WebhookEvent | null {
    const payload = body as CaktoWebhookPayload
    const expectedSecret = process.env.CAKTO_WEBHOOK_SECRET
    if (!expectedSecret || !payload.secret || payload.secret !== expectedSecret) {
      return null
    }

    const data = payload.data
    if (!data?.id || !payload.event) return null

    // Cakto's exact status/event vocabulary beyond "purchase_approved" /
    // status "paid" isn't fully confirmed yet, so status is derived mainly
    // from the timestamp fields we've verified exist on the payload —
    // that's more robust than matching exact strings we haven't observed.
    let status: WebhookEvent["status"] = "pending"
    if (data.chargedbackAt || data.refundedAt) status = "refunded"
    else if (data.canceledAt) status = "canceled"
    else if (data.status === "paid" || data.paidAt) status = "paid"

    return {
      eventId: `${payload.event}:${data.id}`,
      type: payload.event,
      providerPaymentId: data.id,
      providerSubscriptionId: data.subscription?.id,
      status,
      raw: payload as unknown as Record<string, unknown>,
      customerEmail: data.customer?.email,
      customerName: data.customer?.name,
      externalProductId: data.product?.id,
    }
  },
}
