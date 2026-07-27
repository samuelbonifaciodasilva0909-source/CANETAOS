import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getPaymentProvider } from "@/lib/payments"
import type { ProductSlug } from "@/types"

export async function POST(request: Request, { params }: { params: Promise<{ product: string }> }) {
  const { product: productSlug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", productSlug)
    .eq("is_active", true)
    .single()

  if (!product) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })

  const body = await request.json().catch(() => ({}))
  const method: "PIX" | "CREDIT_CARD" = body.method === "CREDIT_CARD" ? "CREDIT_CARD" : "PIX"
  const name = user.user_metadata?.full_name || user.email || "Cliente"
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const provider = getPaymentProvider()

  try {
    if (product.kind === "recurring") {
      const result = await provider.createSubscriptionCheckout({
        productSlug: product.slug as ProductSlug,
        userId: user.id,
        name,
        email: user.email!,
        amountCents: product.price_cents,
        method,
        successUrl: `${siteUrl}/checkout/success`,
      })

      await supabase.from("subscriptions").insert({
        user_id: user.id,
        provider: "asaas",
        provider_subscription_id: result.providerPaymentId,
        status: "incomplete",
      })

      return NextResponse.json(result)
    }

    const result = await provider.createOneTimeCheckout({
      productSlug: product.slug as ProductSlug,
      userId: user.id,
      name,
      email: user.email!,
      amountCents: product.price_cents,
      method,
      successUrl: `${siteUrl}/checkout/success`,
    })

    await supabase.from("purchases").insert({
      user_id: user.id,
      product_id: product.id,
      provider: "asaas",
      provider_payment_id: result.providerPaymentId,
      payment_method: method,
      amount_cents: product.price_cents,
      status: "pending",
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error("Checkout falhou:", err)
    return NextResponse.json({ error: "Não foi possível iniciar o pagamento. Tente novamente em instantes." }, { status: 500 })
  }
}
