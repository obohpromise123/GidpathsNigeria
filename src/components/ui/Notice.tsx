import { CircleAlert, Info, Lightbulb, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { cx } from './cx'

type Kind = 'info' | 'tip' | 'warning' | 'error'

const styles: Record<Kind, { box: string; icon: typeof Info }> = {
  info: { box: 'border-navy-200 bg-navy-50 text-navy-900', icon: Info },
  tip: { box: 'border-teal-200 bg-teal-50 text-teal-900', icon: Lightbulb },
  warning: { box: 'border-sun-300 bg-sun-100 text-sun-700', icon: TriangleAlert },
  error: { box: 'border-red-200 bg-red-50 text-red-900', icon: CircleAlert },
}

export function Notice({
  kind = 'info',
  title,
  children,
  className,
}: {
  kind?: Kind
  title?: string
  children: ReactNode
  className?: string
}) {
  const { box, icon: Icon } = styles[kind]
  return (
    <div className={cx('flex gap-3 rounded-2xl border p-4 text-sm leading-relaxed', box, className)} role={kind === 'error' ? 'alert' : undefined}>
      <Icon aria-hidden className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        <div className={title ? 'mt-0.5' : undefined}>{children}</div>
      </div>
    </div>
  )
}
