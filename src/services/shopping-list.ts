import { createClient } from "@/lib/supabase/client"
import { categorizeIngredient, coreIngredientName, type ShoppingCategory } from "@/lib/shopping/categorize"

export interface ShoppingItem {
  id: string
  name: string
  category: ShoppingCategory
  checked: boolean
}

export async function getOrCreateShoppingList(userId: string): Promise<{ id: string; items: ShoppingItem[] }> {
  const supabase = createClient()
  const { data: existing } = await supabase
    .from("shopping_lists")
    .select("id, items")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (existing) return { id: existing.id, items: (existing.items as ShoppingItem[]) || [] }

  const { data: created } = await supabase
    .from("shopping_lists")
    .insert({ user_id: userId, title: "Minha lista", items: [] })
    .select("id, items")
    .single()

  return { id: created?.id, items: (created?.items as ShoppingItem[]) || [] }
}

/** Adds ingredients from a recipe/meal plan, skipping ones already on the list
 * (matched by core name, so "100g de peito de frango" from two recipes
 * doesn't show up twice). */
export async function addIngredientsToList(userId: string, ingredients: string[]): Promise<number> {
  const supabase = createClient()
  const { id, items } = await getOrCreateShoppingList(userId)

  const existingCoreNames = new Set(items.map((i) => coreIngredientName(i.name)))
  const newItems: ShoppingItem[] = []

  for (const ingredient of ingredients) {
    const core = coreIngredientName(ingredient)
    if (existingCoreNames.has(core)) continue
    existingCoreNames.add(core)
    newItems.push({
      id: crypto.randomUUID(),
      name: ingredient,
      category: categorizeIngredient(ingredient),
      checked: false,
    })
  }

  if (newItems.length === 0) return 0

  await supabase
    .from("shopping_lists")
    .update({ items: [...items, ...newItems], updated_at: new Date().toISOString() })
    .eq("id", id)

  return newItems.length
}
