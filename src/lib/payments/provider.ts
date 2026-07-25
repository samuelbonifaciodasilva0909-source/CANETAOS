import type { ProductSlug } from "@/types"

export interface CheckoutResult {
  /** Set for card checkout — redirect the browser here. */
  checkoutUrl?: string
  /** Set for Pix — render as QR code / copy-paste string. */
  pixQrCode?: string
  pixCopyPaste?: string
  providerPaymentId: string
}

export interface PaymentProvider {
  createOneTimeCheckout(params: {
    productSlug: ProductSlug
    userId: string
    name: string
    email: string
    amountCents: number
    method: "PIX" | "CREDIT_CARD"
    successUrl: string
  }): Promise<CheckoutResult>

  createSubscriptionCheckout(params: {
    productSlug: ProductSlug
    userId: string
    name: string
    email: string
    amountCents: number
    method: "PIX" | "CREDIT_CARD"
    successUrl: string
  }): Promise<CheckoutResult>

  cancelSubscription(providerSubscriptionId: string): Promise<void>

  /** Validates the inbound webhook and normalizes it to a common shape. */
  parseWebhook(params: {
    headers: Headers
    body: unknown
  }): WebhookEvent | null
}

export interface WebhookEvent {
  eventId: string
  type: string
  providerPaymentId?: string
  providerSubscriptionId?: string
  status: "paid" | "pending" | "failed" | "refunded" | "canceled"
  raw: Record<string, unknown>
}
