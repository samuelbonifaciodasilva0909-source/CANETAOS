export function MarqueeTicker({ items }: { items: string[] }) {
  const sequence = [...items, ...items]

  return (
    <div className="overflow-hidden bg-mkt-accent py-2.5">
      <div className="marquee-track">
        {sequence.map((item, i) => (
          <span
            key={i}
            className="shrink-0 px-6 font-mono text-[12px] font-bold uppercase tracking-[0.14em] text-mkt-bg"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
