import { Check } from "lucide-react"

const items = ["Pagamento único", "Acesso imediato", "Pix ou cartão", "Cancele quando quiser"]

export function TrustRow({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-x-5 gap-y-2 ${className}`}>
      {items.map((item) => (
      <span key={item} className="flex items-center gap-1.5 text-[12px] text-mkt-muted">
      <Check className="h-3.5 w-3.5 text-mkt-accent" strokeWidth={2} />
        {item}
      </span>
      ))}
    </div>
    )
}
