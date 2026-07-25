"use client"

import Link from "next/link"
import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PremiumButton } from "@/components/ui/premium-button"
import { PremiumCard } from "@/components/ui/premium-card"
import { CanetaOSLogo } from "@/components/branding/logo"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { ArrowRight } from "lucide-react"

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/app"

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error("E-mail ou senha inválidos")
      setLoading(false)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  async function handleDemoLogin() {
    setDemoLoading(true)
    try {
      await fetch("/api/auth/demo", { method: "POST" })
      router.push(redirect)
      router.refresh()
    } catch {
      setDemoLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col justify-center px-8 py-12 sm:px-12 lg:w-[480px]">
      <div className="mx-auto w-full max-w-[340px]">
        <div className="mb-10 lg:hidden">
          <CanetaOSLogo className="justify-center" />
        </div>

        <div className="mb-10">
          <h1 className="text-[26px] font-semibold tracking-[-0.03em] text-navy-900">
            Entrar
          </h1>
          <p className="mt-2.5 text-[14px] text-navy-500 leading-relaxed">
            Acesse sua conta para continuar.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[13px] font-medium text-navy-700">E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full h-11 rounded-xl border border-border/80 bg-white px-4 text-[14px] text-navy-900 placeholder:text-navy-300 outline-none transition-smooth focus:border-navy-300 focus:ring-4 focus:ring-navy-900/5"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-medium text-navy-700">Senha</label>
              <Link
                href="/forgot-password"
                className="text-[12px] font-medium text-navy-500 hover:text-navy-700 transition-smooth"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <input
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full h-11 rounded-xl border border-border/80 bg-white px-4 text-[14px] text-navy-900 placeholder:text-navy-300 outline-none transition-smooth focus:border-navy-300 focus:ring-4 focus:ring-navy-900/5"
            />
          </div>

          <PremiumButton type="submit" className="w-full mt-2" size="lg" loading={loading}>
            Entrar
          </PremiumButton>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center text-[12px]">
            <span className="bg-background px-3 text-navy-400">ou</span>
          </div>
        </div>

        <PremiumButton
          variant="secondary"
          className="w-full"
          size="lg"
          onClick={handleDemoLogin}
          loading={demoLoading}
          icon={<ArrowRight className="h-4 w-4" />}
        >
          Entrar como Demo
        </PremiumButton>

        <p className="mt-10 text-center text-[13px] text-navy-500">
          Não tem uma conta?{" "}
          <Link
            href="/register"
            className="font-medium text-navy-900 hover:underline"
          >
            Criar conta
          </Link>
        </p>

        <div className="mt-10 border-t border-border/40 pt-6">
          <p className="text-[11px] text-navy-400/70 leading-relaxed text-center">
            CanetaOS é uma ferramenta de acompanhamento e educação. Não
            substitui acompanhamento médico, não indica nem vende medicamento.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 bg-navy-900 lg:flex lg:flex-col lg:items-center lg:justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="relative mx-auto max-w-md px-8 text-center">
          <CanetaOSLogo className="h-9 text-white mb-8 justify-center" white />
          <h2 className="text-[28px] font-semibold text-white tracking-[-0.03em] leading-tight">
            Clareza durante
            <br />
            <span className="text-white/60">a jornada</span>
          </h2>
          <p className="mt-5 text-[14px] text-white/40 leading-relaxed max-w-xs mx-auto">
            Organize sua alimentação, acompanhe seus sintomas e tenha mais
            clareza durante seu tratamento.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
