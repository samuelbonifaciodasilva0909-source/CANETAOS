import { CanetaOSLogo } from "@/components/branding/logo"
import { WifiOff } from "lucide-react"

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <CanetaOSLogo className="mb-8" />
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-50 mb-4">
        <WifiOff className="h-5 w-5 text-navy-600" strokeWidth={1.5} />
      </div>
      <h1 className="text-[20px] font-semibold tracking-[-0.03em] text-navy-900">
        Você está offline
      </h1>
      <p className="mt-2 text-[13px] text-navy-500 leading-relaxed max-w-xs">
        Algumas telas que você já visitou continuam disponíveis. Reconecte-se pra ver dados atualizados.
      </p>
    </div>
  )
}
