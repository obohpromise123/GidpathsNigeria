import { useMemo } from 'react'
import { institutionTypeLabel } from '../components/AdmissionRecord'
import { CourseCard } from '../components/content'
import { FilterSelect, SearchBox } from '../components/FilterControls'
import { PageTitle } from '../components/layout/Logo'
import { Button } from '../components/ui/Button'
import { PageHeader } from '../components/ui/PageHeader'
import { EmptyState } from '../components/ui/States'
import { useCatalog } from '../data/CatalogProvider'
import type { DimensionId, InstitutionType } from '../data/types'
import { useUrlFilters } from '../features/useUrlFilters'
import { DIMENSION_IDS, DIMENSIONS } from '../lib/dimensions'
import { emptyCourseFilters, filterCourses } from '../lib/search'

const INSTITUTION_TYPES: InstitutionType[] = ['university', 'polytechnic', 'college_of_education', 'technical_college']
const DEFAULTS = { q: '', pathway: '', category: '', type: '', interest: '' }

export default function CoursesPage() {
  const catalog = useCatalog()
  const { filters, setFilter, clear, active } = useUrlFilters(DEFAULTS)

  const results = useMemo(
    () =>
      filterCourses(catalog, {
        ...emptyCourseFilters,
        query: filters.q,
        pathway: filters.pathway,
        category: filters.category,
        institutionType: filters.type as InstitutionType | '',
        interest: filters.interest as DimensionId | '',
      }),
    [catalog, filters],
  )

  return (
    <>
      <PageTitle title="Course explorer" />
      <PageHeader eyebrow="Course explorer" title="Find courses that fit you">
        Search {catalog.courses.filter((c) => c.published).length} courses offered at Nigerian universities, polytechnics, colleges of education and
        technical colleges.
      </PageHeader>
      <div className="container-page py-8">
        <div className="rounded-[var(--radius-card)] border border-sand-200 bg-white p-4 sm:p-5">
          <SearchBox value={filters.q} onChange={(v) => setFilter('q', v)} label="Search courses" placeholder="Search by course name or topic, e.g. “law” or “coding”" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <FilterSelect
              id="f-pathway"
              label="Subject pathway"
              allLabel="All pathways"
              value={filters.pathway}
              onChange={(v) => setFilter('pathway', v)}
              options={catalog.pathways.map((p) => ({ id: p.id, label: p.name }))}
            />
            <FilterSelect
              id="f-category"
              label="Career area"
              allLabel="All career areas"
              value={filters.category}
              onChange={(v) => setFilter('category', v)}
              options={catalog.categories.map((c) => ({ id: c.id, label: c.name }))}
            />
            <FilterSelect
              id="f-type"
              label="Institution type"
              allLabel="All institution types"
              value={filters.type}
              onChange={(v) => setFilter('type', v)}
              options={INSTITUTION_TYPES.map((t) => ({ id: t, label: institutionTypeLabel(t) }))}
            />
            <FilterSelect
              id="f-interest"
              label="Interest"
              allLabel="Any interest"
              value={filters.interest}
              onChange={(v) => setFilter('interest', v)}
              options={DIMENSION_IDS.map((d) => ({ id: d, label: DIMENSIONS[d].label }))}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-sm text-slate-600" aria-live="polite">
            Showing <strong>{results.length}</strong> course{results.length === 1 ? '' : 's'}
          </p>
          {active && (
            <Button variant="ghost" size="sm" onClick={clear}>
              Clear filters
            </Button>
          )}
        </div>

        {results.length ? (
          <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((c) => (
              <li key={c.id}>
                <CourseCard course={c} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4">
            <EmptyState title="No courses match those filters" action={<Button onClick={clear}>Clear filters</Button>}>
              Try a different word or remove a filter. Our library is still growing — if a course is missing, it may be added soon.
            </EmptyState>
          </div>
        )}
      </div>
    </>
  )
}
