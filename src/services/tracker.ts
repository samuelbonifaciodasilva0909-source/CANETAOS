import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/database"

type TrackerRow = Database["public"]["Tables"]["tracker_entries"]["Row"]
type TrackerInsert = Database["public"]["Tables"]["tracker_entries"]["Insert"]
type TrackerUpdate = Database["public"]["Tables"]["tracker_entries"]["Update"]
type SymptomRow = Database["public"]["Tables"]["symptom_entries"]["Row"]
type SymptomInsert = Database["public"]["Tables"]["symptom_entries"]["Insert"]
type SymptomUpdate = Database["public"]["Tables"]["symptom_entries"]["Update"]

export interface TrackerEntry {
  tracker: TrackerRow
  symptoms: SymptomRow | null
}

export interface TrackerFormData {
  entry_date: string
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
    other_notes?: string | null
  }
}

export async function getTrackerEntries(userId: string, limit = 30): Promise<TrackerRow[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from("tracker_entries")
    .select("*")
    .eq("user_id", userId)
    .order("entry_date", { ascending: false })
    .limit(limit)
  return data || []
}

export async function getTrackerEntryByDate(userId: string, date: string): Promise<TrackerEntry | null> {
  const supabase = createClient()
  const { data: tracker } = await supabase
    .from("tracker_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("entry_date", date)
    .single()

  if (!tracker) return null

  const { data: symptoms } = await supabase
    .from("symptom_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("entry_date", date)
    .single()

  return { tracker, symptoms }
}

export async function upsertTrackerEntry(userId: string, form: TrackerFormData): Promise<TrackerRow> {
  const supabase = createClient()

  const trackerData: TrackerInsert = {
    user_id: userId,
    entry_date: form.entry_date,
    weight_kg: form.weight_kg ?? null,
    waist_measurement: form.waist_measurement ?? null,
    hip_measurement: form.hip_measurement ?? null,
    chest_measurement: form.chest_measurement ?? null,
    arm_measurement: form.arm_measurement ?? null,
    thigh_measurement: form.thigh_measurement ?? null,
    mood: form.mood ?? null,
    energy_level: form.energy_level ?? null,
    sleep_hours: form.sleep_hours ?? null,
    water_intake_ml: form.water_intake_ml ?? null,
    protein_intake_g: form.protein_intake_g ?? null,
    dose_applied: form.dose_applied ?? null,
    notes: form.notes ?? null,
  }

  const { data: existing } = await supabase
    .from("tracker_entries")
    .select("id")
    .eq("user_id", userId)
    .eq("entry_date", form.entry_date)
    .single()

  let tracker: TrackerRow

  if (existing) {
    const { data } = await supabase
      .from("tracker_entries")
      .update(trackerData)
      .eq("id", existing.id)
      .select()
      .single()
    tracker = data!
  } else {
    const { data } = await supabase
      .from("tracker_entries")
      .insert(trackerData)
      .select()
      .single()
    tracker = data!
  }

  if (form.symptoms) {
    const symptomData: SymptomInsert = {
      user_id: userId,
      entry_date: form.entry_date,
      nausea: form.symptoms.nausea ?? false,
      constipation: form.symptoms.constipation ?? false,
      hair_loss: form.symptoms.hair_loss ?? false,
      food_aversion: form.symptoms.food_aversion ?? false,
      taste_change: form.symptoms.taste_change ?? false,
      fatigue: form.symptoms.fatigue ?? false,
      headache: form.symptoms.headache ?? false,
      other_notes: form.symptoms.other_notes ?? null,
    }

    const { data: existingSymptom } = await supabase
      .from("symptom_entries")
      .select("id")
      .eq("user_id", userId)
      .eq("entry_date", form.entry_date)
      .single()

    if (existingSymptom) {
      await supabase
        .from("symptom_entries")
        .update(symptomData)
        .eq("id", existingSymptom.id)
    } else {
      await supabase
        .from("symptom_entries")
        .insert(symptomData)
    }
  }

  return tracker
}

export async function deleteTrackerEntry(entryId: string): Promise<void> {
  const supabase = createClient()
  await supabase.from("tracker_entries").delete().eq("id", entryId)
}

export async function getSymptomEntries(userId: string, limit = 30): Promise<SymptomRow[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from("symptom_entries")
    .select("*")
    .eq("user_id", userId)
    .order("entry_date", { ascending: false })
    .limit(limit)
  return data || []
}
