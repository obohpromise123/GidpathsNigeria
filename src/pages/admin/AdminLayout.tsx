import {
  BookOpen,
  Briefcase,
  Building,
  FileCheck,
  HandCoins,
  Inbox,
  LayoutDashboard,
  Library,
  LogOut,
  Map,
  Menu,
  ReceiptText,
  School,
  Shapes,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../../auth/AuthProvider'
import { RequireRole } from '../../auth/RequireRole'
import { DemoBanner, SkipLink } from '../../components/layout/SiteLayout'
import { Logo } from '../../components/layout/Logo'
import { cx } from '../../components/ui/cx'
import { CatalogGate } from '../../data/CatalogProvider'

const NAV: { group: string; items: { to: string; label: string; icon: LucideIcon }[] }[] = [
  { group: '', items: [{ to: '/admin', label: 'Overview', icon: LayoutDashboard }] },
  {
    group: 'Content',
    items: [
      { to: '/admin/courses', label: 'Courses', icon: BookOpen },
      { to: '/admin/careers', label: 'Careers', icon: Briefcase },
      { to: '/admin/pathways', label: 'Subject pathways', icon: Map },
      { to: '/admin/categories', label: 'Career areas', icon: Shapes },
    ],
  },
  {
    group: 'Admissions',
    items: [
      { to: '/admin/institutions', label: 'Institutions', icon: Building },
      { to: '/admin/programmes', label: 'Programmes offered', icon: Library },
      { to: '/admin/admissions', label: 'Admission requirements', icon: FileCheck },
      { to: '/admin/sources', label: 'Sources', icon: BookOpen },
      { to: '/admin/verification', label: 'Verification', icon: FileCheck },
    ],
  },
  {
    group: 'Schools',
    items: [
      { to: '/admin/enquiries', label: 'Enquiries', icon: Inbox },
      { to: '/admin/schools', label: 'Schools', icon: School },
      { to: '/admin/members', label: 'School staff', icon: Users },
      { to: '/admin/subscriptions', label: 'Subscriptions', icon: ReceiptText },
      { to: '/admin/sponsorships', label: 'Sponsorships', icon: HandCoins },
    ],
  },
]

function Sidebar() {
  return (
    <nav aria-label="Admin" className="space-y-6 p-4">
      {NAV.map((g) => (
        <div key={g.group || 'top'}>
          {g.group && <p className="mb-2 px-3 text-xs font-semibold tracking-wider text-navy-300 uppercase">{g.group}</p>}
          <ul className="space-y-0.5">
            {g.items.map((i) => (
              <li key={i.to}>
                <NavLink
                  to={i.to}
                  end={i.to === '/admin'}
                  className={({ isActive }) =>
                    cx(
                      'flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
                      isActive ? 'bg-white/10 text-white' : 'text-navy-200 hover:bg-white/5 hover:text-white',
                    )
                  }
                >
                  <i.icon aria-hidden className="size-4 shrink-0" />
                  {i.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

export default function AdminLayout() {
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  useEffect(() => setOpen(false), [location.pathname])

  return (
    <RequireRole role="admin">
      <title>Admin · PathNigeria</title>
      <SkipLink />
      <DemoBanner />
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 bg-navy-950 lg:block">
          <div className="sticky top-0">
            <Link to="/" className="block px-6 py-5">
              <Logo inverted />
            </Link>
            <Sidebar />
          </div>
        </aside>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-navy-950/50" aria-hidden onClick={() => setOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-navy-950">
              <div className="flex items-center justify-between px-5 py-4">
                <Logo inverted />
                <button type="button" className="rounded-full p-2 text-white" aria-label="Close menu" onClick={() => setOpen(false)}>
                  <X aria-hidden />
                </button>
              </div>
              <Sidebar />
            </aside>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-sand-200 bg-white px-4 sm:px-6">
            <div className="flex items-center gap-2">
              <button type="button" className="rounded-full p-2 lg:hidden" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
                <Menu aria-hidden />
              </button>
              <p className="font-semibold text-navy-900">Admin dashboard</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-slate-600 sm:inline">{auth.displayName ?? auth.email}</span>
              <button
                type="button"
                onClick={() => void auth.signOut().then(() => navigate('/'))}
                className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-navy-800 hover:bg-navy-50"
              >
                <LogOut aria-hidden className="size-4" /> Sign out
              </button>
            </div>
          </header>
          <main id="main" tabIndex={-1} className="p-4 outline-none sm:p-6 lg:p-8">
            <CatalogGate>
              <Outlet />
            </CatalogGate>
          </main>
        </div>
      </div>
    </RequireRole>
  )
}
