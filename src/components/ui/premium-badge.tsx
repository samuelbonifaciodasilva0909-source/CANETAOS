import * as React from "react"
import { cn } from "@/lib/utils"

interface PremiumBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "soft" | "outline" | "success" | "warning" | "error"
  dot?: boolean
}

const PremiumBadge = React.forwardRef<HTMLSpanElement, PremiumBadgeProps>(
  ({ className, variant = "default", dot, children, ...props }, ref) => {
    const variantStyles = {
      default: "bg-ink-900 text-white",
      soft: "bg-ink-50 text-ink-700",
      outline: "border border-border text-ink-600 bg-transparent",
      success: "bg-positive-soft text-positive",
      warning: "bg-attention-soft text-attention",
      error: "bg-error-soft text-error",
    }

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium tracking-[0.02em] uppercase",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {dot && (
          <span className={cn(
            "h-1.5 w-1.5 rounded-full",
            variant === "success" && "bg-positive",
            variant === "warning" && "bg-attention",
            variant === "error" && "bg-error",
            variant === "default" && "bg-white/60",
            variant === "soft" && "bg-navy-400",
            variant === "outline" && "bg-navy-400",
          )} />
        )}
        {children}
      </span>
    )
  }
)
PremiumBadge.displayName = "PremiumBadge"

export { PremiumBadge }
