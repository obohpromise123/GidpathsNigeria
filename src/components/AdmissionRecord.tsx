import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router'
import { useCatalog } from '../data/CatalogProvider'
import { findCourse, institutionFor, sourceFor } from '../data/selectors'
import type { AdmissionRequirement } from '../data/types'
import { VERIFICATION_INFO, VerificationBadge } from './ui/Badge'

const INSTITUTION_TYPE_LABEL: Record<string, string> = {
  university: 'University',
  polytechnic: 'Polytechnic',
  college_of_education: 'College of Education',
  technical_college: 'Technical College',
  other: 'Other institution',
}
export const institutionTypeLabel = (t: string) => INSTITUTION_TYPE_LABEL[t] ?? t

const VERIFY = <span className="font-semibold text-sun-700">Verification required</span>

function formatDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString('en-NG', { dateStyle: 'medium' }) : null
}

export function AdmissionRecord({ record, showCourse = false }: { record: AdmissionRequirement; showCourse?: boolean }) {
  const catalog = useCatalog()
  const institution = institutionFor(catalog, record.institution_id)
  const source = sourceFor(catalog, record.source_id)
  const course = findCourse(catalog, record.course_id)
  const verified = record.verification_status === 'verified'

  return (
    <article className="print-break-avoid rounded-2xl border border-sand-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {showCourse && course && (
            <Link to={`/courses/${course.id}`} className="text-lg font-bold text-navy-900 hover:text-teal-700">
              {course.name}
            </Link>
          )}
          <p className={showCourse ? 'text-sm font-semibold text-slate-600' : 'font-bold text-navy-900'}>
            {institution ? (
              <>
                {institution.name} · {institutionTypeLabel(institution.type)}
              </>
            ) : (
              'General guidance — not specific to any one institution'
            )}
          </p>
          <p className="text-sm text-slate-500">Admission cycle: {record.admission_cycle ?? (institution ? VERIFY : 'Not tied to a cycle')}</p>
        </div>
        <VerificationBadge status={record.verification_status} />
      </div>

      <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-navy-900">O’Level requirements</dt>
          <dd className="mt-1 leading-relaxed text-slate-700">{record.olevel_requirements ?? VERIFY}</dd>
        </div>
        <div>
          <dt className="font-semibold text-navy-900">JAMB UTME subjects</dt>
          <dd className="mt-1 text-slate-700">
            {record.utme_subjects.length ? (
              <ul className="list-disc space-y-0.5 pl-5">
                {record.utme_subjects.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            ) : (
              VERIFY
            )}
          </dd>
        </div>
        {record.direct_entry && (
          <div className="sm:col-span-2">
            <dt className="font-semibold text-navy-900">Direct entry</dt>
            <dd className="mt-1 text-slate-700">{record.direct_entry}</dd>
          </div>
        )}
      </dl>

      {record.notes && <p className="mt-4 rounded-xl bg-sand-100 p-3 text-sm leading-relaxed text-slate-700">{record.notes}</p>}

      <p className="mt-4 text-xs text-slate-500">
        {verified && source ? (
          <>
            Source:{' '}
            {source.url ? (
              <a href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-teal-700 underline">
                {source.title} <ExternalLink aria-hidden className="size-3" />
              </a>
            ) : (
              source.title
            )}{' '}
            · Last verified {formatDate(record.last_verified_at)}
          </>
        ) : (
          <>
            {VERIFICATION_INFO[record.verification_status].description} Check{' '}
            <a href="https://ibass.jamb.gov.ng" target="_blank" rel="noreferrer" className="font-semibold text-teal-700 underline">
              JAMB IBASS
            </a>{' '}
            and the institution’s official website.
          </>
        )}
      </p>
    </article>
  )
}
