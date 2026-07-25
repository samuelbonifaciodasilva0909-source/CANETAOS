export function MedicalDisclaimer({ className = "" }: { className?: string }) {
  const professionalName = process.env.NEXT_PUBLIC_PROFESSIONAL_NAME
  const professionalRegistry = process.env.NEXT_PUBLIC_PROFESSIONAL_REGISTRY
  const professionalSpecialty = process.env.NEXT_PUBLIC_PROFESSIONAL_SPECIALTY

  return (
    <div className={`space-y-2 text-xs text-muted-foreground ${className}`}>
      <p>
        CanetaOS é uma ferramenta de acompanhamento e educação. Não substitui
        acompanhamento médico, não indica nem vende medicamento.
      </p>
      <p>
        Conteúdo educativo sujeito a revisão profissional.
      </p>
      {professionalName && professionalRegistry && professionalSpecialty ? (
        <p>
          Responsável técnico: {professionalName} - {professionalRegistry} ({professionalSpecialty})
        </p>
      ) : (
        <p>Conteúdo sob revisão profissional.</p>
      )}
    </div>
  )
}

export function CompactDisclaimer() {
  return (
    <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
      Ferramenta de acompanhamento e educação. Não substitui acompanhamento profissional.
    </p>
  )
}
