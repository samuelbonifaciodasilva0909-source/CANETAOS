import { AppShell } from "@/components/layout/app-shell"
import { PremiumCard } from "@/components/ui/premium-card"
import { XCircle } from "lucide-react"
import Link from "next/link"

export default function CheckoutCancelPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[400px] space-y-8">
        <PremiumCard variant="elevated" padding="xl" className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-warm-100 mb-4">
            <XCircle className="h-7 w-7 text-navy-400" strokeWidth={1.5} />
          </div>
          <h1 className="text-[20px] font-semibold tracking-[-0.03em] text-navy-900">
            Checkout cancelado
          </h1>
          <p className="mt-2 text-[13px] text-navy-500 leading-relaxed">
            O pagamento não foi concluído. Você pode tentar novamente quando
            quiser.
          </p>
          <Link href="/app/plus" className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-navy-900 px-6 text-[13px] font-medium text-white transition-smooth hover:bg-navy-800">
            Ver planos
          </Link>
        </PremiumCard>
      </div>
    </AppShell>
  )
}
