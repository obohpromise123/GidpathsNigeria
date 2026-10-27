import { createBrowserRouter, type RouteObject } from 'react-router'
import SiteLayout from './components/layout/SiteLayout'
import AdmissionsPage from './pages/AdmissionsPage'
import CareerDetailPage from './pages/CareerDetailPage'
import CareersPage from './pages/CareersPage'
import CourseDetailPage from './pages/CourseDetailPage'
import CoursesPage from './pages/CoursesPage'
import HomePage from './pages/HomePage'
import { ContactPage, PrivacyPage, TermsPage } from './pages/LegalPages'
import NotFoundPage from './pages/NotFoundPage'
import PathwayDetailPage from './pages/PathwayDetailPage'
import PathwaysPage from './pages/PathwaysPage'
import QuizPage from './pages/QuizPage'
import ResultsPage from './pages/ResultsPage'
import RoadmapPage from './pages/RoadmapPage'
import RouteError from './pages/RouteError'
import SchoolsPage from './pages/SchoolsPage'
import SignInPage from './pages/SignInPage'
import StartPage from './pages/StartPage'

// Student pages load immediately. Staff areas are split into separate
// downloads ("lazy"), so students on mobile data never download admin code.
const admin = (name: string) => async () => {
  const pages = await import('./pages/admin/pages')
  return { Component: pages[name as keyof typeof pages] as React.ComponentType }
}

export const routes: RouteObject[] = [
  {
    path: '/',
    Component: SiteLayout,
    ErrorBoundary: RouteError,
    children: [
      { index: true, Component: HomePage },
      { path: 'start', Component: StartPage },
      { path: 'quiz', Component: QuizPage },
      { path: 'results', Component: ResultsPage },
      { path: 'roadmap', Component: RoadmapPage },
      { path: 'pathways', Component: PathwaysPage },
      { path: 'pathways/:id', Component: PathwayDetailPage },
      { path: 'courses', Component: CoursesPage },
      { path: 'courses/:id', Component: CourseDetailPage },
      { path: 'careers', Component: CareersPage },
      { path: 'careers/:id', Component: CareerDetailPage },
      { path: 'admissions', Component: AdmissionsPage },
      { path: 'schools', Component: SchoolsPage },
      { path: 'privacy', Component: PrivacyPage },
      { path: 'terms', Component: TermsPage },
      { path: 'contact', Component: ContactPage },
      { path: 'sign-in', Component: SignInPage },
      {
        path: 'school',
        lazy: async () => ({ Component: (await import('./pages/school/SchoolDashboard')).default }),
      },
      { path: '*', Component: NotFoundPage },
    ],
  },
  {
    path: '/admin',
    ErrorBoundary: RouteError,
    lazy: async () => ({ Component: (await import('./pages/admin/AdminLayout')).default }),
    children: [
      { index: true, lazy: admin('AdminOverview') },
      { path: 'enquiries', lazy: admin('EnquiriesPage') },
      { path: 'verification', lazy: admin('VerificationPage') },
      { path: 'members', lazy: admin('MembersPage') },
      { path: ':resource', lazy: admin('ResourcePage') },
    ],
  },
]

export const createRouter = () => createBrowserRouter(routes)
