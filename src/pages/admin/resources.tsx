import type { ReactNode } from 'react'
import { institutionTypeLabel } from '../../components/AdmissionRecord'
import { Badge, VerificationBadge } from '../../components/ui/Badge'
import type { Row, TableName } from '../../data/repository'
import type { Catalog, VerificationStatus } from '../../data/types'
import { DIMENSION_IDS, DIMENSIONS } from '../../lib/dimensions'
import { NIGERIAN_STATES } from '../../lib/nigeria'

// Describes every content type the admin dashboard can manage. One generic
// screen (ResourcePage) reads these descriptions to build its table and form.

export interface Option {
  id: string
  label: string
}

export interface Lookups {
  catalog: Catalog
  schools: Row[]
}

export type FieldType = 'text' | 'textarea' | 'url' | 'email' | 'date' | 'number' | 'select' | 'list' | 'multiselect' | 'checkbox' | 'relation'

export interface FieldDef {
  name: string
  label: string
  type: FieldType
  required?: boolean
  help?: string
  max?: number
  options?: (l: Lookups) => Option[]
  /** Label for the empty choice in a select (makes the field nullable). */
  emptyLabel?: string
  /** For type 'relation': which join table stores the links. */
  relation?: 'course_pathways' | 'course_careers'
  /** Leave out of the insert when blank, so the database default applies. */
  omitIfEmpty?: boolean
  /** Only editable when creating (e.g. readable IDs used in web addresses). */
  createOnly?: boolean
}

export interface ColumnDef {
  label: string
  render: (row: Row, l: Lookups) => ReactNode
}

export interface ResourceDef {
  key: string
  table: TableName
  title: string
  singular: string
  description: string
  /** 'slug' = readable id chosen by the admin; 'generated' = database uuid. */
  idMode: 'slug' | 'generated'
  slugFrom?: string
  rowTitle: (row: Row, l: Lookups) => string
  columns: ColumnDef[]
  searchFields: string[]
  filters?: { name: string; label: string; options: (l: Lookups) => Option[] }[]
  fields: FieldDef[]
  /** Content shown to students: reload the shared catalog after changes. */
  catalogBacked: boolean
  /** Applies the "verified needs a source and date" rule. */
  verification?: boolean
  notice?: ReactNode
}

// ── option helpers ──────────────────────────────────────────────────────
const opt = (pairs: [string, string][]): Option[] => pairs.map(([id, label]) => ({ id, label }))
const categories = (l: Lookups) => l.catalog.categories.map((c) => ({ id: c.id, label: c.name }))
const courseOptions = (l: Lookups) => [...l.catalog.courses].sort((a, b) => a.name.localeCompare(b.name)).map((c) => ({ id: c.id, label: c.name }))
const institutionOptions = (l: Lookups) => l.catalog.institutions.map((i) => ({ id: i.id, label: i.name }))
const sourceOptions = (l: Lookups) => l.catalog.sources.map((s) => ({ id: s.id, label: s.title }))
const schoolOptions = (l: Lookups) => l.schools.map((s) => ({ id: String(s.id), label: String(s.name) }))
const dims = () => DIMENSION_IDS.map((d) => ({ id: d, label: DIMENSIONS[d].label }))
const INSTITUTION_TYPES = opt([
  ['university', 'University'],
  ['polytechnic', 'Polytechnic'],
  ['college_of_education', 'College of Education'],
  ['technical_college', 'Technical College'],
  ['other', 'Other'],
])
const VERIFICATION = opt([
  ['unverified', 'Verification required'],
  ['verified', 'Verified'],
  ['sample', 'Sample (demonstration only)'],
])
const STATES = () => NIGERIAN_STATES.map((s) => ({ id: s, label: s }))

const name = (list: { id: string; name?: string; title?: string }[], id: unknown) => {
  const found = list.find((x) => x.id === id)
  return found?.name ?? found?.title ?? '—'
}
const text = (v: unknown) => (v === null || v === undefined || v === '' ? '—' : String(v))
const published = (row: Row) => (row.published ? <Badge tone="green">Published</Badge> : <Badge tone="neutral">Hidden</Badge>)
const status = (row: Row) => <VerificationBadge status={row.verification_status as VerificationStatus} />

const verificationFields: FieldDef[] = [
  {
    name: 'verification_status',
    label: 'Verification status',
    type: 'select',
    required: true,
    options: () => VERIFICATION,
    help: 'Only choose “Verified” after checking an official source. You must then pick the source and date.',
  },
  { name: 'source_id', label: 'Source', type: 'select', options: sourceOptions, emptyLabel: 'No source yet', help: 'Required when the status is “Verified”.' },
  { name: 'last_verified_at', label: 'Last verified on', type: 'date', help: 'Required when the status is “Verified”.' },
]

const idField = (help = 'Lowercase letters, numbers and dashes, e.g. “civil-engineering”. Used in web addresses; it cannot be changed later.'): FieldDef => ({
  name: 'id',
  label: 'ID',
  type: 'text',
  help: `${help} Leave blank to create it from the name.`,
  createOnly: true,
})

export const RESOURCES: ResourceDef[] = [
  {
    key: 'courses',
    table: 'courses',
    title: 'Courses',
    singular: 'course',
    description: 'Course profiles shown in the course explorer.',
    idMode: 'slug',
    slugFrom: 'name',
    rowTitle: (r) => String(r.name),
    columns: [
      { label: 'Course', render: (r) => <span className="font-semibold text-navy-900">{String(r.name)}</span> },
      { label: 'Career area', render: (r, l) => name(l.catalog.categories, r.category_id) },
      { label: 'Status', render: published },
    ],
    searchFields: ['name', 'summary'],
    filters: [
      { name: 'category_id', label: 'Career area', options: categories },
      { name: 'published', label: 'Status', options: () => opt([['true', 'Published'], ['false', 'Hidden']]) },
    ],
    fields: [
      idField(),
      { name: 'name', label: 'Course name', type: 'text', required: true, max: 200 },
      { name: 'category_id', label: 'Career area', type: 'select', required: true, options: categories },
      { name: 'summary', label: 'One-line summary', type: 'textarea', required: true, max: 300 },
      { name: 'description', label: 'Plain-language description', type: 'textarea', required: true },
      { name: 'what_you_learn', label: 'What students typically learn', type: 'list' },
      { name: 'helpful_subjects', label: 'Helpful subjects or skills (general, not official requirements)', type: 'list' },
      { name: 'workplaces', label: 'Workplaces and industries', type: 'list' },
      { name: 'skills', label: 'Skills students develop', type: 'list' },
      { name: 'further_study', label: 'Further study and professional qualifications', type: 'list' },
      { name: 'typical_duration', label: 'Typical duration', type: 'text' },
      { name: 'interests', label: 'Related interests', type: 'multiselect', options: dims },
      { name: 'institution_types', label: 'Institution types', type: 'multiselect', options: () => INSTITUTION_TYPES },
      { name: 'pathways', label: 'Subject pathways', type: 'relation', relation: 'course_pathways', options: (l) => l.catalog.pathways.map((p) => ({ id: p.id, label: p.name })) },
      {
        name: 'careers',
        label: 'Related careers',
        type: 'relation',
        relation: 'course_careers',
        options: (l) => [...l.catalog.careers].sort((a, b) => a.title.localeCompare(b.title)).map((c) => ({ id: c.id, label: c.title })),
      },
      { name: 'published', label: 'Show to students', type: 'checkbox' },
    ],
    catalogBacked: true,
  },
  {
    key: 'careers',
    table: 'careers',
    title: 'Careers',
    singular: 'career',
    description: 'Career profiles shown in the career explorer and quiz results.',
    idMode: 'slug',
    slugFrom: 'title',
    rowTitle: (r) => String(r.title),
    columns: [
      { label: 'Career', render: (r) => <span className="font-semibold text-navy-900">{String(r.title)}</span> },
      { label: 'Career area', render: (r, l) => name(l.catalog.categories, r.category_id) },
      { label: 'Status', render: published },
    ],
    searchFields: ['title', 'summary'],
    filters: [{ name: 'category_id', label: 'Career area', options: categories }],
    fields: [
      idField(),
      { name: 'title', label: 'Career title', type: 'text', required: true, max: 200 },
      { name: 'category_id', label: 'Career area', type: 'select', required: true, options: categories },
      { name: 'summary', label: 'Plain-language summary', type: 'textarea', required: true, max: 300 },
      { name: 'responsibilities', label: 'Typical responsibilities', type: 'list' },
      { name: 'skills', label: 'Useful skills', type: 'list' },
      { name: 'interests', label: 'Related interests', type: 'multiselect', options: dims },
      { name: 'work_environments', label: 'Work environments', type: 'list' },
      { name: 'start_now', label: 'Skills students can start building now', type: 'list' },
      { name: 'alternative_routes', label: 'Alternative routes', type: 'textarea' },
      { name: 'licensing', label: 'Qualification or licensing considerations', type: 'textarea' },
      { name: 'published', label: 'Show to students', type: 'checkbox' },
    ],
    catalogBacked: true,
    notice: 'Link careers to courses from the course form.',
  },
  {
    key: 'pathways',
    table: 'subject_pathways',
    title: 'Subject pathways',
    singular: 'pathway',
    description: 'Science, Arts, Commercial and other pathways.',
    idMode: 'slug',
    slugFrom: 'name',
    rowTitle: (r) => String(r.name),
    columns: [
      { label: 'Pathway', render: (r) => <span className="font-semibold text-navy-900">{String(r.name)}</span> },
      { label: 'Order', render: (r) => text(r.sort_order) },
    ],
    searchFields: ['name', 'summary'],
    fields: [
      idField(),
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'summary', label: 'Summary', type: 'textarea', required: true },
      { name: 'overview', label: 'What the pathway involves', type: 'textarea' },
      { name: 'subjects', label: 'Common subjects', type: 'list' },
      { name: 'skills', label: 'Skills', type: 'list' },
      { name: 'interests', label: 'Related interests', type: 'multiselect', options: dims },
      { name: 'limitations', label: 'Limitations', type: 'textarea' },
      { name: 'alternatives', label: 'Alternative routes', type: 'textarea' },
      { name: 'sort_order', label: 'Display order', type: 'number' },
    ],
    catalogBacked: true,
  },
  {
    key: 'categories',
    table: 'career_categories',
    title: 'Career areas',
    singular: 'career area',
    description: 'The groups used by the quiz and the career explorer.',
    idMode: 'slug',
    slugFrom: 'name',
    rowTitle: (r) => String(r.name),
    columns: [
      { label: 'Career area', render: (r) => <span className="font-semibold text-navy-900">{String(r.name)}</span> },
      { label: 'Linked interests', render: (r) => ((r.interests as string[]) ?? []).map((d) => DIMENSIONS[d as keyof typeof DIMENSIONS]?.label ?? d).join(', ') },
    ],
    searchFields: ['name', 'description'],
    fields: [
      idField(),
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      {
        name: 'interests',
        label: 'Linked interests (most important first)',
        type: 'multiselect',
        options: dims,
        help: 'The quiz scores this area from these interests. The first two count most.',
      },
      { name: 'sort_order', label: 'Display order', type: 'number' },
    ],
    catalogBacked: true,
  },
  {
    key: 'institutions',
    table: 'institutions',
    title: 'Institutions',
    singular: 'institution',
    description: 'Universities, polytechnics, colleges of education and technical colleges.',
    idMode: 'slug',
    slugFrom: 'short_name',
    rowTitle: (r) => String(r.name),
    columns: [
      { label: 'Institution', render: (r) => <span className="font-semibold text-navy-900">{String(r.name)}</span> },
      { label: 'Type', render: (r) => institutionTypeLabel(String(r.type)) },
      { label: 'State', render: (r) => text(r.state) },
      { label: 'Verification', render: status },
    ],
    searchFields: ['name', 'short_name', 'state'],
    filters: [
      { name: 'type', label: 'Type', options: () => INSTITUTION_TYPES },
      { name: 'verification_status', label: 'Verification', options: () => VERIFICATION },
    ],
    fields: [
      idField(),
      { name: 'name', label: 'Official name', type: 'text', required: true },
      { name: 'short_name', label: 'Short name', type: 'text' },
      { name: 'type', label: 'Institution type', type: 'select', required: true, options: () => INSTITUTION_TYPES },
      { name: 'ownership', label: 'Ownership', type: 'select', required: true, options: () => opt([['federal', 'Federal'], ['state', 'State'], ['private', 'Private'], ['other', 'Other']]) },
      { name: 'state', label: 'State', type: 'select', options: STATES, emptyLabel: 'Not set' },
      { name: 'website', label: 'Official website', type: 'url' },
      ...verificationFields,
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ],
    catalogBacked: true,
    verification: true,
  },
  {
    key: 'programmes',
    table: 'institution_programmes',
    title: 'Programmes offered',
    singular: 'programme',
    description: 'Which institution offers which course. Mark as verified only after checking IBASS or the institution.',
    idMode: 'generated',
    rowTitle: (r, l) => `${name(l.catalog.courses, r.course_id)} at ${name(l.catalog.institutions, r.institution_id)}`,
    columns: [
      { label: 'Course', render: (r, l) => <span className="font-semibold text-navy-900">{name(l.catalog.courses, r.course_id)}</span> },
      { label: 'Institution', render: (r, l) => name(l.catalog.institutions, r.institution_id) },
      { label: 'Award', render: (r) => text(r.award) },
      { label: 'Verification', render: status },
    ],
    searchFields: ['award', 'notes'],
    filters: [
      { name: 'institution_id', label: 'Institution', options: institutionOptions },
      { name: 'verification_status', label: 'Verification', options: () => VERIFICATION },
    ],
    fields: [
      { name: 'institution_id', label: 'Institution', type: 'select', required: true, options: institutionOptions },
      { name: 'course_id', label: 'Course', type: 'select', required: true, options: courseOptions },
      { name: 'award', label: 'Award (e.g. B.Sc., ND, NCE)', type: 'text' },
      ...verificationFields,
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ],
    catalogBacked: true,
    verification: true,
  },
  {
    key: 'admissions',
    table: 'admission_requirements',
    title: 'Admission requirements',
    singular: 'admission requirement',
    description: 'O’Level and UTME requirements. Never mark a record verified without an official source.',
    idMode: 'generated',
    rowTitle: (r, l) => `${name(l.catalog.courses, r.course_id)} — ${r.institution_id ? name(l.catalog.institutions, r.institution_id) : 'general guidance'}`,
    columns: [
      { label: 'Course', render: (r, l) => <span className="font-semibold text-navy-900">{name(l.catalog.courses, r.course_id)}</span> },
      { label: 'Institution', render: (r, l) => (r.institution_id ? name(l.catalog.institutions, r.institution_id) : 'General guidance') },
      { label: 'Cycle', render: (r) => text(r.admission_cycle) },
      { label: 'Verification', render: status },
    ],
    searchFields: ['olevel_requirements', 'notes', 'admission_cycle'],
    filters: [
      { name: 'course_id', label: 'Course', options: courseOptions },
      { name: 'verification_status', label: 'Verification', options: () => VERIFICATION },
    ],
    fields: [
      { name: 'course_id', label: 'Course', type: 'select', required: true, options: courseOptions },
      {
        name: 'institution_id',
        label: 'Institution',
        type: 'select',
        options: institutionOptions,
        emptyLabel: 'None — general guidance for all institutions',
        help: 'Requirements for one institution must never be copied to another.',
      },
      { name: 'admission_cycle', label: 'Admission year or cycle (e.g. 2026/2027)', type: 'text' },
      { name: 'olevel_requirements', label: 'O’Level requirements', type: 'textarea' },
      { name: 'utme_subjects', label: 'UTME subjects (one per line)', type: 'list' },
      { name: 'direct_entry', label: 'Direct entry notes', type: 'textarea' },
      { name: 'notes', label: 'Admission notes', type: 'textarea' },
      ...verificationFields,
    ],
    catalogBacked: true,
    verification: true,
  },
  {
    key: 'sources',
    table: 'educational_sources',
    title: 'Sources',
    singular: 'source',
    description: 'Official references used to verify records.',
    idMode: 'slug',
    slugFrom: 'title',
    rowTitle: (r) => String(r.title),
    columns: [
      { label: 'Source', render: (r) => <span className="font-semibold text-navy-900">{String(r.title)}</span> },
      { label: 'Publisher', render: (r) => text(r.publisher) },
      { label: 'Last accessed', render: (r) => text(r.accessed_at) },
    ],
    searchFields: ['title', 'publisher', 'url'],
    fields: [
      idField('Lowercase letters, numbers and dashes, e.g. “jamb-ibass-2027”.'),
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'publisher', label: 'Publisher', type: 'text', required: true },
      { name: 'url', label: 'Web address', type: 'url' },
      {
        name: 'source_type',
        label: 'Type',
        type: 'select',
        required: true,
        options: () =>
          opt([
            ['official_jamb', 'Official — JAMB'],
            ['official_institution', 'Official — institution'],
            ['official_regulator', 'Official — regulator (NUC, NBTE, NCCE)'],
            ['other', 'Other'],
          ]),
      },
      { name: 'accessed_at', label: 'Date accessed', type: 'date' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ],
    catalogBacked: true,
  },
  {
    key: 'schools',
    table: 'schools',
    title: 'Schools',
    singular: 'school',
    description: 'School accounts. Add staff on the “School staff” page.',
    idMode: 'generated',
    rowTitle: (r) => String(r.name),
    columns: [
      { label: 'School', render: (r) => <span className="font-semibold text-navy-900">{String(r.name)}</span> },
      { label: 'State', render: (r) => text(r.state) },
      { label: 'Join code', render: (r) => <code className="font-mono text-sm">{text(r.join_code)}</code> },
      { label: 'Status', render: (r) => <Badge tone={r.status === 'active' ? 'green' : 'neutral'}>{text(r.status)}</Badge> },
    ],
    searchFields: ['name', 'state', 'join_code'],
    filters: [{ name: 'status', label: 'Status', options: () => opt([['prospect', 'Prospect'], ['active', 'Active'], ['inactive', 'Inactive']]) }],
    fields: [
      { name: 'name', label: 'School name', type: 'text', required: true },
      { name: 'state', label: 'State', type: 'select', options: STATES, emptyLabel: 'Not set' },
      { name: 'school_type', label: 'School type', type: 'select', required: true, options: () => opt([['public', 'Public'], ['private', 'Private'], ['mission', 'Mission'], ['other', 'Other']]) },
      { name: 'contact_email', label: 'School contact email', type: 'email' },
      {
        name: 'join_code',
        label: 'Join code',
        type: 'text',
        omitIfEmpty: true,
        help: '6–12 capital letters or numbers. Leave blank to generate one. Students enter this to share anonymous totals with the school.',
      },
      { name: 'status', label: 'Status', type: 'select', required: true, options: () => opt([['prospect', 'Prospect'], ['active', 'Active'], ['inactive', 'Inactive']]) },
    ],
    catalogBacked: false,
  },
  {
    key: 'subscriptions',
    table: 'subscriptions',
    title: 'Subscriptions',
    singular: 'subscription',
    description: 'Manual record of each school’s subscription status.',
    idMode: 'generated',
    rowTitle: (r, l) => `${name(l.schools as never, r.school_id)} — ${String(r.plan)}`,
    columns: [
      { label: 'School', render: (r, l) => <span className="font-semibold text-navy-900">{name(l.schools as never, r.school_id)}</span> },
      { label: 'Plan', render: (r) => text(r.plan) },
      { label: 'Status', render: (r) => <Badge tone={r.status === 'active' ? 'green' : 'neutral'}>{text(r.status)}</Badge> },
      { label: 'Ends', render: (r) => text(r.ends_on) },
    ],
    searchFields: ['plan', 'notes'],
    fields: [
      { name: 'school_id', label: 'School', type: 'select', required: true, options: schoolOptions },
      { name: 'plan', label: 'Plan name', type: 'text', required: true, help: 'For example “Pilot 2026”.' },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: () => opt([['none', 'None'], ['trial', 'Trial / pilot'], ['active', 'Active'], ['past_due', 'Payment overdue'], ['cancelled', 'Cancelled']]),
      },
      { name: 'starts_on', label: 'Starts on', type: 'date' },
      { name: 'ends_on', label: 'Ends on', type: 'date' },
      { name: 'notes', label: 'Notes (e.g. signed agreement reference)', type: 'textarea' },
    ],
    catalogBacked: false,
    notice: 'No payments are processed. Only mark a subscription “Active” after an agreement has been signed and payment confirmed outside this system.',
  },
  {
    key: 'sponsorships',
    table: 'sponsorships',
    title: 'Sponsorships',
    singular: 'sponsorship',
    description: 'Organisations funding access for schools or students.',
    idMode: 'generated',
    rowTitle: (r) => String(r.sponsor_name),
    columns: [
      { label: 'Sponsor', render: (r) => <span className="font-semibold text-navy-900">{String(r.sponsor_name)}</span> },
      { label: 'School', render: (r, l) => (r.school_id ? name(l.schools as never, r.school_id) : 'Any') },
      { label: 'Seats', render: (r) => text(r.seats) },
      { label: 'Status', render: (r) => text(r.status) },
    ],
    searchFields: ['sponsor_name', 'notes'],
    fields: [
      { name: 'sponsor_name', label: 'Sponsor name', type: 'text', required: true },
      {
        name: 'sponsor_type',
        label: 'Sponsor type',
        type: 'select',
        required: true,
        options: () => opt([['corporate', 'Corporate'], ['foundation', 'Foundation'], ['ngo', 'NGO'], ['government', 'Government'], ['individual', 'Individual'], ['other', 'Other']]),
      },
      { name: 'school_id', label: 'School', type: 'select', options: schoolOptions, emptyLabel: 'Not tied to one school' },
      { name: 'seats', label: 'Number of student seats', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', required: true, options: () => opt([['pledged', 'Pledged'], ['active', 'Active'], ['ended', 'Ended']]) },
      { name: 'starts_on', label: 'Starts on', type: 'date' },
      { name: 'ends_on', label: 'Ends on', type: 'date' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ],
    catalogBacked: false,
  },
]

export const RESOURCE_BY_KEY = new Map(RESOURCES.map((r) => [r.key, r]))

/** Default values for a brand-new record. */
export function newRecordDefaults(def: ResourceDef): Row {
  const defaults: Row = {}
  for (const f of def.fields) {
    if (f.type === 'checkbox') defaults[f.name] = f.name === 'published'
    else if (f.type === 'list' || f.type === 'multiselect' || f.type === 'relation') defaults[f.name] = []
    else defaults[f.name] = null
  }
  if ('verification_status' in defaults) defaults.verification_status = 'unverified'
  if (def.key === 'sources') defaults.source_type = 'other'
  if (def.key === 'institutions') defaults.ownership = 'federal'
  if (def.key === 'schools') Object.assign(defaults, { status: 'prospect', school_type: 'other' })
  if (def.key === 'subscriptions') Object.assign(defaults, { status: 'none', plan: 'Pilot' })
  if (def.key === 'sponsorships') Object.assign(defaults, { status: 'pledged', sponsor_type: 'other' })
  return defaults
}
