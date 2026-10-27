import { Pencil, Plus, Trash } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router'
import { FilterSelect, SearchBox } from '../../components/FilterControls'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog, Modal } from '../../components/ui/Dialog'
import { Notice } from '../../components/ui/Notice'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States'
import { useReloadCatalog } from '../../data/CatalogProvider'
import { friendlyError } from '../../data/errors'
import { getRepository, type Row } from '../../data/repository'
import { isDemoMode } from '../../lib/config'
import { matchesQuery } from '../../lib/search'
import NotFoundPage from '../NotFoundPage'
import { AdminHeader, DataTable } from './AdminUi'
import { fromFormValues, toFormValues, type FormValues } from './formModel'
import { ResourceForm } from './ResourceForm'
import { newRecordDefaults, RESOURCE_BY_KEY } from './resources'
import { useLookups, useRows } from './useAdmin'

/** Keyed by resource so search and filters reset when switching tables. */
export default function ResourcePage() {
  const { resource } = useParams()
  return <ResourceManager key={resource} resource={resource} />
}

function ResourceManager({ resource }: { resource: string | undefined }) {
  const def = RESOURCE_BY_KEY.get(resource ?? '')
  const lookups = useLookups()
  const reloadCatalog = useReloadCatalog()
  const { rows, error, reload } = useRows(def?.table ?? null)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [editing, setEditing] = useState<{ row: Row; isNew: boolean } | null>(null)
  const [deleting, setDeleting] = useState<Row | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [message, setMessage] = useState<{ kind: 'tip' | 'error'; text: string } | null>(null)

  const visible = useMemo(() => {
    if (!rows || !def) return []
    return rows
      .filter((r) => Object.entries(filters).every(([k, v]) => !v || String(r[k]) === v))
      .filter((r) => matchesQuery(query, ...def.searchFields.map((f) => (r[f] === null ? '' : String(r[f] ?? '')))))
  }, [rows, def, filters, query])

  if (!def) return <NotFoundPage />
  if (error) return <ErrorState message={error} onRetry={() => void reload()} />
  if (!rows || !lookups) return <LoadingState label={`Loading ${def.title.toLowerCase()}…`} />

  const afterChange = async (text: string) => {
    await reload()
    if (def.catalogBacked) await reloadCatalog()
    setMessage({ kind: 'tip', text: isDemoMode ? `${text} (demo mode: this change is lost when you reload the page).` : `${text}.` })
  }

  const save = async (values: FormValues) => {
    if (!editing) return
    const { row, links } = fromFormValues(def, values, editing.isNew)
    const repo = await getRepository()
    const saved = editing.isNew ? await repo.insert(def.table, row) : await repo.update(def.table, String(editing.row.id), row)
    for (const link of links) await repo.setCourseLinks(link.table, String(saved.id), link.ids)
    setEditing(null)
    await afterChange(`Saved “${def.rowTitle(saved, lookups)}”`)
  }

  const confirmDelete = async () => {
    if (!deleting) return
    setDeleteBusy(true)
    try {
      await (await getRepository()).remove(def.table, String(deleting.id))
      const title = def.rowTitle(deleting, lookups)
      setDeleting(null)
      await afterChange(`Deleted “${title}”`)
    } catch (e) {
      setDeleting(null)
      setMessage({ kind: 'error', text: friendlyError(e) })
    } finally {
      setDeleteBusy(false)
    }
  }

  return (
    <>
      <title>{`${def.title} · Admin`}</title>
      <AdminHeader
        title={def.title}
        description={def.description}
        actions={
          <Button variant="accent" onClick={() => setEditing({ row: newRecordDefaults(def), isNew: true })}>
            <Plus aria-hidden className="size-4" /> Add {def.singular}
          </Button>
        }
      />

      {message && (
        <Notice kind={message.kind} className="mb-4">
          <span role="status">{message.text}</span>
        </Notice>
      )}

      <div className="mb-4 grid gap-3 rounded-[var(--radius-card)] border border-sand-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <p className="mb-1 text-xs font-semibold tracking-wide text-slate-600 uppercase">Search</p>
          <SearchBox value={query} onChange={setQuery} label={`Search ${def.title}`} placeholder={`Search ${def.title.toLowerCase()}`} />
        </div>
        {def.filters?.map((f) => (
          <FilterSelect
            key={f.name}
            id={`filter-${f.name}`}
            label={f.label}
            allLabel="All"
            value={filters[f.name] ?? ''}
            onChange={(v) => setFilters((prev) => ({ ...prev, [f.name]: v }))}
            options={f.options(lookups)}
          />
        ))}
      </div>

      <p className="mb-3 text-sm text-slate-600" aria-live="polite">
        {visible.length} of {rows.length} {rows.length === 1 ? def.singular : def.title.toLowerCase()}
      </p>

      {visible.length === 0 ? (
        <EmptyState
          title={rows.length ? 'Nothing matches your search' : `No ${def.title.toLowerCase()} yet`}
          action={
            rows.length === 0 && (
              <Button variant="accent" onClick={() => setEditing({ row: newRecordDefaults(def), isNew: true })}>
                <Plus aria-hidden className="size-4" /> Add the first {def.singular}
              </Button>
            )
          }
        />
      ) : (
        <DataTable head={[...def.columns.map((c) => c.label), '']}>
          {visible.map((row) => (
            <tr key={String(row.id)} className="hover:bg-sand-50">
              {def.columns.map((c) => (
                <td key={c.label} className="px-4 py-3 align-top">
                  {c.render(row, lookups)}
                </td>
              ))}
              <td className="px-4 py-2 text-right whitespace-nowrap">
                <Button variant="ghost" size="sm" onClick={() => setEditing({ row, isNew: false })} aria-label={`Edit ${def.rowTitle(row, lookups)}`}>
                  <Pencil aria-hidden className="size-4" /> Edit
                </Button>
                <Button variant="ghost" size="sm" className="text-red-700 hover:bg-red-50" onClick={() => setDeleting(row)} aria-label={`Delete ${def.rowTitle(row, lookups)}`}>
                  <Trash aria-hidden className="size-4" />
                </Button>
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      <Modal
        open={editing !== null}
        title={editing?.isNew ? `Add ${def.singular}` : `Edit ${editing ? def.rowTitle(editing.row, lookups) : ''}`}
        onClose={() => setEditing(null)}
        wide
      >
        {editing && (
          <ResourceForm
            key={String(editing.row.id ?? 'new')}
            def={def}
            initial={toFormValues(def, editing.row, lookups)}
            isNew={editing.isNew}
            lookups={lookups}
            onSave={save}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title={`Delete this ${def.singular}?`}
        confirmLabel="Delete permanently"
        danger
        busy={deleteBusy}
        onCancel={() => setDeleting(null)}
        onConfirm={() => void confirmDelete()}
      >
        <p>
          <strong>{deleting ? def.rowTitle(deleting, lookups) : ''}</strong> will be permanently deleted. This cannot be undone.
        </p>
        {def.catalogBacked && <p className="mt-2 text-sm">Students will no longer see it. Linked records (for example course links) may also be removed.</p>}
      </ConfirmDialog>
    </>
  )
}
