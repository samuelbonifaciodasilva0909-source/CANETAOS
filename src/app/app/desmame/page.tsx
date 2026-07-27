import { createClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/layout/app-shell"
import { redirect } from "next/navigation"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumButton } from "@/components/ui/premium-button"
import { computeEntitlements, hasEntitlement, getDesmameUnlockStatus } from "@/lib/entitlements"
import Link from "next/link"
import { ShieldCheck, Lock, FileText } from "lucide-react"

export default async function DesmamePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [productsRes, purchasesRes, subRes, unlocksRes, entriesRes] = await Promise.all([
    supabase.from("products").select("*"),
    supabase.from("purchases").select("*").eq("user_id", user.id),
    supabase.from("subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("unlock_events").select("*").eq("user_id", user.id),
    supabase.from("tracker_entries").select("entry_date").eq("user_id", user.id),
  ])

  const products = productsRes.data || []
  const desmameProduct = products.find((p: { slug: string }) => p.slug === "desmame")
  const entryDates = (entriesRes.data || []).map((e: { entry_date: string }) => e.entry_date)
  const unlockStatus = getDesmameUnlockStatus(entryDates)

  let entitlements = computeEntitlements({
    purchases: purchasesRes.data || [],
    subscription: subRes.data || null,
    unlockEvents: unlocksRes.data || [],
    products,
  })

  const alreadyUnlockedByUsage = (unlocksRes.data || []).some((u: { product_id: string }) => u.product_id === desmameProduct?.id)
  if (!hasEntitlement(entitlements, "desmame_content") && unlockStatus.unlockedByUsage && desmameProduct && !alreadyUnlockedByUsage) {
    await supabase.from("unlock_events").insert({
      user_id: user.id,
      product_id: desmameProduct.id,
      reason: "8_weeks_active_tracking",
    })
    entitlements = [...entitlements, ...((desmameProduct.entitlements as string[]) || [])] as typeof entitlements
  }

  const isUnlocked = hasEntitlement(entitlements, "desmame_content")

  if (!isUnlocked) {
    return (
      <AppShell>
        <div className="mx-auto max-w-[520px] space-y-8">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-navy-400 mb-2">
              Fase 2
            </p>
            <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-foreground">
              Desmame
            </h1>
            <p className="mt-1.5 text-[14px] text-navy-500">
              Como reduzir a dose com apoio, lidar com o apetite voltando e manter o resultado nos 12 meses seguintes.
            </p>
          </div>

          <PremiumCard variant="hero" padding="xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900">
                <Lock className="h-5 w-5 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-[16px] font-semibold text-foreground tracking-tight">
                Ainda não desbloqueado
              </h3>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] text-navy-500">Desbloqueio gratuito por uso</span>
                <span className="text-[12px] font-numeric text-navy-700">{unlockStatus.activeWeeks}/8 semanas</span>
              </div>
              <div className="h-2 rounded-full bg-warm-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-positive transition-all duration-500"
                  style={{ width: `${Math.min(100, (unlockStatus.activeWeeks / 8) * 100)}%` }}
                />
              </div>
              <p className="mt-2 text-[12px] text-navy-400">
                {unlockStatus.weeksRemaining > 0
                  ? `Faltam ${unlockStatus.weeksRemaining} semanas de registro ativo pra desbloquear de graça.`
                  : "Você já pode desbloquear gratuitamente — atualize a página."}
              </p>
            </div>

            <div className="border-t border-border/40 pt-6">
              <p className="text-[13px] text-navy-500 mb-4">
                Ou desbloqueie agora, sem esperar:
              </p>
              <Link href="/checkout/desmame">
                <PremiumButton className="w-full" size="lg">
                  Desbloquear por R$ 197
                </PremiumButton>
              </Link>
            </div>
          </PremiumCard>
        </div>
      </AppShell>
    )
  }

  const { data: content } = await supabase
    .from("content_items")
    .select("id, title, slug, description")
    .eq("type", "desmame")
    .eq("is_published", true)
    .order("created_at", { ascending: true })

  return (
    <AppShell>
      <div className="space-y-8 max-w-[560px]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-navy-400">
              Fase 2
            </p>
            <ShieldCheck className="h-3.5 w-3.5 text-positive" strokeWidth={1.5} />
          </div>
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-foreground">
            Desmame
          </h1>
          <p className="mt-1.5 text-[14px] text-navy-500">
            Conteúdo liberado. Redução de dose é sempre decisão do seu médico.
          </p>
        </div>

        <div className="space-y-2">
          {(content || []).map((item: { id: string; slug: string; title: string; description: string | null }) => (
            <Link key={item.id} href={`/app/desmame/${item.slug}`} className="block group">
              <PremiumCard variant="interactive" padding="md" className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 shrink-0">
                  <FileText className="h-4 w-4 text-navy-600" strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[13px] font-medium text-foreground">{item.title}</h3>
                  <p className="text-[12px] text-navy-500 truncate">{item.description}</p>
                </div>
              </PremiumCard>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
