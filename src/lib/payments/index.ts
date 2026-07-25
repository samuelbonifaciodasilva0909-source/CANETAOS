import type { PaymentProvider } from "./provider"
import { asaasProvider } from "./asaas"

export function getPaymentProvider(): PaymentProvider {
  return asaasProvider
}

export type { PaymentProvider, CheckoutResult, WebhookEvent } from "./provider"
