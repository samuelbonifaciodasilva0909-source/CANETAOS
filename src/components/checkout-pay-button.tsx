"use client"

import { useState } from "react"
import { PremiumButton } from "@/components/ui/premium-button"
import { toast } from "sonner"
import { Copy, QrCode, CreditCard } from "lucide-react"

interface CheckoutResult {
  checkoutUrl?: string
  pixQrCode?: string
  pixCopyPaste?: string
}

export function CheckoutPayButton({ productSlug }: { productSlug: string }) {
  const [loading, setLoading] = useState<"PIX" | "CREDIT_CARD" | null>(null)
  const [result, setResult] = useState<CheckoutResult | null>(null)

  async function pay(method: "PIX" | "CREDIT_CARD") {
    setLoading(method)
    setResult(null)
    try {
      const res = await fetch(`/api/checkout/${productSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method }),
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
      </div>
    )
  }

  return (
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
  )
}
