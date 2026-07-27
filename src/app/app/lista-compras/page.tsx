"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { AppShell } from "@/components/layout/app-shell"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumButton } from "@/components/ui/premium-button"
import { ErrorState } from "@/components/ui/error-state"
import { getOrCreateShoppingList, type ShoppingItem } from "@/services/shopping-list"
import { SHOPPING_CATEGORIES, categorizeIngredient } from "@/lib/shopping/categorize"
import { toast } from "sonner"
import { Trash2, Plus, Copy, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"

const DEMO_ITEMS: ShoppingItem[] = [
  { id: "d1", name: "200g de peito de frango", category: "Proteínas", checked: false },
  { id: "d2", name: "6 ovos", category: "Proteínas", checked: true },
  { id: "d3", name: "1 abobrinha", category: "Hortifruti", checked: false },
  { id: "d4", name: "Iogurte grego", category: "Laticínios", checked: false },
  { id: "d5", name: "Aveia em flocos", category: "Despensa", checked: false },
]

export default function ShoppingListPage() {
  const [listId, setListId] = useState<string | null>(null)
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDemo, setIsDemo] = useState(false)
  const [newItemName, setNewItemName] = useState("")

  const load = useCallback(async () => {
    setError(null)
    const demo = document.cookie.includes("demo_auth=true")
    setIsDemo(demo)

    if (demo) {
      setItems(DEMO_ITEMS)
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const list = await getOrCreateShoppingList(user.id)
      setListId(list.id)
      setItems(list.items)
    } catch (err) {
      console.error("Falha ao carregar lista de compras:", err)
      setError("Não foi possível carregar sua lista agora.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function persist(newItems: ShoppingItem[]) {
    setItems(newItems)
    if (isDemo || !listId) return
    try {
      const supabase = createClient()
      await supabase.from("shopping_lists").update({ items: newItems, updated_at: new Date().toISOString() }).eq("id", listId)
    } catch (err) {
      console.error("Falha ao salvar lista de compras:", err)
      toast.error("Não foi possível salvar a alteração.")
    }
  }

  function toggleItem(id: string) {
    persist(items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)))
  }

  function removeItem(id: string) {
    persist(items.filter((i) => i.id !== id))
  }

  function addManualItem() {
    const name = newItemName.trim()
    if (!name) return
    persist([...items, { id: crypto.randomUUID(), name, category: categorizeIngredient(name), checked: false }])
    setNewItemName("")
  }

  function copyList() {
    const text = SHOPPING_CATEGORIES
      .map((cat) => {
        const catItems = items.filter((i) => i.category === cat)
        if (catItems.length === 0) return null
        return `${cat}:\n${catItems.map((i) => `- ${i.name}`).join("\n")}`
      })
      .filter(Boolean)
      .join("\n\n")

    navigator.clipboard.writeText(text || "")
    toast.success("Lista copiada")
  }

  if (error) {
    return (
      <AppShell>
        <ErrorState message={error} onRetry={() => { setLoading(true); load() }} />
      </AppShell>
    )
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-[13px] text-navy-400">Carregando...</p>
        </div>
      </AppShell>
    )
  }

  const groups = SHOPPING_CATEGORIES.map((cat) => ({
    category: cat,
    items: items.filter((i) => i.category === cat),
  })).filter((g) => g.items.length > 0)

  return (
    <AppShell>
      <div className="space-y-8 max-w-[560px]">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-navy-400 mb-2">
              Compras
            </p>
            <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-foreground">
              Lista de compras
            </h1>
            <p className="mt-1.5 text-[14px] text-navy-500">
              Adicione ingredientes direto das receitas ou monte a sua.
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={copyList}
              className="flex items-center gap-2 rounded-lg border border-border/60 px-4 py-2 text-[13px] font-medium text-navy-700 transition-smooth hover:bg-warm-50"
            >
              <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
              Copiar lista
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addManualItem() }}
            placeholder="Adicionar item manualmente..."
            className="flex-1 h-11 rounded-xl border border-border/60 bg-warm-50 px-4 text-[13px] text-navy-900 placeholder:text-navy-400 outline-none transition-smooth focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10"
          />
          <PremiumButton onClick={addManualItem} icon={<Plus className="h-4 w-4" />}>
            Adicionar
          </PremiumButton>
        </div>

        {groups.length === 0 ? (
          <PremiumCard variant="soft" padding="xl" className="text-center max-w-md">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-100 mb-4 mx-auto">
              <ShoppingCart className="h-5 w-5 text-navy-600" strokeWidth={1.5} />
            </div>
            <h3 className="text-[15px] font-semibold text-foreground mb-2">
              Sua lista está vazia
            </h3>
            <p className="text-[13px] text-navy-500 leading-relaxed">
              Adicione um item acima ou vá numa receita e toque em &quot;Adicionar à lista de compras&quot;.
            </p>
          </PremiumCard>
        ) : (
          <div className="space-y-6">
            {groups.map(({ category, items: catItems }) => (
              <div key={category}>
                <h2 className="text-[13px] font-medium uppercase tracking-[0.06em] text-navy-400 mb-3">
                  {category}
                </h2>
                <PremiumCard variant="elevated" padding="none" className="divide-y divide-border/40">
                  {catItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                      <button
                        onClick={() => toggleItem(item.id)}
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-smooth",
                          item.checked ? "border-navy-900 bg-navy-900" : "border-navy-200"
                        )}
                      >
                        {item.checked && (
                          <svg viewBox="0 0 16 16" fill="white" className="h-3 w-3">
                            <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                          </svg>
                        )}
                      </button>
                      <span className={cn(
                        "flex-1 text-[13px]",
                        item.checked ? "text-navy-300 line-through" : "text-navy-700"
                      )}>
                        {item.name}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 rounded-lg text-navy-300 hover:text-error hover:bg-error/5 transition-smooth"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
                  ))}
                </PremiumCard>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
