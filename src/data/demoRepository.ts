import { buildSeedCatalog } from './seed'
import { CATALOG_TABLES, GENERATED_ID_TABLES, type Repository, type Row, type SchoolSummaryRow, type TableName } from './repository'
import { AppError } from './errors'
import type { Catalog, UsageEvent } from './types'
import { DEMO_SCHOOL_CODE, DEMO_SCHOOL_ID, DEMO_SCHOOL_NAME, DEMO_USERS } from './demoUsers'

// In-memory data for demo mode. Everything resets when the page is reloaded,
// and nothing is ever sent anywhere. The UI says so wherever it matters.


const VERIFIED_TABLES: TableName[] = ['institutions', 'institution_programmes', 'admission_requirements']

/** Deterministic, clearly labelled sample usage so the school dashboard has something to show. */
function sampleUsage(): UsageEvent[] {
  const levels = ['jss3', 'ss1', 'ss1', 'ss2', 'ss2', 'ss2', 'ss3']
  // Weighted so some areas are popular and a few stay below the privacy threshold.
  const cats = ['technology', 'health', 'health', 'business', 'technology', 'engineering', 'media', 'health', 'creative', 'law-society', 'business', 'education-care']
  const events: UsageEvent[] = []
  for (let i = 0; i < 150; i++) {
    // Fewer students finish each step than start it: 75 start, 45 finish the quiz, 30 view a roadmap.
    const step = i % 10
    const type = step < 4 || step === 9 ? 'onboarding_completed' : step < 7 ? 'quiz_completed' : 'roadmap_viewed'
    events.push({
      id: `sample-${i}`,
      event_type: type,
      school_level: levels[i % levels.length],
      category_id: type === 'onboarding_completed' ? null : cats[i % cats.length],
      school_id: DEMO_SCHOOL_ID,
      created_at: new Date(Date.now() - i * 36e5 * 4).toISOString(),
    })
  }
  return events
}

function initialTables(): Record<string, Row[]> {
  const catalog = buildSeedCatalog()
  const now = new Date().toISOString()
  const tables: Record<string, Row[]> = {}
  for (const [key, table] of Object.entries(CATALOG_TABLES) as [keyof Catalog, TableName][]) {
    tables[table] = catalog[key] as unknown as Row[]
  }
  tables.profiles = Object.values(DEMO_USERS).map((u) => ({ ...u }))
  tables.schools = [
    {
      id: DEMO_SCHOOL_ID,
      name: DEMO_SCHOOL_NAME,
      state: 'Lagos',
      school_type: 'private',
      contact_email: 'office@demo.local',
      join_code: DEMO_SCHOOL_CODE,
      status: 'prospect',
      created_at: now,
    },
  ]
  tables.school_memberships = [
    { id: 'm1', school_id: DEMO_SCHOOL_ID, user_id: DEMO_USERS.school_admin.id, role: 'school_admin', created_at: now },
    { id: 'm2', school_id: DEMO_SCHOOL_ID, user_id: DEMO_USERS.counsellor.id, role: 'counsellor', created_at: now },
  ]
  tables.subscriptions = []
  tables.sponsorships = []
  tables.school_enquiries = []
  tables.verification_records = []
  tables.usage_events = sampleUsage() as unknown as Row[]
  return tables
}

const newId = () => `demo-${Math.random().toString(36).slice(2, 10)}`

export function createDemoRepository(): Repository {
  const tables = initialTables()
  const rows = (t: string) => (tables[t] ??= [])

  const logVerification = (table: TableName, before: Row | null, after: Row) => {
    if (!VERIFIED_TABLES.includes(table)) return
    if (before && before.verification_status === after.verification_status && before.last_verified_at === after.last_verified_at) return
    rows('verification_records').unshift({
      id: newId(),
      record_table: table,
      record_id: String(after.id),
      previous_status: before?.verification_status ?? null,
      new_status: after.verification_status,
      source_id: after.source_id ?? null,
      notes: null,
      reviewer_id: DEMO_USERS.admin.id,
      created_at: new Date().toISOString(),
    })
  }

  const assertVerifiable = (row: Row) => {
    if (row.verification_status === 'verified' && (!row.source_id || !row.last_verified_at)) {
      throw { message: 'verified_needs_source' }
    }
  }

  return {
    mode: 'demo',

    async loadCatalog() {
      const catalog = {} as Record<keyof Catalog, unknown>
      for (const [key, table] of Object.entries(CATALOG_TABLES) as [keyof Catalog, TableName][]) {
        catalog[key] = structuredClone(rows(table))
      }
      return catalog as Catalog
    },

    async list(table, options = {}) {
      let result = rows(table).filter((r) => Object.entries(options.eq ?? {}).every(([k, v]) => r[k] === v))
      if (options.order) {
        const col = options.order
        const dir = options.ascending === false ? -1 : 1
        result = [...result].sort((a, b) => String(a[col] ?? '').localeCompare(String(b[col] ?? '')) * dir)
      }
      return structuredClone(result)
    },

    async insert(table, row) {
      const record: Row = { ...row }
      if (GENERATED_ID_TABLES.includes(table) || !record.id) record.id = newId()
      if (rows(table).some((r) => r.id === record.id)) throw { code: '23505' }
      record.created_at ??= new Date().toISOString()
      assertVerifiable(record)
      rows(table).push(record)
      logVerification(table, null, record)
      return structuredClone(record)
    },

    async update(table, id, patch) {
      const list = rows(table)
      const index = list.findIndex((r) => r.id === id)
      if (index < 0) throw { code: '42501' }
      const before = list[index]
      const after = { ...before, ...patch, id: patch.id ?? before.id }
      assertVerifiable(after)
      list[index] = after
      logVerification(table, before, after)
      return structuredClone(after)
    },

    async remove(table, id) {
      if (table === 'verification_records') throw new AppError('Verification history cannot be deleted.')
      const list = rows(table)
      const index = list.findIndex((r) => r.id === id)
      if (index < 0) throw { code: '42501' }
      list.splice(index, 1)
      if (table === 'courses') {
        tables.course_pathways = rows('course_pathways').filter((l) => l.course_id !== id)
        tables.course_careers = rows('course_careers').filter((l) => l.course_id !== id)
      }
    },

    async setCourseLinks(table, courseId, ids) {
      const column = table === 'course_pathways' ? 'pathway_id' : 'career_id'
      tables[table] = [...rows(table).filter((l) => l.course_id !== courseId), ...ids.map((id) => ({ course_id: courseId, [column]: id }))]
    },

    async submitEnquiry(input) {
      // Kept in memory only so the admin screens can be demonstrated.
      rows('school_enquiries').unshift({ ...input, id: newId(), status: 'new', admin_notes: null, created_at: new Date().toISOString() })
    },

    async recordUsage(event, schoolLevel, categoryId, schoolCode) {
      const linked = schoolCode && schoolCode.trim().toUpperCase() === DEMO_SCHOOL_CODE
      rows('usage_events').unshift({
        id: newId(),
        event_type: event,
        school_level: schoolLevel,
        category_id: categoryId,
        school_id: linked ? DEMO_SCHOOL_ID : null,
        created_at: new Date().toISOString(),
      })
    },

    async lookupSchoolCode(code) {
      const school = rows('schools').find((s) => s.join_code === code.trim().toUpperCase() && s.status !== 'inactive')
      return school ? String(school.name) : null
    },

    async usageSummary() {
      const monthAgo = Date.now() - 30 * 864e5
      const summary = new Map<string, { event_type: string; total: number; last_30_days: number }>()
      for (const e of rows('usage_events')) {
        const type = String(e.event_type)
        const s = summary.get(type) ?? { event_type: type, total: 0, last_30_days: 0 }
        s.total++
        if (Date.parse(String(e.created_at)) > monthAgo) s.last_30_days++
        summary.set(type, s)
      }
      return [...summary.values()]
    },

    async schoolSummary(schoolId) {
      const summary = new Map<string, SchoolSummaryRow>()
      for (const e of rows('usage_events').filter((r) => r.school_id === schoolId)) {
        const key = `${e.event_type}|${e.school_level}|${e.category_id}`
        const s = summary.get(key) ?? {
          event_type: String(e.event_type),
          school_level: (e.school_level as string) ?? null,
          category_id: (e.category_id as string) ?? null,
          total: 0,
        }
        s.total++
        summary.set(key, s)
      }
      return [...summary.values()]
    },

    async addSchoolMember(schoolId, email, role) {
      const profile = rows('profiles').find((p) => String(p.email).toLowerCase() === email.trim().toLowerCase())
      if (!profile) throw { message: 'No account exists for that email' }
      const existing = rows('school_memberships').find((m) => m.school_id === schoolId && m.user_id === profile.id)
      if (existing) existing.role = role
      else rows('school_memberships').push({ id: newId(), school_id: schoolId, user_id: profile.id, role, created_at: new Date().toISOString() })
    },
  }
}
