import { useMemo } from 'react'
import { CareerCard } from '../components/content'
import { FilterSelect, SearchBox } from '../components/FilterControls'
import { PageTitle } from '../components/layout/Logo'
import { Button } from '../components/ui/Button'
import { PageHeader } from '../components/ui/PageHeader'
import { EmptyState } from '../components/ui/States'
import { useCatalog } from '../data/CatalogProvider'
import type { DimensionId } from '../data/types'
import { useUrlFilters } from '../features/useUrlFilters'
import { DIMENSION_IDS, DIMENSIONS } from '../lib/dimensions'
import { filterCareers } from '../lib/search'

const DEFAULTS = { q: '', category: '', interest: '' }

export default function CareersPage() {
  const catalog = useCatalog()
  const { filters, setFilter, clear, active } = useUrlFilters(DEFAULTS)
  const results = useMemo(
    () => filterCareers(catalog, { query: filters.q, category: filters.category, interest: filters.interest as DimensionId | '' }),
    [catalog, filters],
  )
  const category = catalog.categories.find((c) => c.id === filters.category)

  return (
    <>
      <PageTitle title="Career explorer" />
      <PageHeader eyebrow="Career explorer" title={category ? category.name : 'Explore careers'}>
        {category
          ? category.description
          : 'Learn what people in different careers actually do, the skills that help, and the different routes into each one.'}
      </PageHeader>
      <div className="container-page py-8">
        <div className="rounded-[var(--radius-card)] border border-sand-200 bg-white p-4 sm:p-5">
          <SearchBox value={filters.q} onChange={(v) => setFilter('q', v)} label="Search careers" placeholder="Search careers, e.g. “nurse” or “design”" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <FilterSelect
              id="f-category"
              label="Career area"
              allLabel="All career areas"
              value={filters.category}
              onChange={(v) => setFilter('category', v)}
              options={catalog.categories.map((c) => ({ id: c.id, label: c.name }))}
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
            Showing <strong>{results.length}</strong> career{results.length === 1 ? '' : 's'}
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
                <CareerCard career={c} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4">
            <EmptyState title="No careers match those filters" action={<Button onClick={clear}>Clear filters</Button>}>
              Try a different word or remove a filter.
            </EmptyState>
          </div>
        )}
      </div>
    </>
  )
}
