"use client"

import { useState } from "react"
import { addIngredientsToList } from "@/services/shopping-list"
import { toast } from "sonner"
import { ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"

export function AddToShoppingListButton({
  userId,
  ingredients,
  className,
}: {
  userId: string | null
  ingredients: string[]
  className?: string
}) {
  const [saving, setSaving] = useState(false)

  async function handleClick() {
    if (!userId || saving || ingredients.length === 0) return
    setSaving(true)
    try {
      const added = await addIngredientsToList(userId, ingredients)
      toast.success(
        added > 0
          ? `${added} ${added === 1 ? "item adicionado" : "itens adicionados"} à lista de compras`
          : "Esses itens já estavam na sua lista"
      )
    } catch {
      toast.error("Não foi possível adicionar à lista agora.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={saving}
      className={cn(
        "flex items-center gap-2 rounded-lg border border-border/60 px-4 py-2 text-[13px] font-medium text-navy-700 transition-smooth hover:bg-warm-50 disabled:opacity-50",
        className
      )}
    >
      <ShoppingCart className="h-4 w-4 text-navy-400" strokeWidth={1.5} />
      {saving ? "Adicionando..." : "Adicionar à lista de compras"}
    </button>
  )
}
