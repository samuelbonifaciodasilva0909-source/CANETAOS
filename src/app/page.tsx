import Link from "next/link"
import { CanetaOSIcon } from "@/components/branding/logo"
import { ComplianceFooter } from "@/components/compliance/compliance-footer"
import { FaqItem } from "@/components/marketing/faq-item"
import { InkTrace } from "@/components/marketing/ink-trace"
import { MarqueeTicker } from "@/components/marketing/marquee-ticker"
import { PhoneFrame } from "@/components/marketing/phone-frame"
import { StickyCtaBar } from "@/components/marketing/sticky-cta-bar"
import {
  Activity, UtensilsCrossed, Beef, Droplets, ShieldCheck, Heart,
  ClipboardList, ArrowRight, Check,
} from "lucide-react"

const tracks = [
  {
    title: "Medo de recuperar o peso",
    description: "Fase 2 de Desmame: como reduzir a dose com orientação e manter o resultado nos meses seguintes.",
    screenshot: "/marketing/screen-checklist.png",
    screenshotAlt: "Tela de rotina diária do CanetaOS com checklist de hidratação, proteína e aplicação",
  },
  {
    title: "Não sei o que comer",
    description: "Cardápios de alta densidade proteica, filtráveis por sintoma, com lista de compras pronta.",
    screenshot: "/marketing/screen-recipes.png",
    screenshotAlt: "Tela de receitas do CanetaOS com cards de receitas proteicas",
  },
  {
    title: "Perdendo músculo",
    description: "Calculadora de proteína e indicador de treino de resistência, semana a semana.",
    screenshot: "/marketing/screen-lista-compras.png",
    screenshotAlt: "Tela de lista de compras do CanetaOS organizada por categoria, com itens ricos em proteína",
  },
]

const features = [
  { icon: Activity, title: "Tracker diário", description: "Peso, medidas, humor, sono, sintomas e dose aplicada — tudo num só lugar." },
  { icon: UtensilsCrossed, title: "Cardápios e receitas", description: "200+ receitas de alta densidade proteica, filtráveis por sintoma ativo." },
  { icon: Droplets, title: "Protocolo anti-náusea", description: "Conteúdo fixo pras primeiras semanas, quando o desconforto é mais comum." },
  { icon: Beef, title: "Calculadora de proteína", description: "Faixa de 1,2 a 1,6 g/kg com sugestão de divisão por refeição." },
  { icon: ClipboardList, title: "Lista de compras", description: "Direto da receita pra lista, já separada por categoria." },
  { icon: ShieldCheck, title: "Fase 2: Desmame", description: "Como lidar com o apetite voltando e manter o resultado depois de reduzir a dose." },
]

const plans = [
  {
    name: "Acesso ao App",
    price: "R$ 37",
    period: "pagamento único",
    description: "Tracker completo, cardápios e protocolo anti-náusea.",
    href: "/register",
    cta: "Começar agora",
  },
  {
    name: "CanetaOS Plus",
    price: "R$ 90",
    period: "/mês",
    description: "Receitas e cardápios novos todo mês, histórico completo, comunidade.",
    href: "/register",
    cta: "Assinar Plus",
    highlight: true,
  },
]

const faqs = [
  {
    question: "O CanetaOS substitui acompanhamento médico?",
    answer: "Não. O CanetaOS é uma ferramenta de acompanhamento e educação — ele te ajuda a organizar registros e informações pra suas consultas, mas todas as decisões sobre dose, medicamento ou tratamento continuam sendo do seu médico.",
  },
  {
    question: "Funciona com qual caneta?",
    answer: "O app foi desenhado pra quem usa Ozempic, Wegovy, Mounjaro ou Ozivy, mas a maior parte do conteúdo (proteína, hidratação, sintomas, treino) serve pra qualquer fase do tratamento com canetas GLP-1.",
  },
  {
    question: "Preciso assinar pra usar?",
    answer: "Não. O acesso ao app (tracker, cardápios e protocolo anti-náusea) é um pagamento único de R$37. A assinatura Plus é opcional, pra quem quer conteúdo novo todo mês e histórico completo.",
  },
  {
    question: "Como funciona a Fase 2 (Desmame)?",
    answer: "É liberada com a compra avulsa de R$197 ou, gratuitamente, depois de 8 semanas de uso ativo do tracker — pra reconhecer quem já construiu o hábito de se acompanhar.",
  },
  {
    question: "Posso cancelar a assinatura quando quiser?",
    answer: "Sim, o cancelamento é feito direto na tela de Configurações, sem precisar entrar em contato com ninguém.",
  },
]

const tickerItems = [
  "PAGAMENTO ÚNICO",
  "ACESSO IMEDIATO",
  "PIX OU CARTÃO",
  "SEM ASSINATURA OBRIGATÓRIA",
  "CANCELE QUANDO QUISER",
]

export default function MarketingHome() {
  return (
    <div className="flex min-h-screen flex-col bg-mkt-bg pb-20 sm:pb-0">
      <MarqueeTicker items={tickerItems} />

      <header className="sticky top-0 z-40 border-b border-mkt-line bg-mkt-bg/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <CanetaOSIcon className="h-7 w-7" white />
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-[13px] font-medium text-mkt-muted transition-smooth hover:text-mkt-text"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-mkt-accent px-5 py-2.5 text-[13px] font-bold text-mkt-bg transition-smooth hover:bg-mkt-accent-dim"
            >
              Começar
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <div className="relative mx-auto max-w-3xl px-6 pt-16 pb-16 text-center sm:pt-24 overflow-hidden">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-mkt-accent mb-8">
            Pra quem já está na caneta ou vai começar
          </p>

          <div className="relative">
            <InkTrace
              color="var(--color-mkt-accent)"
              className="pointer-events-none absolute left-1/2 top-[0.1em] h-[1.3em] w-[130%] -translate-x-1/2 opacity-70 sm:h-[1.05em]"
            />
            <h1 className="relative text-[38px] sm:text-[60px] font-extrabold tracking-[-0.04em] text-mkt-text leading-[1.02]">
              Comida, treino e sintomas
              <br />
              organizados enquanto você{" "}
              <span className="text-mkt-accent">está na caneta</span>.
            </h1>
          </div>

          <p className="mt-7 text-[16px] sm:text-[18px] leading-relaxed text-mkt-muted max-w-lg mx-auto">
            Registre peso, sintomas e dose toda semana. Sem promessa de prazo,
            sem comparar seu antes e depois com o de ninguém — só a sua
            própria trajetória, com clareza pra conversar melhor com seu médico.
          </p>
          <div className="mt-10 hidden items-center justify-center gap-3 sm:flex">
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-full bg-mkt-accent px-8 py-4 text-[15px] font-bold text-mkt-bg transition-smooth hover:bg-mkt-accent-dim"
            >
              Começar por R$ 37
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-mkt-line px-8 py-4 text-[15px] font-medium text-mkt-text transition-smooth hover:bg-mkt-bg-soft"
            >
              Já tenho conta
            </Link>
          </div>

          <div className="mt-14 flex justify-center">
            <PhoneFrame
              src="/marketing/screen-hoje.png"
              alt="Tela inicial do CanetaOS mostrando peso, hidratação e rotina do dia"
              width={280}
              priority
            />
          </div>
        </div>

        {/* Trilhas / dor principal */}
        <div className="border-t border-mkt-line bg-mkt-bg-soft">
          <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-mkt-accent mb-8 text-center">
              Qual é a sua dor principal agora?
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {tracks.map((track) => (
                <div key={track.title} className="rounded-2xl border border-mkt-line bg-mkt-bg p-6">
                  <div className="mb-5 flex justify-center">
                    <PhoneFrame src={track.screenshot} alt={track.screenshotAlt} width={150} />
                  </div>
                  <h3 className="text-[15px] font-bold text-mkt-text mb-2">{track.title}</h3>
                  <p className="text-[13px] leading-relaxed text-mkt-muted">{track.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
          <div className="grid items-center gap-10 mb-12 lg:grid-cols-[1.1fr_auto]">
            <div className="text-center lg:text-left max-w-lg mx-auto lg:mx-0">
              <h2 className="text-[28px] sm:text-[36px] font-extrabold tracking-[-0.03em] text-mkt-text">
                Tudo que você precisa registrar, num só lugar
              </h2>
              <p className="mt-3 text-[14px] text-mkt-muted leading-relaxed">
                Sem gamificação, sem promessa de resultado — só clareza sobre o que está acontecendo com você.
              </p>
            </div>
            <div className="hidden justify-center lg:flex">
              <PhoneFrame
                src="/marketing/screen-lista-compras.png"
                alt="Tela de lista de compras do CanetaOS gerada a partir de uma receita"
                width={190}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-mkt-line bg-mkt-bg-soft p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mkt-accent/10 mb-4">
                  <f.icon className="h-5 w-5 text-mkt-accent" strokeWidth={1.5} />
                </div>
                <h3 className="text-[15px] font-bold text-mkt-text mb-1.5">{f.title}</h3>
                <p className="text-[13px] leading-relaxed text-mkt-muted">{f.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="border-t border-mkt-line bg-mkt-bg-soft">
          <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
            <div className="text-center mb-12">
              <h2 className="text-[28px] sm:text-[36px] font-extrabold tracking-[-0.03em] text-mkt-text">
                Comece pequeno, evolua se quiser
              </h2>
              <p className="mt-3 text-[14px] text-mkt-muted">
                Sem letras miúdas: pagamento único pra acessar, assinatura opcional pra mais conteúdo.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
              <div className="hidden self-end justify-center pb-2 lg:order-last lg:flex">
                <PhoneFrame
                  src="/marketing/screen-hoje.png"
                  alt="Tela inicial do CanetaOS"
                  width={120}
                  className="opacity-90"
                />
              </div>
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-2xl border p-8 ${plan.highlight ? "border-mkt-accent bg-mkt-accent text-mkt-bg" : "border-mkt-line bg-mkt-bg"}`}
                >
                  <h3 className={`font-mono text-[13px] font-bold uppercase tracking-[0.1em] ${plan.highlight ? "text-mkt-bg/60" : "text-mkt-accent"}`}>
                    {plan.name}
                  </h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-[36px] font-extrabold font-numeric tracking-tight">{plan.price}</span>
                    <span className={`text-[13px] ${plan.highlight ? "text-mkt-bg/60" : "text-mkt-muted"}`}>{plan.period}</span>
                  </div>
                  <p className={`mt-3 text-[13px] leading-relaxed ${plan.highlight ? "text-mkt-bg/80" : "text-mkt-muted"}`}>
                    {plan.description}
                  </p>
                  <Link
                    href={plan.href}
                    className={`mt-6 flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[14px] font-bold transition-smooth ${
                      plan.highlight
                        ? "bg-mkt-bg text-mkt-accent hover:bg-mkt-bg/80"
                        : "bg-mkt-accent text-mkt-bg hover:bg-mkt-accent-dim"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                  </Link>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] text-mkt-muted">
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-mkt-accent" strokeWidth={2} /> Cancele quando quiser</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-mkt-accent" strokeWidth={2} /> Pix ou cartão</span>
              <span className="flex items-center gap-1.5"><Heart className="h-3.5 w-3.5 text-mkt-accent" strokeWidth={1.5} /> Maiores de 18 anos</span>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
          <h2 className="text-[26px] font-extrabold tracking-[-0.03em] text-mkt-text text-center mb-10">
            Perguntas frequentes
          </h2>
          <div>
            {faqs.map((faq) => (
              <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="border-t border-mkt-line bg-mkt-bg-soft">
          <div className="mx-auto max-w-2xl px-6 py-16 sm:py-20 text-center">
            <h2 className="text-[26px] sm:text-[32px] font-extrabold tracking-[-0.03em] text-mkt-text">
              Comece a organizar sua jornada hoje
            </h2>
            <p className="mt-3 text-[14px] text-mkt-muted max-w-md mx-auto">
              Acesso completo ao tracker, cardápios e protocolo anti-náusea por R$37.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-mkt-accent px-8 py-4 text-[15px] font-bold text-mkt-bg transition-smooth hover:bg-mkt-accent-dim"
            >
              Criar minha conta
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </main>

      <ComplianceFooter />
      <StickyCtaBar />
    </div>
  )
}
