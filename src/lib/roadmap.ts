import type { AdmissionRequirement, Career, Catalog, Course } from '../data/types'
import { isJunior, type StudentProfile } from './onboarding'
import type { CategoryMatch, Recommendation } from './recommend'

export interface RoadmapCourse {
  course: Course
  /** Set when the course is not usually linked to the student's pathway. */
  pathwayNote: string | null
}

export interface Roadmap {
  areas: CategoryMatch[]
  careers: Career[]
  courses: RoadmapCourse[]
  subjects: { name: string; count: number }[]
  admissions: { course: Course; records: AdmissionRequirement[] }[]
  skills: string[]
  nextSteps: string[]
  alternatives: Career[]
}

const MAX_CAREERS = 6
const MAX_COURSES = 6

function nextStepsFor(profile: StudentProfile): string[] {
  const common = [
    'Talk through these ideas with a guidance counsellor, teacher or parent.',
    'Open two or three of the course pages below and read what students actually study.',
  ]
  if (isJunior(profile.schoolLevel)) {
    return [
      ...common,
      'Before choosing your senior secondary subjects, check which subjects the courses you like usually need.',
      'Keep Mathematics and English Language strong — almost every course needs them.',
      'Try clubs and activities linked to these areas to see what you really enjoy.',
    ]
  }
  if (profile.schoolLevel === 'ss3') {
    return [
      ...common,
      'Check the exact UTME subject combination for each course and institution on JAMB IBASS before you register.',
      'Make sure your WAEC/NECO subjects match the O’Level requirements of your chosen courses.',
      'Find out whether each institution runs a post-UTME screening and when it happens.',
      'Have a back-up choice: a related course, or a polytechnic or college of education route.',
    ]
  }
  return [
    ...common,
    'Check that your current subject combination keeps your favourite courses open. If not, ask your school about changing a subject early.',
    'Start looking at JAMB IBASS to see the UTME subjects each course needs at different institutions.',
    'Build one practical skill from the list below this term.',
  ]
}

export function buildRoadmap(catalog: Catalog, rec: Recommendation, profile: StudentProfile): Roadmap {
  const areas = rec.top
  const careers = areas.flatMap((a) => a.careers.slice(0, 2)).slice(0, MAX_CAREERS)
  const careerIds = new Set(careers.map((c) => c.id))

  // Courses linked to the suggested careers, ranked by how many of them they lead to.
  const courseHits = new Map<string, number>()
  for (const link of catalog.courseCareers) {
    if (careerIds.has(link.career_id)) courseHits.set(link.course_id, (courseHits.get(link.course_id) ?? 0) + 1)
  }
  const pathwayName = catalog.pathways.find((p) => p.id === profile.pathway)?.name
  const courses: RoadmapCourse[] = catalog.courses
    .filter((c) => c.published && courseHits.has(c.id))
    .sort((a, b) => (courseHits.get(b.id) ?? 0) - (courseHits.get(a.id) ?? 0) || a.name.localeCompare(b.name))
    .slice(0, MAX_COURSES)
    .map((course) => {
      const linked = catalog.coursePathways.filter((cp) => cp.course_id === course.id).map((cp) => cp.pathway_id)
      const names = catalog.pathways.filter((p) => linked.includes(p.id)).map((p) => p.name)
      const pathwayNote =
        pathwayName && profile.pathway && !linked.includes(profile.pathway)
          ? `Usually linked with the ${names.join(' or ')} pathway. Ask your counsellor which subjects you would need.`
          : null
      return { course, pathwayNote }
    })

  const subjectCounts = new Map<string, number>()
  for (const { course } of courses) {
    for (const s of course.helpful_subjects) subjectCounts.set(s, (subjectCounts.get(s) ?? 0) + 1)
  }
  const subjects = [...subjectCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 8)

  const admissions = courses.map(({ course }) => ({
    course,
    records: catalog.admissions.filter((a) => a.course_id === course.id),
  }))

  const skills = [...new Set(careers.flatMap((c) => c.start_now))].slice(0, 8)

  const shownCategoryIds = new Set(areas.map((a) => a.category.id))
  const alternatives = rec.categories
    .filter((c) => !shownCategoryIds.has(c.category.id))
    .slice(0, 3)
    .flatMap((c) => c.careers.slice(0, 1))

  return { areas, careers, courses, subjects, admissions, skills, nextSteps: nextStepsFor(profile), alternatives }
}

/** Plain-text version of the roadmap for downloading. */
export function roadmapToText(roadmap: Roadmap, appName: string): string {
  const lines: string[] = [
    `${appName} — My Career Roadmap`,
    `Created ${new Date().toLocaleDateString('en-NG', { dateStyle: 'long' })}`,
    '',
    'This roadmap is for exploration only. It is not a test result or a guarantee, and it does not replace advice from a qualified counsellor.',
    '',
    'CAREER AREAS TO EXPLORE',
    ...roadmap.areas.map((a) => `- ${a.category.name}`),
    '',
    'CAREERS TO LOOK INTO',
    ...roadmap.careers.map((c) => `- ${c.title}: ${c.summary}`),
    '',
    'COURSES WORTH EXPLORING',
    ...roadmap.courses.map(({ course, pathwayNote }) => `- ${course.name}${pathwayNote ? ` (${pathwayNote})` : ''}`),
    '',
    'SUBJECTS TO PAY ATTENTION TO',
    ...roadmap.subjects.map((s) => `- ${s.name}`),
    '',
    'ADMISSION REQUIREMENTS TO VERIFY (check JAMB IBASS: https://ibass.jamb.gov.ng)',
    ...roadmap.admissions.map(({ course, records }) => {
      const verified = records.filter((r) => r.verification_status === 'verified').length
      return `- ${course.name}: ${verified ? `${verified} verified record(s)` : 'verification required'}`
    }),
    '',
    'SKILLS TO START BUILDING',
    ...roadmap.skills.map((s) => `- ${s}`),
    '',
    'NEXT STEPS',
    ...roadmap.nextSteps.map((s, i) => `${i + 1}. ${s}`),
    '',
    'OTHER CAREERS YOU MIGHT CONSIDER',
    ...roadmap.alternatives.map((c) => `- ${c.title}`),
  ]
  return lines.join('\n')
}
