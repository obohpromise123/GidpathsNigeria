import { zodResolver } from '@hookform/resolvers/zod'
import { Copy, Printer } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useAuth } from '../../auth/AuthProvider'
import { RequireRole } from '../../auth/RequireRole'
import { PageTitle } from '../../components/layout/Logo'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { describedBy, Field, Input, Select } from '../../components/ui/Form'
import { Notice } from '../../components/ui/Notice'
import { ErrorState, LoadingState } from '../../components/ui/States'
import { useCatalog } from '../../data/CatalogProvider'
import { friendlyError } from '../../data/errors'
import { getRepository, type Row, type SchoolSummaryRow } from '../../data/repository'
import type { SchoolRole } from '../../data/types'
import { isDemoMode } from '../../lib/config'
import { NIGERIAN_STATES } from '../../lib/nigeria'
import { SCHOOL_LEVELS } from '../../lib/onboarding'
import { buildParticipationReport, MIN_GROUP_SIZE } from '../../lib/participation'

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Enter the school name').max(200),
  state: z.string(),
  school_type: z.enum(['public', 'private', 'mission', 'other']),
  contact_email: z.string().trim().refine((v) => !v || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), 'Enter a valid email address'),
})
type ProfileForm = z.infer<typeof profileSchema>

const SUBSCRIPTION_LABEL: Record<string, string> = {
  none: 'No subscription',
  trial: 'Pilot / trial',
  active: 'Active',
  past_due: 'Payment overdue',
  cancelled: 'Cancelled',
}

interface SchoolData {
  school: Row
  members: Row[]
  profiles: Row[]
  subscriptions: Row[]
  summary: SchoolSummaryRow[]
}

async function loadSchool(schoolId: string): Promise<SchoolData> {
  const repo = await getRepository()
  const [schools, members, profiles, subscriptions, summary] = await Promise.all([
    repo.list('schools', { eq: { id: schoolId } }),
    repo.list('school_memberships', { eq: { school_id: schoolId } }),
    repo.list('profiles'),
    repo.list('subscriptions', { eq: { school_id: schoolId } }),
    repo.schoolSummary(schoolId),
  ])
  if (!schools[0]) throw new Error('not found')
  return { school: schools[0], members, profiles, subscriptions, summary }
}

function SchoolProfile({ school, canEdit, onSaved }: { school: Row; canEdit: boolean; onSaved: () => void }) {
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: String(school.name),
      state: String(school.state ?? ''),
      school_type: school.school_type as ProfileForm['school_type'],
      contact_email: String(school.contact_email ?? ''),
    },
  })

  const save = async (form: ProfileForm) => {
    setError(null)
    try {
      await (await getRepository()).update('schools', String(school.id), {
        name: form.name,
        state: form.state || null,
        school_type: form.school_type,
        contact_email: form.contact_email || null,
      })
      setEditing(false)
      onSaved()
    } catch (e) {
      setError(friendlyError(e))
    }
  }

  if (editing) {
    return (
      <form onSubmit={handleSubmit(save)} noValidate className="grid gap-4">
        <Field label="School name" htmlFor="s-name" required error={errors.name?.message}>
          <Input id="s-name" {...register('name')} {...describedBy('s-name', errors.name?.message)} />
        </Field>
        <Field label="State" htmlFor="s-state">
          <Select id="s-state" {...register('state')}>
            <option value="">Not set</option>
            {NIGERIAN_STATES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="School type" htmlFor="s-type" required>
          <Select id="s-type" {...register('school_type')}>
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="mission">Mission</option>
            <option value="other">Other</option>
          </Select>
        </Field>
        <Field label="Contact email" htmlFor="s-email" error={errors.contact_email?.message}>
          <Input id="s-email" type="email" {...register('contact_email')} {...describedBy('s-email', errors.contact_email?.message)} />
        </Field>
        {error && <Notice kind="error">{error}</Notice>}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setEditing(false)}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Save
          </Button>
        </div>
      </form>
    )
  }
  return (
    <>
      <dl className="grid gap-3 text-sm">
        {[
          ['Name', school.name],
          ['State', school.state ?? 'Not set'],
          ['Type', school.school_type],
          ['Contact email', school.contact_email ?? 'Not set'],
        ].map(([k, v]) => (
          <div key={String(k)} className="flex justify-between gap-4 border-b border-sand-200 pb-2">
            <dt className="text-slate-600">{String(k)}</dt>
            <dd className="text-right font-medium text-navy-900 capitalize">{String(v)}</dd>
          </div>
        ))}
      </dl>
      {canEdit && (
        <Button variant="secondary" size="sm" className="no-print mt-4" onClick={() => setEditing(true)}>
          Edit school profile
        </Button>
      )}
    </>
  )
}

function Bars({ items }: { items: { label: string; count: number | null }[] }) {
  const max = Math.max(1, ...items.map((i) => i.count ?? 0))
  return (
    <ul className="space-y-2.5">
      {items.map((i) => (
        <li key={i.label}>
          <div className="flex justify-between gap-3 text-sm">
            <span className="font-medium text-navy-900">{i.label}</span>
            <span className="shrink-0 whitespace-nowrap text-slate-600">{i.count === null ? `fewer than ${MIN_GROUP_SIZE}` : i.count}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-sand-200" aria-hidden>
            <div className="h-full rounded-full bg-teal-500" style={{ width: `${((i.count ?? 0) / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

function Dashboard() {
  const auth = useAuth()
  const catalog = useCatalog()
  const [adminSchools, setAdminSchools] = useState<Row[] | null>(null)
  const options = auth.memberships.length
    ? auth.memberships.map((m) => ({ id: m.school_id, name: m.school_name, role: m.role as SchoolRole | 'platform_admin' }))
    : (adminSchools ?? []).map((s) => ({ id: String(s.id), name: String(s.name), role: 'platform_admin' as const }))
  const [schoolId, setSchoolId] = useState<string | null>(null)
  const current = options.find((o) => o.id === schoolId) ?? options[0]
  const [data, setData] = useState<SchoolData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (auth.isAdmin && !auth.memberships.length) {
      void getRepository()
        .then((r) => r.list('schools', { order: 'name' }))
        .then(setAdminSchools)
        .catch((e) => setError(friendlyError(e)))
    }
  }, [auth.isAdmin, auth.memberships.length])

  const currentId = current?.id
  const load = useCallback(() => {
    if (!currentId) return
    setError(null)
    loadSchool(currentId)
      .then(setData)
      .catch((e) => setError(friendlyError(e)))
  }, [currentId])

  useEffect(load, [load])

  if (error) return <ErrorState message={error} onRetry={load} />
  if (auth.isAdmin && !auth.memberships.length && adminSchools?.length === 0) {
    return <ErrorState title="No schools yet" message="Create a school in the admin dashboard first." />
  }
  if (!current || !data || data.school.id !== current.id) return <LoadingState label="Loading your school…" />

  const report = buildParticipationReport(data.summary)
  const subscription = data.subscriptions[0]
  const canEdit = current.role === 'school_admin' || current.role === 'platform_admin'
  const levelLabel = (id: string) => SCHOOL_LEVELS.find((l) => l.id === id)?.label ?? id
  const categoryLabel = (id: string) => catalog.categories.find((c) => c.id === id)?.name ?? id
  const email = (userId: unknown) => String(data.profiles.find((p) => p.id === userId)?.email ?? 'Colleague')

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(String(data.school.join_code))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard can be blocked; the code is visible on screen anyway.
    }
  }

  return (
    <div className="container-page py-10">
      <PageTitle title="School dashboard" />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-wider text-teal-700 uppercase">School dashboard</p>
          <h1 className="mt-1 text-3xl">{String(data.school.name)}</h1>
          <p className="mt-1 text-slate-600">
            Signed in as {auth.email} ·{' '}
            {current.role === 'platform_admin' ? 'Platform administrator' : current.role === 'school_admin' ? 'School administrator' : 'Guidance counsellor'}
          </p>
        </div>
        <div className="no-print flex flex-wrap gap-2">
          {options.length > 1 && (
            <Select aria-label="Choose school" value={current.id} onChange={(e) => setSchoolId(e.target.value)} className="w-auto">
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </Select>
          )}
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer aria-hidden className="size-4" /> Print report
          </Button>
        </div>
      </div>

      {isDemoMode && (
        <Notice kind="warning" className="no-print mt-6">
          Demo mode: this is a fictional school and the participation figures are generated sample data.
        </Notice>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="text-lg">Student participation</h2>
          <p className="mt-1 text-sm text-slate-600">
            Anonymous totals from students who entered your school code and chose to share. You cannot see any individual student’s answers.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {[
              ['onboarding_completed', 'Started exploring'],
              ['quiz_completed', 'Completed the quiz'],
              ['roadmap_viewed', 'Created a roadmap'],
            ].map(([type, label]) => (
              <div key={type} className="rounded-2xl bg-sand-100 p-4">
                <p className="text-sm text-slate-600">{label}</p>
                <p className="mt-1 text-3xl font-extrabold text-navy-900">{report.totals[type] ?? 0}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-base">Quiz completions by class</h3>
              <div className="mt-3">
                {report.byLevel.length ? <Bars items={report.byLevel.map((l) => ({ label: levelLabel(l.level), count: l.count }))} /> : <p className="text-sm text-slate-500">No data yet.</p>}
              </div>
            </div>
            <div>
              <h3 className="text-base">Most-suggested career areas</h3>
              <div className="mt-3">
                {report.byCategory.length ? (
                  <Bars items={report.byCategory.slice(0, 6).map((c) => ({ label: categoryLabel(c.categoryId), count: c.count }))} />
                ) : (
                  <p className="text-sm text-slate-500">No data yet.</p>
                )}
              </div>
            </div>
          </div>
          {report.hiddenGroups > 0 && (
            <p className="mt-4 text-xs text-slate-500">
              To protect privacy, groups with fewer than {MIN_GROUP_SIZE} students are not shown as exact numbers.
            </p>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg">Your school code</h2>
            <p className="mt-1 text-sm text-slate-600">Share this with students at the start of a guidance session.</p>
            <div className="mt-3 flex items-center gap-2">
              <code className="rounded-xl bg-navy-900 px-4 py-2 font-mono text-xl font-bold tracking-widest text-white">{String(data.school.join_code)}</code>
              <Button variant="ghost" size="sm" onClick={() => void copyCode()} className="no-print">
                <Copy aria-hidden className="size-4" /> {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </Card>
          <Card>
            <h2 className="text-lg">Subscription</h2>
            <div className="mt-2">
              <Badge tone={subscription?.status === 'active' ? 'green' : 'neutral'}>{SUBSCRIPTION_LABEL[String(subscription?.status ?? 'none')]}</Badge>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {subscription
                ? `${String(subscription.plan)}${subscription.ends_on ? ` · until ${String(subscription.ends_on)}` : ''}`
                : 'No subscription has been recorded. Student guidance remains free. Contact us to discuss school programmes.'}
            </p>
          </Card>
        </div>

        <Card>
          <h2 className="text-lg">School profile</h2>
          <div className="mt-3">
            <SchoolProfile key={String(data.school.id)} school={data.school} canEdit={canEdit} onSaved={load} />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg">Authorised staff</h2>
          <ul className="mt-3 divide-y divide-sand-200 text-sm">
            {data.members.map((m) => (
              <li key={String(m.id)} className="flex justify-between gap-3 py-2">
                <span className="font-medium text-navy-900">{email(m.user_id)}</span>
                <span className="text-slate-600">{m.role === 'school_admin' ? 'Administrator' : 'Counsellor'}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">To add or remove staff, contact the platform team.</p>
        </Card>

        <Card>
          <h2 className="text-lg">Running a guidance session</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700">
            <li>Share the school code with the class.</li>
            <li>Students open the site, choose “Discover your path” and enter the code.</li>
            <li>Allow about 15 minutes for onboarding and the quiz.</li>
            <li>Discuss results in small groups; remind students suggestions are exploratory.</li>
            <li>Students print or download their roadmap for follow-up conversations.</li>
          </ol>
        </Card>
      </div>
    </div>
  )
}

export default function SchoolDashboard() {
  return (
    <RequireRole role="school">
      <Dashboard />
    </RequireRole>
  )
}
