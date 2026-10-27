import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router'
import { VerificationBadge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States'
import { useCatalog } from '../../data/CatalogProvider'
import type { VerificationStatus } from '../../data/types'
import { AdminHeader, DataTable } from './AdminUi'
import { useRows } from './useAdmin'

const STEPS = [
  'Open the official source: JAMB IBASS (ibass.jamb.gov.ng) for UTME subjects and O’Level requirements, or the institution’s official website.',
  'Find the exact institution, programme and admission year. Requirements for one institution must never be copied to another.',
  'If the source is not yet in the Sources list, add it (with its web address and the date you accessed it).',
  'Edit the admission record: update the O’Level requirements, UTME subjects, cycle and notes exactly as the source states.',
  'Set the status to “Verified”, choose the source and enter today’s date. The system will not accept “Verified” without both.',
  'If the source does not confirm the information, keep or set the status to “Verification required” and explain why in the notes.',
  'Repeat at the start of every admission cycle — JAMB and institutions can change requirements each year.',
]

const TABLE_LABEL: Record<string, string> = {
  admission_requirements: 'Admission requirement',
  institutions: 'Institution',
  institution_programmes: 'Programme',
}

export default function VerificationPage() {
  const catalog = useCatalog()
  const { rows: history, error, reload } = useRows('verification_records', { order: 'created_at', ascending: false })
  const { rows: profiles } = useRows('profiles')

  const pending = {
    admissions: catalog.admissions.filter((a) => a.verification_status === 'unverified').length,
    institutions: catalog.institutions.filter((i) => i.verification_status === 'unverified').length,
    programmes: catalog.programmes.filter((p) => p.verification_status === 'unverified').length,
  }

  const describe = (table: string, id: string) => {
    if (table === 'admission_requirements') {
      const a = catalog.admissions.find((x) => x.id === id)
      if (!a) return 'Deleted record'
      const course = catalog.courses.find((c) => c.id === a.course_id)?.name ?? a.course_id
      const inst = a.institution_id ? catalog.institutions.find((i) => i.id === a.institution_id)?.name : 'general guidance'
      return `${course} — ${inst}`
    }
    if (table === 'institutions') return catalog.institutions.find((i) => i.id === id)?.name ?? 'Deleted record'
    const p = catalog.programmes.find((x) => x.id === id)
    return p ? `${catalog.courses.find((c) => c.id === p.course_id)?.name} at ${catalog.institutions.find((i) => i.id === p.institution_id)?.name}` : 'Deleted record'
  }

  return (
    <>
      <title>Verification · Admin</title>
      <AdminHeader title="Verification workflow" description="Keep admission information accurate and traceable to official sources." />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Admission records needing verification', n: pending.admissions, to: '/admin/admissions' },
          { label: 'Institutions needing verification', n: pending.institutions, to: '/admin/institutions' },
          { label: 'Programmes needing verification', n: pending.programmes, to: '/admin/programmes' },
        ].map((s) => (
          <Link key={s.label} to={s.to} className="rounded-[var(--radius-card)] border border-sand-200 bg-white p-5 hover:border-teal-300">
            <p className="text-sm font-medium text-slate-600">{s.label}</p>
            <p className="mt-1 text-3xl font-extrabold text-navy-900">{s.n}</p>
          </Link>
        ))}
      </div>

      <Card className="mt-6">
        <h2 className="text-lg">How to verify a record</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-700 marker:font-bold marker:text-teal-700">
          {STEPS.map((s) => (
            <li key={s} className="pl-1">
              {s}
            </li>
          ))}
        </ol>
        <a
          href="https://ibass.jamb.gov.ng"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 underline"
        >
          Open JAMB IBASS <ExternalLink aria-hidden className="size-3.5" />
        </a>
      </Card>

      <h2 className="mt-10 mb-3 text-lg">Verification history</h2>
      <p className="mb-3 text-sm text-slate-600">Recorded automatically whenever a status or verification date changes. History cannot be edited.</p>
      {error ? (
        <ErrorState message={error} onRetry={() => void reload()} />
      ) : !history ? (
        <LoadingState label="Loading history…" />
      ) : history.length === 0 ? (
        <EmptyState title="No verification changes yet">Changes will appear here once records are reviewed.</EmptyState>
      ) : (
        <DataTable head={['When', 'Record', 'Change', 'Source', 'Reviewer']}>
          {history.slice(0, 100).map((h) => (
            <tr key={String(h.id)}>
              <td className="px-4 py-3 whitespace-nowrap">{new Date(String(h.created_at)).toLocaleString('en-NG')}</td>
              <td className="px-4 py-3">
                <span className="block text-xs text-slate-500">{TABLE_LABEL[String(h.record_table)]}</span>
                {describe(String(h.record_table), String(h.record_id))}
              </td>
              <td className="px-4 py-3">
                <span className="flex flex-wrap items-center gap-1.5">
                  {h.previous_status ? <VerificationBadge status={h.previous_status as VerificationStatus} /> : <span className="text-xs">Created</span>}
                  <span aria-hidden>→</span>
                  <VerificationBadge status={h.new_status as VerificationStatus} />
                </span>
              </td>
              <td className="px-4 py-3">{catalog.sources.find((s) => s.id === h.source_id)?.title ?? '—'}</td>
              <td className="px-4 py-3">{String(profiles?.find((p) => p.id === h.reviewer_id)?.email ?? '—')}</td>
            </tr>
          ))}
        </DataTable>
      )}
    </>
  )
}
