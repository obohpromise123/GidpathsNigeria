import type { AdmissionRequirement, Career, Catalog, Course, SubjectPathway } from './types'

// Small helpers for looking up related records in the catalog.

export const findCourse = (c: Catalog, id: string | undefined) => c.courses.find((x) => x.id === id && x.published)
export const findCareer = (c: Catalog, id: string | undefined) => c.careers.find((x) => x.id === id && x.published)
export const findPathway = (c: Catalog, id: string | undefined) => c.pathways.find((x) => x.id === id)
export const categoryName = (c: Catalog, id: string) => c.categories.find((x) => x.id === id)?.name ?? 'Other'
export const institutionFor = (c: Catalog, id: string | null) => (id ? c.institutions.find((x) => x.id === id) : undefined)
export const sourceFor = (c: Catalog, id: string | null) => (id ? c.sources.find((x) => x.id === id) : undefined)

export function careersForCourse(c: Catalog, courseId: string): Career[] {
  const ids = new Set(c.courseCareers.filter((l) => l.course_id === courseId).map((l) => l.career_id))
  return c.careers.filter((x) => x.published && ids.has(x.id))
}

export function coursesForCareer(c: Catalog, careerId: string): Course[] {
  const ids = new Set(c.courseCareers.filter((l) => l.career_id === careerId).map((l) => l.course_id))
  return c.courses.filter((x) => x.published && ids.has(x.id))
}

export function pathwaysForCourse(c: Catalog, courseId: string): SubjectPathway[] {
  const ids = new Set(c.coursePathways.filter((l) => l.course_id === courseId).map((l) => l.pathway_id))
  return c.pathways.filter((p) => ids.has(p.id))
}

export function coursesForPathway(c: Catalog, pathwayId: string): Course[] {
  const ids = new Set(c.coursePathways.filter((l) => l.pathway_id === pathwayId).map((l) => l.course_id))
  return c.courses.filter((x) => x.published && ids.has(x.id))
}

/** Institution-specific records first, then general guidance. */
export function admissionsForCourse(c: Catalog, courseId: string): AdmissionRequirement[] {
  return c.admissions
    .filter((a) => a.course_id === courseId)
    .sort((a, b) => Number(a.institution_id === null) - Number(b.institution_id === null))
}

/** True when the key facts students need are missing. */
export function needsVerification(a: AdmissionRequirement): boolean {
  return a.verification_status !== 'verified' || !a.olevel_requirements || a.utme_subjects.length === 0
}
