import { createClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/layout/app-shell"
import { notFound } from "next/navigation"
import Link from "next/link"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { trackContentViewServer } from "@/lib/analytics"
import { FavoriteButton } from "@/components/favorite-button"
import { ArrowLeft, BookOpen, Clock } from "lucide-react"

interface LearningPageProps {
  params: Promise<{ slug: string }>
}

export default async function LearningDetailPage({ params }: LearningPageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: article } = await supabase
    .from("content_items")
    .select("*")
    .eq("slug", slug)
    .in("type", ["educational", "guide"])
    .single()

  if (!article) notFound()
  await trackContentViewServer(supabase, article.id, article.type)

  let initialIsFavorite = false
  if (user) {
    const { data: fav } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("content_id", article.id)
      .maybeSingle()
    initialIsFavorite = !!fav
  }

  const wordCount = article.content?.split(/\s+/).length || 0
  const readTime = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <AppShell>
      <div className="max-w-[560px] mx-auto space-y-8">
        <Link href="/app/learning" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-navy-500 hover:text-navy-700 transition-smooth">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Biblioteca
        </Link>

        <div className="rounded-2xl bg-gradient-to-br from-navy-50 to-warm-100 border border-border/40 p-8 aspect-[16/9] flex items-center justify-center">
          <div className="text-center">
            <BookOpen className="h-10 w-10 text-navy-300 mx-auto" strokeWidth={1.5} />
            <p className="text-[13px] text-navy-400 mt-3">
              {article.type === "educational" ? "Artigo educativo" : "Guia"}
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-3">
              <PremiumBadge variant={article.is_premium ? "default" : "outline"}>
                {article.type === "educational" ? "Artigo" : "Guia"}
              </PremiumBadge>
              <div className="flex items-center gap-1.5 text-[12px] text-navy-400">
                <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                {readTime} min de leitura
              </div>
            </div>
            <FavoriteButton userId={user?.id || null} contentId={article.id} initialIsFavorite={initialIsFavorite} />
          </div>
          <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-foreground">
            {article.title}
          </h1>
          <p className="mt-2 text-[14px] text-navy-500 leading-relaxed">
            {article.description}
          </p>
        </div>

        {article.content && (
          <div className="prose prose-navy">
            <p className="text-[15px] text-navy-700 leading-[1.8] whitespace-pre-line">
              {article.content}
            </p>
          </div>
        )}

        {(article.tags as string[])?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-border/40">
            {(article.tags as string[]).map((tag) => (
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
