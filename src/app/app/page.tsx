"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { AppShell } from "@/components/layout/app-shell"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { HomeInteractive } from "@/components/home-interactive"
import { WeightChart } from "@/components/weight-chart"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  ClipboardList,
  ArrowRight,
  Clock,
  TrendingUp,
  Syringe,
  Beef,
  Flame,
  Target,
  BookOpen,
  UtensilsCrossed,
  ChevronRight,
  Droplets,
  Moon,
  Zap,
} from "lucide-react"

interface UserProfile {
  full_name: string | null
  onboarding_completed: boolean
  created_at: string
}

interface TrackerEntry {
  entry_date: string
  weight_kg: number | null
  waist_measurement: number | null
  protein_intake_g: number | null
  water_intake_ml: number | null
  dose_applied: boolean | null
  mood: string | null
  energy_level: number | null
}

interface SymptomEntry {
  entry_date: string
  nausea: boolean
  constipation: boolean
  fatigue: boolean
  headache: boolean
}

interface ContentItem {
  id: string
  title: string
  slug: string
  description: string | null
  type: string
  is_premium: boolean
  tags: string[]
}

interface DailyChecklist {
  water: boolean
  protein: boolean
  training: boolean
  application: boolean
  tracking: boolean
  sleep: boolean
  movement: boolean
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Bom dia"
  if (hour < 18) return "Boa tarde"
  return "Boa noite"
}

function getWeekNumber(createdAt: string) {
  const created = new Date(createdAt)
  const now = new Date()
  return Math.max(1, Math.ceil((now.getTime() - created.getTime()) / (7 * 24 * 60 * 60 * 1000)))
}

export default function AppPage() {
  const [userId, setUserId] = useState("")
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [entries, setEntries] = useState<TrackerEntry[]>([])
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([])
  const [recipes, setRecipes] = useState<ContentItem[]>([])
  const [articles, setArticles] = useState<ContentItem[]>([])
  const [mealPlans, setMealPlans] = useState<ContentItem[]>([])
  const [checklist, setChecklist] = useState<DailyChecklist | null>(null)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    const isDemo = document.cookie.includes("demo_auth=true")

    if (isDemo) {
      try {
        const res = await fetch("/api/demo/data")
        const demo = await res.json()
        setProfile(demo.profile)
        setEntries(demo.trackerEntries)
        setSymptoms(demo.symptomEntries)
        setRecipes(demo.recipes)
        setArticles(demo.articles)
        setMealPlans(demo.mealPlans)
        setChecklist(demo.checklist)
        setStreak(7)
        setLoading(false)
        return
      } catch {}
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    const [profRes, entriesRes, symptomsRes, recipesRes, articlesRes, mealsRes, checklistRes] = await Promise.all([
      supabase.from("profiles").select("full_name, onboarding_completed, created_at").eq("id", user.id).single(),
      supabase.from("tracker_entries").select("*").eq("user_id", user.id).order("entry_date", { ascending: false }).limit(30),
      supabase.from("symptom_entries").select("entry_date, nausea, constipation, fatigue, headache").eq("user_id", user.id).order("entry_date", { ascending: false }).limit(14),
      supabase.from("content_items").select("id, title, slug, description, type, is_premium, tags").eq("type", "recipe").eq("is_published", true).order("created_at", { ascending: false }).limit(4),
      supabase.from("content_items").select("id, title, slug, description, type, is_premium, tags").eq("type", "educational").eq("is_published", true).order("created_at", { ascending: false }).limit(3),
      supabase.from("content_items").select("id, title, slug, description, type, is_premium, tags").eq("type", "meal_plan").eq("is_published", true).order("created_at", { ascending: false }).limit(3),
      supabase.from("daily_checklists").select("*").eq("user_id", user.id).eq("entry_date", new Date().toISOString().split("T")[0]).single(),
    ])

    if (profRes.data) setProfile(profRes.data)
    if (entriesRes.data) setEntries(entriesRes.data as TrackerEntry[])
    if (symptomsRes.data) setSymptoms(symptomsRes.data as SymptomEntry[])
    if (recipesRes.data) setRecipes(recipesRes.data as ContentItem[])
    if (articlesRes.data) setArticles(articlesRes.data as ContentItem[])
    if (mealsRes.data) setMealPlans(mealsRes.data as ContentItem[])
    if (checklistRes.data) setChecklist(checklistRes.data as DailyChecklist)

    // Calculate streak
    if (entriesRes.data && entriesRes.data.length > 0) {
      let s = 0
      const today = new Date()
      for (let i = 0; i < 90; i++) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split("T")[0]
        if (entriesRes.data.some((e: TrackerEntry) => e.entry_date === dateStr)) {
          s++
        } else break
      }
      setStreak(s)
    }

    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const firstName = profile?.full_name?.split(" ")[0] || "você"
  const weekNumber = profile ? getWeekNumber(profile.created_at) : 1
  const latestEntry = entries[0]
  const todaySymptoms = symptoms[0]
  const hasActiveSymptoms = todaySymptoms && (todaySymptoms.nausea || todaySymptoms.constipation || todaySymptoms.fatigue || todaySymptoms.headache)

  // Contextual content based on symptoms
  const contextualRecipes = hasActiveSymptoms
    ? recipes.filter((r) => {
        const tags = (r.tags as string[]) || []
        if (todaySymptoms.nausea) return tags.some((t) => ["leve", "rápido", "sopa"].includes(t))
        if (todaySymptoms.fatigue) return tags.some((t) => ["proteína", "energético"].includes(t))
        return true
      }).slice(0, 3)
    : recipes.slice(0, 3)

  const completedChecks = checklist
    ? [checklist.water, checklist.protein, checklist.training, checklist.application, checklist.tracking, checklist.sleep, checklist.movement].filter(Boolean).length
    : 0

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-[13px] text-navy-400">Carregando...</div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-8">

        {/* Hero greeting */}
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-navy-400 dark:text-navy-500 mb-2">
            Semana {weekNumber} da sua jornada
          </p>
          <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-[-0.03em] text-foreground">
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="mt-2 text-[15px] text-navy-500 dark:text-navy-400 leading-relaxed">
            Organize sua jornada com mais clareza.
          </p>
        </div>

        {/* Streak + Weekly completion */}
        <div className="grid grid-cols-2 gap-3">
          <PremiumCard variant="elevated" padding="lg">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-4 w-4 text-attention" strokeWidth={1.5} />
              <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-navy-400">Sequência</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[28px] font-bold text-foreground tracking-tight">{streak}</span>
              <span className="text-[12px] text-navy-400">dias</span>
            </div>
          </PremiumCard>

          <PremiumCard variant="elevated" padding="lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-positive" strokeWidth={1.5} />
              <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-navy-400">Hoje</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[28px] font-bold text-foreground tracking-tight">{completedChecks}</span>
              <span className="text-[12px] text-navy-400">/ 7</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-warm-200 dark:bg-navy-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-positive transition-all duration-500"
                style={{ width: `${(completedChecks / 7) * 100}%` }}
              />
            </div>
          </PremiumCard>
        </div>

        {/* Next application reminder */}
        {latestEntry?.dose_applied === false && (
          <PremiumCard variant="soft" padding="lg" className="border border-attention/20">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-attention/10">
                <Syringe className="h-4 w-4 text-attention" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-medium text-foreground">Lembrete de aplicação</p>
                <p className="text-[12px] text-navy-400">Você marcou que não aplicou a dose hoje.</p>
              </div>
            </div>
          </PremiumCard>
        )}

        {/* Weight chart */}
        {entries.length >= 2 && entries.some((e) => e.weight_kg != null) && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-medium uppercase tracking-[0.06em] text-navy-400">
                Evolução do peso
              </h2>
              <Link href="/app/tracker" className="text-[12px] font-medium text-navy-500 hover:text-navy-700 flex items-center gap-1 transition-smooth">
                Ver tudo <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <PremiumCard variant="elevated" padding="lg">
              <WeightChart entries={entries} />
            </PremiumCard>
          </div>
        )}

        {/* Quick stats row */}
        {latestEntry && (
          <div className="grid grid-cols-3 gap-3">
            {latestEntry.weight_kg && (
              <div className="rounded-xl bg-card border border-border/50 p-4 text-center">
                <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-navy-400 mb-1">Peso</p>
                <p className="text-[18px] font-bold text-foreground">{latestEntry.weight_kg}</p>
                <p className="text-[10px] text-navy-400">kg</p>
              </div>
            )}
            {latestEntry.protein_intake_g && (
              <div className="rounded-xl bg-card border border-border/50 p-4 text-center">
                <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-navy-400 mb-1">Proteína</p>
                <p className="text-[18px] font-bold text-foreground">{latestEntry.protein_intake_g}</p>
                <p className="text-[10px] text-navy-400">g</p>
              </div>
            )}
            {latestEntry.water_intake_ml && (
              <div className="rounded-xl bg-card border border-border/50 p-4 text-center">
                <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-navy-400 mb-1">Água</p>
                <p className="text-[18px] font-bold text-foreground">{(latestEntry.water_intake_ml / 1000).toFixed(1)}</p>
                <p className="text-[10px] text-navy-400">L</p>
              </div>
            )}
          </div>
        )}

        {/* Mood + Daily checklist */}
        <HomeInteractive />

        {/* Contextual symptom tip */}
        {hasActiveSymptoms && (
          <PremiumCard variant="soft" padding="lg" className="border border-attention/10">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-attention/10 shrink-0 mt-0.5">
                <Zap className="h-4 w-4 text-attention" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[13px] font-medium text-foreground mb-1">
                  {todaySymptoms.nausea && "Náusea detectada — receitas leves adaptadas para você."}
                  {todaySymptoms.fatigue && !todaySymptoms.nausea && "Cansaço registrado — dicas de energia personalizadas."}
                  {todaySymptoms.constipation && !todaySymptoms.nausea && !todaySymptoms.fatigue && "Dicas de fibra e hidratação para você."}
                  {todaySymptoms.headache && !todaySymptoms.nausea && !todaySymptoms.fatigue && !todaySymptoms.constipation && "Lembre-se de se hidratar bem hoje."}
                </p>
                <p className="text-[12px] text-navy-400">
                  Conteúdo adaptado automaticamente com base nos seus sintomas.
                </p>
              </div>
            </div>
          </PremiumCard>
        )}

        {/* Recommended recipes */}
        {contextualRecipes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-semibold text-foreground tracking-[-0.01em]">
                {hasActiveSymptoms ? "Receitas para você hoje" : "Receitas recomendadas"}
              </h2>
              <Link href="/app/recipes" className="text-[12px] font-medium text-navy-500 hover:text-navy-700 flex items-center gap-1 transition-smooth">
                Ver todas <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {contextualRecipes.map((recipe) => (
                <Link key={recipe.id} href={`/app/recipes/${recipe.slug}`}>
                  <PremiumCard variant="interactive" padding="none" className="overflow-hidden h-full">
                    <div className="h-28 bg-gradient-to-br from-navy-50 to-warm-100 dark:from-navy-800 dark:to-navy-700 flex items-center justify-center">
                      <UtensilsCrossed className="h-7 w-7 text-navy-300 dark:text-navy-500" strokeWidth={1} />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="text-[13px] font-medium text-foreground line-clamp-1">{recipe.title}</h3>
                        {recipe.is_premium && <PremiumBadge variant="default" className="text-[9px]">Plus</PremiumBadge>}
                      </div>
                      <p className="text-[12px] text-navy-500 line-clamp-2 leading-relaxed">{recipe.description}</p>
                    </div>
                  </PremiumCard>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Meal plans */}
        {mealPlans.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-semibold text-foreground tracking-[-0.01em]">
                Cardápios sugeridos
              </h2>
              <Link href="/app/food" className="text-[12px] font-medium text-navy-500 hover:text-navy-700 flex items-center gap-1 transition-smooth">
                Ver todos <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {mealPlans.map((plan) => (
                <Link key={plan.id} href={`/app/food/${plan.slug}`}>
                  <PremiumCard variant="interactive" padding="md" className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-50 dark:bg-navy-800 shrink-0">
                        <UtensilsCrossed className="h-4 w-4 text-navy-600 dark:text-navy-300" strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-[13px] font-medium text-foreground">{plan.title}</h3>
                          {plan.is_premium && <PremiumBadge variant="default" className="text-[9px]">Plus</PremiumBadge>}
                        </div>
                        <p className="text-[12px] text-navy-500 line-clamp-1">{plan.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-navy-300 shrink-0" />
                  </PremiumCard>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Articles */}
        {articles.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-semibold text-foreground tracking-[-0.01em]">
                Para ler hoje
              </h2>
              <Link href="/app/learning" className="text-[12px] font-medium text-navy-500 hover:text-navy-700 flex items-center gap-1 transition-smooth">
                Ver todos <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {articles.map((article) => (
                <Link key={article.id} href={`/app/learning/${article.slug}`}>
                  <PremiumCard variant="interactive" padding="md" className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-50 dark:bg-navy-800 shrink-0">
                        <BookOpen className="h-4 w-4 text-navy-600 dark:text-navy-300" strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-[13px] font-medium text-foreground">{article.title}</h3>
                          {article.is_premium && <PremiumBadge variant="default" className="text-[9px]">Plus</PremiumBadge>}
                        </div>
                        <p className="text-[12px] text-navy-500 line-clamp-1">{article.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-navy-300 shrink-0" />
                  </PremiumCard>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div>
          <h2 className="text-[15px] font-semibold text-foreground mb-4 tracking-[-0.01em]">
            Acesso rápido
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/app/tracker" className="group">
              <PremiumCard variant="interactive" padding="lg" className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 dark:bg-navy-800">
                    <ClipboardList className="h-5 w-5 text-navy-600 dark:text-navy-300" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-foreground">Registrar acompanhamento</p>
                    <p className="text-[12px] text-navy-400 mt-0.5">Peso, medidas e observações</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-navy-300 transition-smooth group-hover:text-navy-600 group-hover:translate-x-0.5" />
              </PremiumCard>
            </Link>
            <Link href="/app/recipes" className="group">
              <PremiumCard variant="interactive" padding="lg" className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 dark:bg-navy-800">
                    <Clock className="h-5 w-5 text-navy-600 dark:text-navy-300" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-foreground">Explorar receitas</p>
                    <p className="text-[12px] text-navy-400 mt-0.5">Opções nutritivas e práticas</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-navy-300 transition-smooth group-hover:text-navy-600 group-hover:translate-x-0.5" />
              </PremiumCard>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
