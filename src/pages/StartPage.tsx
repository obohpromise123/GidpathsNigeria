import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { PageTitle } from '../components/layout/Logo'
import { Button } from '../components/ui/Button'
import { ChipGroup } from '../components/ui/ChipGroup'
import { Checkbox, Field, Input } from '../components/ui/Form'
import { Notice } from '../components/ui/Notice'
import { useCatalog } from '../data/CatalogProvider'
import { getRepository } from '../data/repository'
import type { DimensionId } from '../data/types'
import { useJourney } from '../features/JourneyProvider'
import { DIMENSION_IDS, DIMENSIONS } from '../lib/dimensions'
import { ACTIVITIES, PATHWAY_EXTRA_CHOICES, SCHOOL_LEVELS, STRENGTHS, SUBJECTS, type SchoolLevel } from '../lib/onboarding'

const STEPS = ['About you', 'Subjects & interests', 'Activities & strengths', 'Areas to explore'] as const

function SchoolCodeField() {
  const { profile, updateProfile } = useJourney()
  const [status, setStatus] = useState<{ kind: 'idle' | 'checking' | 'found' | 'missing' | 'error'; name?: string }>({ kind: 'idle' })

  const check = async () => {
    const code = profile.schoolCode?.trim()
    if (!code) return
    setStatus({ kind: 'checking' })
    try {
      const name = await (await getRepository()).lookupSchoolCode(code)
      setStatus(name ? { kind: 'found', name } : { kind: 'missing' })
      if (!name) updateProfile({ shareWithSchool: false })
    } catch {
      setStatus({ kind: 'error' })
    }
  }

  return (
    <div className="rounded-2xl border border-sand-200 bg-sand-50 p-5">
      <Field
        label="School code"
        htmlFor="school-code"
        hint="Only if your teacher or counsellor gave you one. You can leave this empty."
      >
        <div className="flex gap-2">
          <Input
            id="school-code"
            value={profile.schoolCode ?? ''}
            onChange={(e) => {
              updateProfile({ schoolCode: e.target.value.toUpperCase().slice(0, 12) || null, shareWithSchool: false })
              setStatus({ kind: 'idle' })
            }}
            autoComplete="off"
            className="uppercase"
            aria-describedby="school-code-hint school-code-status"
          />
          <Button variant="secondary" onClick={() => void check()} loading={status.kind === 'checking'} disabled={!profile.schoolCode}>
            Check
          </Button>
        </div>
      </Field>
      <p id="school-code-status" aria-live="polite" className="mt-2 text-sm">
        {status.kind === 'found' && <span className="font-semibold text-teal-700">Code recognised: {status.name}</span>}
        {status.kind === 'missing' && <span className="text-red-700">We couldn’t find that code. Check it with your teacher.</span>}
        {status.kind === 'error' && <span className="text-red-700">We couldn’t check the code right now. You can continue without it.</span>}
      </p>
      {status.kind === 'found' && (
        <Checkbox
          className="mt-3"
          checked={profile.shareWithSchool}
          onChange={(e) => updateProfile({ shareWithSchool: e.target.checked })}
          label={
            <>
              Count my activity in my school’s <strong>anonymous totals</strong> (for example, “40 students finished the quiz”). My school will{' '}
              <strong>not</strong> see my answers or results.
            </>
          }
        />
      )}
    </div>
  )
}

export default function StartPage() {
  const catalog = useCatalog()
  const navigate = useNavigate()
  const { profile, updateProfile, completeOnboarding, report } = useJourney()
  const [step, setStep] = useState(0)

  const goTo = (next: number) => {
    setStep(next)
    window.scrollTo({ top: 0 })
  }

  const finish = () => {
    completeOnboarding()
    report('onboarding_completed')
    navigate('/quiz')
  }

  const pathwayOptions = [...catalog.pathways.map((p) => ({ id: p.id, label: p.name })), ...PATHWAY_EXTRA_CHOICES]

  return (
    <div className="container-page max-w-3xl py-10 sm:py-14">
      <PageTitle title="Discover your path" />
      <p className="text-sm font-semibold tracking-wider text-teal-700 uppercase">
        Step {step + 1} of {STEPS.length}: {STEPS[step]}
      </p>
      <h1 className="mt-2 text-3xl">Let’s get to know you</h1>
      <div className="mt-4 flex gap-1.5" aria-hidden>
        {STEPS.map((s, i) => (
          <span key={s} className={`h-2 flex-1 rounded-full ${i <= step ? 'bg-teal-500' : 'bg-sand-200'}`} />
        ))}
      </div>

      {step === 0 && (
        <Notice kind="tip" className="mt-6">
          <span className="flex items-start gap-2">
            <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0" />
            We don’t ask for your name, phone number or address. Every question is optional — choose what fits, or skip it.
          </span>
        </Notice>
      )}

      <div className="mt-8 space-y-10 rounded-[var(--radius-card)] border border-sand-200 bg-white p-5 sm:p-8">
        {step === 0 && (
          <>
            <ChipGroup
              legend="What class are you in?"
              single
              options={SCHOOL_LEVELS}
              value={profile.schoolLevel ? [profile.schoolLevel] : []}
              onChange={([v]) => updateProfile({ schoolLevel: (v as SchoolLevel) ?? null })}
            />
            <ChipGroup
              legend="Which subject pathway are you in, or thinking about?"
              hint="Many schools group subjects into Science, Arts or Commercial. Under the 2025 senior secondary curriculum, students can combine subjects more freely — so treat this as a starting point."
              single
              options={pathwayOptions}
              value={profile.pathway ? [profile.pathway] : []}
              onChange={([v]) => updateProfile({ pathway: v ?? null })}
            />
          </>
        )}

        {step === 1 && (
          <>
            <ChipGroup
              legend="Which subjects do you enjoy most?"
              hint="Pick up to 6."
              max={6}
              options={SUBJECTS}
              value={profile.favouriteSubjects}
              onChange={(v) => updateProfile({ favouriteSubjects: v })}
            />
            <ChipGroup
              legend="What are you interested in?"
              hint="Pick as many as you like."
              options={DIMENSION_IDS.map((d) => ({ id: d, label: DIMENSIONS[d].description }))}
              value={profile.interests}
              onChange={(v) => updateProfile({ interests: v as DimensionId[] })}
            />
          </>
        )}

        {step === 2 && (
          <>
            <ChipGroup
              legend="What do you enjoy doing in your free time?"
              options={ACTIVITIES}
              value={profile.activities}
              onChange={(v) => updateProfile({ activities: v })}
            />
            <ChipGroup
              legend="Which of these describe you?"
              hint="Be honest — there are no wrong answers."
              options={STRENGTHS}
              value={profile.strengths}
              onChange={(v) => updateProfile({ strengths: v })}
            />
          </>
        )}

        {step === 3 && (
          <>
            <ChipGroup
              legend="Are there career areas you already want to explore?"
              hint="Optional. If you’re not sure, skip this — the quiz will suggest some."
              options={catalog.categories.map((c) => ({ id: c.id, label: c.name }))}
              value={profile.careerAreas}
              onChange={(v) => updateProfile({ careerAreas: v })}
            />
            <SchoolCodeField />
          </>
        )}
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        {step > 0 ? (
          <Button variant="ghost" onClick={() => goTo(step - 1)}>
            <ArrowLeft aria-hidden className="size-4" /> Back
          </Button>
        ) : (
          <span />
        )}
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          {step < STEPS.length - 1 && (
            <Button variant="secondary" onClick={() => goTo(step + 1)}>
              Skip this step
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button variant="accent" onClick={() => goTo(step + 1)}>
              Next <ArrowRight aria-hidden className="size-4" />
            </Button>
          ) : (
            <Button variant="accent" size="lg" onClick={finish}>
              Start the interest quiz <ArrowRight aria-hidden className="size-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
