"use client"

import { useState } from "react"
import { PremiumCard } from "@/components/ui/premium-card"
import { MoodSelector } from "@/components/ui/premium-mood"
import { Checklist } from "@/components/ui/premium-checklist"
import { Droplets, Beef, Dumbbell, Syringe, ClipboardList } from "lucide-react"

export function HomeInteractive() {
  const [mood, setMood] = useState<string | null>(null)
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  function handleToggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <>
      <div>
        <h2 className="text-[15px] font-semibold text-foreground mb-4 tracking-[-0.01em]">
          Como você está hoje?
        </h2>
        <MoodSelector selected={mood} onSelect={setMood} />
      </div>

      <div>
        <h2 className="text-[15px] font-semibold text-foreground mb-4 tracking-[-0.01em]">
          Sua rotina de hoje
        </h2>
        <PremiumCard variant="elevated" padding="lg">
          <Checklist
            items={[
              { id: "water", label: "Hidratação", checked: !!checked["water"], icon: <Droplets className="h-4 w-4" strokeWidth={1.5} /> },
              { id: "protein", label: "Proteína", checked: !!checked["protein"], icon: <Beef className="h-4 w-4" strokeWidth={1.5} /> },
              { id: "training", label: "Treino", checked: !!checked["training"], icon: <Dumbbell className="h-4 w-4" strokeWidth={1.5} /> },
              { id: "application", label: "Aplicação", checked: !!checked["application"], icon: <Syringe className="h-4 w-4" strokeWidth={1.5} /> },
              { id: "tracking", label: "Registro", checked: !!checked["tracking"], icon: <ClipboardList className="h-4 w-4" strokeWidth={1.5} /> },
            ]}
            onToggle={(id) => handleToggle(id)}
          />
        </PremiumCard>
      </div>
    </>
  )
}
