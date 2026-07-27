import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getPaymentProvider } from "@/lib/payments"

const BASE_SLUG = "frontend"
const BUMP_SLUG = "recipes_bump"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const includeBump = body.includeBump === true
  const method: "PIX" | "CREDIT_CARD" = body.method === "CREDIT_CARD" ? "CREDIT_CARD" : "PIX"

  const slugs = includeBump ? [BASE_SLUG, BUMP_SLUG] : [BASE_SLUG]
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .in("slug", slugs)
    .eq("is_active", true) as {
      data: { id: string; slug: string; price_cents: number }[] | null
    }

  const base = products?.find((p) => p.slug === BASE_SLUG)
  if (!base) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
  const bump = includeBump ? products?.find((p) => p.slug === BUMP_SLUG) : undefined

  const amountCents = base.price_cents + (bump?.price_cents ?? 0)
  const name = user.user_metadata?.full_name || user.email || "Cliente"
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const provider = getPaymentProvider()

  try {
    const result = await provider.createOneTimeCheckout({
      productSlug: BASE_SLUG,
      userId: user.id,
      name,
      email: user.email!,
      amountCents,
      method,
      successUrl: `${siteUrl}/checkout/success`,
    })

    const rows = [
      {
        user_id: user.id,
        product_id: base.id,
        provider: "asaas",
        provider_payment_id: result.providerPaymentId,
        payment_method: method,
        amount_cents: base.price_cents,
        status: "pending",
      },
      ...(bump
        ? [
            {
              user_id: user.id,
              product_id: bump.id,
              provider: "asaas",
              provider_payment_id: result.providerPaymentId,
              payment_method: method,
              amount_cents: bump.price_cents,
              status: "pending",
            },
          ]
        : []),
    ]

    await supabase.from("purchases").insert(rows)

    return NextResponse.json(result)
  } catch (err) {
    console.error("Checkout falhou:", err)
    return NextResponse.json({ error: "Não foi possível iniciar o pagamento. Tente novamente em instantes." }, { status: 500 })
  }
}
