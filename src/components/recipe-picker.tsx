"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { getRecipeVisual } from "@/lib/content/recipe-visual"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Sparkles, Loader2 } from "lucide-react"

interface RecipeResult {
  id: string
  title: string
  slug: string
  description: string | null
  tags: string[]
  is_premium: boolean
}

const TIME_OPTIONS = [
  { value: "5", label: "5 minutos" },
  { value: "15", label: "15 minutos" },
  { value: "more", label: "Tenho mais tempo" },
]

const STYLE_OPTIONS = [
  { value: "quick", label: "Algo rápido" },
  { value: "light", label: "Algo leve" },
  { value: "low_prep", label: "Pouco preparo" },
  { value: "cook", label: "Quero cozinhar" },
]

const MEAL_OPTIONS = [
  { value: "café-da-manhã", label: "Café da manhã" },
  { value: "almoço", label: "Almoço" },
  { value: "jantar", label: "Jantar" },
  { value: "lanche", label: "Lanche" },
]

export function RecipePicker() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [time, setTime] = useState<string | null>(null)
  const [style, setStyle] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<RecipeResult[] | null>(null)

  function reset() {
    setStep(0)
    setTime(null)
    setStyle(null)
    setResults(null)
  }

  async function runSearch(meal: string) {
    setLoading(true)
    try {
      const tagFilters: string[] = [meal]
      if (time === "5" || style === "quick" || style === "low_prep") tagFilters.push("5-min")
      if (style === "light") tagFilters.push("anti-náusea", "fácil-digestão")

      const supabase = createClient()
      const { data } = await supabase
        .from("content_items")
        .select("id, title, slug, description, tags, is_premium")
        .eq("type", "recipe")
        .eq("is_published", true)
        .overlaps("tags", tagFilters)
        .limit(20)

      let list = (data as RecipeResult[]) || []
      if (list.length === 0) {
        const { data: fallback } = await supabase
          .from("content_items")
          .select("id, title, slug, description, tags, is_premium")
          .eq("type", "recipe")
          .eq("is_published", true)
          .limit(3)
        list = (fallback as RecipeResult[]) || []
      } else {
        list = [...list].sort((a, b) => {
          const scoreA = tagFilters.filter((t) => (a.tags || []).includes(t)).length
          const scoreB = tagFilters.filter((t) => (b.tags || []).includes(t)).length
          return scoreB - scoreA
        })
      }

      setResults(list.slice(0, 3))
      setStep(3)
    } catch (err) {
      console.error("Falha ao buscar receitas:", err)
      setResults([])
      setStep(3)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger
        render={
          <button className="flex items-center gap-2 rounded-lg border border-border/60 px-4 py-2 text-[13px] font-medium text-navy-700 transition-smooth hover:bg-warm-50" />
        }
      >
        <Sparkles className="h-4 w-4 text-navy-400" strokeWidth={1.5} />
        Me ajude a escolher
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 0 && "Quanto tempo você tem?"}
            {step === 1 && "Como você quer algo hoje?"}
            {step === 2 && "Qual refeição?"}
            {step === 3 && "Receitas pra você"}
          </DialogTitle>
        </DialogHeader>

        {step === 0 && (
          <div className="grid gap-2">
            {TIME_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => { setTime(o.value); setStep(1) }}
                className="rounded-xl border border-border/60 p-3.5 text-left text-[13px] font-medium text-navy-600 transition-smooth hover:bg-warm-50 hover:border-border"
              >
                {o.label}
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-2">
            {STYLE_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => { setStyle(o.value); setStep(2) }}
                className="rounded-xl border border-border/60 p-3.5 text-left text-[13px] font-medium text-navy-600 transition-smooth hover:bg-warm-50 hover:border-border"
              >
                {o.label}
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-2">
            {MEAL_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => runSearch(o.value)}
                disabled={loading}
                className={cn(
                  "rounded-xl border border-border/60 p-3.5 text-left text-[13px] font-medium text-navy-600 transition-smooth hover:bg-warm-50 hover:border-border",
                  loading && "opacity-50"
                )}
              >
                {o.label}
              </button>
            ))}
            {loading && (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 text-navy-400 animate-spin" />
              </div>
            )}
          </div>
        )}

        {step === 3 && results && (
          <div className="space-y-2">
            {results.length === 0 ? (
              <p className="text-[13px] text-navy-500 py-6 text-center">
                Não encontramos uma receita exata, mas explore a biblioteca completa.
              </p>
            ) : (
              results.map((recipe) => {
                const visual = getRecipeVisual(recipe.title, recipe.tags || [])
                return (
                  <Link
                    key={recipe.id}
                    href={`/app/recipes/${recipe.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl border border-border/60 p-3 transition-smooth hover:bg-warm-50"
                  >
                    <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br", visual.gradient)}>
                      <visual.icon className={cn("h-5 w-5", visual.iconClass)} strokeWidth={1} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-medium text-foreground truncate">{recipe.title}</p>
                        {recipe.is_premium && <PremiumBadge variant="default" className="text-[9px] shrink-0">Plus</PremiumBadge>}
                      </div>
                      <p className="text-[12px] text-navy-400 truncate">{recipe.description}</p>
                    </div>
                  </Link>
                )
              })
            )}
            <button
              onClick={reset}
              className="w-full text-center text-[12px] font-medium text-navy-500 hover:text-navy-700 pt-2"
            >
              Tentar de novo
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
