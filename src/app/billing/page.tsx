import { AppShell } from "@/components/layout/app-shell"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { PremiumButton } from "@/components/ui/premium-button"
import { CreditCard, Settings, AlertTriangle } from "lucide-react"

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, current_period_end, cancel_at_period_end, plans(name, slug)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single() as { data: { status: string; current_period_end: string | null; cancel_at_period_end: boolean; plans: { name: string; slug: string } | null } | null }

  const planName = subscription?.plans?.name || "CanetaOS Starter"
  const isActive = subscription?.status === "active"
  const isPlus = (subscription?.plans as { slug: string } | null)?.slug === "plus"

  return (
    <AppShell>
      <div className="space-y-8 max-w-[480px]">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-navy-400 mb-2">
            Conta
          </p>
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-navy-900">
            Assinatura
          </h1>
          <p className="mt-1.5 text-[14px] text-navy-500">
            Gerencie sua assinatura e forma de pagamento.
          </p>
        </div>

        <PremiumCard variant="elevated" padding="xl">
          <h3 className="text-[13px] font-medium text-navy-400 uppercase tracking-[0.06em] mb-4">
            Plano atual
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-navy-500">Plano</span>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-navy-900">{planName}</span>
                {isPlus && <PremiumBadge variant="default" dot>Plus</PremiumBadge>}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-navy-500">Status</span>
              <PremiumBadge variant={isActive ? "success" : "outline"}>
                {isActive ? "Ativa" : "Inativa"}
              </PremiumBadge>
            </div>
            {subscription?.current_period_end && (
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-navy-500">Próxima cobrança</span>
                <span className="text-[13px] font-medium text-navy-900">
                  {new Date(subscription.current_period_end).toLocaleDateString("pt-BR")}
                </span>
              </div>
            )}
          </div>

          {subscription?.cancel_at_period_end && (
            <div className="mt-4 rounded-xl bg-warm-50 border border-border/40 p-4 flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-navy-500 mt-0.5 shrink-0" strokeWidth={1.5} />
              <p className="text-[12px] text-navy-600 leading-relaxed">
                Sua assinatura será cancelada ao final do período atual.
              </p>
            </div>
          )}

          <div className="mt-6 border-t border-border/40 pt-6">
            {!isPlus ? (
              <Link href="/checkout/plus_subscription" className="inline-flex h-11 items-center justify-center rounded-xl bg-navy-900 px-6 text-[13px] font-medium text-white transition-smooth hover:bg-navy-800">
                Assinar Plus
              </Link>
            ) : (
              <div className="flex gap-3">
                <PremiumButton variant="outline" size="md">
                  <Settings className="h-4 w-4" strokeWidth={1.5} />
                  Gerenciar
                </PremiumButton>
                <PremiumButton variant="destructive" size="md">
                  Cancelar
                </PremiumButton>
              </div>
            )}
          </div>
        </PremiumCard>

        <PremiumCard variant="elevated" padding="xl">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="h-4 w-4 text-navy-400" strokeWidth={1.5} />
            <h3 className="text-[13px] font-medium text-navy-400 uppercase tracking-[0.06em]">
              Forma de pagamento
            </h3>
          </div>
          <p className="text-[13px] text-navy-500">
            Nenhuma forma de pagamento cadastrada.
          </p>
        </PremiumCard>
      </div>
    </AppShell>
  )
}
