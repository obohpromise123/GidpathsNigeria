import { zodResolver } from '@hookform/resolvers/zod'
import { CircleCheck, KeyRound } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useAuth } from '../auth/AuthProvider'
import { PageTitle } from '../components/layout/Logo'
import { Button, ButtonLink } from '../components/ui/Button'
import { describedBy, Field, Input } from '../components/ui/Form'
import { Notice } from '../components/ui/Notice'
import { LoadingState } from '../components/ui/States'
import { friendlyError } from '../data/errors'

// Where invitation and password-reset emails land. Supabase signs the person
// in from the link, then this page lets them choose a password.

export const passwordSchema = z
  .object({
    password: z.string().min(10, 'Use at least 10 characters').max(72, 'Use 72 characters or fewer'),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'The two passwords don’t match' })
type Form = z.infer<typeof passwordSchema>

export default function SetPasswordPage() {
  const auth = useAuth()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(passwordSchema), defaultValues: { password: '', confirm: '' } })

  const body = () => {
    if (auth.isDemo) {
      return <Notice kind="warning">Setting a password isn’t available in demo mode. Use the demo roles on the staff sign-in page instead.</Notice>
    }
    if (auth.status === 'loading') return <LoadingState label="Checking your link…" />
    if (saved) {
      const next = auth.isAdmin ? '/admin' : auth.memberships.length ? '/school' : '/'
      return (
        <div role="status" className="rounded-[var(--radius-card)] border border-teal-200 bg-teal-50 p-6 text-center">
          <CircleCheck aria-hidden className="mx-auto size-10 text-teal-600" />
          <h2 className="mt-3 text-xl">Password saved</h2>
          <p className="mt-1 text-slate-700">From now on, sign in with {auth.email} and your new password.</p>
          <ButtonLink to={next} variant="primary" className="mt-5">
            Continue
          </ButtonLink>
        </div>
      )
    }
    if (auth.status === 'signedOut') {
      return (
        <div className="space-y-4">
          <Notice kind="warning" title="This link has expired or was already used">
            Links in invitation and reset emails work once and expire after a short time. Request a new one from the sign-in page.
          </Notice>
          <ButtonLink to="/sign-in" variant="secondary">
            Go to staff sign in
          </ButtonLink>
        </div>
      )
    }
    return (
      <form
        noValidate
        className="space-y-5 rounded-[var(--radius-card)] border border-sand-200 bg-white p-6"
        onSubmit={handleSubmit(async (form) => {
          setError(null)
          try {
            await auth.updatePassword(form.password)
            setSaved(true)
          } catch (e) {
            setError(friendlyError(e))
          }
        })}
      >
        <p className="text-sm text-slate-600">
          Choosing a password for <strong className="text-navy-900">{auth.email}</strong>.
        </p>
        <Field label="New password" htmlFor="new-password" required error={errors.password?.message} hint="At least 10 characters. A short phrase is easier to remember.">
          <Input id="new-password" type="password" autoComplete="new-password" {...register('password')} {...describedBy('new-password', errors.password?.message)} />
        </Field>
        <Field label="Type it again" htmlFor="confirm-password" required error={errors.confirm?.message}>
          <Input id="confirm-password" type="password" autoComplete="new-password" {...register('confirm')} {...describedBy('confirm-password', errors.confirm?.message)} />
        </Field>
        {error && <Notice kind="error">{error}</Notice>}
        <Button type="submit" variant="primary" className="w-full" loading={isSubmitting}>
          <KeyRound aria-hidden className="size-4" /> Save password
        </Button>
      </form>
    )
  }

  return (
    <div className="container-page max-w-md py-12 sm:py-16">
      <PageTitle title="Set your password" />
      <h1 className="text-3xl">Set your password</h1>
      <p className="mt-2 mb-8 text-slate-600">For staff accounts created by invitation, or after a password reset.</p>
      {body()}
    </div>
  )
}
