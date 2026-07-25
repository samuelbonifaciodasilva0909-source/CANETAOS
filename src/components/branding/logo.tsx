export function CanetaOSLogo({ className = "h-7", white = false }: { className?: string; white?: boolean }) {
  const color = white ? "#ffffff" : "#102a43"
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7">
        <rect width="28" height="28" rx="8" fill={color} opacity="0.06" />
        <path
          d="M8 20C10 14 13 10 16 12C19 14 14 22 21 10"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="21" cy="10" r="2.5" fill={color} opacity="0.3" />
        <circle cx="21" cy="10" r="1.2" fill={color} />
      </svg>
      <span className="text-[17px] font-semibold tracking-[-0.02em]" style={{ color }}>
        Caneta<span className="font-bold">OS</span>
      </span>
    </div>
  )
}

export function CanetaOSIcon({ className = "h-6 w-6", white = false }: { className?: string; white?: boolean }) {
  const color = white ? "#ffffff" : "#102a43"
  return (
    <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="28" height="28" rx="8" fill={color} opacity="0.06" />
      <path
        d="M8 20C10 14 13 10 16 12C19 14 14 22 21 10"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="21" cy="10" r="2.5" fill={color} opacity="0.3" />
      <circle cx="21" cy="10" r="1.2" fill={color} />
    </svg>
  )
}
