import { isRouteErrorResponse, useRouteError } from 'react-router'
import { ButtonLink } from '../components/ui/Button'

/** Shown if a page crashes or fails to load (for example, a dropped connection). */
export default function RouteError() {
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404
  // Log details for developers; show users a safe, friendly message only.
  if (!notFound) console.error(error)
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-sand-50 px-6 text-center">
      <h1 className="text-3xl">{notFound ? 'Page not found' : 'Something went wrong'}</h1>
      <p className="mt-3 max-w-md text-slate-600">
        {notFound
          ? 'We couldn’t find that page.'
          : 'This page couldn’t be shown. If you are on mobile data, check your connection and try again.'}
      </p>
      <div className="mt-6 flex gap-3">
        <ButtonLink to="/" variant="primary">
          Go home
        </ButtonLink>
        <button type="button" onClick={() => window.location.reload()} className="font-semibold text-navy-800 underline">
          Reload
        </button>
      </div>
    </div>
  )
}
