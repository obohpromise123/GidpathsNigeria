import { Link, useParams } from 'react-router'
import { BulletList, CareerCard, CourseCard, Section } from '../components/content'
import { PageTitle } from '../components/layout/Logo'
import { Badge, GeneralInfoBadge } from '../components/ui/Badge'
import { Notice } from '../components/ui/Notice'
import { PageHeader } from '../components/ui/PageHeader'
import { useCatalog } from '../data/CatalogProvider'
import { categoryName, coursesForCareer, findCareer } from '../data/selectors'
import { DIMENSIONS } from '../lib/dimensions'
import NotFoundPage from './NotFoundPage'

export default function CareerDetailPage() {
  const { id } = useParams()
  const catalog = useCatalog()
  const career = findCareer(catalog, id)
  if (!career) return <NotFoundPage />

  const courses = coursesForCareer(catalog, career.id)
  const related = catalog.careers.filter((c) => c.published && c.category_id === career.category_id && c.id !== career.id).slice(0, 3)

  return (
    <>
      <PageTitle title={career.title} />
      <PageHeader
        eyebrow={categoryName(catalog, career.category_id)}
        title={career.title}
        actions={
          <>
            {career.interests.map((d) => (
              <Badge key={d} tone="teal">
                {DIMENSIONS[d]?.label ?? d}
              </Badge>
            ))}
          </>
        }
      >
        {career.summary}
      </PageHeader>
      <div className="container-page grid gap-10 py-10 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          <Section title="What the work involves" badge={<GeneralInfoBadge />}>
            <BulletList items={career.responsibilities} />
          </Section>
          <Section title="Useful skills and interests">
            <BulletList items={career.skills} />
          </Section>
          <Section title="Courses that can lead here">
            {courses.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {courses.map((c) => (
                  <CourseCard key={c.id} course={c} />
                ))}
              </div>
            ) : (
              <p>No courses linked yet.</p>
            )}
          </Section>
          <Section title="Other routes into this career">
            <p className="leading-relaxed">{career.alternative_routes}</p>
            <p className="mt-3 text-sm text-slate-500">
              Not every career needs the same route. Many people reach the same job through different courses, institutions or experience.
            </p>
          </Section>
          {related.length > 0 && (
            <Section title="Related careers">
              <div className="grid gap-4 sm:grid-cols-3">
                {related.map((c) => (
                  <CareerCard key={c.id} career={c} />
                ))}
              </div>
            </Section>
          )}
        </div>
        <aside className="space-y-6">
          <div className="rounded-[var(--radius-card)] border border-sand-200 bg-white p-6">
            <h2 className="text-lg">Where people work</h2>
            <div className="mt-3 text-sm">
              <BulletList items={career.work_environments} />
            </div>
          </div>
          <div className="rounded-[var(--radius-card)] bg-teal-50 p-6">
            <h2 className="text-lg">Start building skills now</h2>
            <div className="mt-3 text-sm text-teal-900">
              <BulletList items={career.start_now} />
            </div>
          </div>
          <Notice kind="info" title="Qualifications and licensing">
            {career.licensing} Rules can change — check with the relevant professional body.
          </Notice>
          <p className="text-xs leading-relaxed text-slate-500">
            We describe what this career generally involves. We cannot guarantee employment, income or professional status.{' '}
            <Link to="/terms" className="underline">
              Learn more
            </Link>
            .
          </p>
        </aside>
      </div>
    </>
  )
}
