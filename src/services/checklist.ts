import { createClient } from "@/lib/supabase/client"

export interface DailyChecklist {
  id: string
  user_id: string
  entry_date: string
  water: boolean
  protein: boolean
  training: boolean
  application: boolean
  tracking: boolean
  sleep: boolean
  movement: boolean
}

const DEFAULT_CHECKLIST = {
  water: false,
  protein: false,
  training: false,
  application: false,
  tracking: false,
  sleep: false,
  movement: false,
}

export async function getTodayChecklist(userId: string): Promise<DailyChecklist> {
  const supabase = createClient()
  const today = new Date().toISOString().split("T")[0]

  const { data } = await supabase
    .from("daily_checklists")
    .select("*")
    .eq("user_id", userId)
    .eq("entry_date", today)
    .single()

  if (data) return data

  const { data: created } = await supabase
    .from("daily_checklists")
    .insert({ user_id: userId, entry_date: today, ...DEFAULT_CHECKLIST })
    .select()
    .single()

  return created!
}

export async function toggleChecklistItem(
  userId: string,
  field: keyof typeof DEFAULT_CHECKLIST
): Promise<DailyChecklist> {
  const supabase = createClient()
  const today = new Date().toISOString().split("T")[0]

  const { data: existing } = await supabase
    .from("daily_checklists")
    .select("*")
    .eq("user_id", userId)
    .eq("entry_date", today)
    .single()

  if (!existing) {
    const { data } = await supabase
      .from("daily_checklists")
      .insert({ user_id: userId, entry_date: today, ...DEFAULT_CHECKLIST, [field]: true })
      .select()
      .single()
    return data!
  }

  const { data } = await supabase
    .from("daily_checklists")
    .update({ [field]: !existing[field], updated_at: new Date().toISOString() })
    .eq("id", existing.id)
    .select()
    .single()

  return data!
}

export async function getWeeklyStreak(userId: string): Promise<number> {
  const supabase = createClient()

  const { data } = await supabase
    .from("daily_checklists")
    .select("entry_date, water, protein, training, application, tracking")
    .eq("user_id", userId)
    .order("entry_date", { ascending: false })
    .limit(90)

  if (!data || data.length === 0) return 0

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < 90; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(checkDate.getDate() - i)
    const dateStr = checkDate.toISOString().split("T")[0]

    const entry = data.find((d) => d.entry_date === dateStr)
    if (!entry) break

    const hasAny = entry.water || entry.protein || entry.training || entry.application || entry.tracking
    if (hasAny) {
      streak++
    } else {
      break
    }
  }

  return streak
}

export async function getWeeklyCompletionRate(userId: string): Promise<number> {
  const supabase = createClient()
  const today = new Date()
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)

  const { data } = await supabase
    .from("daily_checklists")
    .select("water, protein, training, application, tracking, sleep, movement")
    .eq("user_id", userId)
    .gte("entry_date", weekAgo.toISOString().split("T")[0])
    .lte("entry_date", today.toISOString().split("T")[0])

  if (!data || data.length === 0) return 0

  const totalPossible = data.length * 7
  const totalChecked = data.reduce((sum, day) => {
    return sum + [day.water, day.protein, day.training, day.application, day.tracking, day.sleep, day.movement].filter(Boolean).length
  }, 0)

  return Math.round((totalChecked / totalPossible) * 100)
}
