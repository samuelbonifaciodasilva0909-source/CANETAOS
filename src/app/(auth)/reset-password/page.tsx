"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CanetaOSLogo } from "@/components/branding/logo"
import { ComplianceFooter } from "@/components/compliance/compliance-footer"
import { toast } from "sonner"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [valid, setValid] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY") {
          setValid(true)
        }
      }
    )

    return () => {
      data.subscription.unsubscribe()
    }
  }, [supabase])

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem")
      return
    }

    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres")
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success("Senha redefinida com sucesso!")
    router.push("/app")
    router.refresh()
  }

  if (!valid) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="mx-auto w-full max-w-sm text-center">
          <CanetaOSLogo className="justify-center mb-6" />
          <p className="text-sm text-muted-foreground">
            Verificando link de redefinição...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <CanetaOSLogo />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Redefinir senha
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Informe sua nova senha abaixo.
        </p>

        <form onSubmit={handleResetPassword} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nova senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repita a senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Redefinindo..." : "Redefinir senha"}
          </Button>
        </form>
      </div>
      </div>
      <ComplianceFooter />
    </div>
  )
}
