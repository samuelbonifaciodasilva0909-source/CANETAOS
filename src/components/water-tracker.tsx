"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { PremiumCard } from "@/components/ui/premium-card"
import { WaterChart } from "@/components/water-chart"
import { Droplets, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

const QUICK_AMOUNTS = [200, 300, 500]

interface WaterTrackerProps {
  entries: Array<{ entry_date: string; water_intake_ml: number | null }>
  goalMl: number
  todayMl: number
  isDemo: boolean
  onLogged: (newTodayMl: number) => void
}

export function WaterTracker({ entries, goalMl, todayMl, isDemo, onLogged }: WaterTrackerProps) {
  const [saving, setSaving] = useState(false)

  async function addWater(amountMl: number) {
    const newTotal = todayMl + amountMl
    setSaving(true)
    onLogged(newTotal)

    if (!isDemo) {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const today = new Date().toISOString().split("T")[0]
          await supabase
            .from("tracker_entries")
            .upsert(
              { user_id: user.id, entry_date: today, water_intake_ml: newTotal },
              { onConflict: "user_id,entry_date" }
            )
        }
      } catch (err) {
        console.error("Falha ao registrar água:", err)
      }
    }
    setSaving(false)
  }

  const pct = Math.min(100, Math.round((todayMl / goalMl) * 100))

  return (
    <PremiumCard variant="elevated" padding="lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Droplets className="h-4 w-4 text-sky-500" strokeWidth={1.5} />
          <span className="text-[13px] font-medium text-foreground">Hidratação</span>
        </div>
        <span className="text-[12px] font-numeric text-navy-500">
          {todayMl}ml <span className="text-navy-400">/ {goalMl}ml</span>
        </span>
      </div>

      <div className="h-2 rounded-full bg-warm-200 dark:bg-navy-700 overflow-hidden mb-4">
        <div
          className="h-full rounded-full bg-sky-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex gap-2 mb-5">
        {QUICK_AMOUNTS.map((amount) => (
          <button
            key={amount}
            onClick={() => addWater(amount)}
            disabled={saving}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 h-9 rounded-lg border border-border/60 text-[12px] font-medium font-numeric text-navy-600 transition-smooth",
              "hover:bg-sky-50 hover:border-sky-200 disabled:opacity-50"
            )}
          >
            <Plus className="h-3 w-3" strokeWidth={2} />
            {amount}ml
          </button>
        ))}
      </div>

      <WaterChart entries={entries} goalMl={goalMl} />
    </PremiumCard>
  )
}
