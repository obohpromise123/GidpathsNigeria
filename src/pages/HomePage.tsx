import { ArrowRight, BookOpen, ChartColumn, ClipboardList, Compass, HandCoins, Route, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { Link } from 'react-router'
import { CategoryIcon } from '../components/content'
import { PageTitle } from '../components/layout/Logo'
import { Badge } from '../components/ui/Badge'
import { ButtonLink } from '../components/ui/Button'
import { useCatalog } from '../data/CatalogProvider'
import { careersForCourse, findCourse } from '../data/selectors'
import { APP_NAME } from '../lib/brand'

/** The interests → subjects → courses → careers journey, drawn as a route. */
function RouteIllustration() {
  const stops = [
    { x: 40, y: 250, label: 'Your interests', fill: '#f2b53d' },
    { x: 150, y: 170, label: 'Subjects', fill: '#5ec4aa' },
    { x: 250, y: 110, label: 'Courses', fill: '#86a3d9' },
    { x: 340, y: 52, label: 'Careers', fill: '#ffffff' },
  ]
  return (
    <svg viewBox="0 0 400 300" className="h-auto w-full" role="img" aria-label="A path from your interests, to subjects, to courses, to careers">
      <defs>
        <pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.2" fill="#3a5ea8" opacity="0.35" />
        </pattern>
      </defs>
      <rect width="400" height="300" rx="28" fill="#0f1f3d" />
      <rect width="400" height="300" rx="28" fill="url(#dots)" />
      <path d="M40 250 C 90 250, 100 170, 150 170 S 210 110, 250 110 S 300 52, 340 52" fill="none" stroke="#2fa98d" strokeWidth="10" strokeLinecap="round" />
      <path
        d="M40 250 C 90 250, 100 170, 150 170 S 210 110, 250 110 S 300 52, 340 52"
        fill="none"
        stroke="#0f1f3d"
        strokeWidth="2"
        strokeDasharray="6 10"
        strokeLinecap="round"
      />
      {stops.map((s, i) => (
        <g key={s.label}>
          <circle cx={s.x} cy={s.y} r="15" fill={s.fill} stroke="#0f1f3d" strokeWidth="4" />
          <text
            x={s.x + (i === 3 ? 0 : 22)}
            y={s.y + (i === 3 ? -24 : 6)}
            fill="#fff"
            stroke="#0f1f3d"
            strokeWidth="6"
            paintOrder="stroke"
            strokeLinejoin="round"
            fontSize="15"
            fontWeight="700"
            textAnchor={i === 3 ? 'middle' : 'start'}
            fontFamily="inherit"
          >
            {s.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

const EXAMPLES = [
  { interest: 'Love Biology and helping people?', courses: ['nursing', 'medical-lab-science'] },
  { interest: 'Enjoy computers and solving puzzles?', courses: ['computer-science', 'statistics'] },
  { interest: 'Good at debates and writing?', courses: ['law', 'mass-communication'] },
]

const FAQ = [
  {
    q: 'Is it really free for students?',
    a: 'Yes. Exploring careers, taking the interest quiz, browsing courses and creating a roadmap are free for every student. Schools may pay in future for extra tools such as class-level reports, but students will not be charged for core guidance.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'No. You can explore without signing up and without giving your name. Your answers stay in this browser tab and are cleared when you close it.',
  },
  {
    q: 'Will the quiz tell me exactly what I should study?',
    a: 'No — and be careful of anything that claims to. The quiz is an exploration tool, not a scientific test. It suggests several areas to look into and explains why, so you can have better conversations with your counsellor and parents.',
  },
  {
    q: 'Are the admission requirements official?',
    a: 'Every admission record is labelled. “Verified” means an administrator checked it against an official source on a recorded date. Anything else says “Verification required”. Always confirm requirements on JAMB IBASS and the institution’s official website.',
  },
  {
    q: `Is ${APP_NAME} connected to JAMB, WAEC or any university?`,
    a: `No. ${APP_NAME} is independent. We point you to official sources, but we are not affiliated with or endorsed by JAMB, WAEC, NECO, any ministry or any institution.`,
  },
  {
    q: 'I chose Arts (or Science, or Commercial). Is it too late to change my mind?',
    a: 'Not necessarily. Many courses accept students from different classes if they have the right subject combination, and there are alternative routes such as polytechnics, colleges of education and direct entry. Speak to your school early if you are thinking of changing subjects.',
  },
]

export default function HomePage() {
  const catalog = useCatalog()

  return (
    <>
      <PageTitle title="Discover your path" />

      {/* Hero */}
      <section className="overflow-hidden bg-white">
        <div className="container-page grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:py-20">
          <div>
            <Badge tone="teal" className="text-sm">
              <Sparkles aria-hidden className="size-4" /> Free for every student
            </Badge>
            <h1 className="mt-5 text-4xl leading-tight sm:text-5xl">
              Find out where your interests <span className="text-teal-600">can take you.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              {APP_NAME} helps Nigerian secondary school students connect what they enjoy to subjects, courses and careers — with clear, honest
              information about what each path needs.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink to="/start" variant="accent" size="lg">
                Discover your path <ArrowRight aria-hidden className="size-5" />
              </ButtonLink>
              <ButtonLink to="/courses" variant="secondary" size="lg">
                Explore courses
              </ButtonLink>
            </div>
            <p className="mt-4 text-sm text-slate-500">No sign-up. No name needed. Takes about 10 minutes.</p>
          </div>
          <div className="mx-auto w-full max-w-md lg:max-w-none">
            <RouteIllustration />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container-page py-16" aria-labelledby="how">
        <h2 id="how" className="text-3xl">
          How it works
        </h2>
        <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Compass, title: 'Tell us about you', text: 'Your class, favourite subjects and the things you enjoy. Skip anything you’re unsure about.' },
            { icon: ClipboardList, title: 'Take the interest quiz', text: '16 quick questions about what you like doing. There are no right or wrong answers.' },
            { icon: Route, title: 'See your suggestions', text: 'Several career areas to explore, with a clear explanation of why each one was suggested.' },
            { icon: BookOpen, title: 'Build your roadmap', text: 'Courses, subjects, admission checks and next steps you can print or download.' },
          ].map((s, i) => (
            <li key={s.title} className="relative rounded-[var(--radius-card)] border border-sand-200 bg-white p-6">
              <span className="absolute top-5 right-5 text-4xl font-extrabold text-sand-200">{i + 1}</span>
              <s.icon aria-hidden className="size-8 text-teal-600" />
              <h3 className="mt-4 text-lg">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Interests → courses → careers */}
      <section className="bg-navy-900 py-16 text-white" aria-labelledby="examples">
        <div className="container-page">
          <h2 id="examples" className="text-3xl text-white">
            From what you enjoy to where it can lead
          </h2>
          <p className="mt-3 max-w-2xl text-navy-200">A few examples. Every course can lead to more than one career, and many careers can be reached by more than one course.</p>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {EXAMPLES.map((ex) => {
              const courses = ex.courses.map((id) => findCourse(catalog, id)).filter((c) => c !== undefined)
              return (
                <div key={ex.interest} className="rounded-[var(--radius-card)] bg-white/5 p-6 ring-1 ring-white/10">
                  <p className="text-lg font-bold text-sun-300">{ex.interest}</p>
                  <ul className="mt-4 space-y-4">
                    {courses.map((c) => (
                      <li key={c.id}>
                        <Link to={`/courses/${c.id}`} className="font-semibold text-white underline decoration-teal-400 underline-offset-4 hover:text-teal-200">
                          {c.name}
                        </Link>
                        <p className="mt-1 text-sm text-navy-200">
                          Could lead to: {careersForCourse(catalog, c.id).map((k) => k.title).join(', ') || 'see course page'}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Career categories */}
      <section className="container-page py-16" aria-labelledby="areas">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="areas" className="text-3xl">
              Career areas to explore
            </h2>
            <p className="mt-2 text-slate-600">Browse freely — you don’t need a quiz result to explore any area.</p>
          </div>
          <ButtonLink to="/careers" variant="secondary">
            All careers
          </ButtonLink>
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {catalog.categories.map((c) => (
            <li key={c.id}>
              <Link
                to={`/careers?category=${c.id}`}
                className="flex h-full flex-col gap-3 rounded-[var(--radius-card)] border border-sand-200 bg-white p-5 transition hover:border-teal-300 hover:shadow-md"
              >
                <span className="flex size-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                  <CategoryIcon id={c.id} className="size-6" />
                </span>
                <span className="font-bold text-navy-900">{c.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Free + trust */}
      <section className="container-page" aria-labelledby="free">
        <div className="grid gap-6 rounded-[2rem] bg-teal-50 p-8 sm:p-10 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <h2 id="free" className="text-2xl">
              Core guidance is free for students. Always.
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3 lg:col-span-2">
            {[
              { icon: HandCoins, title: 'No student fees', text: 'Every student can explore careers regardless of their family’s finances.' },
              { icon: ShieldCheck, title: 'Privacy first', text: 'No name, phone number or location needed. No advertising tracking.' },
              { icon: BookOpen, title: 'Honest information', text: 'Admission facts are labelled verified or not, with sources and dates.' },
            ].map((f) => (
              <div key={f.title}>
                <f.icon aria-hidden className="size-7 text-teal-700" />
                <h3 className="mt-3 text-base">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-700">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For schools */}
      <section className="container-page py-16" aria-labelledby="schools">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold tracking-wider text-teal-700 uppercase">For schools</p>
            <h2 id="schools" className="mt-2 text-3xl">
              Give every student a structured start to career guidance
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Counsellors and principals can use {APP_NAME} to run career guidance sessions, give students reliable course information and see
              anonymous, class-level participation — without collecting personal data about students.
            </p>
            <ButtonLink to="/schools" variant="primary" className="mt-6">
              Learn how it works for schools
            </ButtonLink>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Users, text: 'Ready-made activities for guidance lessons' },
              { icon: ChartColumn, text: 'Anonymous participation summaries' },
              { icon: BookOpen, text: 'A shared library of courses and careers' },
              { icon: ShieldCheck, text: 'Designed for minors’ privacy' },
            ].map((b) => (
              <li key={b.text} className="flex items-start gap-3 rounded-2xl border border-sand-200 bg-white p-5">
                <b.icon aria-hidden className="size-6 shrink-0 text-navy-600" />
                <span className="font-medium text-navy-900">{b.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-page" aria-labelledby="faq">
        <h2 id="faq" className="text-3xl">
          Frequently asked questions
        </h2>
        <div className="mt-6 divide-y divide-sand-200 rounded-[var(--radius-card)] border border-sand-200 bg-white">
          {FAQ.map((f) => (
            <details key={f.q} className="group p-5 sm:p-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-navy-900">
                {f.q}
                <span aria-hidden className="text-xl text-teal-600 transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  )
}
