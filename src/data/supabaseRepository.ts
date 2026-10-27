import { getSupabase } from '../lib/supabase'
import type { Catalog } from './types'
import { CATALOG_TABLES, type Repository, type Row } from './repository'

const ORDERED = new Set(['career_categories', 'subject_pathways', 'quiz_questions', 'quiz_options'])

export async function createSupabaseRepository(): Promise<Repository> {
  const db = await getSupabase()
  if (!db) throw new Error('Supabase is not configured')

  const check = <T>(res: { data: T; error: unknown }): T => {
    if (res.error) throw res.error
    return res.data
  }

  return {
    mode: 'live',

    async loadCatalog() {
      const entries = await Promise.all(
        (Object.entries(CATALOG_TABLES) as [keyof Catalog, string][]).map(async ([key, table]) => {
          let q = db.from(table).select('*')
          if (ORDERED.has(table)) q = q.order('sort_order')
          return [key, check(await q)] as const
        }),
      )
      return Object.fromEntries(entries) as unknown as Catalog
    },

    async list(table, options = {}) {
      let q = db.from(table).select('*')
      for (const [col, value] of Object.entries(options.eq ?? {})) q = q.eq(col, value)
      if (options.order) q = q.order(options.order, { ascending: options.ascending ?? true })
      return check(await q) as Row[]
    },

    async insert(table, row) {
      return check(await db.from(table).insert(row).select().single()) as Row
    },

    async update(table, id, patch) {
      const data = check(await db.from(table).update(patch).eq('id', id).select())
      // RLS hides rows you may not change, which shows up as "0 rows updated".
      if (!data || data.length === 0) throw { code: '42501' }
      return data[0] as Row
    },

    async remove(table, id) {
      const data = check(await db.from(table).delete().eq('id', id).select('id'))
      if (!data || data.length === 0) throw { code: '42501' }
    },

    async setCourseLinks(table, courseId, ids) {
      const column = table === 'course_pathways' ? 'pathway_id' : 'career_id'
      check(await db.from(table).delete().eq('course_id', courseId))
      if (ids.length) check(await db.from(table).insert(ids.map((id) => ({ course_id: courseId, [column]: id }))))
    },

    async submitEnquiry(input) {
      // No .select(): the public may write enquiries but not read them back.
      check(await db.from('school_enquiries').insert(input))
    },

    async recordUsage(event, schoolLevel, categoryId, schoolCode) {
      check(
        await db.rpc('record_usage_event', {
          p_event_type: event,
          p_school_level: schoolLevel,
          p_category_id: categoryId,
          p_school_code: schoolCode,
        }),
      )
    },

    async lookupSchoolCode(code) {
      return (check(await db.rpc('lookup_school_code', { p_code: code })) as string | null) ?? null
    },

    async usageSummary() {
      return check(await db.rpc('admin_usage_summary')) as never
    },

    async schoolSummary(schoolId) {
      return check(await db.rpc('school_participation_summary', { p_school_id: schoolId })) as never
    },

    async addSchoolMember(schoolId, email, role) {
      check(await db.rpc('admin_add_school_member', { p_school_id: schoolId, p_email: email, p_role: role }))
    },
  }
}
