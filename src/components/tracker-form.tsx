"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { PremiumCard } from "@/components/ui/premium-card"
import {
  Scale,
  Ruler,
  Droplets,
  Beef,
  Moon,
  Zap,
  Smile,
  Frown,
  Meh,
  ThumbsUp,
  ThumbsDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Save,
  X,
  Activity,
} from "lucide-react"

interface TrackerFormProps {
  date: string
  initialData?: {
    weight_kg?: number | null
    waist_measurement?: number | null
    hip_measurement?: number | null
    chest_measurement?: number | null
    arm_measurement?: number | null
    thigh_measurement?: number | null
    mood?: string | null
    energy_level?: number | null
    sleep_hours?: number | null
    water_intake_ml?: number | null
    protein_intake_g?: number | null
    dose_applied?: boolean | null
    notes?: string | null
    symptoms?: {
      nausea?: boolean
      constipation?: boolean
      hair_loss?: boolean
      food_aversion?: boolean
      taste_change?: boolean
      fatigue?: boolean
      headache?: boolean
    } | null
  } | null
  onSaved: () => void
  onCancel: () => void
}

const SYMPTOMS = [
  { key: "nausea", label: "Náusea", emoji: "🤢" },
  { key: "constipation", label: "Constipação", emoji: "😰" },
  { key: "hair_loss", label: "Queda de cabelo", emoji: "💇" },
  { key: "food_aversion", label: "Aversão alimentar", emoji: "😣" },
  { key: "taste_change", label: "Mudança de gosto", emoji: "👅" },
  { key: "fatigue", label: "Cansaço", emoji: "😴" },
  { key: "headache", label: "Dor de cabeça", emoji: "🤕" },
] as const

const MOODS = [
  { value: "great", label: "Ótimo", icon: ThumbsUp },
  { value: "good", label: "Bem", icon: Smile },
  { value: "neutral", label: "Neutro", icon: Meh },
  { value: "bad", label: "Mal", icon: Frown },
  { value: "terrible", label: "Péssimo", icon: ThumbsDown },
]

export function TrackerForm({ date, initialData, onSaved, onCancel }: TrackerFormProps) {
  const [weight, setWeight] = useState(initialData?.weight_kg?.toString() || "")
  const [waist, setWaist] = useState(initialData?.waist_measurement?.toString() || "")
  const [hip, setHip] = useState(initialData?.hip_measurement?.toString() || "")
  const [chest, setChest] = useState(initialData?.chest_measurement?.toString() || "")
  const [arm, setArm] = useState(initialData?.arm_measurement?.toString() || "")
  const [thigh, setThigh] = useState(initialData?.thigh_measurement?.toString() || "")
  const [mood, setMood] = useState(initialData?.mood || "")
  const [energy, setEnergy] = useState(initialData?.energy_level || 0)
  const [sleep, setSleep] = useState(initialData?.sleep_hours?.toString() || "")
  const [water, setWater] = useState(initialData?.water_intake_ml?.toString() || "")
  const [protein, setProtein] = useState(initialData?.protein_intake_g?.toString() || "")
  const [dose, setDose] = useState(initialData?.dose_applied ?? null)
  const [notes, setNotes] = useState(initialData?.notes || "")
  const [symptoms, setSymptoms] = useState<Record<string, boolean>>({
    nausea: initialData?.symptoms?.nausea ?? false,
    constipation: initialData?.symptoms?.constipation ?? false,
    hair_loss: initialData?.symptoms?.hair_loss ?? false,
    food_aversion: initialData?.symptoms?.food_aversion ?? false,
    taste_change: initialData?.symptoms?.taste_change ?? false,
    fatigue: initialData?.symptoms?.fatigue ?? false,
    headache: initialData?.symptoms?.headache ?? false,
  })
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<"body" | "feel" | "symptoms">("body")

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const trackerData = {
      user_id: user.id,
      entry_date: date,
      weight_kg: weight ? parseFloat(weight) : null,
      waist_measurement: waist ? parseFloat(waist) : null,
      hip_measurement: hip ? parseFloat(hip) : null,
      chest_measurement: chest ? parseFloat(chest) : null,
      arm_measurement: arm ? parseFloat(arm) : null,
      thigh_measurement: thigh ? parseFloat(thigh) : null,
      mood: mood || null,
      energy_level: energy || null,
      sleep_hours: sleep ? parseFloat(sleep) : null,
      water_intake_ml: water ? parseInt(water) : null,
      protein_intake_g: protein ? parseFloat(protein) : null,
      dose_applied: dose,
      notes: notes || null,
    }

    const { data: existing } = await supabase
      .from("tracker_entries")
      .select("id")
      .eq("user_id", user.id)
      .eq("entry_date", date)
      .single()

    if (existing) {
      await supabase.from("tracker_entries").update(trackerData).eq("id", existing.id)
    } else {
      await supabase.from("tracker_entries").insert(trackerData)
    }

    const hasSymptoms = Object.values(symptoms).some(Boolean)
    if (hasSymptoms) {
      const symptomData = {
        user_id: user.id,
        entry_date: date,
        ...symptoms,
      }

      const { data: existingSymptom } = await supabase
        .from("symptom_entries")
        .select("id")
        .eq("user_id", user.id)
        .eq("entry_date", date)
        .single()

      if (existingSymptom) {
        await supabase.from("symptom_entries").update(symptomData).eq("id", existingSymptom.id)
      } else {
        await supabase.from("symptom_entries").insert(symptomData)
      }
    }

    setSaving(false)
    onSaved()
  }

  function toggleSymptom(key: string) {
    setSymptoms((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const tabs = [
    { id: "body" as const, label: "Corpo", icon: Ruler },
    { id: "feel" as const, label: "Bem-estar", icon: Smile },
    { id: "symptoms" as const, label: "Sintomas", icon: Activity },
  ]

  return (
    <div className="space-y-6">
      <div className="flex gap-1 p-1 bg-warm-100 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-[12px] font-medium transition-smooth",
              activeTab === tab.id
                ? "bg-white text-navy-900 shadow-[0_1px_2px_rgba(16,42,67,0.08)]"
                : "text-navy-500 hover:text-navy-700"
            )}
          >
            <tab.icon className="h-3.5 w-3.5" strokeWidth={1.5} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "body" && (
        <div className="space-y-4">
          <InputField icon={Scale} label="Peso" unit="kg" value={weight} onChange={setWeight} step="0.1" />
          <InputField icon={Ruler} label="Cintura" unit="cm" value={waist} onChange={setWaist} step="0.1" />
          <InputField icon={Ruler} label="Quadril" unit="cm" value={hip} onChange={setHip} step="0.1" />
          <InputField icon={Ruler} label="Peito" unit="cm" value={chest} onChange={setChest} step="0.1" />
          <InputField icon={Ruler} label="Braço" unit="cm" value={arm} onChange={setArm} step="0.1" />
          <InputField icon={Ruler} label="Coxa" unit="cm" value={thigh} onChange={setThigh} step="0.1" />
          <InputField icon={Beef} label="Proteína" unit="g" value={protein} onChange={setProtein} step="1" />
          <InputField icon={Droplets} label="Água" unit="ml" value={water} onChange={setWater} step="50" />

          <div className="flex items-center justify-between py-3 border-b border-border/40">
            <span className="text-[13px] text-navy-700">Dose aplicada hoje?</span>
            <div className="flex gap-2">
              <button
                onClick={() => setDose(true)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[12px] font-medium transition-smooth",
                  dose === true ? "bg-navy-900 text-white" : "bg-warm-100 text-navy-500 hover:bg-warm-200"
                )}
              >
                Sim
              </button>
              <button
                onClick={() => setDose(false)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[12px] font-medium transition-smooth",
                  dose === false ? "bg-navy-900 text-white" : "bg-warm-100 text-navy-500 hover:bg-warm-200"
                )}
              >
                Não
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "feel" && (
        <div className="space-y-6">
          <div>
            <label className="block text-[12px] font-medium text-navy-600 mb-3">Como você se sente?</label>
            <div className="grid grid-cols-5 gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMood(mood === m.value ? "" : m.value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-smooth",
                    mood === m.value
                      ? "border-navy-900 bg-navy-50 text-navy-900"
                      : "border-border/60 text-navy-500 hover:bg-warm-50"
                  )}
                >
                  <m.icon className="h-5 w-5" strokeWidth={1.5} />
                  <span className="text-[10px] font-medium">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-navy-600 mb-3">Nível de energia</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setEnergy(energy === level ? 0 : level)}
                  className={cn(
                    "flex-1 h-10 rounded-xl text-[12px] font-medium transition-smooth",
                    energy === level
                      ? "bg-navy-900 text-white"
                      : "bg-warm-100 text-navy-500 hover:bg-warm-200"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-1 px-1">
              <span className="text-[10px] text-navy-400">Baixa</span>
              <span className="text-[10px] text-navy-400">Alta</span>
            </div>
          </div>

          <InputField icon={Moon} label="Sono" unit="h" value={sleep} onChange={setSleep} step="0.5" />
        </div>
      )}

      {activeTab === "symptoms" && (
        <div className="space-y-2">
          {SYMPTOMS.map((s) => (
            <button
              key={s.key}
              onClick={() => toggleSymptom(s.key)}
              className={cn(
                "flex items-center gap-3 w-full py-3 px-4 rounded-xl border transition-smooth text-left",
                symptoms[s.key]
                  ? "border-navy-900/20 bg-navy-50"
                  : "border-border/60 hover:bg-warm-50"
              )}
            >
              <span className="text-lg">{s.emoji}</span>
              <span className="text-[13px] font-medium text-navy-700 flex-1">{s.label}</span>
              <div
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-md border transition-smooth",
                  symptoms[s.key]
                    ? "border-navy-900 bg-navy-900 text-white"
                    : "border-navy-200 bg-white"
                )}
              >
                {symptoms[s.key] && <Check className="h-3 w-3" strokeWidth={3} />}
              </div>
            </button>
          ))}

          <div className="mt-4">
            <label className="block text-[12px] font-medium text-navy-600 mb-1.5">Observações</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Alguma observação sobre hoje..."
              rows={3}
              className="w-full rounded-xl border border-border/60 bg-warm-50 px-4 py-3 text-[13px] text-navy-900 placeholder:text-navy-400 outline-none transition-smooth focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10 resize-none"
            />
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 h-11 rounded-xl border border-border/60 text-[13px] font-medium text-navy-600 hover:bg-warm-50 transition-smooth"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 h-11 rounded-xl bg-navy-900 text-[13px] font-medium text-white hover:bg-navy-800 transition-smooth flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="h-4 w-4" strokeWidth={1.5} />
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  )
}

function InputField({
  icon: Icon,
  label,
  unit,
  value,
  onChange,
  step = "1",
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
  unit: string
  value: string
  onChange: (v: string) => void
  step?: string
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/40">
      <div className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 text-navy-400" strokeWidth={1.5} />
        <span className="text-[13px] text-navy-700">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        <input
          type="number"
          inputMode="decimal"
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="—"
          className="w-20 h-8 rounded-lg border border-border/60 bg-warm-50 px-2 text-right text-[13px] text-navy-900 placeholder:text-navy-300 outline-none transition-smooth focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10"
        />
        <span className="text-[11px] text-navy-400 w-6">{unit}</span>
      </div>
    </div>
  )
}
