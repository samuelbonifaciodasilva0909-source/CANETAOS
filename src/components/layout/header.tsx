"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, CreditCard, LogOut, Sun, Moon, Monitor } from "lucide-react"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { GlobalSearch } from "@/components/global-search"

export function Header() {
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    async function getUser() {
      try {
        const res = await fetch("/api/auth/me")
        const data = await res.json()
        if (data.user) {
          setUserName(data.user.full_name || data.user.email?.split("@")[0] || "")
          setUserEmail(data.user.email || "")
        }
      } catch {
        setUserName("Demo")
        setUserEmail("demo@canetaos.com")
      }
    }
    getUser()
  }, [])

  async function handleSignOut() {
    try {
      await fetch("/api/auth/demo-logout", { method: "POST" })
    } catch {}
    router.push("/login")
    router.refresh()
  }

  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/40 bg-background/80 px-6 sm:px-8 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        <h1 className="text-[13px] font-medium text-navy-400 lg:hidden">
          CanetaOS
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <GlobalSearch />
        <PremiumBadge variant="soft" className="hidden sm:inline-flex">
          Starter
        </PremiumBadge>

        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : theme === "light" ? "dark" : "system")}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-navy-400 hover:bg-warm-100 hover:text-navy-700 transition-smooth"
            title={`Tema atual: ${theme}`}
          >
            {theme === "dark" ? (
              <Moon className="h-4 w-4" strokeWidth={1.5} />
            ) : theme === "light" ? (
              <Sun className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <Monitor className="h-4 w-4" strokeWidth={1.5} />
            )}
          </button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="flex items-center gap-2.5 rounded-full p-1 -mr-1 transition-smooth hover:bg-warm-100" />
            }
          >
            <Avatar className="h-8 w-8 ring-2 ring-white dark:ring-navy-800">
              <AvatarFallback className="bg-navy-50 text-[11px] font-semibold text-navy-700">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-[13px] font-medium text-navy-700 sm:inline-block">
              {userName}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl border-border/60 p-1.5">
            <div className="px-3 py-2.5">
              <p className="text-[13px] font-medium text-foreground">{userName}</p>
              <p className="text-[11px] text-navy-400">{userEmail}</p>
            </div>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem onClick={() => router.push("/app/settings")} className="rounded-xl text-[13px] gap-2.5 py-2">
              <User className="h-4 w-4 text-navy-400" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/app/settings")} className="rounded-xl text-[13px] gap-2.5 py-2">
              <Settings className="h-4 w-4 text-navy-400" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/billing")} className="rounded-xl text-[13px] gap-2.5 py-2">
              <CreditCard className="h-4 w-4 text-navy-400" />
              Assinatura
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem onClick={handleSignOut} className="rounded-xl text-[13px] gap-2.5 py-2 text-error">
              <LogOut className="h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
