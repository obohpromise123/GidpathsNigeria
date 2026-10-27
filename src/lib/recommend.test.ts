import { describe, expect, it } from 'vitest'
import { buildSeedCatalog } from '../data/seed'
import { emptyProfile } from './onboarding'
import { recommend, scoreDimensions, type QuizAnswers } from './recommend'
import { buildRoadmap, roadmapToText } from './roadmap'

const catalog = buildSeedCatalog()

/** Answers "I really enjoy this" for the given likert questions, "Not really" for the rest. */
function likertAnswers(loved: string[]): QuizAnswers {
  const answers: QuizAnswers = {}
  for (const q of catalog.quizQuestions.filter((q) => q.kind === 'likert')) {
    answers[q.id] = loved.includes(q.id) ? `${q.id}-love` : `${q.id}-no`
  }
  return answers
}

describe('scoreDimensions', () => {
  it('scores zero everywhere with no answers and an empty profile', () => {
    const dims = scoreDimensions(catalog, {}, emptyProfile())
    expect(dims.every((d) => d.combined === 0)).toBe(true)
  })

  it('normalises quiz scores to the 0–1 range', () => {
    const allLove: QuizAnswers = {}
    for (const q of catalog.quizQuestions) {
      const opts = catalog.quizOptions.filter((o) => o.question_id === q.id)
      allLove[q.id] = opts[0].id
    }
    for (const d of scoreDimensions(catalog, allLove, emptyProfile())) {
      expect(d.quiz).toBeGreaterThanOrEqual(0)
      expect(d.quiz).toBeLessThanOrEqual(1)
    }
  })

  it('records evidence that explains each point', () => {
    const dims = scoreDimensions(catalog, likertAnswers(['q-tech']), emptyProfile())
    const tech = dims.find((d) => d.id === 'tech')!
    expect(tech.evidence[0].text).toContain('How much do you enjoy working with computers')
  })
})

describe('recommend', () => {
  it('suggests technology for a student who loves tech and logic', () => {
    const rec = recommend(catalog, likertAnswers(['q-tech', 'q-logic']), emptyProfile())
    expect(rec.top[0].category.id).toBe('technology')
    expect(rec.top[0].reasons.length).toBeGreaterThan(0)
  })

  it('suggests health for a student who loves living things and helping people', () => {
    const rec = recommend(catalog, likertAnswers(['q-life', 'q-people']), emptyProfile())
    expect(rec.top[0].category.id).toBe('health')
  })

  it('always offers several possibilities, never a single answer', () => {
    const rec = recommend(catalog, likertAnswers(['q-creative']), emptyProfile())
    expect(rec.top.length).toBeGreaterThanOrEqual(3)
  })

  it('always includes areas the student chose to explore, with a reason', () => {
    const profile = { ...emptyProfile(), careerAreas: ['agriculture'] }
    const rec = recommend(catalog, likertAnswers(['q-tech', 'q-logic']), profile)
    const chosen = rec.top.find((t) => t.category.id === 'agriculture')
    expect(chosen?.chosenByStudent).toBe(true)
    expect(chosen?.reasons[0]).toMatch(/would like to explore/)
  })

  it('reports not enough data when every answer is unsure', () => {
    const answers: QuizAnswers = {}
    for (const q of catalog.quizQuestions) answers[q.id] = catalog.quizOptions.find((o) => o.question_id === q.id && o.is_unsure)!.id
    const rec = recommend(catalog, answers, emptyProfile())
    expect(rec.enoughData).toBe(false)
    expect(rec.top).toHaveLength(0)
    expect(rec.unsureCount).toBe(catalog.quizQuestions.length)
  })

  it('uses onboarding answers when the quiz was skipped', () => {
    const profile = { ...emptyProfile(), favouriteSubjects: ['agric'], activities: ['gardening', 'animals'], interests: ['nature' as const] }
    const rec = recommend(catalog, {}, profile)
    expect(rec.enoughData).toBe(true)
    expect(rec.top[0].category.id).toBe('agriculture')
  })

  it('is deterministic', () => {
    const a = recommend(catalog, likertAnswers(['q-build']), emptyProfile())
    const b = recommend(catalog, likertAnswers(['q-build']), emptyProfile())
    expect(a.top.map((t) => t.category.id)).toEqual(b.top.map((t) => t.category.id))
  })

  it('never suggests unpublished careers', () => {
    const hidden = structuredClone(catalog)
    hidden.careers = hidden.careers.map((c) => (c.id === 'software-developer' ? { ...c, published: false } : c))
    const rec = recommend(hidden, likertAnswers(['q-tech']), emptyProfile())
    expect(rec.categories.flatMap((c) => c.careers).some((c) => c.id === 'software-developer')).toBe(false)
  })
})

describe('buildRoadmap', () => {
  const profile = { ...emptyProfile(), schoolLevel: 'ss3' as const, pathway: 'arts' }
  const rec = recommend(catalog, likertAnswers(['q-tech', 'q-logic']), profile)
  const roadmap = buildRoadmap(catalog, rec, profile)

  it('lists careers and courses linked to the suggestions', () => {
    expect(roadmap.careers.length).toBeGreaterThan(0)
    expect(roadmap.courses.map((c) => c.course.id)).toContain('computer-science')
  })

  it('warns when a course is not usually linked to the student’s pathway', () => {
    const cs = roadmap.courses.find((c) => c.course.id === 'computer-science')!
    expect(cs.pathwayNote).toMatch(/Science pathway/)
  })

  it('gives SS3-specific next steps', () => {
    expect(roadmap.nextSteps.join(' ')).toMatch(/UTME/)
  })

  it('lists admission records to verify for each course', () => {
    expect(roadmap.admissions.length).toBe(roadmap.courses.length)
  })

  it('produces a downloadable text version with the disclaimer', () => {
    const text = roadmapToText(roadmap, 'PathNigeria')
    expect(text).toMatch(/not a test result or a guarantee/)
    expect(text).toMatch(/ibass\.jamb\.gov\.ng/)
  })
})
