import { AppShell } from "@/components/layout/app-shell"
import { PremiumCard } from "@/components/ui/premium-card"
import { PremiumButton } from "@/components/ui/premium-button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function CheckoutSuccessPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[400px] space-y-8">
        <PremiumCard variant="elevated" padding="xl" className="text-center border-positive/20 bg-positive-soft">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-positive/10 mb-4">
            <CheckCircle className="h-7 w-7 text-positive" strokeWidth={1.5} />
          </div>
          <h1 className="text-[20px] font-semibold tracking-[-0.03em] text-navy-900">
            Assinatura confirmada
          </h1>
          <p className="mt-2 text-[13px] text-navy-500 leading-relaxed">
            Obrigado por assinar o CanetaOS Plus! Agora você tem acesso a todo
            o conteúdo premium.
          </p>
          <Link href="/app" className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-navy-900 px-6 text-[13px] font-medium text-white transition-smooth hover:bg-navy-800">
            Ir para o CanetaOS
          </Link>
        </PremiumCard>
      </div>
    </AppShell>
  )
}
