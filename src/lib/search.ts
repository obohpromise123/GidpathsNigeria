import type { Career, Catalog, Course, DimensionId, InstitutionType } from '../data/types'

/** Lower-cases and strips accents/punctuation so "Law" matches "law," etc. */
export function normalise(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/** True if every word in the query appears somewhere in the haystack. */
export function matchesQuery(query: string, ...fields: (string | string[] | null | undefined)[]): boolean {
  const words = normalise(query).split(' ').filter(Boolean)
  if (words.length === 0) return true
  const haystack = normalise(fields.flat().filter(Boolean).join(' '))
  return words.every((w) => haystack.includes(w))
}

export interface CourseFilters {
  query: string
  pathway: string
  category: string
  institutionType: InstitutionType | ''
  interest: DimensionId | ''
}

export const emptyCourseFilters: CourseFilters = { query: '', pathway: '', category: '', institutionType: '', interest: '' }

export function filterCourses(catalog: Catalog, f: CourseFilters): Course[] {
  const pathwayCourses = f.pathway
    ? new Set(catalog.coursePathways.filter((cp) => cp.pathway_id === f.pathway).map((cp) => cp.course_id))
    : null
  return catalog.courses
    .filter((c) => c.published)
    .filter((c) => !pathwayCourses || pathwayCourses.has(c.id))
    .filter((c) => !f.category || c.category_id === f.category)
    .filter((c) => !f.institutionType || c.institution_types.includes(f.institutionType))
    .filter((c) => !f.interest || c.interests.includes(f.interest))
    .filter((c) => matchesQuery(f.query, c.name, c.summary, c.what_you_learn, c.skills))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export interface CareerFilters {
  query: string
  category: string
  interest: DimensionId | ''
}

export const emptyCareerFilters: CareerFilters = { query: '', category: '', interest: '' }

export function filterCareers(catalog: Catalog, f: CareerFilters): Career[] {
  return catalog.careers
    .filter((c) => c.published)
    .filter((c) => !f.category || c.category_id === f.category)
    .filter((c) => !f.interest || c.interests.includes(f.interest))
    .filter((c) => matchesQuery(f.query, c.title, c.summary, c.responsibilities, c.skills))
    .sort((a, b) => a.title.localeCompare(b.title))
}
