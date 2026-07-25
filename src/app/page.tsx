import Link from "next/link"
import { CanetaOSIcon } from "@/components/branding/logo"
import { ComplianceFooter } from "@/components/compliance/compliance-footer"

const tracks = [
  {
    title: "Medo de recuperar o peso",
    description: "Fase 2 de Desmame: como reduzir a dose com orientação e manter o resultado nos meses seguintes.",
  },
  {
    title: "Não sei o que comer",
    description: "Cardápios de alta densidade proteica, filtráveis por sintoma, com lista de compras pronta.",
  },
  {
    title: "Perdendo músculo",
    description: "Calculadora de proteína e indicador de treino de resistência, semana a semana.",
  },
]

export default function MarketingHome() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/40">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <CanetaOSIcon className="h-7 w-7" />
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-[13px] font-medium text-navy-500 transition-smooth hover:text-navy-700"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-navy-900 px-5 py-2.5 text-[13px] font-medium text-white transition-smooth hover:bg-navy-800"
            >
              Começar
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-6 pt-24 pb-16 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-navy-400 mb-6">
            Acompanhamento &amp; Educação · Canetas GLP-1
          </p>
          <h1 className="text-[40px] sm:text-[48px] font-semibold tracking-[-0.04em] text-navy-900 leading-[1.1]">
            Clareza durante{" "}
            <span className="text-navy-400">a jornada</span>
          </h1>
          <p className="mt-6 text-[16px] leading-relaxed text-navy-500 max-w-lg mx-auto">
            Organize sua alimentação, acompanhe seus sintomas e tenha mais
            clareza durante seu tratamento com Ozempic, Wegovy, Mounjaro ou
            Ozivy. Uma ferramenta de acompanhamento e educação.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-navy-900 px-7 py-3.5 text-[14px] font-medium text-white transition-smooth hover:bg-navy-800"
            >
              Começar por R$ 37
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-border/60 px-7 py-3.5 text-[14px] font-medium text-navy-700 transition-smooth hover:bg-warm-50"
            >
              Já tenho conta
            </Link>
          </div>
        </div>

        <div className="border-t border-border/40 bg-paper-100/40">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-navy-400 mb-8 text-center">
              Qual é a sua dor principal agora?
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {tracks.map((track) => (
                <div key={track.title} className="rounded-xl border border-border/60 bg-card p-6">
                  <h3 className="text-[14px] font-semibold text-navy-900 mb-2">{track.title}</h3>
                  <p className="text-[13px] leading-relaxed text-navy-500">{track.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <ComplianceFooter />
    </div>
  )
}
