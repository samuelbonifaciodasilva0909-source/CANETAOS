/**
 * Usage-based unlock for the Desmame (Fase 2) content: it can be bought
 * directly (R$197 upsell) OR earned by 8 distinct weeks of active tracker
 * usage, so users who can't pay upfront still reach the content that
 * addresses their biggest fear (losing the result after stopping).
 */
export const DESMAME_UNLOCK_WEEKS = 8

function isoWeekKey(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00Z")
  const target = new Date(date.getTime())
  const dayNr = (date.getUTCDay() + 6) % 7
  target.setUTCDate(target.getUTCDate() - dayNr + 3)
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4))
  const week =
    1 +
    Math.round(
      ((target.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7
    )
  return `${target.getUTCFullYear()}-W${week}`
}

export function getDesmameUnlockStatus(entryDates: string[]): {
  unlockedByUsage: boolean
  activeWeeks: number
  weeksRemaining: number
} {
  const distinctWeeks = new Set(entryDates.map(isoWeekKey))
  const activeWeeks = distinctWeeks.size
  return {
    unlockedByUsage: activeWeeks >= DESMAME_UNLOCK_WEEKS,
    activeWeeks,
    weeksRemaining: Math.max(0, DESMAME_UNLOCK_WEEKS - activeWeeks),
  }
}
