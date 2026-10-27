import { describe, expect, it } from 'vitest'
import { DIMENSION_IDS } from '../../lib/dimensions'
import { buildSeedCatalog } from './index'

// Guards the quality of the bundled content library.
const c = buildSeedCatalog()
const ids = <T extends { id: string }>(rows: T[]) => new Set(rows.map((r) => r.id))

describe('seed catalog integrity', () => {
  it('has 20–40 courses and careers, each with a unique id', () => {
    expect(c.courses.length).toBeGreaterThanOrEqual(20)
    expect(c.courses.length).toBeLessThanOrEqual(40)
    expect(ids(c.courses).size).toBe(c.courses.length)
    expect(ids(c.careers).size).toBe(c.careers.length)
  })

  it('every link points at records that exist', () => {
    const courses = ids(c.courses)
    const careers = ids(c.careers)
    const pathways = ids(c.pathways)
    const categories = ids(c.categories)
    for (const l of c.courseCareers) expect(careers.has(l.career_id), `${l.course_id} → ${l.career_id}`).toBe(true)
    for (const l of c.coursePathways) expect(pathways.has(l.pathway_id), `${l.course_id} → ${l.pathway_id}`).toBe(true)
    for (const x of [...c.courses, ...c.careers]) expect(categories.has(x.category_id), x.id).toBe(true)
    for (const a of c.admissions) {
      expect(courses.has(a.course_id)).toBe(true)
      if (a.institution_id) expect(ids(c.institutions).has(a.institution_id)).toBe(true)
    }
  })

  it('every course links to at least one pathway and one career', () => {
    for (const course of c.courses) {
      expect(c.coursePathways.some((l) => l.course_id === course.id), course.id).toBe(true)
      expect(c.courseCareers.some((l) => l.course_id === course.id), course.id).toBe(true)
    }
  })

  it('every career is reachable from at least one course', () => {
    for (const career of c.careers) expect(c.courseCareers.some((l) => l.career_id === career.id), career.id).toBe(true)
  })

  it('every career area has careers', () => {
    for (const cat of c.categories) expect(c.careers.some((k) => k.category_id === cat.id), cat.id).toBe(true)
  })

  it('every course has admission guidance', () => {
    for (const course of c.courses) expect(c.admissions.some((a) => a.course_id === course.id), course.id).toBe(true)
  })

  it('never claims bundled information is verified', () => {
    for (const rows of [c.admissions, c.institutions, c.programmes]) {
      expect(rows.filter((r) => r.verification_status === 'verified')).toEqual([])
    }
  })

  it('marks the fictional institution and its records as sample data', () => {
    const sampleInstitutions = c.institutions.filter((i) => i.verification_status === 'sample').map((i) => i.id)
    expect(sampleInstitutions).toEqual(['sample-university'])
    for (const a of c.admissions.filter((a) => a.institution_id)) expect(a.verification_status).toBe('sample')
    for (const p of c.programmes) expect(p.verification_status).toBe('sample')
  })

  it('uses only known interest areas', () => {
    const known = new Set<string>(DIMENSION_IDS)
    for (const x of [...c.courses, ...c.careers, ...c.categories, ...c.pathways]) {
      for (const d of x.interests) expect(known.has(d), `${x.id}: ${d}`).toBe(true)
    }
    for (const o of c.quizOptions) for (const d of Object.keys(o.weights)) expect(known.has(d), o.id).toBe(true)
  })

  it('every quiz question has an "unsure" option and every interest area can score', () => {
    for (const q of c.quizQuestions) expect(c.quizOptions.some((o) => o.question_id === q.id && o.is_unsure), q.id).toBe(true)
    for (const d of DIMENSION_IDS) expect(c.quizOptions.some((o) => (o.weights[d] ?? 0) > 0), d).toBe(true)
  })

  it('all source URLs use https', () => {
    for (const s of c.sources) expect(s.url ?? 'https://').toMatch(/^https:\/\//)
  })
})
