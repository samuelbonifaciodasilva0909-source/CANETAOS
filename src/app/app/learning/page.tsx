import { createClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/layout/app-shell"
import { redirect } from "next/navigation"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { ArrowRight, BookOpen, FileText } from "lucide-react"

export default async function LearningPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: educational } = await supabase
    .from("content_items")
    .select("id, title, slug, description, is_premium, tags")
    .eq("type", "educational")
    .eq("is_published", true)
    .order("created_at", { ascending: false }) as { data: Array<{ id: string; title: string; slug: string; description: string; is_premium: boolean; tags: string[] }> | null }

  const { data: guides } = await supabase
    .from("content_items")
    .select("id, title, slug, description, is_premium, tags")
    .eq("type", "guide")
    .eq("is_published", true)
    .order("created_at", { ascending: false }) as { data: Array<{ id: string; title: string; slug: string; description: string; is_premium: boolean; tags: string[] }> | null }

  return (
    <AppShell>
      <div className="space-y-12">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-foreground">
            Biblioteca
          </h1>
          <p className="mt-1.5 text-[14px] text-navy-500">
            Conteúdo educativo para sua jornada.
          </p>
        </div>

        {educational && educational.length > 0 && (
          <div>
            <h2 className="text-[13px] font-medium uppercase tracking-[0.06em] text-navy-400 mb-4">
              Conteúdo Educacional
            </h2>
            <div className="space-y-2">
              {educational.map((item) => (
                <a key={item.id} href={`/app/learning/${item.slug}`} className="group block">
                  <PremiumCard variant="interactive" padding="md" className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 shrink-0">
                        <BookOpen className="h-5 w-5 text-navy-600" strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5 mb-0.5">
                          <h3 className="text-[13px] font-medium text-foreground">
                            {item.title}
                          </h3>
                          {item.is_premium && (
                            <PremiumBadge variant="default" className="text-[9px]">Plus</PremiumBadge>
                          )}
                        </div>
                        <p className="text-[12px] text-navy-500 line-clamp-1">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-navy-300 transition-smooth group-hover:text-navy-600 group-hover:translate-x-0.5 shrink-0 ml-4" />
                  </PremiumCard>
                </a>
              ))}
            </div>
          </div>
        )}

        {guides && guides.length > 0 && (
          <div>
            <h2 className="text-[13px] font-medium uppercase tracking-[0.06em] text-navy-400 mb-4">
              Guias
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {guides.map((guide) => (
                <a key={guide.id} href={`/app/learning/${guide.slug}`} className="group block">
                  <PremiumCard variant="interactive" padding="lg" className="h-full">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-50 shrink-0">
                        <FileText className="h-4 w-4 text-navy-600" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-[13px] font-medium text-foreground">
                        {guide.title}
                      </h3>
                    </div>
                    <p className="text-[12px] text-navy-500 line-clamp-2 leading-relaxed">
                      {guide.description}
                    </p>
                  </PremiumCard>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
