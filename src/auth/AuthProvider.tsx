import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEMO_SCHOOL_ID, DEMO_SCHOOL_NAME, DEMO_USERS, type DemoUserKind } from '../data/demoUsers'
import { AppError } from '../data/errors'
import type { SchoolRole } from '../data/types'
import { isDemoMode } from '../lib/config'
import { getSupabase } from '../lib/supabase'

// Who is signed in, and what they may see.
//
// IMPORTANT: these checks only decide what the interface SHOWS. The real
// protection is Row Level Security in the database (supabase/migrations),
// which refuses any request a user is not allowed to make.

export interface Membership {
  school_id: string
  school_name: string
  role: SchoolRole
}

export interface AuthState {
  status: 'loading' | 'signedOut' | 'signedIn'
  userId: string | null
  email: string | null
  displayName: string | null
  isAdmin: boolean
  memberships: Membership[]
  isDemo: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  demoSignIn: (kind: DemoUserKind) => void
  /** Emails a link to /account/password. Never reveals whether the account exists. */
  requestPasswordReset: (email: string) => Promise<void>
  /** Sets a new password for the signed-in user (after an invite or reset link). */
  updatePassword: (password: string) => Promise<void>
}

type Identity = Pick<AuthState, 'status' | 'userId' | 'email' | 'displayName' | 'isAdmin' | 'memberships'>

const signedOut: Identity = { status: 'signedOut', userId: null, email: null, displayName: null, isAdmin: false, memberships: [] }
const DEMO_KEY = 'pathnigeria.demo-user'

function demoIdentity(kind: DemoUserKind): Identity {
  const u = DEMO_USERS[kind]
  return {
    status: 'signedIn',
    userId: u.id,
    email: u.email,
    displayName: u.display_name,
    isAdmin: u.platform_role === 'admin',
    memberships:
      kind === 'admin' ? [] : [{ school_id: DEMO_SCHOOL_ID, school_name: DEMO_SCHOOL_NAME, role: kind === 'school_admin' ? 'school_admin' : 'counsellor' }],
  }
}

async function loadLiveIdentity(userId: string, email: string | null): Promise<Identity> {
  const db = (await getSupabase())!
  const [profile, memberships] = await Promise.all([
    db.from('profiles').select('display_name, platform_role').eq('id', userId).maybeSingle(),
    db.from('school_memberships').select('school_id, role, schools(name)').eq('user_id', userId),
  ])
  return {
    status: 'signedIn',
    userId,
    email,
    displayName: profile.data?.display_name ?? null,
    isAdmin: profile.data?.platform_role === 'admin',
    memberships: (memberships.data ?? []).map((m) => {
      const school = m.schools as unknown as { name: string } | null
      return { school_id: m.school_id as string, role: m.role as SchoolRole, school_name: school?.name ?? 'Your school' }
    }),
  }
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<Identity>(() => {
    if (!isDemoMode) return { ...signedOut, status: 'loading' }
    try {
      const kind = sessionStorage.getItem(DEMO_KEY) as DemoUserKind | null
      if (kind && kind in DEMO_USERS) return demoIdentity(kind)
    } catch {
      // ignore
    }
    return signedOut
  })

  useEffect(() => {
    if (isDemoMode) return
    let cancelled = false
    let unsubscribe = () => {}
    void getSupabase().then((db) => {
      if (!db || cancelled) return
      const { data } = db.auth.onAuthStateChange((_event, session) => {
        // Defer the profile query so it does not run inside the auth callback.
        setTimeout(() => {
          if (cancelled) return
          if (!session) return setIdentity(signedOut)
          loadLiveIdentity(session.user.id, session.user.email ?? null)
            .then((id) => !cancelled && setIdentity(id))
            .catch(() => !cancelled && setIdentity(signedOut))
        }, 0)
      })
      unsubscribe = () => data.subscription.unsubscribe()
    })
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const db = await getSupabase()
    if (!db) throw new AppError('Sign-in is not available in demo mode.')
    const { error } = await db.auth.signInWithPassword({ email, password })
    // Same message for wrong email or password, so we don't reveal which accounts exist.
    if (error) throw new AppError('That email and password combination did not work.')
  }, [])

  const signOut = useCallback(async () => {
    if (isDemoMode) {
      try {
        sessionStorage.removeItem(DEMO_KEY)
      } catch {
        // ignore
      }
      setIdentity(signedOut)
      return
    }
    const db = await getSupabase()
    await db?.auth.signOut()
    setIdentity(signedOut)
  }, [])

  const demoSignIn = useCallback((kind: DemoUserKind) => {
    if (!isDemoMode) return
    try {
      sessionStorage.setItem(DEMO_KEY, kind)
    } catch {
      // ignore
    }
    setIdentity(demoIdentity(kind))
  }, [])

  const requestPasswordReset = useCallback(async (email: string) => {
    const db = await getSupabase()
    if (!db) throw new AppError('Password reset is not available in demo mode.')
    const { error } = await db.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/account/password` })
    // Supabase answers the same way whether or not the account exists; only surface rate limits.
    if (error && /rate limit|too many/i.test(error.message)) {
      throw new AppError('Too many requests. Please wait a few minutes and try again.')
    }
  }, [])

  const updatePassword = useCallback(async (password: string) => {
    const db = await getSupabase()
    if (!db) throw new AppError('Setting a password is not available in demo mode.')
    const { error } = await db.auth.updateUser({ password })
    if (!error) return
    if (/different from the old/i.test(error.message)) throw new AppError('Choose a password that is different from your current one.')
    if (/weak|short|characters/i.test(error.message)) throw new AppError('That password is too weak. Use at least 10 characters.')
    throw new AppError('We couldn’t save your password. The link may have expired; request a new one from the sign-in page.')
  }, [])

  const value = useMemo<AuthState>(
    () => ({ ...identity, isDemo: isDemoMode, signIn, signOut, demoSignIn, requestPasswordReset, updatePassword }),
    [identity, signIn, signOut, demoSignIn, requestPasswordReset, updatePassword],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
