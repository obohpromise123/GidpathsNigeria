import { Download, ExternalLink, Printer, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { BulletList, CategoryIcon, ExploratoryNotice } from '../components/content'
import { LogoMark, PageTitle } from '../components/layout/Logo'
import { VerificationBadge } from '../components/ui/Badge'
import { Button, ButtonLink } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/Dialog'
import { Notice } from '../components/ui/Notice'
import { EmptyState } from '../components/ui/States'
import { useCatalog } from '../data/CatalogProvider'
import { institutionFor } from '../data/selectors'
import { useJourney } from '../features/JourneyProvider'
import { useRecommendation } from '../features/useRecommendation'
import { APP_NAME } from '../lib/brand'
import { SCHOOL_LEVELS } from '../lib/onboarding'
import { buildRoadmap, roadmapToText } from '../lib/roadmap'

function Block({ title, step, children }: { title: string; step: number; children: React.ReactNode }) {
  return (
    <section className="print-break-avoid rounded-[var(--radius-card)] border border-sand-200 bg-white p-6 print:border-slate-300 print:shadow-none">
      <h2 className="flex items-center gap-3 text-xl">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-navy-900 text-sm text-white print:border print:border-black print:bg-white print:text-black">
          {step}
        </span>
        {title}
      </h2>
      <div className="mt-4 text-slate-700">{children}</div>
    </section>
  )
}

export default function RoadmapPage() {
  const catalog = useCatalog()
  const rec = useRecommendation()
  const navigate = useNavigate()
  const { profile, quizCompletedAt, onboardingDone, reset, report } = useJourney()
  const [confirmReset, setConfirmReset] = useState(false)
  const roadmap = useMemo(() => buildRoadmap(catalog, rec, profile), [catalog, rec, profile])
  const hasData = (quizCompletedAt || onboardingDone) && rec.enoughData

  useEffect(() => {
    if (hasData) report('roadmap_viewed', rec.top[0]?.category.id ?? null)
  }, [hasData, rec.top, report])

  if (!hasData) {
    return (
      <div className="container-page py-16">
        <PageTitle title="My career roadmap" />
        <EmptyState
          title="Your roadmap will appear here"
          action={
            <ButtonLink to="/start" variant="accent">
              Discover your path
            </ButtonLink>
          }
        >
          Tell us a little about yourself and take the interest quiz. We’ll turn your answers into a roadmap you can print or download.
        </EmptyState>
      </div>
    )
  }

  const download = () => {
    const blob = new Blob([roadmapToText(roadmap, APP_NAME)], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'my-career-roadmap.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const level = SCHOOL_LEVELS.find((l) => l.id === profile.schoolLevel)?.label
  const pathway = catalog.pathways.find((p) => p.id === profile.pathway)?.name

  return (
    <div className="container-page py-10 sm:py-14 print:py-0">
      <PageTitle title="My career roadmap" />

      <div className="hidden items-center gap-2 print:flex">
        <LogoMark className="size-7" />
        <span className="font-bold">{APP_NAME}</span>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-sm font-semibold tracking-wider text-teal-700 uppercase">My career roadmap</p>
          <h1 className="mt-2 text-3xl sm:text-4xl">Your plan for exploring what’s next</h1>
          <p className="mt-2 text-slate-600">
            {[level, pathway].filter(Boolean).join(' · ') || 'Personalised from your answers'} · Created{' '}
            {new Date().toLocaleDateString('en-NG', { dateStyle: 'long' })}
          </p>
        </div>
        <div className="no-print flex flex-wrap gap-2">
          <Button variant="primary" onClick={() => window.print()}>
            <Printer aria-hidden className="size-4" /> Print or save as PDF
          </Button>
          <Button variant="secondary" onClick={download}>
            <Download aria-hidden className="size-4" /> Download
          </Button>
        </div>
      </div>

      <Notice kind="warning" title="Your roadmap is not saved online" className="no-print mt-6">
        It stays in this browser tab only and disappears when you close the tab. Print it, save it as a PDF, or download it to keep it.
      </Notice>
      <ExploratoryNotice className="mt-4" />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Block step={1} title="Career areas to explore">
          <ul className="space-y-3">
            {roadmap.areas.map((a) => (
              <li key={a.category.id} className="flex items-start gap-3">
                <CategoryIcon id={a.category.id} className="mt-0.5 size-5 shrink-0 text-teal-600" />
                <div>
                  <p className="font-semibold text-navy-900">{a.category.name}</p>
                  <p className="text-sm text-slate-600">{a.reasons[0] ?? a.category.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </Block>

        <Block step={2} title="Careers to look into">
          <ul className="space-y-3">
            {roadmap.careers.map((c) => (
              <li key={c.id}>
                <Link to={`/careers/${c.id}`} className="font-semibold text-navy-900 underline decoration-teal-300 underline-offset-4 hover:text-teal-700">
                  {c.title}
                </Link>
                <p className="text-sm text-slate-600">{c.summary}</p>
              </li>
            ))}
          </ul>
        </Block>

        <Block step={3} title="Courses worth exploring">
          <ul className="space-y-3">
            {roadmap.courses.map(({ course, pathwayNote }) => (
              <li key={course.id}>
                <Link to={`/courses/${course.id}`} className="font-semibold text-navy-900 underline decoration-teal-300 underline-offset-4 hover:text-teal-700">
                  {course.name}
                </Link>
                <p className="text-sm text-slate-600">{course.summary}</p>
                {pathwayNote && <p className="mt-1 text-sm font-medium text-sun-700">{pathwayNote}</p>}
              </li>
            ))}
          </ul>
        </Block>

        <Block step={4} title="Subjects to pay attention to">
          <p className="mb-3 text-sm text-slate-600">
            These subjects are commonly helpful for the courses above. English Language and Mathematics are needed for almost every course.
          </p>
          <div className="flex flex-wrap gap-2">
            {roadmap.subjects.map((s) => (
              <span key={s.name} className="rounded-full bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-800 ring-1 ring-teal-200">
                {s.name}
              </span>
            ))}
          </div>
        </Block>

        <Block step={5} title="Admission requirements to verify">
          <p className="mb-4 text-sm text-slate-600">
            Requirements differ between institutions and can change every year. Always check the official{' '}
            <a href="https://ibass.jamb.gov.ng" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-teal-700 underline">
              JAMB IBASS <ExternalLink aria-hidden className="size-3.5" />
            </a>{' '}
            and the institution’s own website.
          </p>
          <ul className="divide-y divide-sand-200">
            {roadmap.admissions.map(({ course, records }) => (
              <li key={course.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <Link to={`/courses/${course.id}#admission`} className="font-medium text-navy-900 hover:text-teal-700">
                  {course.name}
                </Link>
                <span className="flex flex-wrap gap-1.5">
                  {records.length === 0 ? (
                    <VerificationBadge status="unverified" />
                  ) : (
                    [...new Set(records.map((r) => r.verification_status))].map((s) => <VerificationBadge key={s} status={s} />)
                  )}
                </span>
                {records.some((r) => r.institution_id) && (
                  <p className="w-full text-xs text-slate-500">
                    Institution records: {records.filter((r) => r.institution_id).map((r) => institutionFor(catalog, r.institution_id)?.name).join(', ')}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </Block>

        <Block step={6} title="Skills to start building now">
          <BulletList items={roadmap.skills} />
        </Block>

        <Block step={7} title="Suggested next steps">
          <ol className="list-decimal space-y-2 pl-5 marker:font-bold marker:text-teal-700">
            {roadmap.nextSteps.map((s) => (
              <li key={s} className="pl-1 leading-relaxed">
                {s}
              </li>
            ))}
          </ol>
        </Block>

        <Block step={8} title="Other careers you might consider">
          <p className="mb-3 text-sm text-slate-600">Outside your top areas, but still worth a look.</p>
          <ul className="space-y-2">
            {roadmap.alternatives.map((c) => (
              <li key={c.id}>
                <Link to={`/careers/${c.id}`} className="font-semibold text-navy-900 hover:text-teal-700">
                  {c.title}
                </Link>{' '}
                <span className="text-sm text-slate-600">— {c.summary}</span>
              </li>
            ))}
          </ul>
        </Block>
      </div>

      <div className="no-print mt-10 flex flex-wrap justify-center gap-3">
        <ButtonLink to="/results" variant="secondary">
          Back to my results
        </ButtonLink>
        <Button variant="ghost" onClick={() => setConfirmReset(true)}>
          <RotateCcw aria-hidden className="size-4" /> Clear my answers and start again
        </Button>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Clear your answers?"
        confirmLabel="Clear and start again"
        danger
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          reset()
          navigate('/start')
        }}
      >
        This removes your answers and roadmap from this browser tab. Print or download your roadmap first if you want to keep it.
      </ConfirmDialog>
    </div>
  )
}
