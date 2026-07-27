"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { AppShell } from "@/components/layout/app-shell"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { HomeInteractive } from "@/components/home-interactive"
import { WeightChart } from "@/components/weight-chart"
import { ProgressRing } from "@/components/ui/progress-ring"
import { getRecipeVisual } from "@/lib/content/recipe-visual"
import { ErrorState } from "@/components/ui/error-state"
import { WaterTracker } from "@/components/water-tracker"
import { pickTipOfDay, type Tip } from "@/lib/content/tips"
import { getPersonalizedContext } from "@/lib/personalization/context"
import { getNextStepCTA, getTodayFocusActions } from "@/lib/personalization/next-step"
import { getWeekSummary } from "@/lib/personalization/week-summary"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  ArrowRight,
  TrendingUp,
  Syringe,
  Target,
  BookOpen,
  UtensilsCrossed,
  ChevronRight,
  Droplets,
  Zap,
  Lightbulb,
  Star,
  Heart,
  Smile,
  Meh,
  Frown,
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
  const [waterGoal, setWaterGoal] = useState(2000)
  const [preferences, setPreferences] = useState<{ primary_goal: string | null; treatment_duration_category: string | null } | null>(null)
  const [tip, setTip] = useState<Tip | null>(null)
  const [contentViewedWeek, setContentViewedWeek] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setError(null)
    const isDemo = document.cookie.includes("demo_auth=true")
    const supabase = createClient()

    async function loadTip(phase: string | null) {
      const { data } = await supabase
        .from("content_items")
        .select("title, content, tags")
        .eq("type", "tip")
        .eq("is_published", true)
      if (data) {
        setTip(pickTipOfDay(data.map((t) => ({ title: t.title, content: t.content, tags: (t.tags as string[]) || [] })), phase))
      }
    }

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
        setWaterGoal(demo.preferences?.daily_water_goal_ml || 2000)
        setPreferences(demo.preferences || null)
        setContentViewedWeek(2)
        await loadTip(demo.preferences?.treatment_duration_category || null)
        setLoading(false)
        return
      } catch {}
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) console.error("Falha ao obter usuário:", userError.message)
      if (!user) return
      setUserId(user.id)

      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
      sevenDaysAgo.setHours(0, 0, 0, 0)

      const [profRes, entriesRes, symptomsRes, recipesRes, articlesRes, mealsRes, checklistRes, prefsRes, viewsRes] = await Promise.all([
        supabase.from("profiles").select("full_name, onboarding_completed, created_at").eq("id", user.id).single(),
        supabase.from("tracker_entries").select("*").eq("user_id", user.id).order("entry_date", { ascending: false }).limit(30),
        supabase.from("symptom_entries").select("entry_date, nausea, constipation, fatigue, headache").eq("user_id", user.id).order("entry_date", { ascending: false }).limit(14),
        supabase.from("content_items").select("id, title, slug, description, type, is_premium, tags").eq("type", "recipe").eq("is_published", true).order("created_at", { ascending: false }).limit(4),
        supabase.from("content_items").select("id, title, slug, description, type, is_premium, tags").eq("type", "educational").eq("is_published", true).order("created_at", { ascending: false }).limit(3),
        supabase.from("content_items").select("id, title, slug, description, type, is_premium, tags").eq("type", "meal_plan").eq("is_published", true).order("created_at", { ascending: false }).limit(3),
        supabase.from("daily_checklists").select("*").eq("user_id", user.id).eq("entry_date", new Date().toISOString().split("T")[0]).single(),
        supabase.from("user_preferences").select("daily_water_goal_ml, treatment_duration_category, primary_goal").eq("user_id", user.id).single(),
        supabase.from("product_events").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("event_type", "content_viewed").gte("created_at", sevenDaysAgo.toISOString()),
      ])

      if (profRes.data) setProfile(profRes.data)
      if (entriesRes.data) setEntries(entriesRes.data as TrackerEntry[])
      if (symptomsRes.data) setSymptoms(symptomsRes.data as SymptomEntry[])
      if (recipesRes.data) setRecipes(recipesRes.data as ContentItem[])
      if (articlesRes.data) setArticles(articlesRes.data as ContentItem[])
      if (mealsRes.data) setMealPlans(mealsRes.data as ContentItem[])
      if (checklistRes.data) setChecklist(checklistRes.data as DailyChecklist)
      const prefs = prefsRes.data as { daily_water_goal_ml: number; treatment_duration_category: string | null; primary_goal: string | null } | null
      setWaterGoal(prefs?.daily_water_goal_ml || 2000)
      setPreferences(prefs)
      setContentViewedWeek(viewsRes.count || 0)
      await loadTip(prefs?.treatment_duration_category || null)

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
    } catch (err) {
      console.error("Falha ao carregar dados da home:", err)
      setError("Não foi possível carregar sua Home agora.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const todayStr = new Date().toISOString().split("T")[0]
  const isDemo = typeof document !== "undefined" && document.cookie.includes("demo_auth=true")

  function handleWaterLogged(newTodayMl: number) {
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.entry_date === todayStr)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], water_intake_ml: newTodayMl }
        return next
      }
      return [{ entry_date: todayStr, weight_kg: null, waist_measurement: null, protein_intake_g: null, water_intake_ml: newTodayMl, dose_applied: null, mood: null, energy_level: null }, ...prev]
    })
  }

  const todayWaterMl = entries.find((e) => e.entry_date === todayStr)?.water_intake_ml || 0

  const personalizedContext = useMemo(
    () => getPersonalizedContext({ entries, symptoms, preferences }),
    [entries, symptoms, preferences]
  )
  const nextStep = useMemo(() => getNextStepCTA(personalizedContext), [personalizedContext])
  const focusActions = useMemo(() => getTodayFocusActions(personalizedContext), [personalizedContext])
  const weekSummary = useMemo(
    () => getWeekSummary({ entries, symptoms, trainingRegisteredThisWeek: false, contentViewed: contentViewedWeek }),
    [entries, symptoms, contentViewedWeek]
  )

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

  // Resumo de hoje — stat rings
  const waterPct = Math.min(100, Math.round((todayWaterMl / waterGoal) * 100))
  const checklistPct = Math.round((completedChecks / 7) * 100)
  const streakPct = Math.min(100, Math.round((streak / 7) * 100))
  const symptomCount = todaySymptoms
    ? [todaySymptoms.nausea, todaySymptoms.constipation, todaySymptoms.fatigue, todaySymptoms.headache].filter(Boolean).length
    : 0
  const wellnessPct = todaySymptoms ? Math.max(0, 100 - symptomCount * 25) : 100
  const moodLabel = !todaySymptoms ? "Sem registro" : symptomCount === 0 ? "Leve" : symptomCount <= 2 ? "Moderado" : "Intenso"
  const MoodIcon = !todaySymptoms || symptomCount === 0 ? Smile : symptomCount <= 2 ? Meh : Frown

  const hasWeightChart = entries.length >= 2 && entries.some((e) => e.weight_kg != null)
  const suggestion = contextualRecipes[0] || mealPlans[0]

  if (error) {
    return (
      <AppShell>
        <ErrorState message={error} onRetry={() => { setLoading(true); loadData() }} />
      </AppShell>
    )
  }

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

        {/* Hero — Seu foco de hoje, driven by getPersonalizedContext */}
        <Link href={nextStep.href} className="block group">
          <div className="relative overflow-hidden rounded-3xl bg-aurora p-6 sm:p-8 text-white shadow-aurora transition-smooth group-hover:brightness-[1.08]">
            <div className="relative z-10 max-w-md">
              <div className="flex items-center gap-1.5 mb-3 text-[12px] font-medium text-white/80">
                <Star className="h-3.5 w-3.5" strokeWidth={0} fill="currentColor" />
                Seu foco de hoje
              </div>
              <p className="text-[22px] sm:text-[26px] font-semibold tracking-[-0.02em] leading-snug mb-2">
                {nextStep.label}
              </p>
              <p className="text-[13px] text-white/75 leading-relaxed">
                Cada passo importa. Você está indo muito bem!
              </p>
            </div>
            <Target className="pointer-events-none absolute -right-6 -bottom-8 h-36 w-36 text-white/10 sm:h-44 sm:w-44" strokeWidth={1} />
            <Target className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 h-16 w-16 text-white/20 sm:block" strokeWidth={1.2} />
          </div>
        </Link>

        {/* Today's focus — max 3 contextual actions, no medical tasking */}
        {focusActions.length > 0 && (
          <div>
            <h2 className="text-[13px] font-medium uppercase tracking-[0.06em] text-navy-400 mb-3">
              Próximas ações
            </h2>
            <div className="grid gap-2 sm:grid-cols-3">
              {focusActions.map((action) => (
                <Link key={action.key} href={action.href}>
                  <PremiumCard variant="interactive" padding="md" className="h-full flex items-center justify-between gap-2">
                    <span className="text-[13px] font-medium text-foreground">{action.label}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-navy-300 shrink-0" strokeWidth={1.5} />
                  </PremiumCard>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Resumo de hoje — stat rings */}
        <div>
          <h2 className="text-[13px] font-medium uppercase tracking-[0.06em] text-navy-400 mb-3">
            Resumo de hoje
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <PremiumCard variant="elevated" padding="md">
              <div className="flex items-start justify-between mb-3">
                <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-navy-400">Água</span>
                <ProgressRing pct={waterPct} size={40} strokeWidth={3.5} colorClassName="stroke-sky-500">
                  <span className="text-[9px] font-bold font-numeric text-sky-500">{waterPct}%</span>
                </ProgressRing>
              </div>
              <p className="text-[18px] font-bold font-numeric text-foreground">{(todayWaterMl / 1000).toFixed(1)} L</p>
              <p className="text-[11px] text-navy-400">Meta: {(waterGoal / 1000).toFixed(1)} L</p>
            </PremiumCard>

            <PremiumCard variant="elevated" padding="md">
              <div className="flex items-start justify-between mb-3">
                <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-navy-400">Rotina</span>
                <ProgressRing pct={checklistPct} size={40} strokeWidth={3.5} colorClassName="stroke-emerald-500">
                  <UtensilsCrossed className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2} />
                </ProgressRing>
              </div>
              <p className="text-[18px] font-bold font-numeric text-foreground">{completedChecks} / 7</p>
              <p className="text-[11px] text-navy-400">Hábitos hoje</p>
            </PremiumCard>

            <PremiumCard variant="elevated" padding="md">
              <div className="flex items-start justify-between mb-3">
                <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-navy-400">Sintomas</span>
                <ProgressRing pct={wellnessPct} size={40} strokeWidth={3.5} colorClassName="stroke-amber-500">
                  <MoodIcon className="h-3.5 w-3.5 text-amber-500" strokeWidth={2} />
                </ProgressRing>
              </div>
              <p className="text-[18px] font-bold text-foreground">{moodLabel}</p>
              <p className="text-[11px] text-navy-400">Como se sente</p>
            </PremiumCard>

            <PremiumCard variant="elevated" padding="md">
              <div className="flex items-start justify-between mb-3">
                <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-navy-400">Sequência</span>
                <ProgressRing pct={streakPct} size={40} strokeWidth={3.5} colorClassName="stroke-violet-500">
                  <span className="text-[9px] font-bold font-numeric text-violet-500">{streakPct}%</span>
                </ProgressRing>
              </div>
              <p className="text-[18px] font-bold font-numeric text-foreground">{streak}</p>
              <p className="text-[11px] text-navy-400">dias seguidos</p>
            </PremiumCard>
          </div>
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

        {/* Evolução + próxima refeição sugerida */}
        {(hasWeightChart || suggestion) && (
          <div className="grid gap-4 lg:grid-cols-5">
            {hasWeightChart && (
              <div className={cn(suggestion ? "lg:col-span-3" : "lg:col-span-5")}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[13px] font-medium uppercase tracking-[0.06em] text-navy-400">
                    Evolução do peso
                  </h2>
                  <Link href="/app/tracker" className="text-[12px] font-medium text-navy-500 hover:text-navy-700 flex items-center gap-1 transition-smooth">
                    Ver tudo <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
                <PremiumCard variant="elevated" padding="lg" className="h-[calc(100%-2rem)]">
                  <WeightChart entries={entries} />
                </PremiumCard>
              </div>
            )}

            {suggestion && (
              <div className={cn(hasWeightChart ? "lg:col-span-2" : "lg:col-span-5")}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[13px] font-medium uppercase tracking-[0.06em] text-navy-400">
                    Próxima refeição sugerida
                  </h2>
                </div>
                <Link href={`/app/${contextualRecipes[0] ? "recipes" : "food"}/${suggestion.slug}`}>
                  {(() => {
                    const visual = getRecipeVisual(suggestion.title, suggestion.tags || [])
                    return (
                      <PremiumCard variant="interactive" padding="none" className="overflow-hidden h-full">
                        <div className={`h-28 bg-gradient-to-br ${visual.gradient} dark:from-navy-800 dark:to-navy-700 flex items-center justify-center`}>
                          <visual.icon className={`h-8 w-8 ${visual.iconClass} dark:text-navy-500`} strokeWidth={1} />
                        </div>
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-1.5">
                            <h3 className="text-[13px] font-medium text-foreground line-clamp-1">{suggestion.title}</h3>
                            {suggestion.is_premium && <PremiumBadge variant="default" className="text-[9px]">Plus</PremiumBadge>}
                          </div>
                          {suggestion.tags && suggestion.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {suggestion.tags.slice(0, 3).map((t) => (
                                <span key={t} className="rounded-md bg-warm-100 dark:bg-navy-800 px-1.5 py-0.5 text-[10px] text-navy-500 dark:text-navy-400">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="text-[12px] text-navy-500 line-clamp-2 leading-relaxed mb-2">{suggestion.description}</p>
                          <span className="text-[12px] font-medium text-violet-600 dark:text-violet-400 flex items-center gap-1">
                            Ver receita completa <ChevronRight className="h-3 w-3" />
                          </span>
                        </div>
                      </PremiumCard>
                    )
                  })()}
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tip of the day */}
        {tip && (
          <PremiumCard variant="soft" padding="lg" className="border border-border/40">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-50 shrink-0">
                <Lightbulb className="h-4 w-4 text-navy-600" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-navy-400 mb-1">
                  Dica do dia
                </p>
                <p className="text-[13px] font-medium text-foreground mb-1">{tip.title}</p>
                <p className="text-[13px] text-navy-500 leading-relaxed">{tip.content}</p>
              </div>
            </div>
          </PremiumCard>
        )}

        {/* Hydration */}
        <WaterTracker
          entries={entries}
          goalMl={waterGoal}
          todayMl={todayWaterMl}
          isDemo={isDemo}
          onLogged={handleWaterLogged}
        />

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
              {contextualRecipes.map((recipe) => {
                const visual = getRecipeVisual(recipe.title, recipe.tags || [])
                return (
                <Link key={recipe.id} href={`/app/recipes/${recipe.slug}`}>
                  <PremiumCard variant="interactive" padding="none" className="overflow-hidden h-full">
                    <div className={`h-28 bg-gradient-to-br ${visual.gradient} dark:from-navy-800 dark:to-navy-700 flex items-center justify-center`}>
                      <visual.icon className={`h-7 w-7 ${visual.iconClass} dark:text-navy-500`} strokeWidth={1} />
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
                )
              })}
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

        {/* Minha Semana — compact summary, full breakdown at /app/semana */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-medium uppercase tracking-[0.06em] text-navy-400">
              Minha semana
            </h2>
            <Link href="/app/semana" className="text-[12px] font-medium text-navy-500 hover:text-navy-700 flex items-center gap-1 transition-smooth">
              Ver mais <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <PremiumCard variant="elevated" padding="lg">
            <p className="text-[13px] text-navy-700 leading-relaxed">{weekSummary.observations[0]}</p>
            {weekSummary.observations.length > 1 && (
              <p className="text-[13px] text-navy-500 leading-relaxed mt-1">{weekSummary.observations[1]}</p>
            )}
          </PremiumCard>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-[15px] font-semibold text-foreground mb-4 tracking-[-0.01em]">
            Atalhos rápidos
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[
              { href: "/app/tracker", icon: Smile, label: "Como me sinto" },
              { href: "/app/food", icon: UtensilsCrossed, label: "Refeição" },
              { href: "/app/tracker", icon: Droplets, label: "Água" },
              { href: "/app/learning", icon: BookOpen, label: "Conteúdos" },
              { href: "/app/semana", icon: TrendingUp, label: "Evolução" },
              { href: "/app/colecao", icon: Heart, label: "Favoritas" },
            ].map((action) => (
              <Link key={action.label} href={action.href} className="group">
                <PremiumCard variant="interactive" padding="sm" className="flex flex-col items-center gap-2 text-center h-full">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 dark:bg-violet-500/15 group-hover:bg-violet-500/15 dark:group-hover:bg-violet-500/20 transition-smooth">
                    <action.icon className="h-[18px] w-[18px] text-violet-600 dark:text-violet-300" strokeWidth={1.5} />
                  </div>
                  <span className="text-[11px] font-medium text-foreground leading-tight">{action.label}</span>
                </PremiumCard>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
