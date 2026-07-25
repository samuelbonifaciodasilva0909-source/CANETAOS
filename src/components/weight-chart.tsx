"use client"

import { useMemo } from "react"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

interface WeightChartProps {
  entries: Array<{ entry_date: string; weight_kg: number | null }>
}

export function WeightChart({ entries }: WeightChartProps) {
  const data = useMemo(() => {
    return entries
      .filter((e) => e.weight_kg != null)
      .slice(0, 30)
      .reverse()
      .map((e) => ({
        date: new Date(e.entry_date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        peso: e.weight_kg,
      }))
  }, [entries])

  if (data.length < 2) return null

  const min = Math.min(...data.map((d) => d.peso!))
  const max = Math.max(...data.map((d) => d.peso!))
  const padding = (max - min) * 0.15 || 1

  return (
    <div className="w-full h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#102a43" stopOpacity={0.12} className="[stop-color:var(--foreground)]" />
              <stop offset="100%" stopColor="#102a43" stopOpacity={0} className="[stop-color:var(--foreground)]" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#8e99a4" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[min - padding, max + padding]}
            tick={{ fontSize: 10, fill: "#8e99a4" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              fontSize: "12px",
              color: "var(--foreground)",
            }}
            formatter={(value) => [`${value} kg`, "Peso"]}
          />
          <Area
            type="monotone"
            dataKey="peso"
            stroke="#102a43"
            strokeWidth={2}
            fill="url(#weightGradient)"
            dot={{ r: 3, fill: "#102a43", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#102a43", strokeWidth: 2, stroke: "#fff" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
