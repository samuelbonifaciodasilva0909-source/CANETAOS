export type MedicationName =
  | "ozempic"
  | "wegovy"
  | "mounjaro"
  | "ozivy"
  | "outro"
  | "prefiro_nao_informar"

export type TreatmentDurationCategory =
  | "starting"
  | "less_than_4_weeks"
  | "4_to_8_weeks"
  | "2_to_6_months"
  | "more_than_6_months"
  | "prefiro_nao_informar"

/**
 * The onboarding routing question ("qual a sua dor principal agora?").
 * Drives which content track (trilha) personalizes the home screen.
 */
export type PrimaryGoal =
  | "medo_recuperar_peso"
  | "nao_sei_o_que_comer"
  | "perdendo_musculo"

export type PreferredContentType =
  | "recipes"
  | "organization"
  | "tracking"
  | "education"
  | "habits"

export type ContentType =
  | "meal_plan"
  | "recipe"
  | "educational"
  | "guide"
  | "update"

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "expired"

export type UserRole = "user" | "admin" | "professional"

export type PaymentProviderType = "asaas"

/** Funnel product slugs, in purchase order. */
export type ProductSlug = "frontend" | "recipes_bump" | "desmame" | "plus_subscription"

/**
 * Entitlements are granted by owning a paid product (or an active Plus
 * subscription), never by a "plan tier" — see src/lib/entitlements.
 */
export type EntitlementSlug =
  | "onboarding"
  | "basic_tracker"
  | "meal_plans"
  | "quick_recipes"
  | "desmame_content"
  | "plus_feed"
  | "plus_community"
  | "monthly_content"

export type PlanSlug = "free" | "plus" | "pro"

export interface PlanFeatures {
  entitlements: EntitlementSlug[]
  max_tracker_entries_per_month: number | null
}

export const MEDICATION_LABELS: Record<MedicationName, string> = {
  ozempic: "Ozempic",
  wegovy: "Wegovy",
  mounjaro: "Mounjaro",
  ozivy: "Ozivy",
  outro: "Outro",
  prefiro_nao_informar: "Prefiro não informar",
}

export const TREATMENT_DURATION_LABELS: Record<TreatmentDurationCategory, string> = {
  starting: "Ainda estou começando",
  less_than_4_weeks: "Menos de 4 semanas",
  "4_to_8_weeks": "4 a 8 semanas",
  "2_to_6_months": "2 a 6 meses",
  more_than_6_months: "Mais de 6 meses",
  prefiro_nao_informar: "Prefiro não informar",
}

export const PRIMARY_GOAL_LABELS: Record<PrimaryGoal, string> = {
  medo_recuperar_peso: "Tenho medo de recuperar o peso quando parar",
  nao_sei_o_que_comer: "Não sei o que comer",
  perdendo_musculo: "Sinto que estou perdendo músculo",
}

export const CONTENT_TYPE_LABELS: Record<PreferredContentType, string> = {
  recipes: "Receitas",
  organization: "Organização",
  tracking: "Acompanhamento",
  education: "Educação",
  habits: "Hábitos",
}

export type AnalyticsEventType =
  | "signup_completed"
  | "onboarding_completed"
  | "first_tracker_entry"
  | "content_viewed"
  | "premium_content_clicked"
  | "checkout_started"
  | "checkout_completed"
  | "subscription_started"
  | "subscription_canceled"

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  trialing: "Período de teste",
  active: "Ativa",
  past_due: "Em atraso",
  canceled: "Cancelada",
  incomplete: "Incompleta",
  expired: "Expirada",
}
