import type { SchoolSummaryRow } from '../data/repository'

/**
 * Groups below this size are hidden in breakdowns, so a small class can't
 * reveal what one particular student chose.
 */
export const MIN_GROUP_SIZE = 5

export interface ParticipationReport {
  totals: Record<string, number>
  byLevel: { level: string; count: number | null }[]
  byCategory: { categoryId: string; count: number | null }[]
  hiddenGroups: number
}

const LEVEL_ORDER = ['jss1', 'jss2', 'jss3', 'ss1', 'ss2', 'ss3', 'other']

export function buildParticipationReport(rows: SchoolSummaryRow[]): ParticipationReport {
  const totals: Record<string, number> = {}
  const levels = new Map<string, number>()
  const categories = new Map<string, number>()

  for (const r of rows) {
    const n = Number(r.total)
    totals[r.event_type] = (totals[r.event_type] ?? 0) + n
    if (r.event_type !== 'quiz_completed') continue
    if (r.school_level) levels.set(r.school_level, (levels.get(r.school_level) ?? 0) + n)
    if (r.category_id) categories.set(r.category_id, (categories.get(r.category_id) ?? 0) + n)
  }

  let hiddenGroups = 0
  const suppress = (count: number) => {
    if (count >= MIN_GROUP_SIZE) return count
    hiddenGroups++
    return null
  }

  return {
    totals,
    byLevel: [...levels.entries()]
      .sort((a, b) => LEVEL_ORDER.indexOf(a[0]) - LEVEL_ORDER.indexOf(b[0]))
      .map(([level, count]) => ({ level, count: suppress(count) })),
    byCategory: [...categories.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([categoryId, count]) => ({ categoryId, count: suppress(count) })),
    hiddenGroups,
  }
}
