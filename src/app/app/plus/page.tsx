import { createClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/layout/app-shell"
import { redirect } from "next/navigation"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { PremiumButton } from "@/components/ui/premium-button"
import { Check, Star } from "lucide-react"

export default async function PlusPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, plan_id, plans(name, slug)")
    .eq("user_id", user.id)
    .in("status", ["active", "trialing"])
    .single() as { data: { status: string; plan_id: string | null; plans: { name: string; slug: string } | null } | null }

  const isPlus = (subscription?.plans as { slug: string } | null)?.slug === "plus"

  const features = [
    "Receitas premium exclusivas",
    "Cardápios variados e atualizados",
    "Histórico completo de acompanhamento",
    "Planejamento de manutenção",
    "Novos conteúdos toda semana",
  ]

  return (
    <AppShell>
      <div className="space-y-10 max-w-[560px]">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-foreground">
            CanetaOS Plus
          </h1>
          <p className="mt-1.5 text-[14px] text-navy-500">
            Desbloqueie todo o potencial do CanetaOS.
          </p>
        </div>

        {isPlus ? (
          <PremiumCard variant="elevated" padding="xl" className="border-positive/20 bg-positive-soft">
            <PremiumBadge variant="success" dot>Assinante Plus</PremiumBadge>
            <p className="mt-3 text-[14px] text-navy-700 leading-relaxed">
              Aproveite todo o conteúdo premium, receitas exclusivas e
              recursos avançados.
            </p>
          </PremiumCard>
        ) : (
          <PremiumCard variant="hero" padding="xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900">
                <Star className="h-5 w-5 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-[18px] font-semibold text-foreground tracking-tight">
                Desbloqueie o CanetaOS Plus
              </h3>
            </div>

            <p className="text-[14px] text-navy-500 leading-relaxed mb-6">
              Tenha acesso a receitas premium, cardápios exclusivos, histórico
              completo, calculadora avançada e muito mais.
            </p>

            <div className="space-y-3 mb-8">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-navy-100 shrink-0">
                    <Check className="h-3 w-3 text-navy-700" strokeWidth={3} />
                  </div>
                  <span className="text-[13px] text-navy-700">{feature}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border/40 pt-6">
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-[32px] font-bold text-foreground tracking-tight">R$ 29</span>
                <span className="text-[14px] text-navy-400">/mês</span>
              </div>
              <PremiumButton className="w-full" size="lg">
                Assinar CanetaOS Plus
              </PremiumButton>
            </div>
          </PremiumCard>
        )}

        <div>
          <h2 className="text-[13px] font-medium uppercase tracking-[0.06em] text-navy-400 mb-4">
            Ferramentas Educativas
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <PremiumCard variant="interactive" padding="lg">
              <h4 className="text-[13px] font-medium text-foreground mb-1">Calculadora de Proteína</h4>
              <p className="text-[12px] text-navy-500">
                Ferramenta educativa de referência
              </p>
            </PremiumCard>
            <PremiumCard variant="interactive" padding="lg">
              <h4 className="text-[13px] font-medium text-foreground mb-1">Registro de Treino</h4>
              <p className="text-[12px] text-navy-500">
                Acompanhe seus treinos semanais
              </p>
            </PremiumCard>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
