import { ShieldAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { ButtonLink } from '../components/ui/Button'
import { LoadingState } from '../components/ui/States'
import { useAuth } from './AuthProvider'

/**
 * Hides pages from people without the right role. This is a convenience for
 * the interface only — the database's Row Level Security is what actually
 * prevents unauthorised reads and writes.
 */
export function RequireRole({ role, children }: { role: 'admin' | 'school'; children: ReactNode }) {
  const auth = useAuth()
  const location = useLocation()

  if (auth.status === 'loading') return <LoadingState label="Checking your account…" />
  if (auth.status === 'signedOut') {
    return <Navigate to={`/sign-in?next=${encodeURIComponent(location.pathname)}`} replace />
  }
  const allowed = role === 'admin' ? auth.isAdmin : auth.memberships.length > 0 || auth.isAdmin
  if (!allowed) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <ShieldAlert aria-hidden className="size-12 text-navy-400" />
        <h1 className="mt-4 text-2xl">You don’t have access to this page</h1>
        <p className="mt-2 max-w-md text-slate-600">
          You’re signed in as {auth.email}, but this account doesn’t have the {role === 'admin' ? 'administrator' : 'school staff'} role. Ask a
          platform administrator if you think this is a mistake.
        </p>
        <ButtonLink to="/" variant="secondary" className="mt-6">
          Go to the home page
        </ButtonLink>
      </div>
    )
  }
  return <>{children}</>
}
