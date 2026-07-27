import { createClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/layout/app-shell"
import { notFound } from "next/navigation"
import Link from "next/link"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { trackContentViewServer } from "@/lib/analytics"
import { FavoriteButton } from "@/components/favorite-button"
import { Clock, Beef, ArrowLeft } from "lucide-react"

interface FoodPageProps {
  params: Promise<{ slug: string }>
}

export default async function FoodDetailPage({ params }: FoodPageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: meal } = await supabase
    .from("content_items")
    .select("*")
    .eq("slug", slug)
    .eq("type", "meal_plan")
    .single()

  if (!meal) notFound()
  await trackContentViewServer(supabase, meal.id, "meal_plan")

  let initialIsFavorite = false
  if (user) {
    const { data: fav } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("content_id", meal.id)
      .maybeSingle()
    initialIsFavorite = !!fav
  }

  return (
    <AppShell>
      <div className="max-w-[560px] mx-auto space-y-8">
        <Link href="/app/food" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-navy-500 hover:text-navy-700 transition-smooth">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Cardápios
        </Link>

        <div className="rounded-2xl bg-gradient-to-br from-navy-50 to-warm-100 border border-border/40 p-8 aspect-[16/9] flex items-center justify-center">
          <div className="text-center">
            <span className="text-5xl">🥗</span>
            <p className="text-[13px] text-navy-400 mt-3">{meal.title}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              {meal.is_premium && <PremiumBadge variant="default">Plus</PremiumBadge>}
            </div>
            <FavoriteButton userId={user?.id || null} contentId={meal.id} initialIsFavorite={initialIsFavorite} />
          </div>
          <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-foreground">
            {meal.title}
          </h1>
          <p className="mt-2 text-[14px] text-navy-500 leading-relaxed">
            {meal.description}
          </p>
        </div>

        {meal.content && (
          <div>
            <h2 className="text-[13px] font-medium uppercase tracking-[0.06em] text-navy-400 mb-3">
              Conteúdo
            </h2>
            <p className="text-[14px] text-navy-700 leading-relaxed whitespace-pre-line">
              {meal.content}
            </p>
          </div>
        )}

        {(meal.tags as string[])?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {(meal.tags as string[]).map((tag) => (
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
