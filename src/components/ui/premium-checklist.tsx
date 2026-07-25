"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface ChecklistItemProps {
  label: string
  checked: boolean
  onChange?: (checked: boolean) => void
  icon?: React.ReactNode
}

function ChecklistItem({ label, checked, onChange, icon }: ChecklistItemProps) {
  return (
    <button
      onClick={() => onChange?.(!checked)}
      className={cn(
        "group flex items-center gap-3.5 rounded-xl px-4 py-3 transition-smooth w-full text-left",
        checked
          ? "bg-navy-50/80 dark:bg-navy-800/60"
          : "bg-card hover:bg-warm-50 dark:hover:bg-navy-800/40 border border-border/40"
      )}
    >
      <div
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-smooth",
          checked
            ? "border-navy-900 dark:border-navy-200 bg-navy-900 dark:bg-navy-200 text-white dark:text-navy-900"
            : "border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-700 group-hover:border-navy-300 dark:group-hover:border-navy-500"
        )}
      >
        {checked && <Check className="h-3 w-3" strokeWidth={3} />}
      </div>
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        {icon && <span className="text-navy-400 shrink-0">{icon}</span>}
        <span
          className={cn(
            "text-sm transition-smooth",
            checked ? "text-navy-400 line-through" : "text-navy-700 dark:text-navy-200"
          )}
        >
          {label}
        </span>
      </div>
    </button>
  )
}

interface ChecklistProps {
  items: {
    id: string
    label: string
    checked: boolean
    icon?: React.ReactNode
  }[]
  onToggle?: (id: string, checked: boolean) => void
}

function Checklist({ items, onToggle }: ChecklistProps) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <ChecklistItem
          key={item.id}
          label={item.label}
          checked={item.checked}
          icon={item.icon}
          onChange={(checked) => onToggle?.(item.id, checked)}
        />
      ))}
    </div>
  )
}

export { Checklist, ChecklistItem }
