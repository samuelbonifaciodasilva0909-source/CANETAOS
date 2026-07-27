import { createClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/layout/app-shell"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { computeEntitlements, hasEntitlement } from "@/lib/entitlements"
import { trackContentViewServer } from "@/lib/analytics"
import { FavoriteButton } from "@/components/favorite-button"
import { ArrowLeft, ShieldCheck } from "lucide-react"

export default async function DesmameDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [productsRes, purchasesRes, subRes, unlocksRes] = await Promise.all([
    supabase.from("products").select("*"),
    supabase.from("purchases").select("*").eq("user_id", user.id),
    supabase.from("subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("unlock_events").select("*").eq("user_id", user.id),
  ])

  const entitlements = computeEntitlements({
    purchases: purchasesRes.data || [],
    subscription: subRes.data || null,
    unlockEvents: unlocksRes.data || [],
    products: productsRes.data || [],
  })

  if (!hasEntitlement(entitlements, "desmame_content")) {
    redirect("/app/desmame")
  }

  const { data: article } = await supabase
    .from("content_items")
    .select("*")
    .eq("slug", slug)
    .eq("type", "desmame")
    .single()

  if (!article) notFound()
  await trackContentViewServer(supabase, article.id, "desmame")

  const { data: fav } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("content_id", article.id)
    .maybeSingle()

  return (
    <AppShell>
      <div className="max-w-[560px] mx-auto space-y-8">
        <Link href="/app/desmame" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-navy-500 hover:text-navy-700 transition-smooth">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Desmame
        </Link>

        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-positive">
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
              Fase 2 — Desmame
            </div>
            <FavoriteButton userId={user.id} contentId={article.id} initialIsFavorite={!!fav} />
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
            {article.content.split("\n\n").map((paragraph: string, i: number) => (
              <p key={i} className="text-[15px] text-navy-700 leading-[1.8] mb-4 last:mb-0 whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
