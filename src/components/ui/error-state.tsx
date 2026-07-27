import { AlertCircle, RotateCcw } from "lucide-react"

export function ErrorState({
  message = "Não foi possível carregar os dados agora.",
  onRetry,
}: {
  message?: string
  onRetry: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-error-soft">
        <AlertCircle className="h-5 w-5 text-error" strokeWidth={1.5} />
      </div>
      <p className="text-[13px] text-navy-500 max-w-xs">{message}</p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 rounded-lg border border-border/60 px-4 py-2 text-[13px] font-medium text-navy-700 transition-smooth hover:bg-warm-50"
      >
        <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />
        Tentar novamente
      </button>
    </div>
  )
}
