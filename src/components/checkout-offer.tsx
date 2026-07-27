"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { PremiumButton } from "@/components/ui/premium-button"
import { toast } from "sonner"
import { pixelTrack } from "@/lib/analytics/meta-pixel"
import { Copy, QrCode, CreditCard, Check } from "lucide-react"

interface CheckoutResult {
  checkoutUrl?: string
  pixQrCode?: string
  pixCopyPaste?: string
  providerPaymentId?: string
}

const PIX_POLL_INTERVAL_MS = 3000

function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })
}

export function CheckoutOffer({
  baseName,
  basePriceCents,
  bumpName,
  bumpDescription,
  bumpPriceCents,
}: {
  baseName: string
  basePriceCents: number
  bumpName: string
  bumpDescription: string | null
  bumpPriceCents: number
}) {
  const router = useRouter()
  const [includeBump, setIncludeBump] = useState(false)
  const [loading, setLoading] = useState<"PIX" | "CREDIT_CARD" | null>(null)
  const [result, setResult] = useState<CheckoutResult | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const totalCents = basePriceCents + (includeBump ? bumpPriceCents : 0)

  useEffect(() => {
    pixelTrack("InitiateCheckout", {
      value: basePriceCents / 100,
      currency: "BRL",
      content_name: baseName,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!result?.providerPaymentId || !result?.pixCopyPaste) return

    const supabase = createClient()
    pollRef.current = setInterval(async () => {
      const { data } = await supabase
        .from("purchases")
        .select("status")
        .eq("provider", "asaas")
        .eq("provider_payment_id", result.providerPaymentId!)
        .eq("status", "paid")
        .limit(1)
        .maybeSingle()

      if (data) {
        if (pollRef.current) clearInterval(pollRef.current)
        router.push(`/checkout/success?value=${(totalCents / 100).toFixed(2)}`)
      }
    }, PIX_POLL_INTERVAL_MS)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [result?.providerPaymentId, result?.pixCopyPaste, router])

  async function pay(method: "PIX" | "CREDIT_CARD") {
    setLoading(method)
    setResult(null)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, includeBump }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Não foi possível iniciar o pagamento.")
        return
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }

      setResult(data)
    } catch {
      toast.error("Não foi possível iniciar o pagamento. Tente novamente.")
    } finally {
      setLoading(null)
    }
  }

  if (result?.pixCopyPaste) {
    return (
      <div className="space-y-4">
        {result.pixQrCode && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`data:image/png;base64,${result.pixQrCode}`}
            alt="QR Code Pix"
            className="mx-auto h-48 w-48 rounded-xl border border-border/60"
          />
        )}
        <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-warm-50 p-3">
          <code className="flex-1 truncate text-[11px] text-navy-600">{result.pixCopyPaste}</code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(result.pixCopyPaste!)
              toast.success("Código Pix copiado")
            }}
            className="shrink-0 rounded-lg p-1.5 text-navy-500 hover:bg-warm-100"
          >
            <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>
        <p className="text-[12px] text-navy-400 text-center">
          Escaneie o QR code ou copie o código Pix no app do seu banco.
        </p>
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-navy-400">
          <span className="h-1.5 w-1.5 rounded-full bg-navy-300 animate-pulse" />
          Aguardando confirmação do pagamento — você será redirecionado automaticamente.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between border-b border-border/40 pb-4">
        <span className="text-[14px] text-navy-600">{baseName}</span>
        <span className="text-[14px] font-medium font-numeric text-navy-900">
          R$ {formatPrice(basePriceCents)}
        </span>
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-border/60 bg-warm-50 p-4 cursor-pointer">
        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-smooth ${
            includeBump ? "border-navy-900 bg-navy-900" : "border-border/80 bg-white"
          }`}
        >
          {includeBump && <Check className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />}
        </span>
        <input
          type="checkbox"
          checked={includeBump}
          onChange={(e) => setIncludeBump(e.target.checked)}
          className="sr-only"
        />
        <span className="flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className="text-[13px] font-medium text-navy-900">Adicionar {bumpName}</span>
            <span className="text-[13px] font-medium font-numeric text-navy-900 shrink-0">
              + R$ {formatPrice(bumpPriceCents)}
            </span>
          </span>
          {bumpDescription && (
            <span className="mt-0.5 block text-[12px] text-navy-500">{bumpDescription}</span>
          )}
        </span>
      </label>

      <div className="flex items-baseline justify-between pt-2">
        <span className="text-[13px] font-medium uppercase tracking-[0.08em] text-navy-400">
          Total
        </span>
        <span className="text-[32px] font-bold font-numeric text-navy-900 tracking-tight">
          R$ {formatPrice(totalCents)}
        </span>
      </div>

      <div className="space-y-3">
        <PremiumButton
          className="w-full"
          size="lg"
          loading={loading === "PIX"}
          disabled={loading !== null}
          onClick={() => pay("PIX")}
          icon={<QrCode className="h-4 w-4" />}
        >
          Pagar com Pix
        </PremiumButton>
        <PremiumButton
          className="w-full"
          variant="outline"
          size="lg"
          loading={loading === "CREDIT_CARD"}
          disabled={loading !== null}
          onClick={() => pay("CREDIT_CARD")}
          icon={<CreditCard className="h-4 w-4" />}
        >
          Pagar com cartão
        </PremiumButton>
      </div>
    </div>
  )
}
