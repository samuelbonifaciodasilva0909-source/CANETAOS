import type { PaymentProvider, CheckoutResult, WebhookEvent } from "./provider"
import type { ProductSlug } from "@/types"

const BASE_URL =
  process.env.ASAAS_ENV === "production"
    ? "https://api.asaas.com/v3"
    : "https://sandbox.asaas.com/api/v3"

function apiKey(): string {
  const key = process.env.ASAAS_API_KEY
  if (!key) throw new Error("ASAAS_API_KEY não configurada")
  return key
}

async function asaasFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      access_token: apiKey(),
      ...init?.headers,
    },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Asaas ${path} falhou (${res.status}): ${body}`)
  }
  return res.json() as Promise<T>
}

async function findOrCreateCustomer(params: {
  userId: string
  name: string
  email: string
}): Promise<string> {
  const existing = await asaasFetch<{ data: { id: string }[] }>(
    `/customers?email=${encodeURIComponent(params.email)}`
  )
  if (existing.data.length > 0) return existing.data[0].id

  const created = await asaasFetch<{ id: string }>("/customers", {
    method: "POST",
    body: JSON.stringify({
      name: params.name,
      email: params.email,
      externalReference: params.userId,
    }),
  })
  return created.id
}

function dueDateTomorrow(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split("T")[0]
}

async function createCharge(params: {
  customerId: string
  amountCents: number
  method: "PIX" | "CREDIT_CARD"
  description: string
  externalReference: string
}): Promise<CheckoutResult> {
  const payment = await asaasFetch<{ id: string; invoiceUrl: string }>("/payments", {
    method: "POST",
    body: JSON.stringify({
      customer: params.customerId,
      billingType: params.method,
      value: params.amountCents / 100,
      dueDate: dueDateTomorrow(),
      description: params.description,
      externalReference: params.externalReference,
    }),
  })

  if (params.method === "PIX") {
    const pix = await asaasFetch<{ encodedImage: string; payload: string }>(
      `/payments/${payment.id}/pixQrCode`
    )
    return {
      providerPaymentId: payment.id,
      pixQrCode: pix.encodedImage,
      pixCopyPaste: pix.payload,
    }
  }

  return { providerPaymentId: payment.id, checkoutUrl: payment.invoiceUrl }
}

export const asaasProvider: PaymentProvider = {
  async createOneTimeCheckout({ productSlug, userId, name, email, amountCents, method }) {
    const customerId = await findOrCreateCustomer({ userId, name, email })
    return createCharge({
      customerId,
      amountCents,
      method,
      description: `CanetaOS - ${productSlug}`,
      externalReference: `${userId}:${productSlug}`,
    })
  },

  async createSubscriptionCheckout({ productSlug, userId, name, email, amountCents, method }) {
    const customerId = await findOrCreateCustomer({ userId, name, email })
    const subscription = await asaasFetch<{ id: string }>("/subscriptions", {
      method: "POST",
      body: JSON.stringify({
        customer: customerId,
        billingType: method,
        value: amountCents / 100,
        nextDueDate: dueDateTomorrow(),
        cycle: "MONTHLY",
        description: `CanetaOS - ${productSlug}`,
        externalReference: `${userId}:${productSlug}`,
      }),
    })

    if (method === "PIX") {
      const payments = await asaasFetch<{ data: { id: string }[] }>(
        `/payments?subscription=${subscription.id}&status=PENDING`
      )
      const firstPayment = payments.data[0]
      if (firstPayment) {
        const pix = await asaasFetch<{ encodedImage: string; payload: string }>(
          `/payments/${firstPayment.id}/pixQrCode`
        )
        return {
          providerPaymentId: subscription.id,
          pixQrCode: pix.encodedImage,
          pixCopyPaste: pix.payload,
        }
      }
    }

    return { providerPaymentId: subscription.id, checkoutUrl: undefined }
  },

  async cancelSubscription(providerSubscriptionId: string) {
    await asaasFetch(`/subscriptions/${providerSubscriptionId}`, { method: "DELETE" })
  },

  parseWebhook({ headers, body }): WebhookEvent | null {
    const token = headers.get("asaas-access-token")
    if (!process.env.ASAAS_WEBHOOK_TOKEN || token !== process.env.ASAAS_WEBHOOK_TOKEN) {
      return null
    }

    const payload = body as {
      id?: string
      event?: string
      payment?: { id: string; status: string; subscription?: string }
      subscription?: { id: string; status: string }
    }
    if (!payload.event) return null

    const statusMap: Record<string, WebhookEvent["status"]> = {
      CONFIRMED: "paid",
      RECEIVED: "paid",
      OVERDUE: "pending",
      REFUNDED: "refunded",
      DELETED: "canceled",
    }

    const rawStatus = payload.payment?.status || payload.subscription?.status || ""
    const status = statusMap[rawStatus] ?? "pending"

    return {
      eventId: payload.id || `${payload.event}:${payload.payment?.id || payload.subscription?.id}`,
      type: payload.event,
      providerPaymentId: payload.payment?.id,
      providerSubscriptionId: payload.payment?.subscription || payload.subscription?.id,
      status,
      raw: payload as Record<string, unknown>,
    }
  },
}

export type { ProductSlug }
