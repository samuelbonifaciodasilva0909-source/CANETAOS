"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, PlusCircle, BookOpen, User } from "lucide-react"

const navItems = [
  {
    label: "Hoje",
    href: "/app",
    icon: Home,
  },
  {
    label: "Registrar",
    href: "/app/tracker",
    icon: PlusCircle,
  },
  {
    label: "Conteúdo",
    href: "/app/recipes",
    icon: BookOpen,
  },
  {
    label: "Perfil",
    href: "/app/settings",
    icon: User,
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="border-t border-border/60 bg-card/95 backdrop-blur-xl supports-[backdrop-filter]:bg-card/80">
      <div className="flex items-center justify-around px-2 py-1.5">
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
                "flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-[10px] font-medium transition-smooth",
                isActive
                  ? "text-navy-900"
                  : "text-navy-400"
              )}
            >
              <item.icon className="h-5 w-5" strokeWidth={isActive ? 2 : 1.5} />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
