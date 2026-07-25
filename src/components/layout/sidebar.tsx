"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CanetaOSIcon } from "@/components/branding/logo"
import {
  Home,
  Activity,
  UtensilsCrossed,
  BookOpen,
  Star,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    label: "Hoje",
    href: "/app",
    icon: Home,
  },
  {
    label: "Minha Jornada",
    href: "/app/tracker",
    icon: Activity,
  },
  {
    label: "Alimentação",
    href: "/app/food",
    icon: UtensilsCrossed,
  },
  {
    label: "Receitas",
    href: "/app/recipes",
    icon: UtensilsCrossed,
  },
  {
    label: "Biblioteca",
    href: "/app/learning",
    icon: BookOpen,
  },
  {
    label: "CanetaOS Plus",
    href: "/app/plus",
    icon: Star,
  },
  {
    label: "Configurações",
    href: "/app/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-[232px] lg:flex-col">
      <div className="flex grow flex-col border-r border-border/60 bg-card/80 px-4 py-6">
        <Link href="/app" className="flex items-center px-3 mb-8">
          <CanetaOSIcon className="h-7 w-7" />
        </Link>

        <nav className="flex flex-1 flex-col gap-0.5">
          {navItems.map((item) => {
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
                    ? "bg-navy-50 dark:bg-navy-800/60 text-navy-900 dark:text-navy-100"
                    : "text-navy-500 dark:text-navy-400 hover:text-navy-700 dark:hover:text-navy-200 hover:bg-warm-50 dark:hover:bg-navy-800/40"
                )}
              >
                <item.icon className={cn("h-[18px] w-[18px]", isActive ? "text-navy-700 dark:text-navy-200" : "text-navy-400")} strokeWidth={1.8} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-border/40">
          <div className="px-3 py-2">
            <p className="text-[11px] leading-relaxed text-navy-500 dark:text-navy-400">
              Ferramenta de acompanhamento e educação. Não substitui
              acompanhamento médico.
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
