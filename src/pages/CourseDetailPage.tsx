import { Clock, ExternalLink } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { AdmissionRecord, institutionTypeLabel } from '../components/AdmissionRecord'
import { BulletList, CareerCard, CategoryIcon, Section, TagList } from '../components/content'
import { PageTitle } from '../components/layout/Logo'
import { Badge, GeneralInfoBadge, VerificationBadge } from '../components/ui/Badge'
import { Notice } from '../components/ui/Notice'
import { PageHeader } from '../components/ui/PageHeader'
import { useCatalog } from '../data/CatalogProvider'
import { admissionsForCourse, careersForCourse, categoryName, findCourse, institutionFor, pathwaysForCourse } from '../data/selectors'
import NotFoundPage from './NotFoundPage'

export default function CourseDetailPage() {
  const { id } = useParams()
  const catalog = useCatalog()
  const course = findCourse(catalog, id)
  if (!course) return <NotFoundPage />

  const careers = careersForCourse(catalog, course.id)
  const pathways = pathwaysForCourse(catalog, course.id)
  const admissions = admissionsForCourse(catalog, course.id)
  const programmes = catalog.programmes.filter((p) => p.course_id === course.id)

  return (
    <>
      <PageTitle title={course.name} />
      <PageHeader
        eyebrow={categoryName(catalog, course.category_id)}
        title={course.name}
        actions={
          <>
            {pathways.map((p) => (
              <Link key={p.id} to={`/pathways/${p.id}`}>
                <Badge tone="teal">{p.name} pathway</Badge>
              </Link>
            ))}
            {course.institution_types.map((t) => (
              <Badge key={t} tone="navy">
                {institutionTypeLabel(t)}
              </Badge>
            ))}
          </>
        }
      >
        {course.summary}
      </PageHeader>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          <Section title="About this course" badge={<GeneralInfoBadge />}>
            <p className="leading-relaxed">{course.description}</p>
            {course.typical_duration && (
              <p className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                <Clock aria-hidden className="size-4" /> {course.typical_duration} Durations vary by institution.
              </p>
            )}
          </Section>

          <Section title="What students typically learn">
            <BulletList items={course.what_you_learn} />
          </Section>

          <Section title="Helpful subjects and skills" badge={<GeneralInfoBadge />}>
            <TagList items={course.helpful_subjects} />
            <p className="mt-3 text-sm text-slate-500">
              These subjects are commonly useful for this course. They are not official admission requirements — see the admission section below.
            </p>
          </Section>

          <Section title="Careers this course can lead to">
            {careers.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {careers.map((c) => (
                  <CareerCard key={c.id} career={c} />
                ))}
              </div>
            ) : (
              <p>No careers linked yet.</p>
            )}
            <p className="mt-3 text-sm text-slate-500">A course can lead to many careers, including ones not listed here. No course guarantees a job.</p>
          </Section>

          <Section title="Admission requirements" id="admission">
            <Notice kind="warning" className="mb-4">
              Requirements differ between institutions and change between admission cycles. One institution’s requirements do not apply to another.
              Always confirm on{' '}
              <a href="https://ibass.jamb.gov.ng" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold underline">
                JAMB IBASS <ExternalLink aria-hidden className="size-3.5" />
              </a>{' '}
              and the institution’s official website.
            </Notice>
            {admissions.length ? (
              <div className="space-y-4">
                {admissions.map((a) => (
                  <AdmissionRecord key={a.id} record={a} />
                ))}
              </div>
            ) : (
              <p className="font-semibold text-sun-700">Verification required — no admission information has been added for this course yet.</p>
            )}
          </Section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[var(--radius-card)] border border-sand-200 bg-white p-6">
            <h2 className="flex items-center gap-2 text-lg">
              <CategoryIcon id={course.category_id} className="size-5 text-teal-600" /> Where graduates work
            </h2>
            <div className="mt-3 text-sm">
              <BulletList items={course.workplaces} />
            </div>
            <h2 className="mt-6 text-lg">Skills you may develop</h2>
            <div className="mt-3 text-sm">
              <BulletList items={course.skills} />
            </div>
            <h2 className="mt-6 text-lg">Further study and professional qualifications</h2>
            <div className="mt-3 text-sm">
              <BulletList items={course.further_study} />
            </div>
          </div>

          <div className="rounded-[var(--radius-card)] border border-sand-200 bg-white p-6">
            <h2 className="text-lg">Institutions in our records</h2>
            {programmes.length ? (
              <ul className="mt-3 space-y-3 text-sm">
                {programmes.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-navy-900">
                      {institutionFor(catalog, p.institution_id)?.name ?? 'Unknown institution'}
                      {p.award && <span className="text-slate-500"> · {p.award}</span>}
                    </span>
                    <VerificationBadge status={p.verification_status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-600">
                No institution offerings have been verified for this course yet. Use JAMB IBASS to see which institutions offer it.
              </p>
            )}
          </div>
        </aside>
      </div>
    </>
  )
}
