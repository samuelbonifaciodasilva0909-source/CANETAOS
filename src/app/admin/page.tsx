import { createClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/layout/app-shell"
import { redirect } from "next/navigation"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { Users, BookOpen, CreditCard, Webhook, ArrowRight } from "lucide-react"
import Link from "next/link"

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single()

  if (role?.role !== "admin") redirect("/app")

  const { count: userCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })

  const { count: contentCount } = await supabase
    .from("content_items")
    .select("id", { count: "exact", head: true })

  const { count: subCount } = await supabase
    .from("subscriptions")
    .select("id", { count: "exact", head: true })
    .eq("status", "active")

  const stats = [
    { label: "Usuários", value: userCount || 0, icon: Users },
    { label: "Conteúdos", value: contentCount || 0, icon: BookOpen },
    { label: "Assinaturas ativas", value: subCount || 0, icon: CreditCard },
  ]

  const management = [
    { label: "Usuários", href: "/admin/users", icon: Users },
    { label: "Conteúdos", href: "/admin/content", icon: BookOpen },
    { label: "Assinaturas", href: "/admin/subscriptions", icon: CreditCard },
    { label: "Webhooks", href: "/admin/webhooks", icon: Webhook },
  ]

  return (
    <AppShell>
      <div className="space-y-8 max-w-[560px]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-navy-400">
              Administração
            </p>
            <PremiumBadge variant="warning">Admin</PremiumBadge>
          </div>
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-navy-900">
            Painel administrativo
          </h1>
          <p className="mt-1.5 text-[14px] text-navy-500">
            Visão geral e gerenciamento do CanetaOS.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <PremiumCard key={stat.label} variant="elevated" padding="lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-50">
                  <stat.icon className="h-4 w-4 text-navy-600" strokeWidth={1.5} />
                </div>
              </div>
              <p className="text-[24px] font-bold font-numeric text-navy-900 tracking-tight">
                {stat.value}
              </p>
              <p className="text-[11px] text-navy-400 mt-0.5">{stat.label}</p>
            </PremiumCard>
          ))}
        </div>

        <div>
          <h2 className="text-[13px] font-medium uppercase tracking-[0.06em] text-navy-400 mb-4">
            Gerenciamento
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {management.map((item) => (
              <Link key={item.label} href={item.href}>
                <PremiumCard variant="interactive" padding="lg" className="group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-50">
                        <item.icon className="h-4 w-4 text-navy-600" strokeWidth={1.5} />
                      </div>
                      <span className="text-[13px] font-medium text-navy-900">{item.label}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-navy-400 transition-smooth group-hover:text-navy-700 group-hover:translate-x-0.5" strokeWidth={1.5} />
                  </div>
                </PremiumCard>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
