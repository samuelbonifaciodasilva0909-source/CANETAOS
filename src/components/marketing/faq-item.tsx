import { ChevronDown } from "lucide-react"

export function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group border-b border-mkt-line py-5 last:border-0">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-mkt-text [&::-webkit-details-marker]:hidden">
        {question}
        <ChevronDown className="h-4 w-4 shrink-0 text-mkt-accent transition-transform duration-200 group-open:rotate-180" strokeWidth={2} />
      </summary>
      <p className="mt-3 text-[13px] leading-relaxed text-mkt-muted">{answer}</p>
    </details>
  )
}
