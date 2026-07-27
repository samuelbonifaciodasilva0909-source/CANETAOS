"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { AppShell } from "@/components/layout/app-shell"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { TrackerForm } from "@/components/tracker-form"
import { ErrorState } from "@/components/ui/error-state"
import {
  Plus,
  Scale,
  Ruler,
  Droplets,
  Beef,
  Moon,
  Zap,
  Activity,
  ChevronLeft,
  ChevronRight,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"

type TrackerRow = {
  id: string
  entry_date: string
  weight_kg: number | null
  waist_measurement: number | null
  hip_measurement: number | null
  chest_measurement: number | null
  arm_measurement: number | null
  thigh_measurement: number | null
  mood: string | null
  energy_level: number | null
  sleep_hours: number | null
  water_intake_ml: number | null
  protein_intake_g: number | null
  dose_applied: boolean | null
  notes: string | null
}

type SymptomRow = {
  id: string
  entry_date: string
  nausea: boolean
  constipation: boolean
  hair_loss: boolean
  food_aversion: boolean
  taste_change: boolean
  fatigue: boolean
  headache: boolean
  other_notes: string | null
}

export default function TrackerPage() {
  const [entries, setEntries] = useState<TrackerRow[]>([])
  const [symptoms, setSymptoms] = useState<SymptomRow[]>([])
  const [userId, setUserId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingDate, setEditingDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [editingData, setEditingData] = useState<TrackerRow | null>(null)
  const [editingSymptoms, setEditingSymptoms] = useState<SymptomRow | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setError(null)
    const isDemo = document.cookie.includes("demo_auth=true")

    if (isDemo) {
      try {
        const res = await fetch("/api/demo/data")
        const demo = await res.json()
        setEntries(demo.trackerEntries.map((e: TrackerRow, i: number) => ({ ...e, id: `demo-${i}` })))
        setSymptoms(demo.symptomEntries.map((s: SymptomRow, i: number) => ({ ...s, id: `demo-sym-${i}` })))
        setUserId("demo-user-id")
        setLoading(false)
        return
      } catch {}
    }

    try {
      const supabase = createClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) console.error("Falha ao obter usuário:", userError.message)
      if (!user) return
      setUserId(user.id)

      const { data: trackerData } = await supabase
        .from("tracker_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("entry_date", { ascending: false })
        .limit(30)

      const { data: symptomData } = await supabase
        .from("symptom_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("entry_date", { ascending: false })
        .limit(30)

      setEntries(trackerData || [])
      setSymptoms(symptomData || [])
    } catch (err) {
      console.error("Falha ao carregar tracker:", err)
      setError("Não foi possível carregar seu histórico agora.")
    } finally {
      setLoading(false)
    }
  }

  function openNewEntry() {
    setEditingDate(new Date().toISOString().split("T")[0])
    setEditingData(null)
    setEditingSymptoms(null)
    setShowForm(true)
  }

  function openEditEntry(entry: TrackerRow) {
    setEditingDate(entry.entry_date)
    setEditingData(entry)
    const sym = symptoms.find((s) => s.entry_date === entry.entry_date)
    setEditingSymptoms(sym || null)
    setShowForm(true)
  }

  async function handleDelete(entryId: string) {
    const supabase = createClient()
    await supabase.from("tracker_entries").delete().eq("id", entryId)
    loadData()
  }

  function handleSaved() {
    setShowForm(false)
    loadData()
  }

  const latestWeight = entries[0]?.weight_kg
  const previousWeight = entries[1]?.weight_kg
  const weightDiff = latestWeight && previousWeight ? latestWeight - previousWeight : null

  if (error) {
    return (
      <AppShell>
        <ErrorState message={error} onRetry={() => { setLoading(true); loadData() }} />
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-navy-400 mb-2">
              Acompanhamento
            </p>
            <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-foreground">
              Minha Jornada
            </h1>
            <p className="mt-1.5 text-[14px] text-navy-500">
              Registros ao longo do tempo.
            </p>
          </div>
          <button
            onClick={openNewEntry}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-navy-900 text-[13px] font-medium text-white hover:bg-navy-800 transition-smooth"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Novo registro
          </button>
        </div>

        {showForm && (
          <PremiumCard variant="elevated" padding="xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-semibold text-foreground">
                {editingData ? "Editar registro" : "Novo registro"} — {new Date(editingDate + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-navy-400 hover:text-navy-700">
                <span className="sr-only">Fechar</span>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <TrackerForm
              date={editingDate}
              initialData={editingData ? {
                ...editingData,
                symptoms: editingSymptoms ? {
                  nausea: editingSymptoms.nausea,
                  constipation: editingSymptoms.constipation,
                  hair_loss: editingSymptoms.hair_loss,
                  food_aversion: editingSymptoms.food_aversion,
                  taste_change: editingSymptoms.taste_change,
                  fatigue: editingSymptoms.fatigue,
                  headache: editingSymptoms.headache,
                } : null,
              } : null}
              onSaved={handleSaved}
              onCancel={() => setShowForm(false)}
            />
          </PremiumCard>
        )}

        {!showForm && entries.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <PremiumCard variant="elevated" padding="lg">
              <div className="flex items-center gap-2 mb-2">
                <Scale className="h-3.5 w-3.5 text-navy-400" strokeWidth={1.5} />
                <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-navy-400">Peso</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[22px] font-bold font-numeric text-foreground tracking-tight">
                  {latestWeight || "—"}
                </span>
                {latestWeight && <span className="text-[12px] text-navy-400">kg</span>}
              </div>
              {weightDiff !== null && (
                <div className={cn(
                  "flex items-center gap-1 mt-1",
                  weightDiff < 0 ? "text-positive" : weightDiff > 0 ? "text-error" : "text-navy-400"
                )}>
                  {weightDiff < 0 ? <TrendingDown className="h-3 w-3" /> : weightDiff > 0 ? <TrendingUp className="h-3 w-3" /> : null}
                  <span className="text-[11px] font-medium font-numeric">
                    {weightDiff > 0 ? "+" : ""}{weightDiff.toFixed(1)} kg
                  </span>
                </div>
              )}
            </PremiumCard>

            <PremiumCard variant="elevated" padding="lg">
              <div className="flex items-center gap-2 mb-2">
                <Ruler className="h-3.5 w-3.5 text-navy-400" strokeWidth={1.5} />
                <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-navy-400">Cintura</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[22px] font-bold font-numeric text-foreground tracking-tight">
                  {entries[0]?.waist_measurement || "—"}
                </span>
                {entries[0]?.waist_measurement && <span className="text-[12px] text-navy-400">cm</span>}
              </div>
            </PremiumCard>

            <PremiumCard variant="elevated" padding="lg">
              <div className="flex items-center gap-2 mb-2">
                <Beef className="h-3.5 w-3.5 text-navy-400" strokeWidth={1.5} />
                <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-navy-400">Proteína</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[22px] font-bold font-numeric text-foreground tracking-tight">
                  {entries[0]?.protein_intake_g || "—"}
                </span>
                {entries[0]?.protein_intake_g && <span className="text-[12px] text-navy-400">g</span>}
              </div>
            </PremiumCard>

            <PremiumCard variant="elevated" padding="lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-3.5 w-3.5 text-navy-400" strokeWidth={1.5} />
                <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-navy-400">Registros</span>
              </div>
              <span className="text-[22px] font-bold text-foreground tracking-tight">
                {entries.length}
              </span>
              <span className="text-[12px] text-navy-400 ml-1">dias</span>
            </PremiumCard>
          </div>
        )}

        {!showForm && entries.length > 0 && (
          <div>
            <h2 className="text-[13px] font-medium uppercase tracking-[0.06em] text-navy-400 mb-4">
              Registros recentes
            </h2>
            <div className="space-y-2">
              {entries.map((entry) => {
                const sym = symptoms.find((s) => s.entry_date === entry.entry_date)
                return (
                  <button
                    key={entry.id}
                    onClick={() => openEditEntry(entry)}
                    className="w-full text-left"
                  >
                    <PremiumCard variant="interactive" padding="md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-[13px] font-semibold text-navy-700 shrink-0">
                            {new Date(entry.entry_date + "T12:00:00").getDate()}
                          </div>
                          <div>
                            <p className="text-[13px] font-medium text-foreground">
                              {new Date(entry.entry_date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })}
                            </p>
                            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                              {entry.weight_kg && (
                                <span className="text-[11px] text-navy-500 flex items-center gap-1">
                                  <Scale className="h-3 w-3" strokeWidth={1.5} /> {entry.weight_kg} kg
                                </span>
                              )}
                              {entry.waist_measurement && (
                                <span className="text-[11px] text-navy-500 flex items-center gap-1">
                                  <Ruler className="h-3 w-3" strokeWidth={1.5} /> {entry.waist_measurement} cm
                                </span>
                              )}
                              {entry.dose_applied === true && (
                                <PremiumBadge variant="success">Dose</PremiumBadge>
                              )}
                              {sym && (sym.nausea || sym.fatigue || sym.headache) && (
                                <PremiumBadge variant="warning">Sintomas</PremiumBadge>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(entry.id) }}
                          className="p-2 rounded-lg text-navy-400 hover:text-error hover:bg-error/5 transition-smooth shrink-0"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    </PremiumCard>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {!showForm && entries.length === 0 && !loading && (
          <div className="pt-8">
            <PremiumCard variant="soft" padding="xl" className="text-center max-w-md mx-auto">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-100 mb-4 mx-auto">
                <Plus className="h-5 w-5 text-navy-600" strokeWidth={1.5} />
              </div>
              <h3 className="text-[15px] font-semibold text-foreground mb-2">
                Seu histórico começa aqui
              </h3>
              <p className="text-[13px] text-navy-500 leading-relaxed mb-6">
                Comece registrando seus dados de acompanhamento para acompanhar
                sua jornada ao longo do tempo.
              </p>
              <button
                onClick={openNewEntry}
                className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-navy-900 text-[13px] font-medium text-white hover:bg-navy-800 transition-smooth"
              >
                <Plus className="h-4 w-4" strokeWidth={1.5} />
                Registrar acompanhamento
              </button>
            </PremiumCard>
          </div>
        )}
      </div>
    </AppShell>
  )
}
