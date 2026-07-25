"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { CanetaOSLogo } from "@/components/branding/logo"
import { cn } from "@/lib/utils"
import {
  MEDICATION_LABELS,
  TREATMENT_DURATION_LABELS,
  PRIMARY_GOAL_LABELS,
} from "@/types"
import type { MedicationName, TreatmentDurationCategory, PrimaryGoal } from "@/types"
import { Check, ChevronRight, ChevronLeft } from "lucide-react"

const steps = [1, 2, 3, 4, 5, 6]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [fullName, setFullName] = useState("")
  const [medicationName, setMedicationName] = useState("")
  const [treatmentDuration, setTreatmentDuration] = useState("")
  const [currentWeight, setCurrentWeight] = useState("")
  const [primaryGoal, setPrimaryGoal] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleComplete() {
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/app")
        return
      }

      await supabase
        .from("profiles")
        .update({ full_name: fullName, onboarding_completed: true })
        .eq("id", user.id)

      await supabase.from("user_preferences").insert({
        user_id: user.id,
        medication_name: medicationName,
        treatment_duration_category: treatmentDuration,
        primary_goal: primaryGoal,
      })

      const weightKg = parseFloat(currentWeight.replace(",", "."))
      if (!Number.isNaN(weightKg) && weightKg > 0) {
        await supabase.from("tracker_entries").insert({
          user_id: user.id,
          entry_date: new Date().toISOString().split("T")[0],
          weight_kg: weightKg,
        })
      }

      await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType: "onboarding_completed" }),
      })
    } catch {
      // Demo mode or Supabase not configured — proceed anyway
    }

    router.push("/app")
  }

  function nextStep() {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  function canProceed(): boolean {
    switch (currentStep) {
      case 1: return fullName.trim().length >= 1
      case 2: return medicationName !== ""
      case 3: return treatmentDuration !== ""
      case 4: return currentWeight.trim() !== "" && !Number.isNaN(parseFloat(currentWeight.replace(",", ".")))
      case 5: return primaryGoal !== ""
      case 6: return true
      default: return false
    }
  }

  const stepTitles: Record<number, string> = {
    1: "Vamos personalizar sua experiência",
    2: "Qual tratamento você está acompanhando?",
    3: "Há quanto tempo você iniciou seu acompanhamento?",
    4: "Qual é o seu peso atual?",
    5: "Qual é a sua principal dor agora?",
    6: "Tudo pronto!",
  }

  const stepDescriptions: Record<number, string> = {
    1: "Comece informando seu nome.",
    2: "Isso nos ajuda a personalizar seu conteúdo.",
    3: "",
    4: "Usamos isso só para começar seu registro de acompanhamento.",
    5: "Essa resposta personaliza o que você vê primeiro no app.",
    6: "Suas informações foram configuradas. Você já pode começar a usar o CanetaOS.",
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-warm-50 px-6 py-12">
      <div className="w-full max-w-[420px]">
        <div className="mb-10 flex justify-center">
          <CanetaOSLogo />
        </div>

        <div className="mb-8">
          <div className="flex gap-1.5">
            {steps.map((step) => (
              <div
                key={step}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all duration-300",
                  step <= currentStep ? "bg-navy-900" : "bg-navy-200"
                )}
              />
            ))}
          </div>
          <p className="mt-2 text-[11px] text-navy-400 text-right">
            Passo {currentStep} de {steps.length}
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-border/40 p-8 shadow-[0_1px_3px_rgba(16,42,67,0.04)]">
          <div className="mb-6">
            <h2 className="text-[18px] font-semibold text-navy-900 tracking-tight">
              {stepTitles[currentStep]}
            </h2>
            {stepDescriptions[currentStep] && (
              <p className="mt-1.5 text-[13px] text-navy-500">
                {stepDescriptions[currentStep]}
              </p>
            )}
          </div>

          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-[12px] font-medium text-navy-600 mb-1.5">
                  Nome
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Seu nome"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoFocus
                  className="h-11 w-full rounded-xl border border-border/60 bg-warm-50 px-4 text-[13px] text-navy-900 placeholder:text-navy-400 outline-none transition-smooth focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="grid gap-2">
              {(Object.entries(MEDICATION_LABELS) as [MedicationName, string][]).map(
                ([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setMedicationName(value)}
                    className={cn(
                      "rounded-xl border p-3.5 text-left text-[13px] font-medium transition-smooth",
                      medicationName === value
                        ? "border-navy-900 bg-navy-50 text-navy-900 shadow-[0_1px_2px_rgba(16,42,67,0.06)]"
                        : "border-border/60 text-navy-600 hover:bg-warm-50 hover:border-border"
                    )}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="grid gap-2">
              {(Object.entries(TREATMENT_DURATION_LABELS) as [TreatmentDurationCategory, string][]).map(
                ([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setTreatmentDuration(value)}
                    className={cn(
                      "rounded-xl border p-3.5 text-left text-[13px] font-medium transition-smooth",
                      treatmentDuration === value
                        ? "border-navy-900 bg-navy-50 text-navy-900 shadow-[0_1px_2px_rgba(16,42,67,0.06)]"
                        : "border-border/60 text-navy-600 hover:bg-warm-50 hover:border-border"
                    )}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="currentWeight" className="block text-[12px] font-medium text-navy-600 mb-1.5">
                  Peso atual (kg)
                </label>
                <input
                  id="currentWeight"
                  type="text"
                  inputMode="decimal"
                  placeholder="Ex: 82,5"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  autoFocus
                  className="h-11 w-full rounded-xl border border-border/60 bg-warm-50 px-4 text-[13px] text-navy-900 placeholder:text-navy-400 outline-none transition-smooth focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10"
                />
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="grid gap-2">
              {(Object.entries(PRIMARY_GOAL_LABELS) as [PrimaryGoal, string][]).map(
                ([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setPrimaryGoal(value)}
                    className={cn(
                      "rounded-xl border p-3.5 text-left text-[13px] font-medium transition-smooth",
                      primaryGoal === value
                        ? "border-navy-900 bg-navy-50 text-navy-900 shadow-[0_1px_2px_rgba(16,42,67,0.06)]"
                        : "border-border/60 text-navy-600 hover:bg-warm-50 hover:border-border"
                    )}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
          )}

          {currentStep === 6 && (
            <div className="text-center py-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-positive/10 mb-4">
                <Check className="h-7 w-7 text-positive" strokeWidth={1.5} />
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          {currentStep > 1 && currentStep < 6 ? (
            <button
              onClick={prevStep}
              className="flex items-center gap-1.5 text-[13px] font-medium text-navy-500 transition-smooth hover:text-navy-700"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
              Voltar
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={nextStep}
            disabled={!canProceed() || loading}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-6 py-3 text-[13px] font-medium transition-smooth",
              canProceed() && !loading
                ? "bg-navy-900 text-white hover:bg-navy-800 shadow-[0_1px_2px_rgba(16,42,67,0.12)]"
                : "bg-navy-200 text-navy-400 cursor-not-allowed"
            )}
          >
            {currentStep === 6
              ? loading ? "Finalizando..." : "Começar"
              : "Continuar"}
            {currentStep < 6 && <ChevronRight className="h-4 w-4" strokeWidth={1.5} />}
          </button>
        </div>
      </div>
    </div>
  )
}
