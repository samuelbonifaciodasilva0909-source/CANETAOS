import type { PaymentProvider } from "./provider"
import { asaasProvider } from "./asaas"
import { caktoProvider } from "./cakto"

export function getPaymentProvider(): PaymentProvider {
  return caktoProvider
}

export { asaasProvider, caktoProvider }

export type { PaymentProvider, CheckoutResult, WebhookEvent } from "./provider"
