import { zodResolver } from '@hookform/resolvers/zod'
import { FlaskConical, KeyRound } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useSearchParams } from 'react-router'
import { z } from 'zod'
import { useAuth } from '../auth/AuthProvider'
import { PageTitle } from '../components/layout/Logo'
import { Button } from '../components/ui/Button'
import { describedBy, Field, Input } from '../components/ui/Form'
import { Notice } from '../components/ui/Notice'
import { friendlyError } from '../data/errors'
import type { DemoUserKind } from '../data/demoUsers'

const schema = z.object({
  email: z.string().trim().pipe(z.email('Enter a valid email address')),
  password: z.string().min(1, 'Enter your password'),
})
type Form = z.infer<typeof schema>

/** Only allow redirects to paths on this site (prevents open-redirect tricks). */
function safeNext(value: string | null) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : null
}

export default function SignInPage() {
  const auth = useAuth()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } })

  if (auth.status === 'signedIn') {
    return <Navigate to={next ?? (auth.isAdmin ? '/admin' : auth.memberships.length ? '/school' : '/')} replace />
  }

  const onSubmit = async (form: Form) => {
    setError(null)
    try {
      await auth.signIn(form.email, form.password)
    } catch (e) {
      setError(friendlyError(e))
    }
  }

  const demoOptions: { kind: DemoUserKind; label: string; text: string }[] = [
    { kind: 'admin', label: 'Platform administrator', text: 'Manage courses, careers, admissions, sources and enquiries.' },
    { kind: 'school_admin', label: 'School administrator', text: 'See the school dashboard for the demo school.' },
    { kind: 'counsellor', label: 'Guidance counsellor', text: 'See the school dashboard as a counsellor.' },
  ]

  return (
    <div className="container-page max-w-md py-12 sm:py-16">
      <PageTitle title="Staff sign in" />
      <h1 className="text-3xl">Staff sign in</h1>
      <p className="mt-2 text-slate-600">For school staff and platform administrators. Students don’t need to sign in.</p>

      {auth.isDemo ? (
        <div className="mt-8 space-y-4">
          <Notice kind="warning" title="Demo mode">
            There are no real accounts in demo mode. Choose a demo role to look around. Changes stay in this browser tab only and are lost when you reload.
          </Notice>
          {demoOptions.map((o) => (
            <button
              key={o.kind}
              type="button"
              onClick={() => auth.demoSignIn(o.kind)}
              className="flex w-full items-start gap-3 rounded-2xl border border-sand-200 bg-white p-4 text-left hover:border-teal-400 hover:bg-teal-50"
            >
              <FlaskConical aria-hidden className="mt-0.5 size-5 shrink-0 text-teal-600" />
              <span>
                <span className="block font-semibold text-navy-900">Continue as demo {o.label.toLowerCase()}</span>
                <span className="text-sm text-slate-600">{o.text}</span>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5 rounded-[var(--radius-card)] border border-sand-200 bg-white p-6">
          <Field label="Email" htmlFor="email" required error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="username" {...register('email')} {...describedBy('email', errors.email?.message)} />
          </Field>
          <Field label="Password" htmlFor="password" required error={errors.password?.message}>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              {...describedBy('password', errors.password?.message)}
            />
          </Field>
          {error && <Notice kind="error">{error}</Notice>}
          <Button type="submit" variant="primary" className="w-full" loading={isSubmitting || auth.status === 'loading'}>
            <KeyRound aria-hidden className="size-4" /> Sign in
          </Button>
          <p className="text-xs text-slate-500">Accounts are created by a platform administrator. Ask them if you need access.</p>
        </form>
      )}
    </div>
  )
}
