import { AppShell } from "@/components/layout/app-shell"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PremiumCard } from "@/components/ui/premium-card"
import { CheckoutOffer } from "@/components/checkout-offer"
import { Shield } from "lucide-react"

export default async function CheckoutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login?redirect=/checkout")

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .in("slug", ["frontend", "recipes_bump"])
    .eq("is_active", true) as {
      data: { slug: string; name: string; description: string | null; price_cents: number }[] | null
    }

  const base = products?.find((p) => p.slug === "frontend")
  const bump = products?.find((p) => p.slug === "recipes_bump")

  if (!base || !bump) {
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

  return (
    <AppShell>
      <div className="mx-auto max-w-[480px] space-y-8">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-navy-400 mb-2">
            Compra única
          </p>
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-navy-900">
            {base.name}
          </h1>
          {base.description && (
            <p className="mt-1.5 text-[14px] text-navy-500">{base.description}</p>
          )}
        </div>

        <PremiumCard variant="hero" padding="xl">
          <CheckoutOffer
            baseName={base.name}
            basePriceCents={base.price_cents}
            bumpName={bump.name}
            bumpDescription={bump.description}
            bumpPriceCents={bump.price_cents}
          />

          <div className="flex items-center justify-center gap-2 mt-6">
            <Shield className="h-3.5 w-3.5 text-navy-400" strokeWidth={1.5} />
            <span className="text-[11px] text-navy-400">Pagamento processado com segurança via Asaas.</span>
          </div>
        </PremiumCard>
      </div>
    </AppShell>
  )
}
