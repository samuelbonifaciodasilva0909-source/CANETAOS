export function ComplianceFooter({ className = "" }: { className?: string }) {
  const professionalName = process.env.NEXT_PUBLIC_PROFESSIONAL_NAME
  const professionalRegistry = process.env.NEXT_PUBLIC_PROFESSIONAL_REGISTRY
  const professionalSpecialty = process.env.NEXT_PUBLIC_PROFESSIONAL_SPECIALTY

  return (
    <footer className={`border-t border-border/60 bg-paper-50 dark:bg-ink-950 px-4 py-4 sm:px-8 ${className}`}>
      <div className="mx-auto max-w-[1200px] space-y-1">
        <p className="text-[12px] leading-relaxed text-ink-600 dark:text-ink-300">
          CanetaOS é uma ferramenta de acompanhamento e educação. Não substitui
          acompanhamento médico, não indica nem vende medicamento.
        </p>
        <p className="text-[12px] leading-relaxed text-ink-500 dark:text-ink-400">
          {professionalName && professionalRegistry && professionalSpecialty
            ? `Responsável técnico: ${professionalName} — ${professionalRegistry} (${professionalSpecialty})`
            : "Conteúdo sob revisão profissional."}
        </p>
      </div>
    </footer>
  )
}

/**
 * Compact but still legible (never below 11px) compliance strip for
 * authenticated app screens, docked above the mobile BottomNav so it's
 * always on-screen without needing a scroll to discover it.
 */
export function ComplianceBar() {
  return (
    <div className="border-t border-border/60 bg-paper-50/95 dark:bg-ink-950/95 backdrop-blur-xl px-4 py-2 lg:hidden">
      <p className="text-[11px] leading-snug text-ink-500 dark:text-ink-400 text-center">
        Ferramenta de acompanhamento e educação. Não substitui acompanhamento médico.
      </p>
    </div>
  )
}
