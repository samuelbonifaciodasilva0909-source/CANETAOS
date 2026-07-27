import { createClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/layout/app-shell"
import { redirect } from "next/navigation"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { getRecipeVisual } from "@/lib/content/recipe-visual"
import { FavoriteButton } from "@/components/favorite-button"
import Link from "next/link"
import { Heart, UtensilsCrossed, BookOpen, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

const TYPE_LABELS: Record<string, string> = {
  recipe: "Receitas",
  meal_plan: "Cardápios",
  educational: "Artigos",
  guide: "Guias",
}

const TYPE_ROUTES: Record<string, string> = {
  recipe: "/app/recipes",
  meal_plan: "/app/food",
  educational: "/app/learning",
  guide: "/app/learning",
}

const TYPE_ICONS: Record<string, typeof UtensilsCrossed> = {
  recipe: UtensilsCrossed,
  meal_plan: UtensilsCrossed,
  educational: BookOpen,
  guide: FileText,
}

export default async function CollectionPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const { type: filterType } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: favs } = await supabase
    .from("favorites")
    .select("content_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const contentIds: string[] = (favs || []).map((f: { content_id: string }) => f.content_id)
  const orderMap = new Map<string, number>(contentIds.map((id, i) => [id, i]))

  const { data: items } = contentIds.length > 0
    ? await supabase.from("content_items").select("id, title, slug, description, type, is_premium, tags").in("id", contentIds)
    : { data: [] }

  const sorted = [...(items || [])].sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0))
  const filtered = filterType ? sorted.filter((i) => i.type === filterType) : sorted

  const availableTypes = Array.from(new Set(sorted.map((i) => i.type)))

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-navy-400 mb-2">
            Favoritos
          </p>
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-foreground">
            Minha coleção
          </h1>
          <p className="mt-1.5 text-[14px] text-navy-500">
            Receitas, cardápios e conteúdos que você salvou.
          </p>
        </div>

        {availableTypes.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <Link href="/app/colecao">
              <PremiumBadge variant={!filterType ? "default" : "outline"}>Todos</PremiumBadge>
            </Link>
            {availableTypes.map((t) => (
              <Link key={t} href={`/app/colecao?type=${t}`}>
                <PremiumBadge variant={filterType === t ? "default" : "outline"}>
                  {TYPE_LABELS[t] || t}
                </PremiumBadge>
              </Link>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <PremiumCard variant="soft" padding="xl" className="text-center max-w-md">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-100 mb-4 mx-auto">
              <Heart className="h-5 w-5 text-navy-600" strokeWidth={1.5} />
            </div>
            <h3 className="text-[15px] font-semibold text-foreground mb-2">
              Sua coleção está vazia
            </h3>
            <p className="text-[13px] text-navy-500 leading-relaxed">
              Toque no coração em qualquer receita, cardápio ou artigo pra salvar aqui.
            </p>
          </PremiumCard>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((item) => {
              const Icon = TYPE_ICONS[item.type] || FileText
              const visual = item.type === "recipe" ? getRecipeVisual(item.title, (item.tags as string[]) || []) : null
              return (
                <div key={item.id} className="relative">
                  <Link href={`${TYPE_ROUTES[item.type]}/${item.slug}`} className="block">
                    <PremiumCard variant="interactive" padding="md" className="flex items-center gap-3 pr-12">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl shrink-0",
                        visual ? `bg-gradient-to-br ${visual.gradient}` : "bg-navy-50"
                      )}>
                        {visual ? (
                          <visual.icon className={cn("h-4 w-4", visual.iconClass)} strokeWidth={1.5} />
                        ) : (
                          <Icon className="h-4 w-4 text-navy-600" strokeWidth={1.5} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[13px] font-medium text-foreground truncate">{item.title}</h3>
                          {item.is_premium && <PremiumBadge variant="default" className="text-[9px] shrink-0">Plus</PremiumBadge>}
                        </div>
                        <p className="text-[12px] text-navy-500 truncate">{item.description}</p>
                      </div>
                    </PremiumCard>
                  </Link>
                  <FavoriteButton
                    userId={user.id}
                    contentId={item.id}
                    initialIsFavorite={true}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
