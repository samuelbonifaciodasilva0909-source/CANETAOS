"use client"

import { useState } from "react"
import { toggleFavorite } from "@/services/content"
import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"

export function FavoriteButton({
  userId,
  contentId,
  initialIsFavorite,
  className,
}: {
  userId: string | null
  contentId: string
  initialIsFavorite: boolean
  className?: string
}) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [saving, setSaving] = useState(false)

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!userId || saving) return
    setSaving(true)
    const next = await toggleFavorite(userId, contentId)
    setIsFavorite(next)
    setSaving(false)
  }

  return (
    <button
      onClick={handleClick}
      aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg transition-smooth",
        isFavorite ? "text-error" : "text-navy-300 hover:text-navy-500",
        className
      )}
    >
      <Heart className="h-4 w-4" strokeWidth={1.5} fill={isFavorite ? "currentColor" : "none"} />
    </button>
  )
}
