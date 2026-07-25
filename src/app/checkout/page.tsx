import { AppShell } from "@/components/layout/app-shell"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumButton } from "@/components/ui/premium-button"
import { Star, Check, Shield, CreditCard } from "lucide-react"

export default async function CheckoutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  return (
    <AppShell>
      <div className="mx-auto max-w-[480px] space-y-8">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-navy-400 mb-2">
            Assinatura
          </p>
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-navy-900">
            Finalizar assinatura
          </h1>
          <p className="mt-1.5 text-[14px] text-navy-500">
            Desbloqueie todo o conteúdo do CanetaOS Plus.
          </p>
        </div>

        <PremiumCard variant="hero" padding="xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900">
              <Star className="h-5 w-5 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-navy-900 tracking-tight">
                CanetaOS Plus
              </h3>
              <p className="text-[12px] text-navy-500">Acesso completo</p>
            </div>
          </div>

          <div className="border-t border-border/40 pt-6 mb-6">
            <div className="flex items-baseline gap-1">
              <span className="text-[36px] font-bold text-navy-900 tracking-tight">R$ 29</span>
              <span className="text-[14px] text-navy-400">/mês</span>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            {["Receitas premium exclusivas", "Cardápios variados e atualizados", "Histórico completo de acompanhamento", "Planejamento de manutenção"].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-navy-100 shrink-0">
                  <Check className="h-3 w-3 text-navy-700" strokeWidth={3} />
                </div>
                <span className="text-[13px] text-navy-700">{feature}</span>
              </div>
            ))}
          </div>

          <PremiumButton className="w-full" size="lg">
            Assinar agora
          </PremiumButton>

          <div className="flex items-center justify-center gap-2 mt-4">
            <Shield className="h-3.5 w-3.5 text-navy-400" strokeWidth={1.5} />
            <span className="text-[11px] text-navy-400">Pagamento seguro. Cancelamento a qualquer momento.</span>
          </div>
        </PremiumCard>

        <div className="flex items-center gap-3 text-[11px] text-navy-400">
          <CreditCard className="h-4 w-4" strokeWidth={1.5} />
          <span>O pagamento será processado mensalmente.</span>
        </div>
      </div>
    </AppShell>
  )
}
