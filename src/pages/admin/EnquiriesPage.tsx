import { Mail, Phone, Trash } from 'lucide-react'
import { useState } from 'react'
import { FilterSelect } from '../../components/FilterControls'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/Dialog'
import { Select, Textarea } from '../../components/ui/Form'
import { Notice } from '../../components/ui/Notice'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States'
import { friendlyError } from '../../data/errors'
import { getRepository, type Row } from '../../data/repository'
import type { EnquiryStatus } from '../../data/types'
import { isDemoMode } from '../../lib/config'
import { AdminHeader } from './AdminUi'
import { useRows } from './useAdmin'

const STATUSES: { id: EnquiryStatus; label: string }[] = [
  { id: 'new', label: 'New' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'demo_scheduled', label: 'Demo scheduled' },
  { id: 'closed', label: 'Closed' },
]

function EnquiryCard({ enquiry, onChanged, onDelete }: { enquiry: Row; onChanged: (msg: string) => void; onDelete: () => void }) {
  const [status, setStatus] = useState(String(enquiry.status))
  const [notes, setNotes] = useState(String(enquiry.admin_notes ?? ''))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dirty = status !== enquiry.status || notes !== String(enquiry.admin_notes ?? '')

  const save = async () => {
    setBusy(true)
    setError(null)
    try {
      await (await getRepository()).update('school_enquiries', String(enquiry.id), { status, admin_notes: notes.trim() || null })
      onChanged(`Updated enquiry from ${String(enquiry.school_name)}`)
    } catch (e) {
      setError(friendlyError(e))
    } finally {
      setBusy(false)
    }
  }

  const id = String(enquiry.id)
  return (
    <article className="rounded-[var(--radius-card)] border border-sand-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg">{String(enquiry.school_name)}</h2>
          <p className="text-sm text-slate-600">
            {String(enquiry.contact_name)} · {String(enquiry.role_title)} · {String(enquiry.state)}
            {enquiry.student_count ? ` · ${String(enquiry.student_count)} students` : ''}
          </p>
          <p className="mt-1 text-xs text-slate-500">Received {new Date(String(enquiry.created_at)).toLocaleString('en-NG')}</p>
        </div>
        <Badge tone={enquiry.status === 'new' ? 'sun' : enquiry.status === 'closed' ? 'neutral' : 'teal'}>
          {STATUSES.find((s) => s.id === enquiry.status)?.label ?? String(enquiry.status)}
        </Badge>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-sm">
        <a href={`mailto:${String(enquiry.email)}`} className="inline-flex items-center gap-1.5 font-semibold text-teal-700 underline">
          <Mail aria-hidden className="size-4" /> {String(enquiry.email)}
        </a>
        {Boolean(enquiry.phone) && (
          <a href={`tel:${String(enquiry.phone)}`} className="inline-flex items-center gap-1.5 font-semibold text-teal-700 underline">
            <Phone aria-hidden className="size-4" /> {String(enquiry.phone)}
          </a>
        )}
      </div>
      {Boolean(enquiry.message) && <p className="mt-3 rounded-xl bg-sand-100 p-3 text-sm whitespace-pre-line">{String(enquiry.message)}</p>}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor={`status-${id}`} className="mb-1 block text-xs font-semibold tracking-wide text-slate-600 uppercase">
            Status
          </label>
          <Select id={`status-${id}`} value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`notes-${id}`} className="mb-1 block text-xs font-semibold tracking-wide text-slate-600 uppercase">
            Internal notes
          </label>
          <Textarea id={`notes-${id}`} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-11" />
        </div>
      </div>
      {error && (
        <Notice kind="error" className="mt-3">
          {error}
        </Notice>
      )}
      <div className="mt-4 flex justify-between gap-3">
        <Button variant="ghost" size="sm" className="text-red-700 hover:bg-red-50" onClick={onDelete}>
          <Trash aria-hidden className="size-4" /> Delete
        </Button>
        <Button variant="primary" size="sm" onClick={() => void save()} disabled={!dirty} loading={busy}>
          Save
        </Button>
      </div>
    </article>
  )
}

export default function EnquiriesPage() {
  const { rows, error, reload } = useRows('school_enquiries', { order: 'created_at', ascending: false })
  const [filter, setFilter] = useState('')
  const [deleting, setDeleting] = useState<Row | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ kind: 'tip' | 'error'; text: string } | null>(null)

  if (error) return <ErrorState message={error} onRetry={() => void reload()} />
  if (!rows) return <LoadingState label="Loading enquiries…" />
  const visible = rows.filter((r) => !filter || r.status === filter)

  const done = async (text: string) => {
    await reload()
    setMessage({ kind: 'tip', text })
  }

  return (
    <>
      <title>Enquiries · Admin</title>
      <AdminHeader title="School enquiries" description="Requests for demonstrations submitted from the For Schools page." />
      {isDemoMode && (
        <Notice kind="warning" className="mb-4">
          Demo mode: only enquiries submitted in this browser tab appear here. Nothing has been emailed or stored on a server.
        </Notice>
      )}
      {message && (
        <Notice kind={message.kind} className="mb-4">
          <span role="status">{message.text}</span>
        </Notice>
      )}
      <div className="mb-4 max-w-xs">
        <FilterSelect id="enq-status" label="Status" allLabel="All statuses" value={filter} onChange={setFilter} options={STATUSES} />
      </div>
      {visible.length === 0 ? (
        <EmptyState title={rows.length ? 'No enquiries with this status' : 'No enquiries yet'}>
          {rows.length ? null : 'When a school submits the enquiry form, it will appear here.'}
        </EmptyState>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {visible.map((e) => (
            <EnquiryCard key={String(e.id)} enquiry={e} onChanged={(t) => void done(t)} onDelete={() => setDeleting(e)} />
          ))}
        </div>
      )}
      <ConfirmDialog
        open={deleting !== null}
        title="Delete this enquiry?"
        confirmLabel="Delete permanently"
        danger
        busy={busy}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return
          setBusy(true)
          try {
            await (await getRepository()).remove('school_enquiries', String(deleting.id))
            setDeleting(null)
            await done('Enquiry deleted')
          } catch (e) {
            setDeleting(null)
            setMessage({ kind: 'error', text: friendlyError(e) })
          } finally {
            setBusy(false)
          }
        }}
      >
        The enquiry from <strong>{String(deleting?.school_name ?? '')}</strong> and its contact details will be permanently deleted.
      </ConfirmDialog>
    </>
  )
}
