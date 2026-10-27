import { useParams } from 'react-router'
import { BulletList, CareerCard, CourseCard, Section, TagList } from '../components/content'
import { PageTitle } from '../components/layout/Logo'
import { GeneralInfoBadge } from '../components/ui/Badge'
import { ButtonLink } from '../components/ui/Button'
import { Notice } from '../components/ui/Notice'
import { PageHeader } from '../components/ui/PageHeader'
import { useCatalog } from '../data/CatalogProvider'
import { careersForCourse, coursesForPathway, findPathway } from '../data/selectors'
import { DIMENSIONS } from '../lib/dimensions'
import NotFoundPage from './NotFoundPage'

export default function PathwayDetailPage() {
  const { id } = useParams()
  const catalog = useCatalog()
  const pathway = findPathway(catalog, id)
  if (!pathway) return <NotFoundPage />

  const courses = coursesForPathway(catalog, pathway.id)
  const careers = [...new Map(courses.flatMap((c) => careersForCourse(catalog, c.id)).map((k) => [k.id, k])).values()]

  return (
    <>
      <PageTitle title={`${pathway.name} pathway`} />
      <PageHeader eyebrow="Subject pathway" title={pathway.name} actions={<GeneralInfoBadge />}>
        {pathway.summary}
      </PageHeader>
      <div className="container-page grid gap-10 py-10 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          <Section title="What this pathway involves">
            <p className="leading-relaxed">{pathway.overview}</p>
          </Section>
          <Section title="Subjects commonly taken">
            <TagList items={pathway.subjects} />
            <p className="mt-3 text-sm text-slate-500">Schools offer different combinations. Check what your school offers.</p>
          </Section>
          <Section title="Courses you could explore">
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
          <Section title="Careers connected with these courses">
            <div className="grid gap-4 sm:grid-cols-2">
              {careers.slice(0, 8).map((c) => (
                <CareerCard key={c.id} career={c} />
              ))}
            </div>
          </Section>
        </div>
        <aside className="space-y-6">
          <div className="rounded-[var(--radius-card)] border border-sand-200 bg-white p-6">
            <h2 className="text-lg">You might enjoy this if you like…</h2>
            <div className="mt-3">
              <BulletList items={pathway.interests.map((d) => DIMENSIONS[d]?.description ?? d)} />
            </div>
            <h2 className="mt-6 text-lg">Skills you’ll build</h2>
            <div className="mt-3">
              <BulletList items={pathway.skills} />
            </div>
          </div>
          <Notice kind="warning" title="Things to keep in mind">
            {pathway.limitations}
          </Notice>
          <Notice kind="tip" title="Other routes">
            {pathway.alternatives}
          </Notice>
          <ButtonLink to="/pathways" variant="secondary" className="w-full">
            Compare all pathways
          </ButtonLink>
        </aside>
      </div>
    </>
  )
}
