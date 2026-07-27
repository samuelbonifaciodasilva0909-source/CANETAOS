import type { PersonalizedContext } from "./context"

export interface FocusAction {
  key: string
  label: string
  href: string
}

/** The single most relevant next action for "Seu próximo passo". */
export function getNextStepCTA(ctx: PersonalizedContext): { label: string; href: string } {
  if (ctx.daysSinceLastEntry === null || ctx.daysSinceLastEntry > 0) {
    return { label: "Registrar acompanhamento", href: "/app/tracker" }
  }
  if (ctx.activeSymptoms.length > 0) {
    return { label: "Registrar como você está se sentindo", href: "/app/tracker" }
  }
  if (ctx.hydrationStatus === "below_goal") {
    return { label: "Registrar hidratação", href: "/app/tracker" }
  }
  if (ctx.trackingConsistency === "new") {
    return { label: "Continuar de onde parou", href: "/app/recipes" }
  }
  return { label: "Explorar opções de alimentação", href: "/app/food" }
}

/** Up to 3 relevant actions for "Seu foco de hoje" — no medical tasks, no guilt-tripping copy. */
export function getTodayFocusActions(ctx: PersonalizedContext): FocusAction[] {
  const candidates: FocusAction[] = []

  if (ctx.daysSinceLastEntry === null || ctx.daysSinceLastEntry > 0) {
    candidates.push({ key: "log", label: "Registrar acompanhamento de hoje", href: "/app/tracker" })
  }
  if (ctx.hydrationStatus === "below_goal" || ctx.hydrationStatus === "unknown") {
    candidates.push({ key: "water", label: "Registrar hidratação", href: "/app/tracker" })
  }
  if (ctx.activeSymptoms.length > 0) {
    candidates.push({ key: "symptom-recipes", label: "Ver receitas adaptadas pra hoje", href: "/app/recipes" })
  }
  if (ctx.proteinStatus === "low") {
    candidates.push({ key: "protein", label: "Registrar sua proteína do dia", href: "/app/tracker" })
  }
  if (ctx.trackingConsistency === "new") {
    candidates.push({ key: "explore", label: "Explorar uma receita rápida", href: "/app/recipes" })
  }
  candidates.push({ key: "meal-plans", label: "Ver cardápios da semana", href: "/app/food" })
  candidates.push({ key: "learning", label: "Continuar um conteúdo", href: "/app/learning" })

  const seen = new Set<string>()
  return candidates.filter((a) => (seen.has(a.key) ? false : (seen.add(a.key), true))).slice(0, 3)
}
