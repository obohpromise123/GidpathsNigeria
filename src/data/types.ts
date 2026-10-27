// Shared data types. These mirror the PostgreSQL tables in
// supabase/migrations so the same objects work in demo mode and live mode.

/** The ten interest areas the quiz measures. */
export type DimensionId =
  | 'logic'
  | 'life'
  | 'build'
  | 'communicate'
  | 'people'
  | 'organise'
  | 'tech'
  | 'nature'
  | 'creative'
  | 'practical'

/**
 * How trustworthy a factual record is.
 * - verified: checked against an official source on a recorded date
 * - unverified: believed to be typical, but must be checked before relying on it
 * - sample: invented for demonstration only, never real
 */
export type VerificationStatus = 'verified' | 'unverified' | 'sample'

export type InstitutionType =
  | 'university'
  | 'polytechnic'
  | 'college_of_education'
  | 'technical_college'
  | 'other'

export type Ownership = 'federal' | 'state' | 'private' | 'other'

export interface CareerCategory {
  id: string
  name: string
  description: string
  interests: DimensionId[]
  sort_order: number
}

export interface SubjectPathway {
  id: string
  name: string
  summary: string
  overview: string
  subjects: string[]
  skills: string[]
  interests: DimensionId[]
  limitations: string
  alternatives: string
  sort_order: number
}

export interface Course {
  id: string
  name: string
  category_id: string
  summary: string
  description: string
  what_you_learn: string[]
  helpful_subjects: string[]
  workplaces: string[]
  skills: string[]
  further_study: string[]
  interests: DimensionId[]
  institution_types: InstitutionType[]
  typical_duration: string
  published: boolean
}

export interface Career {
  id: string
  title: string
  category_id: string
  summary: string
  responsibilities: string[]
  interests: DimensionId[]
  skills: string[]
  work_environments: string[]
  start_now: string[]
  alternative_routes: string
  licensing: string
  published: boolean
}

export interface CoursePathway {
  course_id: string
  pathway_id: string
}

export interface CourseCareer {
  course_id: string
  career_id: string
}

export interface Institution {
  id: string
  name: string
  short_name: string | null
  type: InstitutionType
  ownership: Ownership
  state: string | null
  website: string | null
  verification_status: VerificationStatus
  source_id: string | null
  last_verified_at: string | null
  notes: string | null
}

export interface InstitutionProgramme {
  id: string
  institution_id: string
  course_id: string
  award: string | null
  verification_status: VerificationStatus
  source_id: string | null
  last_verified_at: string | null
  notes: string | null
}

export type SourceType = 'official_jamb' | 'official_institution' | 'official_regulator' | 'other'

export interface EducationalSource {
  id: string
  title: string
  publisher: string
  url: string | null
  source_type: SourceType
  accessed_at: string | null
  notes: string | null
}

export interface AdmissionRequirement {
  id: string
  course_id: string
  /** null means general guidance that is not tied to one institution. */
  institution_id: string | null
  admission_cycle: string | null
  olevel_requirements: string | null
  utme_subjects: string[]
  direct_entry: string | null
  notes: string | null
  verification_status: VerificationStatus
  source_id: string | null
  last_verified_at: string | null
}

export interface VerificationRecord {
  id: string
  record_table: string
  record_id: string
  previous_status: VerificationStatus | null
  new_status: VerificationStatus
  source_id: string | null
  notes: string | null
  reviewer_id: string | null
  created_at: string
}

export interface QuizQuestion {
  id: string
  prompt: string
  helper: string | null
  kind: 'likert' | 'choice'
  sort_order: number
  active: boolean
}

export interface QuizOption {
  id: string
  question_id: string
  label: string
  weights: Partial<Record<DimensionId, number>>
  is_unsure: boolean
  sort_order: number
}

export type EnquiryStatus = 'new' | 'contacted' | 'demo_scheduled' | 'closed'

export interface SchoolEnquiry {
  id: string
  school_name: string
  contact_name: string
  role_title: string
  email: string
  phone: string | null
  state: string
  student_count: string | null
  message: string | null
  status: EnquiryStatus
  admin_notes: string | null
  created_at: string
}

export interface School {
  id: string
  name: string
  state: string | null
  school_type: 'public' | 'private' | 'mission' | 'other'
  contact_email: string | null
  join_code: string
  status: 'prospect' | 'active' | 'inactive'
  created_at: string
}

export type SchoolRole = 'school_admin' | 'counsellor'

export interface SchoolMembership {
  id: string
  school_id: string
  user_id: string
  role: SchoolRole
  created_at: string
}

export interface Subscription {
  id: string
  school_id: string
  plan: string
  status: 'none' | 'trial' | 'active' | 'past_due' | 'cancelled'
  starts_on: string | null
  ends_on: string | null
  notes: string | null
}

export interface Sponsorship {
  id: string
  sponsor_name: string
  sponsor_type: 'corporate' | 'foundation' | 'ngo' | 'government' | 'individual' | 'other'
  school_id: string | null
  seats: number | null
  status: 'pledged' | 'active' | 'ended'
  starts_on: string | null
  ends_on: string | null
  notes: string | null
}

export type UsageEventType = 'onboarding_completed' | 'quiz_completed' | 'roadmap_viewed'

export interface UsageEvent {
  id: string
  event_type: UsageEventType
  school_level: string | null
  category_id: string | null
  school_id: string | null
  created_at: string
}

export interface Profile {
  id: string
  email: string | null
  display_name: string | null
  platform_role: 'user' | 'admin'
}

/** All public educational content, loaded once and shared across pages. */
export interface Catalog {
  categories: CareerCategory[]
  pathways: SubjectPathway[]
  courses: Course[]
  careers: Career[]
  coursePathways: CoursePathway[]
  courseCareers: CourseCareer[]
  institutions: Institution[]
  programmes: InstitutionProgramme[]
  sources: EducationalSource[]
  admissions: AdmissionRequirement[]
  quizQuestions: QuizQuestion[]
  quizOptions: QuizOption[]
}
