"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface MoodButtonProps {
  emoji: string
  label: string
  selected?: boolean
  onClick?: () => void
}

function MoodButton({ emoji, label, selected, onClick }: MoodButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 rounded-2xl p-4 transition-smooth",
        "border",
        selected
          ? "border-navy-900/20 dark:border-navy-200/20 bg-navy-50 dark:bg-navy-800/60 shadow-[0_0_0_1px_rgba(16,42,67,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
          : "border-border/60 bg-card hover:border-navy-200 dark:hover:border-navy-600 hover:bg-warm-50 dark:hover:bg-navy-800/40"
      )}
    >
      <span className="text-2xl transition-spring" style={{ transform: selected ? "scale(1.15)" : "scale(1)" }}>
        {emoji}
      </span>
      <span className={cn(
        "text-xs font-medium transition-smooth",
        selected ? "text-navy-900 dark:text-navy-100" : "text-navy-500 dark:text-navy-400"
      )}>
        {label}
      </span>
    </button>
  )
}

interface MoodSelectorProps {
  selected: string | null
  onSelect: (mood: string | null) => void
}

function MoodSelector({ selected, onSelect }: MoodSelectorProps) {
  const moods = [
    { emoji: "🙂", label: "Bem", id: "well" },
    { emoji: "🤢", label: "Náusea", id: "nausea" },
    { emoji: "😴", label: "Cansaço", id: "fatigue" },
    { emoji: "🤮", label: "Enjoo", id: "vomit" },
    { emoji: "😐", label: "Sem sintomas", id: "none" },
  ]

  return (
    <div className="grid grid-cols-5 gap-3">
      {moods.map((mood) => (
        <MoodButton
          key={mood.id}
          emoji={mood.emoji}
          label={mood.label}
          selected={selected === mood.id}
          onClick={() => onSelect(selected === mood.id ? null : mood.id)}
        />
      ))}
    </div>
  )
}

export { MoodButton, MoodSelector }
