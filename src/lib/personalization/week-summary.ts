import { daysAgo } from "./context"

export interface WeekSummary {
  daysLogged: number
  daysWithHydration: number
  daysWithSymptoms: number
  daysWithSleepLogged: number
  daysWithEnergyLogged: number
  trainingRegisteredThisWeek: boolean
  contentViewed: number
  observations: string[]
}

interface TrackerEntryLike {
  entry_date: string
  water_intake_ml?: number | null
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

function hasAnySymptom(s: SymptomEntryLike): boolean {
  return !!(s.nausea || s.constipation || s.hair_loss || s.food_aversion || s.taste_change || s.fatigue || s.headache)
}

/**
 * Descriptive (never diagnostic) weekly summary — states what was
 * registered, not what it means. Used by both the Home compact card and
 * the full "Minha Semana" page.
 */
export function getWeekSummary(params: {
  entries: TrackerEntryLike[]
  symptoms: SymptomEntryLike[]
  trainingRegisteredThisWeek: boolean
  contentViewed: number
}): WeekSummary {
  const { entries, symptoms, trainingRegisteredThisWeek, contentViewed } = params

  const weekEntries = entries.filter((e) => daysAgo(e.entry_date) <= 6)
  const weekSymptoms = symptoms.filter((s) => daysAgo(s.entry_date) <= 6)

  const daysLogged = new Set(weekEntries.map((e) => e.entry_date)).size
  const daysWithHydration = weekEntries.filter((e) => (e.water_intake_ml || 0) > 0).length
  const daysWithSleepLogged = weekEntries.filter((e) => e.sleep_hours != null).length
  const daysWithEnergyLogged = weekEntries.filter((e) => e.energy_level != null).length
  const daysWithSymptoms = new Set(
    weekSymptoms.filter(hasAnySymptom).map((s) => s.entry_date)
  ).size

  const observations: string[] = []
  observations.push(
    daysLogged === 0
      ? "Você ainda não registrou dados nesta semana."
      : `Você registrou seus dados em ${daysLogged} ${daysLogged === 1 ? "dia" : "dias"} nesta semana.`
  )
  if (daysWithSymptoms > 0) {
    observations.push(`Você registrou sintomas em ${daysWithSymptoms} ${daysWithSymptoms === 1 ? "dia" : "dias"}.`)
  }
  if (daysWithHydration > 0) {
    observations.push(`Você registrou hidratação em ${daysWithHydration} ${daysWithHydration === 1 ? "dia" : "dias"}.`)
  }
  if (contentViewed > 0) {
    observations.push(`Você visualizou ${contentViewed} ${contentViewed === 1 ? "conteúdo" : "conteúdos"} esta semana.`)
  }

  return {
    daysLogged,
    daysWithHydration,
    daysWithSymptoms,
    daysWithSleepLogged,
    daysWithEnergyLogged,
    trainingRegisteredThisWeek,
    contentViewed,
    observations,
  }
}
