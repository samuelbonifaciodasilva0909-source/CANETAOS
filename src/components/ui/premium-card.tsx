import * as React from "react"
import { cn } from "@/lib/utils"

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "soft" | "interactive" | "hero"
  padding?: "none" | "sm" | "md" | "lg" | "xl"
}

const PremiumCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  ({ className, variant = "default", padding = "md", children, ...props }, ref) => {
    const variantStyles = {
      default: "bg-card border border-border/70",
      elevated: "bg-card border border-border/50 shadow-[0_1px_2px_rgba(15,27,43,0.03)]",
      soft: "bg-paper-100/60 dark:bg-ink-800/50 border-0",
      interactive: "bg-card border border-border/70 hover-lift cursor-pointer",
      hero: "bg-card border border-border/50 shadow-[0_1px_4px_rgba(15,27,43,0.05)]",
    }

    const paddingStyles = {
      none: "",
      sm: "p-4",
      md: "p-5 sm:p-6",
      lg: "p-6 sm:p-8",
      xl: "p-8 sm:p-10",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl",
          variantStyles[variant],
          paddingStyles[padding],
          variant === "interactive" && "transition-smooth",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
PremiumCard.displayName = "PremiumCard"

export { PremiumCard }
