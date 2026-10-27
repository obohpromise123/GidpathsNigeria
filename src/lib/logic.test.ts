import { describe, expect, it } from 'vitest'
import { buildSeedCatalog } from '../data/seed'
import { buildParticipationReport, MIN_GROUP_SIZE } from './participation'
import { emptyCourseFilters, filterCareers, filterCourses, matchesQuery } from './search'
import { emptyEnquiry, enquirySchema, toEnquiryRow } from './validation'

const catalog = buildSeedCatalog()

describe('search', () => {
  it('matches all words, ignoring case and punctuation', () => {
    expect(matchesQuery('civil ENGINEERING', 'Civil Engineering')).toBe(true)
    expect(matchesQuery('civil law', 'Civil Engineering')).toBe(false)
    expect(matchesQuery('', 'anything')).toBe(true)
  })

  it('filters courses by text', () => {
    expect(filterCourses(catalog, { ...emptyCourseFilters, query: 'nursing' }).map((c) => c.id)).toEqual(['nursing'])
  })

  it('filters courses by pathway, category, institution type and interest together', () => {
    const results = filterCourses(catalog, { ...emptyCourseFilters, pathway: 'technical', institutionType: 'technical_college' })
    expect(results.map((c) => c.id)).toContain('electrical-installation')
    expect(results.every((c) => c.institution_types.includes('technical_college'))).toBe(true)
    const health = filterCourses(catalog, { ...emptyCourseFilters, category: 'health', interest: 'life' })
    expect(health.length).toBeGreaterThan(0)
    expect(health.every((c) => c.category_id === 'health' && c.interests.includes('life'))).toBe(true)
  })

  it('returns nothing (not an error) for an impossible combination', () => {
    expect(filterCourses(catalog, { ...emptyCourseFilters, query: 'zzzz' })).toEqual([])
  })

  it('hides unpublished courses', () => {
    const hidden = structuredClone(catalog)
    hidden.courses[0].published = false
    expect(filterCourses(hidden, emptyCourseFilters).some((c) => c.id === hidden.courses[0].id)).toBe(false)
  })

  it('filters careers by category', () => {
    const results = filterCareers(catalog, { query: '', category: 'creative', interest: '' })
    expect(results.length).toBeGreaterThan(0)
    expect(results.every((c) => c.category_id === 'creative')).toBe(true)
  })
})

describe('enquiry validation', () => {
  const valid = {
    ...emptyEnquiry,
    school_name: 'Bright Future College',
    contact_name: 'Ngozi Eze',
    role_title: 'Principal',
    email: ' Principal@Example.com ',
    state: 'Lagos',
    consent: true,
  }

  it('accepts a complete enquiry and normalises the email', () => {
    const parsed = enquirySchema.parse(valid)
    expect(toEnquiryRow(parsed)).toMatchObject({ email: 'principal@example.com', phone: null, message: null, consent: true })
  })

  it('requires consent', () => {
    expect(enquirySchema.safeParse({ ...valid, consent: false }).success).toBe(false)
  })

  it('rejects an invalid email and an empty school name', () => {
    const result = enquirySchema.safeParse({ ...valid, email: 'not-an-email', school_name: ' ' })
    expect(result.success).toBe(false)
    const paths = result.error!.issues.map((i) => i.path[0])
    expect(paths).toContain('email')
    expect(paths).toContain('school_name')
  })

  it('rejects submissions where the hidden spam-trap field is filled', () => {
    expect(enquirySchema.safeParse({ ...valid, website: 'http://spam' }).success).toBe(false)
  })
})

describe('participation report', () => {
  it('hides small groups so individual students cannot be identified', () => {
    const report = buildParticipationReport([
      { event_type: 'quiz_completed', school_level: 'ss1', category_id: 'health', total: 12 },
      { event_type: 'quiz_completed', school_level: 'ss2', category_id: 'law-society', total: MIN_GROUP_SIZE - 1 },
      { event_type: 'onboarding_completed', school_level: 'ss1', category_id: null, total: 20 },
    ])
    expect(report.totals).toEqual({ quiz_completed: 12 + MIN_GROUP_SIZE - 1, onboarding_completed: 20 })
    expect(report.byLevel).toEqual([
      { level: 'ss1', count: 12 },
      { level: 'ss2', count: null },
    ])
    expect(report.byCategory.find((c) => c.categoryId === 'law-society')?.count).toBeNull()
    expect(report.hiddenGroups).toBe(2)
  })
})
