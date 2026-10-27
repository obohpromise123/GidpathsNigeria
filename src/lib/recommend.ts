import type { Career, CareerCategory, Catalog, DimensionId, QuizOption } from '../data/types'
import { DIMENSION_IDS, DIMENSIONS } from './dimensions'
import { ACTIVITIES_BY_ID, STRENGTHS_BY_ID, SUBJECTS_BY_ID, type StudentProfile } from './onboarding'

// Transparent, rule-based matching:
//  1. Each quiz answer adds points to one or more interest areas.
//  2. Each area's quiz score = points earned ÷ points possible (0–1).
//  3. Onboarding choices (subjects, activities, strengths, interests) add a
//     smaller "profile" score per area.
//  4. A career category's score is a weighted average of the areas it is
//     linked to. Categories the student chose to explore get a small boost
//     and are always shown.
// Every point is recorded as "evidence" so we can explain each suggestion.

/** questionId → optionId */
export type QuizAnswers = Record<string, string>

export const QUIZ_WEIGHT = 0.7
export const PROFILE_WEIGHT = 0.3
/** Profile points needed for a full profile score in one area. */
const PROFILE_POINTS_FOR_MAX = 4
const CHOSEN_BOOST = 10
const CATEGORY_DIM_WEIGHTS = [1, 0.8, 0.6]

export interface Evidence {
  source: 'quiz' | 'profile'
  text: string
  points: number
}

export interface DimensionScore {
  id: DimensionId
  label: string
  quiz: number
  profile: number
  combined: number
  evidence: Evidence[]
}

export type MatchStrength = 'strong' | 'good' | 'possible'

export interface CategoryMatch {
  category: CareerCategory
  /** 0–100 */
  score: number
  strength: MatchStrength
  reasons: string[]
  chosenByStudent: boolean
  careers: Career[]
}

export interface Recommendation {
  dimensions: DimensionScore[]
  categories: CategoryMatch[]
  /** The suggestions to highlight (always several, never just one). */
  top: CategoryMatch[]
  answeredCount: number
  unsureCount: number
  /** False when there are no positive signals at all. */
  enoughData: boolean
}

const MIN_SUGGESTIONS = 3

export function strengthFor(score: number): MatchStrength {
  if (score >= 60) return 'strong'
  if (score >= 35) return 'good'
  return 'possible'
}

export function scoreDimensions(catalog: Catalog, answers: QuizAnswers, profile: StudentProfile): DimensionScore[] {
  const questions = catalog.quizQuestions.filter((q) => q.active)
  const optionsByQuestion = new Map<string, QuizOption[]>()
  for (const o of catalog.quizOptions) {
    const list = optionsByQuestion.get(o.question_id) ?? []
    list.push(o)
    optionsByQuestion.set(o.question_id, list)
  }

  const scores = new Map<DimensionId, { quizRaw: number; quizMax: number; profileRaw: number; evidence: Evidence[] }>(
    DIMENSION_IDS.map((d) => [d, { quizRaw: 0, quizMax: 0, profileRaw: 0, evidence: [] }]),
  )

  for (const q of questions) {
    const options = optionsByQuestion.get(q.id) ?? []
    for (const d of DIMENSION_IDS) {
      scores.get(d)!.quizMax += Math.max(0, ...options.map((o) => o.weights[d] ?? 0))
    }
    const chosen = options.find((o) => o.id === answers[q.id])
    if (!chosen) continue
    for (const [d, points] of Object.entries(chosen.weights) as [DimensionId, number][]) {
      if (!points || !scores.has(d)) continue
      const s = scores.get(d)!
      s.quizRaw += points
      s.evidence.push({
        source: 'quiz',
        points,
        text: q.kind === 'likert' ? `You answered “${chosen.label}” to “${q.prompt}”` : `You chose “${chosen.label}”`,
      })
    }
  }

  const addProfile = (dims: DimensionId[], points: number, text: string) => {
    for (const d of dims) {
      const s = scores.get(d)
      if (!s) continue
      s.profileRaw += points
      s.evidence.push({ source: 'profile', points, text })
    }
  }
  for (const d of profile.interests) addProfile([d], 2, `You said you are interested in ${DIMENSIONS[d]?.label.toLowerCase() ?? d}`)
  for (const id of profile.favouriteSubjects) {
    const o = SUBJECTS_BY_ID.get(id)
    if (o) addProfile(o.dims, 1, `${o.label} is one of your favourite subjects`)
  }
  for (const id of profile.activities) {
    const o = ACTIVITIES_BY_ID.get(id)
    if (o) addProfile(o.dims, 1, `You enjoy ${o.label.charAt(0).toLowerCase()}${o.label.slice(1)}`)
  }
  for (const id of profile.strengths) {
    const o = STRENGTHS_BY_ID.get(id)
    if (o) addProfile(o.dims, 1, `You described yourself as ${o.label.charAt(0).toLowerCase()}${o.label.slice(1)}`)
  }

  const hasQuizSignal = [...scores.values()].some((s) => s.quizRaw > 0)

  return DIMENSION_IDS.map((d) => {
    const s = scores.get(d)!
    const quiz = s.quizMax > 0 ? s.quizRaw / s.quizMax : 0
    const prof = Math.min(1, s.profileRaw / PROFILE_POINTS_FOR_MAX)
    const combined = hasQuizSignal ? QUIZ_WEIGHT * quiz + PROFILE_WEIGHT * prof : prof
    return {
      id: d,
      label: DIMENSIONS[d].label,
      quiz,
      profile: prof,
      combined,
      evidence: s.evidence.sort((a, b) => b.points - a.points),
    }
  })
}

function rankCareers(careers: Career[], dims: Map<DimensionId, DimensionScore>): Career[] {
  const fit = (c: Career) =>
    c.interests.length ? c.interests.reduce((sum, d) => sum + (dims.get(d)?.combined ?? 0), 0) / c.interests.length : 0
  return [...careers].sort((a, b) => fit(b) - fit(a) || a.title.localeCompare(b.title))
}

export function recommend(catalog: Catalog, answers: QuizAnswers, profile: StudentProfile): Recommendation {
  const dimensions = scoreDimensions(catalog, answers, profile)
  const dims = new Map(dimensions.map((d) => [d.id, d]))
  const chosen = new Set(profile.careerAreas)
  const publishedCareers = catalog.careers.filter((c) => c.published)

  const categories: CategoryMatch[] = catalog.categories
    .map((category) => {
      const linked = category.interests.filter((d) => dims.has(d))
      const weights = linked.map((_, i) => CATEGORY_DIM_WEIGHTS[i] ?? 0.5)
      const totalWeight = weights.reduce((a, b) => a + b, 0)
      const base = totalWeight ? linked.reduce((sum, d, i) => sum + dims.get(d)!.combined * weights[i], 0) / totalWeight : 0
      const isChosen = chosen.has(category.id)
      const score = Math.round(Math.min(100, base * 100 + (isChosen ? CHOSEN_BOOST : 0)))

      const reasons = linked
        .flatMap((d) => dims.get(d)!.evidence.map((e) => ({ ...e, area: DIMENSIONS[d].label })))
        .sort((a, b) => b.points - a.points)
        .filter((e, i, all) => all.findIndex((x) => x.text === e.text) === i)
        .slice(0, 3)
        .map((e) => `${e.text} — linked to ${e.area.toLowerCase()}.`)
      if (isChosen) reasons.unshift('You said you would like to explore this area.')

      return {
        category,
        score,
        strength: strengthFor(score),
        reasons,
        chosenByStudent: isChosen,
        careers: rankCareers(
          publishedCareers.filter((c) => c.category_id === category.id),
          dims,
        ),
      }
    })
    .sort((a, b) => b.score - a.score || a.category.sort_order - b.category.sort_order)

  const answeredCount = Object.keys(answers).filter((qid) => catalog.quizQuestions.some((q) => q.id === qid)).length
  const unsureCount = Object.entries(answers).filter(
    ([, oid]) => catalog.quizOptions.find((o) => o.id === oid)?.is_unsure,
  ).length
  const enoughData = dimensions.some((d) => d.combined > 0) || chosen.size > 0

  let top: CategoryMatch[] = []
  if (enoughData) {
    top = categories.filter((c) => c.score > 0).slice(0, MIN_SUGGESTIONS)
    for (const c of categories) if (c.chosenByStudent && !top.includes(c)) top.push(c)
    // Always offer several possibilities, even if signals are weak.
    for (const c of categories) if (top.length < MIN_SUGGESTIONS && !top.includes(c)) top.push(c)
  }

  return { dimensions, categories, top, answeredCount, unsureCount, enoughData }
}
