import { zodResolver } from '@hookform/resolvers/zod'
import { Trash, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/Dialog'
import { describedBy, Field, Input, Select } from '../../components/ui/Form'
import { Notice } from '../../components/ui/Notice'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States'
import { friendlyError } from '../../data/errors'
import { getRepository, type Row } from '../../data/repository'
import type { SchoolRole } from '../../data/types'
import { isDemoMode } from '../../lib/config'
import { AdminHeader, DataTable } from './AdminUi'
import { useRows } from './useAdmin'

const schema = z.object({
  school_id: z.string().min(1, 'Choose a school'),
  email: z.string().trim().pipe(z.email('Enter a valid email address')),
  role: z.enum(['school_admin', 'counsellor']),
})
type Form = z.infer<typeof schema>

const ROLE_LABEL: Record<SchoolRole, string> = { school_admin: 'School administrator', counsellor: 'Guidance counsellor' }

export default function MembersPage() {
  const members = useRows('school_memberships')
  const schools = useRows('schools', { order: 'name' })
  const profiles = useRows('profiles')
  const [message, setMessage] = useState<{ kind: 'tip' | 'error'; text: string } | null>(null)
  const [removing, setRemoving] = useState<Row | null>(null)
  const [busy, setBusy] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { school_id: '', email: '', role: 'counsellor' } })

  const error = members.error ?? schools.error ?? profiles.error
  if (error) return <ErrorState message={error} onRetry={() => void members.reload()} />
  if (!members.rows || !schools.rows || !profiles.rows) return <LoadingState label="Loading school staff…" />

  const reloadAll = async () => {
    await Promise.all([members.reload(), profiles.reload()])
  }

  const add = async (form: Form) => {
    setMessage(null)
    try {
      await (await getRepository()).addSchoolMember(form.school_id, form.email, form.role)
      reset({ school_id: form.school_id, email: '', role: form.role })
      await reloadAll()
      setMessage({ kind: 'tip', text: `${form.email} now has access as ${ROLE_LABEL[form.role].toLowerCase()}.` })
    } catch (e) {
      setMessage({ kind: 'error', text: friendlyError(e) })
    }
  }

  const schoolName = (id: unknown) => String(schools.rows?.find((s) => s.id === id)?.name ?? 'Unknown school')
  const email = (id: unknown) => String(profiles.rows?.find((p) => p.id === id)?.email ?? 'Unknown user')

  return (
    <>
      <title>School staff · Admin</title>
      <AdminHeader title="School staff" description="Give school administrators and counsellors access to their school’s dashboard." />
      {message && (
        <Notice kind={message.kind} className="mb-4">
          <span role="status">{message.text}</span>
        </Notice>
      )}
      <Card className="mb-6">
        <h2 className="text-lg">Add a staff member</h2>
        <p className="mt-1 text-sm text-slate-600">
          {isDemoMode
            ? 'Demo mode: try principal@demo.local or counsellor@demo.local.'
            : 'The person must already have an account. Invite them first in the Supabase dashboard (Authentication → Users → Invite user).'}
        </p>
        <form onSubmit={handleSubmit(add)} noValidate className="mt-4 grid gap-4 sm:grid-cols-4 sm:items-end">
          <Field label="School" htmlFor="m-school" required error={errors.school_id?.message}>
            <Select id="m-school" {...register('school_id')} {...describedBy('m-school', errors.school_id?.message)}>
              <option value="">Choose…</option>
              {schools.rows.map((s) => (
                <option key={String(s.id)} value={String(s.id)}>
                  {String(s.name)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Email" htmlFor="m-email" required error={errors.email?.message}>
            <Input id="m-email" type="email" {...register('email')} {...describedBy('m-email', errors.email?.message)} />
          </Field>
          <Field label="Role" htmlFor="m-role" required>
            <Select id="m-role" {...register('role')}>
              <option value="counsellor">{ROLE_LABEL.counsellor}</option>
              <option value="school_admin">{ROLE_LABEL.school_admin}</option>
            </Select>
          </Field>
          <Button type="submit" variant="accent" loading={isSubmitting}>
            <UserPlus aria-hidden className="size-4" /> Give access
          </Button>
        </form>
      </Card>

      {members.rows.length === 0 ? (
        <EmptyState title="No school staff yet" />
      ) : (
        <DataTable head={['Staff member', 'School', 'Role', '']}>
          {members.rows.map((m) => (
            <tr key={String(m.id)}>
              <td className="px-4 py-3 font-medium text-navy-900">{email(m.user_id)}</td>
              <td className="px-4 py-3">{schoolName(m.school_id)}</td>
              <td className="px-4 py-3">{ROLE_LABEL[m.role as SchoolRole]}</td>
              <td className="px-4 py-2 text-right">
                <Button variant="ghost" size="sm" className="text-red-700 hover:bg-red-50" onClick={() => setRemoving(m)} aria-label={`Remove ${email(m.user_id)}`}>
                  <Trash aria-hidden className="size-4" /> Remove
                </Button>
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      <ConfirmDialog
        open={removing !== null}
        title="Remove access?"
        confirmLabel="Remove access"
        danger
        busy={busy}
        onCancel={() => setRemoving(null)}
        onConfirm={async () => {
          if (!removing) return
          setBusy(true)
          try {
            await (await getRepository()).remove('school_memberships', String(removing.id))
            setRemoving(null)
            await reloadAll()
            setMessage({ kind: 'tip', text: 'Access removed.' })
          } catch (e) {
            setRemoving(null)
            setMessage({ kind: 'error', text: friendlyError(e) })
          } finally {
            setBusy(false)
          }
        }}
      >
        {removing && (
          <>
            <strong>{email(removing.user_id)}</strong> will no longer be able to see {schoolName(removing.school_id)}’s dashboard. Their account is not
            deleted.
          </>
        )}
      </ConfirmDialog>
    </>
  )
}
