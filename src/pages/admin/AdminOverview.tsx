import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { Notice } from '../../components/ui/Notice'
import { useCatalog } from '../../data/CatalogProvider'
import { friendlyError } from '../../data/errors'
import { getRepository, type UsageSummaryRow } from '../../data/repository'
import { isDemoMode } from '../../lib/config'
import { AdminHeader } from './AdminUi'
import { useRows } from './useAdmin'

const EVENT_LABELS: Record<string, string> = {
  onboarding_completed: 'Onboarding completed',
  quiz_completed: 'Quizzes completed',
  roadmap_viewed: 'Roadmaps viewed',
}

function Stat({ label, value, to }: { label: string; value: number | string; to?: string }) {
  const body = (
    <>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-1 text-3xl font-extrabold text-navy-900">{value}</p>
    </>
  )
  return to ? (
    <Link to={to} className="block rounded-[var(--radius-card)] border border-sand-200 bg-white p-5 hover:border-teal-300">
      {body}
    </Link>
  ) : (
    <div className="rounded-[var(--radius-card)] border border-sand-200 bg-white p-5">{body}</div>
  )
}

export default function AdminOverview() {
  const catalog = useCatalog()
  const { rows: enquiries } = useRows('school_enquiries')
  const [usage, setUsage] = useState<UsageSummaryRow[] | null>(null)
  const [usageError, setUsageError] = useState<string | null>(null)

  useEffect(() => {
    getRepository()
      .then((r) => r.usageSummary())
      .then(setUsage)
      .catch((e) => setUsageError(friendlyError(e)))
  }, [])

  const admissions = catalog.admissions
  const byStatus = (s: string) => admissions.filter((a) => a.verification_status === s).length
  const verifiedPct = admissions.length ? Math.round((byStatus('verified') / admissions.length) * 100) : 0
  const newEnquiries = enquiries?.filter((e) => e.status === 'new').length ?? 0

  return (
    <>
      <title>Overview · Admin</title>
      <AdminHeader title="Overview" description="A summary of content, verification progress and school interest." />

      <h2 className="mb-3 text-lg">Content library</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Courses" value={catalog.courses.length} to="/admin/courses" />
        <Stat label="Careers" value={catalog.careers.length} to="/admin/careers" />
        <Stat label="Institutions" value={catalog.institutions.length} to="/admin/institutions" />
        <Stat label="Admission records" value={admissions.length} to="/admin/admissions" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg">Admission verification</h2>
          <p className="mt-1 text-sm text-slate-600">
            {verifiedPct}% of admission records are verified against an official source.
          </p>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-sand-200" aria-hidden>
            <div className="h-full bg-emerald-600" style={{ width: `${verifiedPct}%` }} />
          </div>
          <ul className="mt-4 flex flex-wrap gap-2 text-sm">
            <li>
              <Badge tone="green">Verified: {byStatus('verified')}</Badge>
            </li>
            <li>
              <Badge tone="sun">Verification required: {byStatus('unverified')}</Badge>
            </li>
            <li>
              <Badge tone="neutral">Sample: {byStatus('sample')}</Badge>
            </li>
          </ul>
          <Link to="/admin/verification" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:underline">
            Open the verification workflow <ArrowRight aria-hidden className="size-4" />
          </Link>
        </Card>

        <Card>
          <h2 className="text-lg">School enquiries</h2>
          <p className="mt-1 text-sm text-slate-600">
            {enquiries === null ? 'Loading…' : `${enquiries.length} total, ${newEnquiries} new.`}
          </p>
          <Link to="/admin/enquiries" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:underline">
            Manage enquiries <ArrowRight aria-hidden className="size-4" />
          </Link>
        </Card>
      </div>

      <h2 className="mt-10 mb-3 text-lg">Student usage (anonymous)</h2>
      {isDemoMode && (
        <Notice kind="warning" className="mb-4">
          Demo mode: these figures are generated sample data plus anything you do in this tab. They are not real usage.
        </Notice>
      )}
      {usageError ? (
        <Notice kind="error">{usageError}</Notice>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {['onboarding_completed', 'quiz_completed', 'roadmap_viewed'].map((type) => {
            const row = usage?.find((u) => u.event_type === type)
            return (
              <div key={type} className="rounded-[var(--radius-card)] border border-sand-200 bg-white p-5">
                <p className="text-sm font-medium text-slate-600">{EVENT_LABELS[type]}</p>
                <p className="mt-1 text-3xl font-extrabold text-navy-900">{usage ? (row?.total ?? 0) : '…'}</p>
                <p className="text-xs text-slate-500">{usage ? `${row?.last_30_days ?? 0} in the last 30 days` : ''}</p>
              </div>
            )
          })}
        </div>
      )}
      <p className="mt-3 text-xs text-slate-500">Counts contain no names, answers or device identifiers.</p>
    </>
  )
}
