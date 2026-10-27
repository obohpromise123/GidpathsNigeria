import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { PageTitle } from '../components/layout/Logo'
import { Button } from '../components/ui/Button'
import { cx } from '../components/ui/cx'
import { useCatalog } from '../data/CatalogProvider'
import { useJourney } from '../features/JourneyProvider'

export default function QuizPage() {
  const catalog = useCatalog()
  const navigate = useNavigate()
  const { answers, setAnswer, completeQuiz } = useJourney()

  const questions = useMemo(
    () => catalog.quizQuestions.filter((q) => q.active).sort((a, b) => a.sort_order - b.sort_order),
    [catalog.quizQuestions],
  )
  // Resume at the first unanswered question.
  const [index, setIndex] = useState(() => Math.max(0, Math.min(questions.findIndex((q) => !answers[q.id]), questions.length - 1)))
  const heading = useRef<HTMLHeadingElement>(null)

  if (questions.length === 0) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="text-2xl">The quiz isn’t available right now</h1>
        <p className="mt-2 text-slate-600">
          You can still <Link to="/careers" className="font-semibold text-teal-700 underline">browse careers</Link> directly.
        </p>
      </div>
    )
  }

  const question = questions[index]
  const options = catalog.quizOptions.filter((o) => o.question_id === question.id).sort((a, b) => a.sort_order - b.sort_order)
  const isLast = index === questions.length - 1
  const answeredCount = questions.filter((q) => answers[q.id]).length

  const go = (next: number) => {
    setIndex(next)
    // Move focus to the new question so screen-reader users hear it.
    requestAnimationFrame(() => heading.current?.focus())
  }

  const finish = () => {
    completeQuiz()
    navigate('/results')
  }

  return (
    <div className="container-page max-w-2xl py-10 sm:py-14">
      <PageTitle title="Career interest quiz" />
      <div className="flex items-center justify-between gap-4 text-sm font-semibold text-slate-600">
        <span>
          Question {index + 1} of {questions.length}
        </span>
        <span>{answeredCount} answered</span>
      </div>
      <div
        className="mt-3 h-2.5 overflow-hidden rounded-full bg-sand-200"
        role="progressbar"
        aria-label="Quiz progress"
        aria-valuemin={0}
        aria-valuemax={questions.length}
        aria-valuenow={index + 1}
      >
        <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
      </div>

      <form
        className="mt-8 rounded-[var(--radius-card)] border border-sand-200 bg-white p-5 sm:p-8"
        onSubmit={(e) => {
          e.preventDefault()
          if (isLast) finish()
          else go(index + 1)
        }}
      >
        <fieldset>
          <legend className="contents">
            <h1 ref={heading} tabIndex={-1} className="text-2xl leading-snug outline-none sm:text-[1.7rem]">
              {question.prompt}
            </h1>
          </legend>
          {question.helper && <p className="mt-2 text-slate-600">{question.helper}</p>}
          <div className="mt-6 space-y-3">
            {options.map((o) => {
              const selected = answers[question.id] === o.id
              return (
                <label
                  key={o.id}
                  className={cx(
                    'flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3 transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-teal-500',
                    selected ? 'border-teal-600 bg-teal-50' : 'border-sand-200 hover:border-teal-300',
                    o.is_unsure && !selected && 'border-dashed',
                  )}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={o.id}
                    checked={selected}
                    onChange={() => setAnswer(question.id, o.id)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden
                    className={cx(
                      'flex size-6 shrink-0 items-center justify-center rounded-full border-2',
                      selected ? 'border-teal-600 bg-teal-600 text-white' : 'border-sand-300',
                    )}
                  >
                    {selected && <Check className="size-4" />}
                  </span>
                  <span className={cx('font-medium', o.is_unsure ? 'text-slate-600' : 'text-navy-900')}>{o.label}</span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" onClick={() => go(index - 1)} disabled={index === 0}>
            <ArrowLeft aria-hidden className="size-4" /> Back
          </Button>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            {!answers[question.id] && !isLast && (
              <Button variant="secondary" onClick={() => go(index + 1)}>
                Skip
              </Button>
            )}
            <Button type="submit" variant="accent" disabled={isLast ? answeredCount === 0 : !answers[question.id]}>
              {isLast ? 'See my results' : 'Next'} <ArrowRight aria-hidden className="size-4" />
            </Button>
          </div>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        This is an exploration tool, not a test. There are no right or wrong answers, and you can change any answer.
      </p>
    </div>
  )
}
