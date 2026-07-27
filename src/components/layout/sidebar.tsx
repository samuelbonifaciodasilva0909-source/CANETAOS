"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CanetaOSIcon } from "@/components/branding/logo"
import {
  Home,
  Activity,
  UtensilsCrossed,
  BookOpen,
  Heart,
  ShieldCheck,
  ShoppingCart,
  Star,
  Settings,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useEntitlements } from "@/hooks/use-entitlements"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const navItems = [
  { label: "Hoje", href: "/app", icon: Home },
  { label: "Minha Jornada", href: "/app/tracker", icon: Activity },
  { label: "Alimentação", href: "/app/food", icon: UtensilsCrossed },
  { label: "Receitas", href: "/app/recipes", icon: UtensilsCrossed, requiresEntitlement: "quick_recipes" as const },
  { label: "Lista de Compras", href: "/app/lista-compras", icon: ShoppingCart },
  { label: "Biblioteca", href: "/app/learning", icon: BookOpen },
  { label: "Minha Coleção", href: "/app/colecao", icon: Heart },
  { label: "Desmame", href: "/app/desmame", icon: ShieldCheck },
  { label: "CanetaOS Plus", href: "/app/plus", icon: Star },
  { label: "Configurações", href: "/app/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { hasEntitlement } = useEntitlements()
  const [userName, setUserName] = useState("")

  useEffect(() => {
    async function getUser() {
      try {
        const res = await fetch("/api/auth/me")
        const data = await res.json()
        if (data.user) setUserName(data.user.full_name || data.user.email?.split("@")[0] || "")
      } catch {
        setUserName("Demo")
      }
    }
    getUser()
  }, [])

  const initials = userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "U"

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-[248px] lg:flex-col">
      <div className="flex grow flex-col border-r border-border/60 bg-sidebar px-4 py-6">
        <Link href="/app" className="flex items-center gap-2.5 px-3 mb-8">
          <CanetaOSIcon className="h-7 w-7" />
          <span className="text-[16px] font-semibold tracking-[-0.02em] text-foreground">
            Caneta<span className="font-bold text-aurora">OS</span>
          </span>
        </Link>

        <nav className="flex flex-1 flex-col gap-0.5">
          {navItems.filter((item) => !item.requiresEntitlement || hasEntitlement(item.requiresEntitlement)).map((item) => {
            const isActive =
              item.href === "/app"
                ? pathname === "/app"
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-smooth",
                  isActive
                    ? "bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300"
                    : "text-navy-500 dark:text-navy-400 hover:text-navy-700 dark:hover:text-navy-200 hover:bg-warm-50 dark:hover:bg-white/[0.04]"
                )}
              >
                <item.icon
                  className={cn("h-[18px] w-[18px]", isActive ? "text-violet-600 dark:text-violet-300" : "text-navy-400")}
                  strokeWidth={1.8}
                />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {!hasEntitlement("plus_feed") && (
          <Link
            href="/app/plus"
            className="mt-4 block rounded-2xl bg-aurora p-4 text-white shadow-aurora transition-smooth hover:brightness-110"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 mb-3">
              <Sparkles className="h-4 w-4" strokeWidth={1.8} />
            </div>
            <p className="text-[13px] font-semibold leading-snug mb-1">CanetaOS Premium</p>
            <p className="text-[11px] leading-relaxed text-white/75 mb-3">
              Aproveite todos os recursos exclusivos para sua jornada.
            </p>
            <span className="inline-flex items-center justify-center w-full rounded-xl bg-white/15 py-2 text-[12px] font-medium backdrop-blur-sm">
              Ver planos
            </span>
          </Link>
        )}

        <div className="mt-4 pt-4 border-t border-border/40">
          <Link href="/app/settings" className="flex items-center gap-2.5 px-1 py-1 rounded-xl transition-smooth hover:bg-warm-50 dark:hover:bg-white/[0.04]">
            <Avatar className="h-9 w-9 ring-2 ring-white dark:ring-void-700">
              <AvatarFallback className="bg-violet-500/15 text-[12px] font-semibold text-violet-600 dark:text-violet-300">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-foreground truncate">{userName || "Olá!"}</p>
              <p className="text-[11px] text-navy-400 truncate">
                {hasEntitlement("plus_feed") ? "Plano Premium" : "Plano Starter"}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </aside>
  )
}
