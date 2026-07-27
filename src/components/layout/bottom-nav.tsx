"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, ClipboardList, Plus, Heart, BookOpen } from "lucide-react"
import { useEntitlements } from "@/hooks/use-entitlements"

const leftItems = [
  { label: "Início", href: "/app", icon: Home },
  { label: "Registros", href: "/app/tracker", icon: ClipboardList },
]

const rightItems = [
  { label: "Receitas", href: "/app/recipes", icon: Heart, requiresEntitlement: "quick_recipes" as const },
  { label: "Conteúdos", href: "/app/learning", icon: BookOpen },
]

function NavLink({ item, isActive }: { item: { label: string; href: string; icon: typeof Home }; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-[10px] font-medium transition-smooth",
        isActive ? "text-violet-600 dark:text-violet-400" : "text-navy-400"
      )}
    >
      <item.icon className="h-5 w-5" strokeWidth={isActive ? 2 : 1.5} />
      {item.label}
    </Link>
  )
}

export function BottomNav() {
  const pathname = usePathname()
  const { hasEntitlement } = useEntitlements()

  function isActive(href: string) {
    return href === "/app" ? pathname === "/app" : pathname.startsWith(href)
  }

  return (
    <nav className="border-t border-border/60 bg-card/95 backdrop-blur-xl supports-[backdrop-filter]:bg-card/80">
      <div className="flex items-center justify-around px-2 py-1.5">
        {leftItems.map((item) => (
          <NavLink key={item.href} item={item} isActive={isActive(item.href)} />
        ))}

        <Link
          href="/app/tracker"
          className="flex h-12 w-12 -translate-y-3 items-center justify-center rounded-full bg-aurora text-white shadow-aurora transition-smooth active:scale-95"
          aria-label="Registrar agora"
        >
          <Plus className="h-6 w-6" strokeWidth={2} />
        </Link>

        {rightItems
          .filter((item) => !item.requiresEntitlement || hasEntitlement(item.requiresEntitlement))
          .map((item) => (
            <NavLink key={item.href} item={item} isActive={isActive(item.href)} />
          ))}
      </div>
    </nav>
  )
}
