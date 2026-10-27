import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { getRepository } from '../data/repository'
import type { UsageEventType } from '../data/types'
import { emptyProfile, type StudentProfile } from '../lib/onboarding'
import type { QuizAnswers } from '../lib/recommend'

// The student's journey (onboarding answers + quiz answers).
//
// Privacy: this contains no names or contact details. It is kept in
// sessionStorage, which the browser clears when the tab is closed, so a
// shared school computer does not keep one student's answers for the next.

const STORAGE_KEY = 'pathnigeria.journey.v1'

export interface JourneyState {
  profile: StudentProfile
  answers: QuizAnswers
  onboardingDone: boolean
  quizCompletedAt: string | null
  /** Usage events already reported this session (so we count each once). */
  reported: UsageEventType[]
}

const initialState = (): JourneyState => ({
  profile: emptyProfile(),
  answers: {},
  onboardingDone: false,
  quizCompletedAt: null,
  reported: [],
})

function load(): JourneyState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState()
    const parsed = JSON.parse(raw) as Partial<JourneyState>
    return { ...initialState(), ...parsed, profile: { ...emptyProfile(), ...parsed.profile } }
  } catch {
    return initialState()
  }
}

interface JourneyApi extends JourneyState {
  updateProfile: (patch: Partial<StudentProfile>) => void
  completeOnboarding: () => void
  setAnswer: (questionId: string, optionId: string) => void
  completeQuiz: () => void
  reset: () => void
  /** Records an anonymous usage event once per session. Never throws. */
  report: (event: UsageEventType, categoryId?: string | null) => void
}

const JourneyContext = createContext<JourneyApi | null>(null)

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<JourneyState>(load)

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Storage can be unavailable (private mode, full); the app still works.
    }
  }, [state])

  // Refs give report() synchronous access to the latest state, so an event is
  // never sent twice (React may run effects twice in development).
  const stateRef = useRef(state)
  stateRef.current = state
  const reportedRef = useRef(new Set(state.reported))

  const report = useCallback((event: UsageEventType, categoryId: string | null = null) => {
    if (reportedRef.current.has(event)) return
    reportedRef.current.add(event)
    const { profile } = stateRef.current
    const code = profile.shareWithSchool ? profile.schoolCode : null
    void getRepository()
      .then((repo) => repo.recordUsage(event, profile.schoolLevel, categoryId, code))
      .catch(() => {
        // Usage counts are optional; never interrupt the student over them.
      })
    setState((s) => ({ ...s, reported: [...s.reported, event] }))
  }, [])

  const api = useMemo<JourneyApi>(
    () => ({
      ...state,
      updateProfile: (patch) => setState((s) => ({ ...s, profile: { ...s.profile, ...patch } })),
      completeOnboarding: () => setState((s) => ({ ...s, onboardingDone: true })),
      setAnswer: (questionId, optionId) => setState((s) => ({ ...s, answers: { ...s.answers, [questionId]: optionId } })),
      completeQuiz: () => setState((s) => ({ ...s, quizCompletedAt: new Date().toISOString() })),
      reset: () => {
        try {
          sessionStorage.removeItem(STORAGE_KEY)
        } catch {
          // ignore
        }
        reportedRef.current = new Set()
        setState(initialState())
      },
      report,
    }),
    [state, report],
  )

  return <JourneyContext.Provider value={api}>{children}</JourneyContext.Provider>
}

export function useJourney(): JourneyApi {
  const ctx = useContext(JourneyContext)
  if (!ctx) throw new Error('useJourney must be used inside <JourneyProvider>')
  return ctx
}
