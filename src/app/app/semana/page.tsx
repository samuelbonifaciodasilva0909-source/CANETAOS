import { createClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/layout/app-shell"
import { redirect } from "next/navigation"
import { PremiumCard } from "@/components/ui/premium-card"
import { getWeekSummary } from "@/lib/personalization/week-summary"
import { Calendar, Droplets, Activity, Moon, Zap, Dumbbell, BookOpen } from "lucide-react"

export default async function WeekSummaryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)
  const sevenDaysAgoDate = sevenDaysAgo.toISOString().split("T")[0]

  const [entriesRes, symptomsRes, checklistsRes, viewsRes] = await Promise.all([
    supabase.from("tracker_entries").select("entry_date, water_intake_ml, sleep_hours, energy_level").eq("user_id", user.id).gte("entry_date", sevenDaysAgoDate),
    supabase.from("symptom_entries").select("entry_date, nausea, constipation, hair_loss, food_aversion, taste_change, fatigue, headache").eq("user_id", user.id).gte("entry_date", sevenDaysAgoDate),
    supabase.from("daily_checklists").select("entry_date, training").eq("user_id", user.id).gte("entry_date", sevenDaysAgoDate),
    supabase.from("product_events").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("event_type", "content_viewed").gte("created_at", sevenDaysAgo.toISOString()),
  ])

  const trainingRegisteredThisWeek = (checklistsRes.data || []).some((c: { training: boolean }) => c.training)

  const summary = getWeekSummary({
    entries: entriesRes.data || [],
    symptoms: symptomsRes.data || [],
    trainingRegisteredThisWeek,
    contentViewed: viewsRes.count || 0,
  })

  const stats = [
    { icon: Calendar, label: "Dias com registro", value: summary.daysLogged },
    { icon: Droplets, label: "Dias com hidratação", value: summary.daysWithHydration },
    { icon: Activity, label: "Dias com sintomas", value: summary.daysWithSymptoms },
    { icon: Moon, label: "Dias com sono registrado", value: summary.daysWithSleepLogged },
    { icon: Zap, label: "Dias com energia registrada", value: summary.daysWithEnergyLogged },
    { icon: Dumbbell, label: "Treino de resistência", value: summary.trainingRegisteredThisWeek ? "Sim" : "Não" },
    { icon: BookOpen, label: "Conteúdos visualizados", value: summary.contentViewed },
  ]

  return (
    <AppShell>
      <div className="space-y-8 max-w-[560px]">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-navy-400 mb-2">
            Resumo
          </p>
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-foreground">
            Minha semana
          </h1>
          <p className="mt-1.5 text-[14px] text-navy-500">
            Os últimos 7 dias do seu acompanhamento.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {stats.map((stat) => (
            <PremiumCard key={stat.label} variant="elevated" padding="lg">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 shrink-0">
                  <stat.icon className="h-4 w-4 text-navy-600" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[16px] font-bold font-numeric text-foreground">{stat.value}</p>
                  <p className="text-[11px] text-navy-400">{stat.label}</p>
                </div>
              </div>
            </PremiumCard>
          ))}
        </div>

        <div>
          <h2 className="text-[13px] font-medium uppercase tracking-[0.06em] text-navy-400 mb-3">
            Observações da sua semana
          </h2>
          <PremiumCard variant="soft" padding="lg">
            <ul className="space-y-2">
              {summary.observations.map((obs, i) => (
                <li key={i} className="text-[13px] text-navy-700 leading-relaxed">{obs}</li>
              ))}
            </ul>
          </PremiumCard>
        </div>
      </div>
    </AppShell>
  )
}
