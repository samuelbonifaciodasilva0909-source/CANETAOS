"use client"

import Link from "next/link"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CanetaOSLogo } from "@/components/branding/logo"
import { ComplianceFooter } from "@/components/compliance/compliance-footer"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <CanetaOSLogo />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Esqueceu a senha?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Informe seu e-mail e enviaremos um link para redefinir sua senha.
        </p>

        {sent ? (
          <div className="mt-8 rounded-lg border border-positive/20 bg-positive/5 p-4">
            <p className="text-sm text-positive">
              E-mail enviado! Verifique sua caixa de entrada e clique no link
              para redefinir sua senha.
            </p>
          </div>
        ) : (
          <form onSubmit={handleForgotPassword} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Enviando..." : "Enviar link de redefinição"}
            </Button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Lembrou a senha?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Voltar ao login
          </Link>
        </p>
      </div>
      </div>
      <ComplianceFooter />
    </div>
  )
}
