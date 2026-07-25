"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { AppShell } from "@/components/layout/app-shell"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumButton } from "@/components/ui/premium-button"
import { User, Shield, CreditCard, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { MEDICATION_LABELS, TREATMENT_DURATION_LABELS, PRIMARY_GOAL_LABELS } from "@/types"

interface Profile {
  full_name: string | null
  age_confirmed: boolean
  email: string
}

interface Preferences {
  medication_name: string | null
  treatment_duration_category: string | null
  primary_goal: string | null
}

const medications = Object.entries(MEDICATION_LABELS).map(([value, label]) => ({ value, label }))
const durations = Object.entries(TREATMENT_DURATION_LABELS).map(([value, label]) => ({ value, label }))
const goals = Object.entries(PRIMARY_GOAL_LABELS).map(([value, label]) => ({ value, label }))

function InlineEditable({ label, value, onSave }: { label: string; value: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
      <span className="text-[13px] text-navy-500 dark:text-navy-400">{label}</span>
      {editing ? (
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") { onSave(draft); setEditing(false) }
              if (e.key === "Escape") { setDraft(value); setEditing(false) }
            }}
            className="w-48 rounded-lg border border-border/60 bg-card px-2.5 py-1.5 text-[13px] text-foreground outline-none focus:border-navy-400 dark:focus:border-navy-500 transition-smooth"
          />
          <button onClick={() => { onSave(draft); setEditing(false) }} className="rounded-lg p-1.5 hover:bg-positive/10 text-positive transition-smooth">
            <Check className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
          <button onClick={() => { setDraft(value); setEditing(false) }} className="rounded-lg p-1.5 hover:bg-error/10 text-error transition-smooth">
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
      ) : (
        <button onClick={() => setEditing(true)} className="text-[13px] font-medium text-foreground hover:text-navy-600 dark:hover:text-navy-300 transition-smooth">
          {value || "Não informado"}
        </button>
      )}
    </div>
  )
}

function InlineSelect({ label, value, options, onSave }: { label: string; value: string | null; options: { value: string; label: string }[]; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value || "")

  const displayLabel = options.find((o) => o.value === value)?.label || value || "Não informado"

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
      <span className="text-[13px] text-navy-500 dark:text-navy-400">{label}</span>
      {editing ? (
        <div className="flex items-center gap-1.5">
          <select
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
            className="w-48 rounded-lg border border-border/60 bg-card px-2.5 py-1.5 text-[13px] text-foreground outline-none focus:border-navy-400 dark:focus:border-navy-500 transition-smooth appearance-none"
          >
            <option value="">Selecionar...</option>
            {options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button onClick={() => { if (draft) onSave(draft); setEditing(false) }} className="rounded-lg p-1.5 hover:bg-positive/10 text-positive transition-smooth">
            <Check className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
          <button onClick={() => setEditing(false)} className="rounded-lg p-1.5 hover:bg-error/10 text-error transition-smooth">
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
      ) : (
        <button onClick={() => setEditing(true)} className="text-[13px] font-medium text-foreground hover:text-navy-600 dark:hover:text-navy-300 transition-smooth">
          {displayLabel}
        </button>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [preferences, setPreferences] = useState<Preferences | null>(null)
  const [userId, setUserId] = useState("")
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }, [])

  const loadData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    const [profRes, prefRes] = await Promise.all([
      supabase.from("profiles").select("full_name, age_confirmed").eq("id", user.id).single(),
      supabase.from("user_preferences").select("medication_name, treatment_duration_category, primary_goal").eq("user_id", user.id).single(),
    ])

    setProfile({
      full_name: (profRes.data as { full_name: string | null })?.full_name || null,
      age_confirmed: (profRes.data as { age_confirmed: boolean })?.age_confirmed || false,
      email: user.email || "",
    })
    setPreferences(prefRes.data as Preferences | null)
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  async function updateProfile(field: string, value: string) {
    const supabase = createClient()
    const { error } = await supabase.from("profiles").update({ [field]: value }).eq("id", userId)
    if (!error) {
      setProfile((prev) => prev ? { ...prev, [field]: value } : prev)
      showToast("Perfil atualizado")
    }
  }

  async function updatePreference(field: string, value: string) {
    const supabase = createClient()
    const { error } = await supabase.from("user_preferences").update({ [field]: value }).eq("user_id", userId)
    if (!error) {
      setPreferences((prev) => prev ? { ...prev, [field]: value } : prev)
      showToast("Preferência atualizada")
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-[13px] text-navy-400">Carregando...</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-10 max-w-[560px]">

        {/* Toast */}
        {toast && (
          <div className="fixed top-20 right-6 z-50 rounded-xl bg-foreground text-background px-4 py-2.5 text-[13px] font-medium shadow-lg">
            {toast}
          </div>
        )}

        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-foreground">
            Configurações
          </h1>
          <p className="mt-1.5 text-[14px] text-navy-500 dark:text-navy-400">
            Gerencie suas preferências e informações.
          </p>
        </div>

        <PremiumCard variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-5">
            <User className="h-4 w-4 text-navy-400" strokeWidth={1.5} />
            <h3 className="text-[13px] font-medium text-foreground">
              Informações Pessoais
            </h3>
          </div>
          <div className="space-y-0">
            <InlineEditable label="Nome" value={profile?.full_name || ""} onSave={(v) => updateProfile("full_name", v)} />
            <div className="flex items-center justify-between py-2.5 border-b border-border/40">
              <span className="text-[13px] text-navy-500 dark:text-navy-400">E-mail</span>
              <span className="text-[13px] font-medium text-foreground">{profile?.email}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-[13px] text-navy-500 dark:text-navy-400">Idade confirmada (18+)</span>
              <span className="text-[13px] font-medium text-foreground">{profile?.age_confirmed ? "Sim" : "Não"}</span>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-5">
            <Shield className="h-4 w-4 text-navy-400" strokeWidth={1.5} />
            <h3 className="text-[13px] font-medium text-foreground">
              Preferências
            </h3>
          </div>
          <div className="space-y-0">
            <InlineSelect label="Tratamento" value={preferences?.medication_name ?? null} options={medications} onSave={(v) => updatePreference("medication_name", v)} />
            <InlineSelect label="Duração" value={preferences?.treatment_duration_category ?? null} options={durations} onSave={(v) => updatePreference("treatment_duration_category", v)} />
            <InlineSelect label="Dor principal" value={preferences?.primary_goal ?? null} options={goals} onSave={(v) => updatePreference("primary_goal", v)} />
          </div>
        </PremiumCard>

        <PremiumCard variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-5">
            <CreditCard className="h-4 w-4 text-navy-400" strokeWidth={1.5} />
            <h3 className="text-[13px] font-medium text-foreground">
              Assinatura
            </h3>
          </div>
          <p className="text-[13px] text-navy-500 dark:text-navy-400 mb-4">
            Você está no plano{" "}
            <span className="font-medium text-foreground">Starter</span> (gratuito).
          </p>
          <a href="/app/plus">
            <PremiumButton variant="secondary" size="sm">
              Conhecer CanetaOS Plus
            </PremiumButton>
          </a>
        </PremiumCard>

        <PremiumCard variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-5">
            <Shield className="h-4 w-4 text-navy-400" strokeWidth={1.5} />
            <h3 className="text-[13px] font-medium text-foreground">
              Privacidade e Segurança
            </h3>
          </div>
          <p className="text-[13px] text-navy-500 dark:text-navy-400 leading-relaxed">
            Seus dados são protegidos e nunca são compartilhados com terceiros.
            Você pode solicitar a exclusão de sua conta a qualquer momento.
          </p>
        </PremiumCard>
      </div>
    </AppShell>
  )
}
