"use client"

import { useMemo } from "react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts"

interface WaterChartProps {
  entries: Array<{ entry_date: string; water_intake_ml: number | null }>
  goalMl: number
}

export function WaterChart({ entries, goalMl }: WaterChartProps) {
  const data = useMemo(() => {
    const today = new Date()
    const byDate = new Map(entries.map((e) => [e.entry_date, e.water_intake_ml || 0]))
    const days: { date: string; agua: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split("T")[0]
      days.push({
        date: d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
        agua: byDate.get(key) || 0,
      })
    }
    return days
  }, [entries])

  return (
    <div className="w-full h-[140px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#8e99a4" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#8e99a4" }} axisLine={false} tickLine={false} />
          <ReferenceLine y={goalMl} stroke="#5b7a63" strokeDasharray="4 4" strokeWidth={1.5} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              fontSize: "12px",
              color: "var(--foreground)",
            }}
            formatter={(value) => [`${value} ml`, "Água"]}
          />
          <Bar dataKey="agua" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
