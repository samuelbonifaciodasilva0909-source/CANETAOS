import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressRingProps {
  pct: number
  size?: number
  strokeWidth?: number
  colorClassName?: string
  trackClassName?: string
  children?: React.ReactNode
  className?: string
}

/** Circular progress indicator used on the "Resumo de hoje" stat tiles.
 * Center content (icon, percentage, or emoji) is passed as children. */
function ProgressRing({
  pct,
  size = 44,
  strokeWidth = 4,
  colorClassName = "stroke-violet-500",
  trackClassName = "stroke-black/5 dark:stroke-white/10",
  children,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, pct))
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={trackClassName}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(colorClassName, "transition-all duration-700 ease-out")}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}

export { ProgressRing }
