import { describe, expect, it } from 'vitest'
import { createDemoRepository } from './demoRepository'
import { DEMO_SCHOOL_CODE, DEMO_SCHOOL_ID } from './demoUsers'

describe('demo repository', () => {
  it('loads the full sample catalog', async () => {
    const catalog = await createDemoRepository().loadCatalog()
    expect(catalog.courses.length).toBeGreaterThan(20)
  })

  it('refuses to mark a record verified without source and date, like the database', async () => {
    const repo = createDemoRepository()
    const [first] = await repo.list('admission_requirements')
    await expect(repo.update('admission_requirements', String(first.id), { verification_status: 'verified' })).rejects.toMatchObject({
      message: 'verified_needs_source',
    })
  })

  it('logs verification changes', async () => {
    const repo = createDemoRepository()
    const [first] = await repo.list('admission_requirements')
    await repo.update('admission_requirements', String(first.id), { verification_status: 'verified', source_id: 'jamb-ibass', last_verified_at: '2026-10-23' })
    const history = await repo.list('verification_records')
    expect(history[0]).toMatchObject({ previous_status: 'unverified', new_status: 'verified', record_id: first.id })
  })

  it('links usage to the demo school only with the right code', async () => {
    const repo = createDemoRepository()
    const before = (await repo.schoolSummary(DEMO_SCHOOL_ID)).reduce((n, r) => n + r.total, 0)
    await repo.recordUsage('quiz_completed', 'ss1', 'health', DEMO_SCHOOL_CODE.toLowerCase())
    await repo.recordUsage('quiz_completed', 'ss1', 'health', 'WRONG')
    const after = (await repo.schoolSummary(DEMO_SCHOOL_ID)).reduce((n, r) => n + r.total, 0)
    expect(after - before).toBe(1)
    expect(await repo.lookupSchoolCode('demo2026')).toMatch(/Demo Secondary School/)
    expect(await repo.lookupSchoolCode('nope')).toBeNull()
  })

  it('does not share state between instances (each page load starts fresh)', async () => {
    const a = createDemoRepository()
    await a.submitEnquiry({ school_name: 'X', contact_name: 'Y', role_title: 'Z', email: 'a@b.co', phone: null, state: 'Lagos', student_count: null, message: null, consent: true })
    expect(await a.list('school_enquiries')).toHaveLength(1)
    expect(await createDemoRepository().list('school_enquiries')).toHaveLength(0)
  })
})
