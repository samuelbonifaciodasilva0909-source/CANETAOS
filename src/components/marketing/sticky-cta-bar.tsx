import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function StickyCtaBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-mkt-line bg-mkt-bg/95 backdrop-blur-md px-4 py-3 sm:hidden">
      <Link
        href="/register"
        className="flex items-center justify-center gap-2 rounded-full bg-mkt-accent px-6 py-3.5 text-[14px] font-bold text-mkt-bg"
      >
        Começar por R$ 37
        <ArrowRight className="h-4 w-4" strokeWidth={2} />
      </Link>
    </div>
  )
}
