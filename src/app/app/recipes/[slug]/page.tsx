import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/layout/app-shell"
import { notFound } from "next/navigation"
import Link from "next/link"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { getRecipeVisual } from "@/lib/content/recipe-visual"
import { trackContentViewServer } from "@/lib/analytics"
import { FavoriteButton } from "@/components/favorite-button"
import { AddToShoppingListButton } from "@/components/add-to-shopping-list-button"
import { getUserEntitlements, hasEntitlement } from "@/lib/entitlements"
import { Clock, Beef, ArrowLeft } from "lucide-react"

interface RecipePageProps {
  params: Promise<{ slug: string }>
}

export default async function RecipeDetailPage({ params }: RecipePageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const isDemo = (await cookies()).get("demo_auth")?.value === "true"
  if (!isDemo) {
    const entitlements = await getUserEntitlements(supabase, user.id)
    if (!hasEntitlement(entitlements, "quick_recipes")) notFound()
  }

  const { data: recipe } = await supabase
    .from("content_items")
    .select("*")
    .eq("slug", slug)
    .eq("type", "recipe")
    .single()

  if (!recipe) notFound()
  await trackContentViewServer(supabase, recipe.id, "recipe")

  let initialIsFavorite = false
  if (user) {
    const { data: fav } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("content_id", recipe.id)
      .maybeSingle()
    initialIsFavorite = !!fav
  }

  let parsed: {
    tempo?: string
    ingredientes?: string[]
    instrucoes?: string | string[]
    protein_estimate?: string
  } = {}

  try {
    if (recipe.content) parsed = JSON.parse(recipe.content)
  } catch {}

  const steps = Array.isArray(parsed.instrucoes)
    ? parsed.instrucoes
    : parsed.instrucoes
      ? [parsed.instrucoes]
      : []

  const visual = getRecipeVisual(recipe.title, (recipe.tags as string[]) || [])

  return (
    <AppShell>
      <div className="max-w-[560px] mx-auto space-y-8">
        <Link href="/app/recipes" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-navy-500 hover:text-navy-700 transition-smooth">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Receitas
        </Link>

        <div className={`rounded-2xl bg-gradient-to-br ${visual.gradient} border border-border/40 p-8 aspect-[16/9] flex items-center justify-center`}>
          <div className="text-center">
            <visual.icon className={`h-12 w-12 mx-auto ${visual.iconClass}`} strokeWidth={1} />
            <p className="text-[13px] text-navy-500 mt-3">{recipe.title}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              {recipe.is_premium && <PremiumBadge variant="default">Plus</PremiumBadge>}
            </div>
            <FavoriteButton userId={user?.id || null} contentId={recipe.id} initialIsFavorite={initialIsFavorite} />
          </div>
          <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-foreground">
            {recipe.title}
          </h1>
          <p className="mt-2 text-[14px] text-navy-500 leading-relaxed">
            {recipe.description}
          </p>
        </div>

        <div className="flex gap-4">
          {parsed.tempo && (
            <div className="flex items-center gap-2 text-[13px] text-navy-600">
              <Clock className="h-4 w-4 text-navy-400" strokeWidth={1.5} />
              {parsed.tempo}
            </div>
          )}
          {parsed.protein_estimate && (
            <div className="flex items-center gap-2 text-[13px] text-navy-600">
              <Beef className="h-4 w-4 text-navy-400" strokeWidth={1.5} />
              {parsed.protein_estimate} proteína
            </div>
          )}
        </div>

        {parsed.ingredientes && parsed.ingredientes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-medium uppercase tracking-[0.06em] text-navy-400">
                Ingredientes
              </h2>
              <AddToShoppingListButton userId={user?.id || null} ingredients={parsed.ingredientes} />
            </div>
            <div className="space-y-2">
              {parsed.ingredientes.map((ing, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-border/40">
                  <div className="h-1.5 w-1.5 rounded-full bg-navy-300 shrink-0" />
                  <span className="text-[13px] text-navy-700">{ing}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {steps.length > 0 && (
          <div>
            <h2 className="text-[13px] font-medium uppercase tracking-[0.06em] text-navy-400 mb-3">
              Modo de preparo
            </h2>
            <ol className="space-y-3">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-50 text-[11px] font-semibold font-numeric text-navy-700">
                    {i + 1}
                  </span>
                  <p className="text-[14px] text-navy-700 leading-relaxed pt-0.5">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {(recipe.tags as string[])?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {(recipe.tags as string[]).map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full bg-warm-100 text-[11px] font-medium text-navy-500">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
