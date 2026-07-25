import { createClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/layout/app-shell"
import { redirect } from "next/navigation"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { Clock, ArrowRight } from "lucide-react"

export default async function FoodPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: mealPlans } = await supabase
    .from("content_items")
    .select("id, title, slug, description, is_premium, tags")
    .eq("type", "meal_plan")
    .eq("is_published", true)
    .order("created_at", { ascending: false }) as { data: Array<{ id: string; title: string; slug: string; description: string; is_premium: boolean; tags: string[] }> | null }

  return (
    <AppShell>
      <div className="space-y-10">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-foreground">
            Alimentação
          </h1>
          <p className="mt-1.5 text-[14px] text-navy-500">
            Cardápios e orientações para organizar sua alimentação.
          </p>
        </div>

        {mealPlans && mealPlans.length > 0 ? (
          <div className="space-y-3">
            {mealPlans.map((plan, i) => (
              <a key={plan.id} href={`/app/food/${plan.slug}`} className="group block">
                <PremiumCard variant="interactive" padding="lg" className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-50 text-navy-600 shrink-0">
                      <Clock className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 mb-1">
                        <h3 className="text-[14px] font-medium text-foreground">
                          {plan.title}
                        </h3>
                        {plan.is_premium && (
                          <PremiumBadge variant="default" className="text-[9px]">Plus</PremiumBadge>
                        )}
                      </div>
                      <p className="text-[13px] text-navy-500 line-clamp-1">
                        {plan.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-navy-300 transition-smooth group-hover:text-navy-600 group-hover:translate-x-0.5 shrink-0 ml-4" />
                </PremiumCard>
              </a>
            ))}
          </div>
        ) : (
          <PremiumCard variant="soft" padding="xl" className="text-center max-w-md mx-auto">
            <p className="text-[13px] text-navy-500">
              Cardápios serão disponibilizados em breve.
            </p>
          </PremiumCard>
        )}
      </div>
    </AppShell>
  )
}
