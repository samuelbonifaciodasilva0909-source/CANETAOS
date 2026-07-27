export interface Tip {
  title: string
  content: string
}

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  return Math.floor((date.getTime() - start.getTime()) / 86400000)
}

/** Deterministic "tip of the day": same tip all day, rotates daily, scoped
 * to tips tagged for the user's current treatment phase (falls back to any
 * tip if the phase is unknown or has no matching tips). */
export function pickTipOfDay(
  tips: Array<{ title: string; content: string | null; tags: string[] }>,
  phase: string | null
): Tip | null {
  if (tips.length === 0) return null

  const inPhase = phase ? tips.filter((t) => t.tags.includes(phase)) : []
  const pool = inPhase.length > 0 ? inPhase : tips

  const idx = dayOfYear(new Date()) % pool.length
  const tip = pool[idx]
  return { title: tip.title, content: tip.content || "" }
}
