import { RefreshCw, SearchX } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from './Button'

export function Spinner({ className = 'size-6' }: { className?: string }) {
  return <span aria-hidden className={`${className} inline-block animate-spin rounded-full border-[3px] border-navy-200 border-t-teal-600`} />
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" className="flex min-h-[40vh] flex-col items-center justify-center gap-3 p-8 text-slate-600">
      <Spinner className="size-8" />
      <p>{label}</p>
    </div>
  )
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }: { title?: string; message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="mx-auto flex min-h-[40vh] max-w-md flex-col items-center justify-center gap-3 p-8 text-center">
      <h2 className="text-xl">{title}</h2>
      <p className="text-slate-600">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          <RefreshCw aria-hidden className="size-4" /> Try again
        </Button>
      )}
    </div>
  )
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-dashed border-sand-300 bg-white/60 px-6 py-12 text-center">
      <SearchX aria-hidden className="size-10 text-navy-300" />
      <h3 className="text-lg">{title}</h3>
      {children && <div className="max-w-md text-slate-600">{children}</div>}
      {action}
    </div>
  )
}
