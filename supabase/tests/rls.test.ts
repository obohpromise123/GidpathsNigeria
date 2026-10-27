// @vitest-environment node
import type { PGlite } from '@electric-sql/pglite'
import { beforeAll, describe, expect, it } from 'vitest'
import { buildSeedCatalog } from '../../src/data/seed/index.ts'
import { fromFormValues, toFormValues } from '../../src/pages/admin/formModel.ts'
import { newRecordDefaults, RESOURCES } from '../../src/pages/admin/resources.tsx'
import { createTestDatabase, createUser, runAs, type Actor } from './harness.ts'

const anon: Actor = { role: 'anon' }
let db: PGlite
let admin: Actor, user: Actor, schoolAdminA: Actor, counsellorA: Actor, staffB: Actor
let schoolA: string, schoolB: string

const enquiry = (extra = '') => `
  insert into public.school_enquiries (school_name, contact_name, role_title, email, state, consent${extra ? ', status' : ''})
  values ('Test College', 'Ada Obi', 'Principal', 'ada@example.com', 'Lagos', true${extra ? `, '${extra}'` : ''})`

beforeAll(async () => {
  db = await createTestDatabase()
  admin = { role: 'authenticated', userId: await createUser(db, 'admin@example.com', { admin: true }) }
  user = { role: 'authenticated', userId: await createUser(db, 'someone@example.com') }
  schoolAdminA = { role: 'authenticated', userId: await createUser(db, 'head@school-a.ng') }
  counsellorA = { role: 'authenticated', userId: await createUser(db, 'counsellor@school-a.ng') }
  staffB = { role: 'authenticated', userId: await createUser(db, 'head@school-b.ng') }

  const a = await db.query<{ id: string }>(`insert into public.schools (name, join_code) values ('School A', 'AAAA1111') returning id`)
  const b = await db.query<{ id: string }>(`insert into public.schools (name, join_code) values ('School B', 'BBBB2222') returning id`)
  schoolA = a.rows[0].id
  schoolB = b.rows[0].id
  await runAs(db, admin, `select public.admin_add_school_member($1, 'head@school-a.ng', 'school_admin')`, [schoolA])
  await runAs(db, admin, `select public.admin_add_school_member($1, 'counsellor@school-a.ng', 'counsellor')`, [schoolA])
  await runAs(db, admin, `select public.admin_add_school_member($1, 'head@school-b.ng', 'school_admin')`, [schoolB])
})

describe('migrations and seed', () => {
  it('load the full sample catalog', async () => {
    const catalog = buildSeedCatalog()
    const count = async (t: string) => (await db.query<{ n: number }>(`select count(*)::int as n from public.${t}`)).rows[0].n
    expect(await count('courses')).toBe(catalog.courses.length)
    expect(await count('careers')).toBe(catalog.careers.length)
    expect(await count('course_careers')).toBe(catalog.courseCareers.length)
    expect(await count('admission_requirements')).toBe(catalog.admissions.length)
    expect(await count('quiz_options')).toBe(catalog.quizOptions.length)
  })

  it('seed contains no record claiming to be verified', async () => {
    const { rows } = await db.query(`select id from public.admission_requirements where verification_status = 'verified'`)
    expect(rows).toHaveLength(0)
  })

  it('can be re-run without errors or duplicates', async () => {
    const { readFileSync } = await import('node:fs')
    await db.exec(readFileSync(new URL('../seed.sql', import.meta.url), 'utf8'))
    const { rows } = await db.query<{ n: number }>(`select count(*)::int as n from public.courses`)
    expect(rows[0].n).toBe(buildSeedCatalog().courses.length)
  })
})

describe('anonymous visitors', () => {
  it('can read public content', async () => {
    const { rows } = await runAs(db, anon, `select id from public.courses where id = 'computer-science'`)
    expect(rows).toHaveLength(1)
  })

  it('cannot change content', async () => {
    await expect(runAs(db, anon, `insert into public.career_categories (id, name) values ('x', 'X')`)).rejects.toThrow()
    await expect(runAs(db, anon, `update public.courses set name = 'Hacked'`)).rejects.toThrow(/permission denied/)
  })

  it('can submit an enquiry but not read any', async () => {
    await runAs(db, anon, enquiry())
    await expect(runAs(db, anon, `select * from public.school_enquiries`)).rejects.toThrow(/permission denied/)
  })

  it('cannot pre-set an enquiry status', async () => {
    await expect(runAs(db, anon, enquiry('closed'))).rejects.toThrow(/row-level security/)
  })

  it('cannot see schools, profiles, usage or verification history', async () => {
    for (const t of ['schools', 'profiles', 'usage_events', 'verification_records', 'sponsorships']) {
      await expect(runAs(db, anon, `select * from public.${t}`), t).rejects.toThrow(/permission denied/)
    }
  })

  it('can record anonymous usage, linked to a school only with a valid code', async () => {
    await runAs(db, anon, `select public.record_usage_event('quiz_completed', 'ss2', 'technology', 'aaaa1111')`)
    await runAs(db, anon, `select public.record_usage_event('quiz_completed', 'not-a-level', 'nope', 'WRONGCODE')`)
    const { rows } = await db.query<{ school_id: string | null; school_level: string | null; category_id: string | null }>(
      `select school_id, school_level, category_id from public.usage_events order by id`,
    )
    expect(rows[0]).toEqual({ school_id: schoolA, school_level: 'ss2', category_id: 'technology' })
    expect(rows[1]).toEqual({ school_id: null, school_level: null, category_id: null })
  })

  it('cannot call the internal policy helpers through the public API schema', async () => {
    await expect(runAs(db, anon, `select public.is_admin()`)).rejects.toThrow(/does not exist/)
    await expect(runAs(db, user, `select public.shares_school_with($1)`, [(admin as { userId: string }).userId])).rejects.toThrow(
      /does not exist/,
    )
  })

  it('cannot call admin functions', async () => {
    await expect(runAs(db, anon, `select * from public.admin_usage_summary()`)).rejects.toThrow(/permission denied/)
  })

  it('does not see unpublished courses', async () => {
    await runAs(db, admin, `update public.courses set published = false where id = 'statistics'`)
    expect((await runAs(db, anon, `select id from public.courses where id = 'statistics'`)).rows).toHaveLength(0)
    expect((await runAs(db, admin, `select id from public.courses where id = 'statistics'`)).rows).toHaveLength(1)
    await runAs(db, admin, `update public.courses set published = true where id = 'statistics'`)
  })
})

describe('signed-in users without special roles', () => {
  it('cannot modify content (updates silently affect no rows)', async () => {
    const res = await runAs(db, user, `update public.courses set name = 'Hacked' where id = 'law'`)
    expect(res.affectedRows).toBe(0)
    await expect(runAs(db, user, `insert into public.careers (id, title, category_id) values ('x', 'X', 'technology')`)).rejects.toThrow(
      /row-level security/,
    )
  })

  it('cannot promote themselves to admin', async () => {
    await expect(runAs(db, user, `update public.profiles set platform_role = 'admin'`)).rejects.toThrow(/permission denied/)
  })

  it('can update their own display name only', async () => {
    const own = await runAs(db, user, `update public.profiles set display_name = 'Me'`)
    expect(own.affectedRows).toBe(1)
  })

  it('cannot read enquiries or other people’s profiles', async () => {
    expect((await runAs(db, user, `select * from public.school_enquiries`)).rows).toHaveLength(0)
    expect((await runAs(db, user, `select id from public.profiles`)).rows).toHaveLength(1)
  })

  it('cannot add themselves to a school', async () => {
    await expect(
      runAs(db, user, `insert into public.school_memberships (school_id, user_id, role) values ($1, $2, 'school_admin')`, [
        schoolA,
        (user as { userId: string }).userId,
      ]),
    ).rejects.toThrow(/row-level security/)
    await expect(runAs(db, user, `select public.admin_add_school_member($1, 'someone@example.com', 'school_admin')`, [schoolA])).rejects.toThrow(
      /Not authorised/,
    )
  })
})

describe('school staff', () => {
  it('see only their own school', async () => {
    const { rows } = await runAs<{ name: string }>(db, counsellorA, `select name from public.schools`)
    expect(rows.map((r) => r.name)).toEqual(['School A'])
  })

  it('see colleagues but not other schools’ staff', async () => {
    const { rows } = await runAs<{ email: string }>(db, counsellorA, `select email from public.profiles order by email`)
    expect(rows.map((r) => r.email)).toEqual(['counsellor@school-a.ng', 'head@school-a.ng'])
  })

  it('get aggregate participation for their school only', async () => {
    const { rows } = await runAs<{ total: number }>(db, counsellorA, `select * from public.school_participation_summary($1)`, [schoolA])
    expect(rows.length).toBeGreaterThan(0)
    await expect(runAs(db, staffB, `select * from public.school_participation_summary($1)`, [schoolA])).rejects.toThrow(/Not authorised/)
  })

  it('cannot read raw usage events', async () => {
    expect((await runAs(db, counsellorA, `select * from public.usage_events`)).rows).toHaveLength(0)
  })

  it('school admins can edit the school profile but not status or join code', async () => {
    const ok = await runAs(db, schoolAdminA, `update public.schools set state = 'Lagos' where id = $1`, [schoolA])
    expect(ok.affectedRows).toBe(1)
    await expect(runAs(db, schoolAdminA, `update public.schools set status = 'active' where id = $1`, [schoolA])).rejects.toThrow(
      /Only platform administrators/,
    )
    const other = await runAs(db, schoolAdminA, `update public.schools set state = 'Kano' where id = $1`, [schoolB])
    expect(other.affectedRows).toBe(0)
  })

  it('counsellors cannot edit the school profile', async () => {
    const res = await runAs(db, counsellorA, `update public.schools set state = 'Ogun' where id = $1`, [schoolA])
    expect(res.affectedRows).toBe(0)
  })

  it('can read but not change their subscription status', async () => {
    await runAs(db, admin, `insert into public.subscriptions (school_id, status) values ($1, 'trial')`, [schoolA])
    const { rows } = await runAs<{ status: string }>(db, schoolAdminA, `select status from public.subscriptions`)
    expect(rows.map((r) => r.status)).toEqual(['trial'])
    const res = await runAs(db, schoolAdminA, `update public.subscriptions set status = 'active'`)
    expect(res.affectedRows).toBe(0)
    expect((await runAs(db, staffB, `select * from public.subscriptions`)).rows).toHaveLength(0)
  })
})

describe('platform administrators', () => {
  it('can manage content', async () => {
    await runAs(db, admin, `insert into public.career_categories (id, name) values ('test-cat', 'Test category')`)
    const res = await runAs(db, admin, `delete from public.career_categories where id = 'test-cat'`)
    expect(res.affectedRows).toBe(1)
  })

  it('can read enquiries', async () => {
    const { rows } = await runAs(db, admin, `select * from public.school_enquiries`)
    expect(rows.length).toBeGreaterThan(0)
  })

  it('cannot mark a record verified without a source and date', async () => {
    await expect(
      runAs(db, admin, `update public.admission_requirements set verification_status = 'verified' where course_id = 'law' and institution_id is null`),
    ).rejects.toThrow(/admissions_verified_needs_source/)
  })

  it('verifying a record writes an audit entry with the reviewer', async () => {
    await runAs(
      db,
      admin,
      `update public.admission_requirements
         set verification_status = 'verified', source_id = 'jamb-ibass', last_verified_at = current_date
       where course_id = 'law' and institution_id is null`,
    )
    const { rows } = await runAs<{ previous_status: string; new_status: string; reviewer_id: string }>(
      db,
      admin,
      `select previous_status, new_status, reviewer_id from public.verification_records where new_status = 'verified'`,
    )
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ previous_status: 'unverified', reviewer_id: (admin as { userId: string }).userId })
  })

  it('cannot edit or delete verification history', async () => {
    await expect(runAs(db, admin, `delete from public.verification_records`)).rejects.toThrow(/permission denied/)
  })

  it('can view platform usage summary', async () => {
    const { rows } = await runAs<{ event_type: string; total: number }>(db, admin, `select * from public.admin_usage_summary()`)
    expect(rows.find((r) => r.event_type === 'quiz_completed')?.total).toBe(2)
  })
})

describe('admin forms', () => {
  // Every admin form must produce rows the real schema accepts (demo mode
  // has no constraints, so this is the only place a mismatch shows up).
  it.each(RESOURCES.map((def) => [def.key, def] as const))('%s: a minimal new record is accepted by the database', async (_key, def) => {
    const schools = (await db.query<Record<string, unknown>>(`select * from public.schools order by name`)).rows
    const lookups = { catalog: buildSeedCatalog(), schools }
    const values = toFormValues(def, newRecordDefaults(def), lookups)
    for (const f of def.fields) {
      if (f.type === 'select' && f.required && !values[f.name]) values[f.name] = f.options!(lookups)[0].id
      if (!f.required || f.type === 'select') continue
      if (f.type === 'email') values[f.name] = 'form-test@example.com'
      else if (f.type === 'url') values[f.name] = 'https://example.com'
      else if (['text', 'textarea'].includes(f.type)) values[f.name] = `Form test ${def.key} ${f.name}`
    }
    if ('admission_cycle' in values) values.admission_cycle = 'Form test' // avoid clashing with seeded general guidance
    const { row } = fromFormValues(def, values, true)
    const cols = Object.keys(row).join(', ')
    await runAs(db, admin, `insert into public.${def.table} (${cols}) select ${cols} from jsonb_populate_record(null::public.${def.table}, $1)`, [
      JSON.stringify(row),
    ])
  })
})

describe('saved quiz sessions', () => {
  it('are visible only to their owner', async () => {
    const owner = (user as { userId: string }).userId
    await runAs(db, user, `insert into public.quiz_sessions (user_id, school_level) values ($1, 'ss1')`, [owner])
    expect((await runAs(db, user, `select * from public.quiz_sessions`)).rows).toHaveLength(1)
    expect((await runAs(db, counsellorA, `select * from public.quiz_sessions`)).rows).toHaveLength(0)
    await expect(
      runAs(db, counsellorA, `insert into public.quiz_sessions (user_id) values ($1)`, [owner]),
    ).rejects.toThrow(/row-level security/)
  })
})
