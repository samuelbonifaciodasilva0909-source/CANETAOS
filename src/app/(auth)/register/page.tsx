"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { PremiumButton } from "@/components/ui/premium-button"
import { CanetaOSLogo } from "@/components/branding/logo"
import { toast } from "sonner"
import { ArrowRight } from "lucide-react"

export default function RegisterPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()

    if (!ageConfirmed) {
      toast.error("Você precisa confirmar que tem 18 anos ou mais")
      return
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem")
      return
    }

    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres")
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: fullName,
        age_confirmed: true,
        age_confirmed_at: new Date().toISOString(),
        onboarding_completed: false,
      })
    }

    toast.success("Conta criada com sucesso!")
    router.push("/onboarding")
    router.refresh()
  }

  async function handleDemoRegister() {
    setDemoLoading(true)
    try {
      await fetch("/api/auth/demo", { method: "POST" })
      router.push("/onboarding")
      router.refresh()
    } catch {
      setDemoLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 bg-navy-900 lg:flex lg:flex-col lg:items-center lg:justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="relative mx-auto max-w-md px-8 text-center">
          <CanetaOSLogo className="h-9 text-white mb-8 justify-center" white />
          <h2 className="text-[28px] font-semibold text-white tracking-[-0.03em] leading-tight">
            Comece sua
            <br />
            <span className="text-white/60">jornada</span>
          </h2>
          <p className="mt-5 text-[14px] text-white/40 leading-relaxed max-w-xs mx-auto">
            Crie sua conta gratuita e comece a organizar seu acompanhamento
            com mais clareza.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-8 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-[340px]">
          <div className="mb-10 lg:hidden">
            <CanetaOSLogo className="justify-center" />
          </div>

          <div className="mb-10">
            <h1 className="text-[26px] font-semibold tracking-[-0.03em] text-navy-900">
              Criar conta
            </h1>
            <p className="mt-2.5 text-[14px] text-navy-500 leading-relaxed">
              Preencha seus dados para começar.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-navy-700">Nome completo</label>
              <input
                type="text"
                placeholder="Seu nome"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
                className="w-full h-11 rounded-xl border border-border/80 bg-white px-4 text-[14px] text-navy-900 placeholder:text-navy-300 outline-none transition-smooth focus:border-navy-300 focus:ring-4 focus:ring-navy-900/5"
              />
            </div>

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
              <label className="text-[13px] font-medium text-navy-700">Senha</label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full h-11 rounded-xl border border-border/80 bg-white px-4 text-[14px] text-navy-900 placeholder:text-navy-300 outline-none transition-smooth focus:border-navy-300 focus:ring-4 focus:ring-navy-900/5"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-medium text-navy-700">Confirmar senha</label>
              <input
                type="password"
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full h-11 rounded-xl border border-border/80 bg-white px-4 text-[14px] text-navy-900 placeholder:text-navy-300 outline-none transition-smooth focus:border-navy-300 focus:ring-4 focus:ring-navy-900/5"
              />
            </div>

            <label className="flex items-start gap-3 pt-2 cursor-pointer group">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={ageConfirmed}
                  onChange={(e) => setAgeConfirmed(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-5 w-5 rounded-md border border-navy-200 bg-white transition-smooth peer-checked:border-navy-900 peer-checked:bg-navy-900 group-hover:border-navy-300">
                  {ageConfirmed && (
                    <svg viewBox="0 0 16 16" fill="white" className="h-full w-full p-0.5">
                      <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-[13px] text-navy-500 leading-snug">
                Confirmo que tenho 18 anos ou mais.
              </span>
            </label>

            <PremiumButton type="submit" className="w-full mt-2" size="lg" loading={loading} disabled={!ageConfirmed}>
              Criar conta
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
            onClick={handleDemoRegister}
            loading={demoLoading}
            icon={<ArrowRight className="h-4 w-4" />}
          >
            Criar conta Demo
          </PremiumButton>

          <p className="mt-10 text-center text-[13px] text-navy-500">
            Já tem uma conta?{" "}
            <Link href="/login" className="font-medium text-navy-900 hover:underline">
              Entrar
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
    </div>
  )
}
