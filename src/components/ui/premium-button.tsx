"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "outline" | "soft"
  size?: "sm" | "md" | "lg" | "icon"
  loading?: boolean
  icon?: React.ReactNode
}

const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ className, variant = "primary", size = "md", loading, icon, children, disabled, ...props }, ref) => {
    const variantStyles = {
      primary: "bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-950 shadow-[0_1px_2px_rgba(15,27,43,0.14)]",
      secondary: "bg-paper-100 text-ink-800 hover:bg-paper-200 active:bg-paper-300 border border-border/70",
      ghost: "text-ink-600 hover:bg-paper-100 active:bg-paper-200",
      destructive: "bg-error text-white hover:bg-error/90 active:bg-error/80",
      outline: "border border-border text-ink-700 hover:bg-paper-50 active:bg-paper-100",
      soft: "bg-ink-50 text-ink-700 hover:bg-ink-100 active:bg-ink-200",
    }

    const sizeStyles = {
      sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
      md: "h-10 px-4 text-sm rounded-lg gap-2",
      lg: "h-12 px-6 text-sm rounded-lg gap-2",
      icon: "h-10 w-10 rounded-lg",
    }

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-smooth",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900/20 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
      </button>
    )
  }
)
PremiumButton.displayName = "PremiumButton"

export { PremiumButton }
