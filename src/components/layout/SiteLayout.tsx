import { FlaskConical, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router'
import { useAuth } from '../../auth/AuthProvider'
import { CatalogGate } from '../../data/CatalogProvider'
import { useJourney } from '../../features/JourneyProvider'
import { APP_NAME, CONTACT } from '../../lib/brand'
import { isDemoMode } from '../../lib/config'
import { ButtonLink } from '../ui/Button'
import { cx } from '../ui/cx'
import { Logo } from './Logo'

const NAV = [
  { to: '/pathways', label: 'Pathways' },
  { to: '/courses', label: 'Courses' },
  { to: '/careers', label: 'Careers' },
  { to: '/admissions', label: 'Admissions' },
  { to: '/schools', label: 'For schools' },
]

export function DemoBanner() {
  if (!isDemoMode) return null
  return (
    <div className="no-print bg-sun-100 text-sun-700">
      <p className="container-page flex items-center gap-2 py-2 text-xs font-medium sm:text-sm">
        <FlaskConical aria-hidden className="size-4 shrink-0" />
        <span>
          <strong>Demo mode:</strong> using built-in sample data. Nothing you do here is saved to a database or sent anywhere.
        </span>
      </p>
    </div>
  )
}

function Header() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { quizCompletedAt, onboardingDone } = useJourney()
  const auth = useAuth()
  useEffect(() => setOpen(false), [location.pathname])

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cx('rounded-full px-3 py-2 text-sm font-semibold transition-colors', isActive ? 'bg-navy-50 text-navy-900' : 'text-slate-700 hover:text-navy-900')

  const dashboard = auth.isAdmin ? '/admin' : auth.memberships.length ? '/school' : null
  const hasProgress = quizCompletedAt || onboardingDone

  return (
    <header className="no-print sticky top-0 z-40 border-b border-sand-200 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" aria-label={`${APP_NAME} home`} className="shrink-0">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={linkClass}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          {dashboard && (
            <ButtonLink to={dashboard} variant="ghost" size="sm">
              Dashboard
            </ButtonLink>
          )}
          {hasProgress && (
            <ButtonLink to="/roadmap" variant="secondary" size="sm">
              My roadmap
            </ButtonLink>
          )}
          <ButtonLink to="/start" variant="accent" size="sm">
            Discover your path
          </ButtonLink>
        </div>
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-full text-navy-900 hover:bg-navy-50 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X aria-hidden /> : <Menu aria-hidden />}
        </button>
      </div>
      {open && (
        <nav id="mobile-menu" aria-label="Main" className="border-t border-sand-200 bg-white lg:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => cx(linkClass({ isActive }), 'py-3 text-base')}>
                {n.label}
              </NavLink>
            ))}
            {hasProgress && (
              <NavLink to="/roadmap" className={({ isActive }) => cx(linkClass({ isActive }), 'py-3 text-base')}>
                My roadmap
              </NavLink>
            )}
            {dashboard && (
              <NavLink to={dashboard} className={({ isActive }) => cx(linkClass({ isActive }), 'py-3 text-base')}>
                Dashboard
              </NavLink>
            )}
            <ButtonLink to="/start" variant="accent" className="mt-2">
              Discover your path
            </ButtonLink>
          </div>
        </nav>
      )}
    </header>
  )
}

function Footer() {
  const groups = [
    {
      title: 'Explore',
      links: [
        { to: '/start', label: 'Discover your path' },
        { to: '/quiz', label: 'Career interest quiz' },
        { to: '/pathways', label: 'Subject pathways' },
        { to: '/courses', label: 'Courses' },
        { to: '/careers', label: 'Careers' },
        { to: '/admissions', label: 'Admission guidance' },
      ],
    },
    {
      title: 'For schools',
      links: [
        { to: '/schools', label: 'How it helps schools' },
        { to: '/schools#enquiry', label: 'Request a demonstration' },
        { to: '/sign-in', label: 'Staff sign in' },
      ],
    },
    {
      title: 'About',
      links: [
        { to: '/privacy', label: 'Privacy' },
        { to: '/terms', label: 'Terms of use' },
        { to: '/contact', label: 'Contact' },
      ],
    },
  ]
  return (
    <footer className="no-print mt-20 bg-navy-950 text-navy-100">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo inverted />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-navy-200">
            Free career exploration for Nigerian secondary school students. Suggestions are for exploration only and do not replace advice from a qualified
            counsellor.
          </p>
          <p className="mt-4 text-sm text-navy-300">
            {CONTACT.email} · {CONTACT.phone}
          </p>
        </div>
        {groups.map((g) => (
          <div key={g.title}>
            <h2 className="text-sm font-semibold tracking-wider text-white uppercase">{g.title}</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {g.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-navy-200 hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <p className="container-page py-5 text-xs leading-relaxed text-navy-300">
          © {new Date().getFullYear()} {APP_NAME}. Independent service — not affiliated with or endorsed by JAMB, WAEC, NECO, any ministry or any
          institution. Always confirm admission requirements with official sources.
        </p>
      </div>
    </footer>
  )
}

export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only z-50 rounded-full bg-navy-900 px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      Skip to main content
    </a>
  )
}

export default function SiteLayout() {
  return (
    <>
      <SkipLink />
      <DemoBanner />
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        <CatalogGate>
          <Outlet />
        </CatalogGate>
      </main>
      <Footer />
      <ScrollRestoration />
    </>
  )
}
