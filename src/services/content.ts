import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/database"

type ContentRow = Database["public"]["Tables"]["content_items"]["Row"]

export async function getContentByType(
  type: string,
  limit = 50,
  userId?: string
): Promise<ContentRow[]> {
  const supabase = createClient()
  let query = supabase
    .from("content_items")
    .select("*")
    .eq("type", type)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(limit)

  const { data } = await query
  return data || []
}

export async function getContentBySlug(slug: string): Promise<ContentRow | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from("content_items")
    .select("*")
    .eq("slug", slug)
    .single()
  return data
}

export async function searchContent(query: string): Promise<ContentRow[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from("content_items")
    .select("*")
    .eq("is_published", true)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.[\"${query}\"]`)
    .limit(20)
  return data || []
}

export async function toggleFavorite(userId: string, contentId: string): Promise<boolean> {
  const supabase = createClient()

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("content_id", contentId)
    .single()

  if (existing) {
    await supabase.from("favorites").delete().eq("id", existing.id)
    return false
  } else {
    await supabase.from("favorites").insert({ user_id: userId, content_id: contentId })
    return true
  }
}

export async function getFavoriteIds(userId: string): Promise<Set<string>> {
  const supabase = createClient()
  const { data } = await supabase
    .from("favorites")
    .select("content_id")
    .eq("user_id", userId)
  return new Set((data || []).map((f) => f.content_id))
}

export async function getFavorites(userId: string): Promise<ContentRow[]> {
  const supabase = createClient()
  const { data: favs } = await supabase
    .from("favorites")
    .select("content_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (!favs || favs.length === 0) return []

  const { data } = await supabase
    .from("content_items")
    .select("*")
    .in("id", favs.map((f) => f.content_id))

  return data || []
}

export async function getContentRecommendations(
  userId: string,
  symptoms: string[]
): Promise<ContentRow[]> {
  const supabase = createClient()

  const tagFilters: string[] = []
  if (symptoms.includes("nausea")) tagFilters.push("anti náusea", "náusea", "leve")
  if (symptoms.includes("constipation")) tagFilters.push("fibra", "constipação")
  if (symptoms.includes("fatigue")) tagFilters.push("energia", "nutritivo")
  if (symptoms.includes("headache")) tagFilters.push("hidratação")

  if (tagFilters.length === 0) {
    const { data } = await supabase
      .from("content_items")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(6)
    return data || []
  }

  const { data } = await supabase
    .from("content_items")
    .select("*")
    .eq("is_published", true)
    .overlaps("tags", tagFilters)
    .limit(6)

  return data || []
}
