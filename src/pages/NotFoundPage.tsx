import { PageTitle } from '../components/layout/Logo'
import { ButtonLink } from '../components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="container-page flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
      <PageTitle title="Page not found" />
      <p className="text-sm font-semibold tracking-wider text-teal-700 uppercase">Page not found</p>
      <h1 className="mt-2 text-3xl">We couldn’t find that page</h1>
      <p className="mt-3 max-w-md text-slate-600">The link may be wrong, or the page may have moved. Try one of these instead:</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <ButtonLink to="/" variant="primary">
          Home
        </ButtonLink>
        <ButtonLink to="/courses" variant="secondary">
          Courses
        </ButtonLink>
        <ButtonLink to="/careers" variant="secondary">
          Careers
        </ButtonLink>
      </div>
    </div>
  )
}
