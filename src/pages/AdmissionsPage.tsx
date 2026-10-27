import { ExternalLink } from 'lucide-react'
import { useMemo } from 'react'
import { AdmissionRecord } from '../components/AdmissionRecord'
import { FilterSelect } from '../components/FilterControls'
import { PageTitle } from '../components/layout/Logo'
import { GeneralInfoBadge, VERIFICATION_INFO, VerificationBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { PageHeader } from '../components/ui/PageHeader'
import { EmptyState } from '../components/ui/States'
import { useCatalog } from '../data/CatalogProvider'
import type { VerificationStatus } from '../data/types'
import { useUrlFilters } from '../features/useUrlFilters'

const DEFAULTS = { course: '', institution: '', status: '' }
const STATUSES: VerificationStatus[] = ['verified', 'unverified', 'sample']

const STEPS = [
  {
    title: 'O’Level results',
    text: 'Most courses ask for five credit passes (WAEC, NECO or NABTEB), usually including English Language and Mathematics, plus subjects relevant to the course. Some institutions only accept results from one sitting.',
  },
  {
    title: 'JAMB UTME',
    text: 'You register for the UTME with JAMB and write Use of English plus three subjects. The three subjects must match the combination required for the course you choose.',
  },
  {
    title: 'Institution screening',
    text: 'Many institutions run a post-UTME screening or other checks and set their own cut-off marks, which can change each year.',
  },
  {
    title: 'Other routes',
    text: 'Direct Entry (with qualifications such as A-Levels, JUPEB, IJMB, ND or NCE) can lead into the second year of some degrees. Polytechnics, colleges of education and technical colleges offer other routes.',
  },
]

export default function AdmissionsPage() {
  const catalog = useCatalog()
  const { filters, setFilter, clear, active } = useUrlFilters(DEFAULTS)

  const records = useMemo(
    () =>
      catalog.admissions
        .filter((a) => !filters.course || a.course_id === filters.course)
        .filter((a) => !filters.institution || (filters.institution === 'general' ? a.institution_id === null : a.institution_id === filters.institution))
        .filter((a) => !filters.status || a.verification_status === filters.status)
        .filter((a) => catalog.courses.some((c) => c.id === a.course_id && c.published))
        .sort((a, b) => {
          const name = (id: string) => catalog.courses.find((c) => c.id === id)?.name ?? ''
          return name(a.course_id).localeCompare(name(b.course_id))
        }),
    [catalog, filters],
  )
  const institutionsWithRecords = catalog.institutions.filter((i) => catalog.admissions.some((a) => a.institution_id === i.id))

  return (
    <>
      <PageTitle title="Admission guidance" />
      <PageHeader eyebrow="Admission guidance" title="Understand admission requirements">
        How admission to Nigerian higher institutions generally works, and what each course usually asks for — with clear labels showing what has and
        hasn’t been verified.
      </PageHeader>

      <div className="container-page py-10">
        <section aria-labelledby="how-admission">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="how-admission" className="text-2xl">
              How admission generally works
            </h2>
            <GeneralInfoBadge />
          </div>
          <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-[var(--radius-card)] border border-sand-200 bg-white p-5">
                <span className="text-sm font-bold text-teal-700">Step {i + 1}</span>
                <h3 className="mt-1 text-lg">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10 grid gap-4 rounded-[var(--radius-card)] bg-navy-900 p-6 text-white sm:p-8 lg:grid-cols-3" aria-labelledby="official">
          <div className="lg:col-span-2">
            <h2 id="official" className="text-xl text-white">
              The official source is JAMB IBASS
            </h2>
            <p className="mt-2 text-navy-200">
              JAMB’s Integrated Brochure and Syllabus System lists the UTME subjects and O’Level requirements for each course at each institution. Use it
              before you register for the UTME. We are not affiliated with JAMB.
            </p>
          </div>
          <div className="flex items-center lg:justify-end">
            <a
              href="https://ibass.jamb.gov.ng"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 font-semibold text-navy-900 hover:bg-teal-50"
            >
              Open JAMB IBASS <ExternalLink aria-hidden className="size-4" />
            </a>
          </div>
        </section>

        <section className="mt-10" aria-labelledby="labels">
          <h2 id="labels" className="text-xl">
            What the labels mean
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {STATUSES.map((s) => (
              <li key={s} className="rounded-2xl border border-sand-200 bg-white p-4">
                <VerificationBadge status={s} />
                <p className="mt-2 text-sm text-slate-600">{VERIFICATION_INFO[s].description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10" aria-labelledby="records">
          <h2 id="records" className="text-2xl">
            Admission records
          </h2>
          <div className="mt-4 grid gap-3 rounded-[var(--radius-card)] border border-sand-200 bg-white p-4 sm:grid-cols-3 sm:p-5">
            <FilterSelect
              id="a-course"
              label="Course"
              allLabel="All courses"
              value={filters.course}
              onChange={(v) => setFilter('course', v)}
              options={catalog.courses
                .filter((c) => c.published)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((c) => ({ id: c.id, label: c.name }))}
            />
            <FilterSelect
              id="a-institution"
              label="Institution"
              allLabel="All records"
              value={filters.institution}
              onChange={(v) => setFilter('institution', v)}
              options={[{ id: 'general', label: 'General guidance only' }, ...institutionsWithRecords.map((i) => ({ id: i.id, label: i.name }))]}
            />
            <FilterSelect
              id="a-status"
              label="Verification"
              allLabel="Any status"
              value={filters.status}
              onChange={(v) => setFilter('status', v)}
              options={STATUSES.map((s) => ({ id: s, label: VERIFICATION_INFO[s].label }))}
            />
          </div>
          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-sm text-slate-600" aria-live="polite">
              Showing <strong>{records.length}</strong> record{records.length === 1 ? '' : 's'}
            </p>
            {active && (
              <Button variant="ghost" size="sm" onClick={clear}>
                Clear filters
              </Button>
            )}
          </div>
          {records.length ? (
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {records.map((r) => (
                <AdmissionRecord key={r.id} record={r} showCourse />
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState title="No records match" action={<Button onClick={clear}>Clear filters</Button>}>
                {filters.status === 'verified'
                  ? 'No records have been verified yet. Our team is checking requirements against official sources.'
                  : 'Try removing a filter.'}
              </EmptyState>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
