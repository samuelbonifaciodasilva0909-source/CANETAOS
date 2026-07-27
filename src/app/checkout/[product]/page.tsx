import { AppShell } from "@/components/layout/app-shell"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PremiumCard } from "@/components/ui/premium-card"
import { CheckoutPayButton } from "@/components/checkout-pay-button"
import { Shield } from "lucide-react"

export default async function CheckoutProductPage({
  params,
}: {
  params: Promise<{ product: string }>
}) {
  const { product: productSlug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirect=/checkout/${productSlug}`)

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", productSlug)
    .eq("is_active", true)
    .single() as { data: { name: string; description: string | null; price_cents: number; kind: string } | null }

  if (!product) {
    return (
      <AppShell>
        <div className="mx-auto max-w-[480px]">
          <PremiumCard variant="elevated" padding="xl" className="text-center">
            <p className="text-[14px] text-navy-500">Produto não encontrado.</p>
          </PremiumCard>
        </div>
      </AppShell>
    )
  }

  const price = (product.price_cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })

  return (
    <AppShell>
      <div className="mx-auto max-w-[480px] space-y-8">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-navy-400 mb-2">
            {product.kind === "recurring" ? "Assinatura" : "Compra única"}
          </p>
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-navy-900">
            {product.name}
          </h1>
          {product.description && (
            <p className="mt-1.5 text-[14px] text-navy-500">{product.description}</p>
          )}
        </div>

        <PremiumCard variant="hero" padding="xl">
          <div className="border-b border-border/40 pb-6 mb-6">
            <div className="flex items-baseline gap-1">
              <span className="text-[36px] font-bold font-numeric text-navy-900 tracking-tight">
                R$ {price}
              </span>
              {product.kind === "recurring" && <span className="text-[14px] text-navy-400">/mês</span>}
            </div>
          </div>

          <CheckoutPayButton productSlug={productSlug} />

          <div className="flex items-center justify-center gap-2 mt-6">
            <Shield className="h-3.5 w-3.5 text-navy-400" strokeWidth={1.5} />
            <span className="text-[11px] text-navy-400">Pagamento processado com segurança via Asaas.</span>
          </div>
        </PremiumCard>
      </div>
    </AppShell>
  )
}
