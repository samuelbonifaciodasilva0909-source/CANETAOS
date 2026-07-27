import type { PrimaryGoal, TreatmentDurationCategory } from "@/types"

export type HydrationStatus = "below_goal" | "near_goal" | "met_goal" | "unknown"
export type LevelStatus = "low" | "adequate" | "unknown"
export type EnergyStatus = "low" | "moderate" | "high" | "unknown"
export type TrackingConsistency = "new" | "building" | "consistent"

export interface PersonalizedContext {
  activeSymptoms: string[]
  recentSymptoms: string[]
  hydrationStatus: HydrationStatus
  proteinStatus: LevelStatus
  sleepStatus: LevelStatus
  energyStatus: EnergyStatus
  trackingConsistency: TrackingConsistency
  daysSinceLastEntry: number | null
  primaryTrack: PrimaryGoal | null
  treatmentPhase: TreatmentDurationCategory | null
}

interface TrackerEntryLike {
  entry_date: string
  water_intake_ml?: number | null
  protein_intake_g?: number | null
  sleep_hours?: number | null
  energy_level?: number | null
}

interface SymptomEntryLike {
  entry_date: string
  nausea?: boolean
  constipation?: boolean
  hair_loss?: boolean
  food_aversion?: boolean
  taste_change?: boolean
  fatigue?: boolean
  headache?: boolean
}

const SYMPTOM_KEYS = [
  "nausea", "constipation", "hair_loss", "food_aversion", "taste_change", "fatigue", "headache",
] as const

function symptomsFor(entry: SymptomEntryLike | undefined): string[] {
  if (!entry) return []
  return SYMPTOM_KEYS.filter((key) => entry[key])
}

export function daysAgo(dateStr: string): number {
  const then = new Date(dateStr + "T00:00:00")
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.round((now.getTime() - then.getTime()) / 86400000)
}

/**
 * Pure, reusable personalization signal calculator — describes the user's
 * current context (hydration, symptoms, consistency, etc.) so the Home,
 * weekly summary and content recommendations can adapt to it. This is
 * experience personalization, not a medical/diagnostic engine: it never
 * infers causality or suggests dose changes.
 */
export function getPersonalizedContext(params: {
  entries: TrackerEntryLike[]
  symptoms: SymptomEntryLike[]
  preferences: {
    primary_goal: string | null
    treatment_duration_category: string | null
    daily_water_goal_ml?: number
  } | null
}): PersonalizedContext {
  const { entries, symptoms, preferences } = params
  const todayStr = new Date().toISOString().split("T")[0]
  const goalMl = preferences?.daily_water_goal_ml || 2000

  const todayEntry = entries.find((e) => e.entry_date === todayStr)
  const todaySymptoms = symptoms.find((s) => s.entry_date === todayStr)

  const last7Symptoms = symptoms.filter((s) => daysAgo(s.entry_date) <= 6)
  const recentSymptoms = Array.from(new Set(last7Symptoms.flatMap(symptomsFor)))

  let hydrationStatus: HydrationStatus = "unknown"
  if (todayEntry?.water_intake_ml != null) {
    const pct = todayEntry.water_intake_ml / goalMl
    hydrationStatus = pct >= 1 ? "met_goal" : pct >= 0.7 ? "near_goal" : "below_goal"
  }

  let proteinStatus: LevelStatus = "unknown"
  if (todayEntry?.protein_intake_g != null) {
    proteinStatus = todayEntry.protein_intake_g >= 60 ? "adequate" : "low"
  }

  let sleepStatus: LevelStatus = "unknown"
  if (todayEntry?.sleep_hours != null) {
    sleepStatus = todayEntry.sleep_hours >= 7 ? "adequate" : "low"
  }

  let energyStatus: EnergyStatus = "unknown"
  if (todayEntry?.energy_level != null) {
    energyStatus = todayEntry.energy_level <= 2 ? "low" : todayEntry.energy_level >= 4 ? "high" : "moderate"
  }

  const daysLoggedLast7 = new Set(
    entries.filter((e) => daysAgo(e.entry_date) <= 6).map((e) => e.entry_date)
  ).size
  const trackingConsistency: TrackingConsistency =
    daysLoggedLast7 >= 5 ? "consistent" : daysLoggedLast7 >= 2 ? "building" : "new"

  const mostRecentDate = entries[0]?.entry_date
  const daysSinceLastEntry = mostRecentDate ? daysAgo(mostRecentDate) : null

  return {
    activeSymptoms: symptomsFor(todaySymptoms),
    recentSymptoms,
    hydrationStatus,
    proteinStatus,
    sleepStatus,
    energyStatus,
    trackingConsistency,
    daysSinceLastEntry,
    primaryTrack: (preferences?.primary_goal as PrimaryGoal | null) || null,
    treatmentPhase: (preferences?.treatment_duration_category as TreatmentDurationCategory | null) || null,
  }
}
