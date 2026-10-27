import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { PageTitle } from '../components/layout/Logo'
import { GeneralInfoBadge } from '../components/ui/Badge'
import { Notice } from '../components/ui/Notice'
import { PageHeader } from '../components/ui/PageHeader'
import { useCatalog } from '../data/CatalogProvider'
import { coursesForPathway } from '../data/selectors'

export default function PathwaysPage() {
  const catalog = useCatalog()
  return (
    <>
      <PageTitle title="Subject pathways" />
      <PageHeader eyebrow="Subject pathways" title="Explore subject pathways">
        See what each pathway involves, the subjects it usually includes, and the courses and careers it can lead to.
      </PageHeader>
      <div className="container-page py-10">
        <Notice kind="tip" title="Pathways are a guide, not a cage">
          Course eligibility depends on your actual subject combination and on each institution’s requirements — not on the name of your class. Under
          Nigeria’s 2025 senior secondary curriculum, students can combine subjects across pathways more freely, though schools may still group them.
          Ask your school which combinations it offers.
        </Notice>
        <ul className="mt-8 grid gap-6 md:grid-cols-2">
          {catalog.pathways.map((p) => {
            const courses = coursesForPathway(catalog, p.id)
            return (
              <li key={p.id}>
                <Link
                  to={`/pathways/${p.id}`}
                  className="group flex h-full flex-col rounded-[var(--radius-card)] border border-sand-200 bg-white p-6 shadow-sm transition hover:border-teal-300 hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-2xl group-hover:text-teal-700">{p.name}</h2>
                    <GeneralInfoBadge />
                  </div>
                  <p className="mt-2 text-slate-600">{p.summary}</p>
                  <p className="mt-4 text-sm font-semibold text-navy-900">Common subjects</p>
                  <p className="mt-1 text-sm text-slate-600">{p.subjects.slice(0, 6).join(' · ')}…</p>
                  <p className="mt-4 text-sm text-slate-600">
                    <strong className="text-navy-900">{courses.length}</strong> courses in our library
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-semibold text-teal-700">
                    Explore {p.name} <ArrowRight aria-hidden className="size-4 transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}
