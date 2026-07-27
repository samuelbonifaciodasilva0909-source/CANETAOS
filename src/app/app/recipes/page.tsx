import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/layout/app-shell"
import { redirect, notFound } from "next/navigation"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { getRecipeVisual } from "@/lib/content/recipe-visual"
import { RecipePicker } from "@/components/recipe-picker"
import { getUserEntitlements, hasEntitlement } from "@/lib/entitlements"
import { ArrowRight, Clock, Beef } from "lucide-react"

export default async function RecipesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const isDemo = (await cookies()).get("demo_auth")?.value === "true"
  if (!isDemo) {
    const entitlements = await getUserEntitlements(supabase, user.id)
    if (!hasEntitlement(entitlements, "quick_recipes")) notFound()
  }

  const { data: recipes } = await supabase
    .from("content_items")
    .select("id, title, slug, description, is_premium, tags")
    .eq("type", "recipe")
    .eq("is_published", true)
    .order("created_at", { ascending: false }) as { data: Array<{ id: string; title: string; slug: string; description: string; is_premium: boolean; tags: string[] }> | null }

  return (
    <AppShell>
      <div className="space-y-10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-foreground">
              Receitas
            </h1>
            <p className="mt-1.5 text-[14px] text-navy-500">
              Receitas nutritivas e práticas para sua rotina.
            </p>
          </div>
          <RecipePicker />
        </div>

        {recipes && recipes.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {recipes.map((recipe) => {
              const visual = getRecipeVisual(recipe.title, (recipe.tags as string[]) || [])
              return (
              <a key={recipe.id} href={`/app/recipes/${recipe.slug}`} className="group block">
                <PremiumCard variant="interactive" padding="none" className="overflow-hidden h-full">
                  <div className={`h-36 bg-gradient-to-br ${visual.gradient} flex items-center justify-center`}>
                    <visual.icon className={`h-8 w-8 ${visual.iconClass}`} strokeWidth={1} />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-[14px] font-medium text-foreground">
                        {recipe.title}
                      </h3>
                      {recipe.is_premium && (
                        <PremiumBadge variant="default" className="text-[9px]">Plus</PremiumBadge>
                      )}
                    </div>
                    <p className="text-[13px] text-navy-500 line-clamp-2 leading-relaxed">
                      {recipe.description}
                    </p>
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/40">
                      <div className="flex items-center gap-1.5 text-[12px] text-navy-400">
                        <Clock className="h-3.5 w-3.5" />
                        15 min
                      </div>
                      <div className="flex items-center gap-1.5 text-[12px] text-navy-400">
                        <Beef className="h-3.5 w-3.5" />
                        Proteína
                      </div>
                    </div>
                  </div>
                </PremiumCard>
              </a>
              )
            })}
          </div>
        ) : (
          <PremiumCard variant="soft" padding="xl" className="text-center max-w-md mx-auto">
            <p className="text-[13px] text-navy-500">
              Receitas serão disponibilizadas em breve.
            </p>
          </PremiumCard>
        )}
      </div>
    </AppShell>
  )
}
