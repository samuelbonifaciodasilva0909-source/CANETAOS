import { createClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/layout/app-shell"
import { notFound } from "next/navigation"
import Link from "next/link"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { Clock, Beef, ArrowLeft, Heart } from "lucide-react"

interface RecipePageProps {
  params: Promise<{ slug: string }>
}

export default async function RecipeDetailPage({ params }: RecipePageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: recipe } = await supabase
    .from("content_items")
    .select("*")
    .eq("slug", slug)
    .eq("type", "recipe")
    .single()

  if (!recipe) notFound()

  let parsed: {
    tempo?: string
    ingredientes?: string[]
    instrucoes?: string
    protein_estimate?: string
  } = {}

  try {
    if (recipe.content) parsed = JSON.parse(recipe.content)
  } catch {}

  return (
    <AppShell>
      <div className="max-w-[560px] mx-auto space-y-8">
        <Link href="/app/recipes" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-navy-500 hover:text-navy-700 transition-smooth">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Receitas
        </Link>

        <div className="rounded-2xl bg-gradient-to-br from-navy-50 to-warm-100 border border-border/40 p-8 aspect-[16/9] flex items-center justify-center">
          <div className="text-center">
            <span className="text-5xl">🍽️</span>
            <p className="text-[13px] text-navy-400 mt-3">{recipe.title}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            {recipe.is_premium && <PremiumBadge variant="default">Plus</PremiumBadge>}
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
            <h2 className="text-[13px] font-medium uppercase tracking-[0.06em] text-navy-400 mb-3">
              Ingredientes
            </h2>
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

        {parsed.instrucoes && (
          <div>
            <h2 className="text-[13px] font-medium uppercase tracking-[0.06em] text-navy-400 mb-3">
              Modo de preparo
            </h2>
            <p className="text-[14px] text-navy-700 leading-relaxed whitespace-pre-line">
              {parsed.instrucoes}
            </p>
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
