import Image from "next/image"

interface AuthorityBadgeProps {
  photoSrc?: string
  className?: string
}

export function AuthorityBadge({ photoSrc, className = "" }: AuthorityBadgeProps) {
  const name = process.env.NEXT_PUBLIC_PROFESSIONAL_NAME
  const registry = process.env.NEXT_PUBLIC_PROFESSIONAL_REGISTRY
  const specialty = process.env.NEXT_PUBLIC_PROFESSIONAL_SPECIALTY

if (!name || !registry) return null

return (
  <div className={`flex items-center justify-center gap-2.5 ${className}`}>
    {photoSrc && (
    <Image src={photoSrc} alt={name} width={32} height={32} className="rounded-full border border-mkt-line" />
    )}
    <p className="text-[12px] leading-snug text-mkt-muted">
    Conteúdo revisado por <span className="font-semibold text-mkt-text">{name}</span>
      {specialty ? `, ${specialty}` : ""} — {registry}
    </p>
  </div>
  )
}
