import { ArrowRight, Compass, RotateCcw } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router'
import { CategoryIcon, ExploratoryNotice } from '../components/content'
import { PageTitle } from '../components/layout/Logo'
import { Badge } from '../components/ui/Badge'
import { ButtonLink } from '../components/ui/Button'
import { EmptyState } from '../components/ui/States'
import { useCatalog } from '../data/CatalogProvider'
import { useJourney } from '../features/JourneyProvider'
import { useRecommendation } from '../features/useRecommendation'
import type { CategoryMatch, DimensionScore, MatchStrength } from '../lib/recommend'

const STRENGTH: Record<MatchStrength, { label: string; tone: 'teal' | 'navy' | 'neutral' }> = {
  strong: { label: 'Strong match', tone: 'teal' },
  good: { label: 'Good match', tone: 'navy' },
  possible: { label: 'Worth exploring', tone: 'neutral' },
}

function levelWord(value: number) {
  if (value >= 0.6) return 'High'
  if (value >= 0.3) return 'Some'
  if (value > 0) return 'A little'
  return 'Not shown'
}

function InterestProfile({ dimensions }: { dimensions: DimensionScore[] }) {
  const sorted = [...dimensions].sort((a, b) => b.combined - a.combined)
  return (
    <ul className="space-y-3">
      {sorted.map((d) => (
        <li key={d.id}>
          <div className="flex justify-between gap-4 text-sm">
            <span className="font-medium text-navy-900">{d.label}</span>
            <span className="text-slate-600">{levelWord(d.combined)}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-sand-200" aria-hidden>
            <div className="h-full rounded-full bg-teal-500" style={{ width: `${Math.round(d.combined * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

function MatchCard({ match }: { match: CategoryMatch }) {
  const s = STRENGTH[match.strength]
  return (
    <article className="flex flex-col rounded-[var(--radius-card)] border border-sand-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
          <CategoryIcon id={match.category.id} className="size-6" />
        </span>
        <div className="flex flex-wrap justify-end gap-1.5">
          <Badge tone={s.tone}>{s.label}</Badge>
          {match.chosenByStudent && <Badge tone="sun">You chose this</Badge>}
        </div>
      </div>
      <h2 className="mt-4 text-xl">{match.category.name}</h2>
      <p className="mt-1 text-slate-600">{match.category.description}</p>

      <h3 className="mt-5 text-sm font-semibold tracking-wide text-slate-500 uppercase">Why this was suggested</h3>
      {match.reasons.length ? (
        <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
          {match.reasons.map((r) => (
            <li key={r} className="flex gap-2">
              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-teal-500" />
              {r}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-slate-600">Suggested so you have several areas to compare — your answers gave only weak signals here.</p>
      )}

      {match.careers.length > 0 && (
        <>
          <h3 className="mt-5 text-sm font-semibold tracking-wide text-slate-500 uppercase">Careers to look at</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {match.careers.slice(0, 4).map((c) => (
              <li key={c.id}>
                <Link to={`/careers/${c.id}`} className="inline-flex min-h-10 items-center rounded-full bg-navy-50 px-3.5 text-sm font-semibold text-navy-800 hover:bg-navy-100">
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
      <Link to={`/careers?category=${match.category.id}`} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:underline">
        All careers in this area <ArrowRight aria-hidden className="size-4" />
      </Link>
    </article>
  )
}

export default function ResultsPage() {
  const catalog = useCatalog()
  const rec = useRecommendation()
  const { quizCompletedAt, onboardingDone, report } = useJourney()
  const topCategory = rec.top[0]?.category.id ?? null

  useEffect(() => {
    if (quizCompletedAt) report('quiz_completed', topCategory)
  }, [quizCompletedAt, topCategory, report])

  if (!quizCompletedAt && !onboardingDone) {
    return (
      <div className="container-page py-16">
        <PageTitle title="Your results" />
        <EmptyState
          title="No results yet"
          action={
            <ButtonLink to="/start" variant="accent">
              Discover your path
            </ButtonLink>
          }
        >
          Answer a few questions and take the interest quiz to see career areas to explore.
        </EmptyState>
      </div>
    )
  }

  const shown = new Set(rec.top.map((t) => t.category.id))

  return (
    <div className="container-page py-10 sm:py-14">
      <PageTitle title="Your results" />
      <p className="text-sm font-semibold tracking-wider text-teal-700 uppercase">Quiz complete</p>
      <h1 className="mt-2 text-3xl sm:text-4xl">Career areas you might enjoy exploring</h1>
      <p className="mt-3 max-w-2xl text-lg text-slate-600">
        Based on {rec.answeredCount} quiz answer{rec.answeredCount === 1 ? '' : 's'} and what you told us about yourself. These are starting points —
        not the only options.
      </p>
      <ExploratoryNotice className="mt-6 max-w-3xl" />

      {!rec.enoughData ? (
        <div className="mt-10">
          <EmptyState
            title="We need a bit more to go on"
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <ButtonLink to="/quiz" variant="accent">
                  <RotateCcw aria-hidden className="size-4" /> Revisit the quiz
                </ButtonLink>
                <ButtonLink to="/careers" variant="secondary">
                  Browse all careers
                </ButtonLink>
              </div>
            }
          >
            It’s completely fine to be unsure! Try answering a few more questions, or browse every career area freely.
          </EmptyState>
        </div>
      ) : (
        <>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {rec.top.map((m) => (
              <MatchCard key={m.category.id} match={m} />
            ))}
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-5">
            <section className="rounded-[var(--radius-card)] border border-sand-200 bg-white p-6 lg:col-span-2" aria-labelledby="profile">
              <h2 id="profile" className="text-xl">
                Your interest profile
              </h2>
              <p className="mt-1 mb-5 text-sm text-slate-600">How strongly your answers pointed to each interest area.</p>
              <InterestProfile dimensions={rec.dimensions} />
            </section>
            <section className="lg:col-span-3" aria-labelledby="next">
              <div className="rounded-[var(--radius-card)] bg-navy-900 p-6 text-white sm:p-8">
                <h2 id="next" className="text-2xl text-white">
                  Turn this into a plan
                </h2>
                <p className="mt-2 text-navy-200">
                  Your roadmap lists courses to explore, subjects to focus on, admission requirements to check and practical next steps.
                </p>
                <ButtonLink to="/roadmap" variant="accent" size="lg" className="mt-6">
                  See my roadmap <ArrowRight aria-hidden className="size-5" />
                </ButtonLink>
              </div>
              <div className="mt-6 rounded-[var(--radius-card)] border border-sand-200 bg-white p-6">
                <h2 className="flex items-center gap-2 text-lg">
                  <Compass aria-hidden className="size-5 text-teal-600" /> Explore beyond your results
                </h2>
                <p className="mt-1 text-sm text-slate-600">Your results don’t limit you. Every area is open to explore.</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {catalog.categories
                    .filter((c) => !shown.has(c.id))
                    .map((c) => (
                      <li key={c.id}>
                        <Link
                          to={`/careers?category=${c.id}`}
                          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-sand-300 px-3.5 text-sm font-medium hover:border-teal-400 hover:bg-teal-50"
                        >
                          <CategoryIcon id={c.id} className="size-4 text-teal-700" />
                          {c.name}
                        </Link>
                      </li>
                    ))}
                </ul>
                <Link to="/quiz" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-navy-800 hover:underline">
                  <RotateCcw aria-hidden className="size-4" /> Change my quiz answers
                </Link>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  )
}
