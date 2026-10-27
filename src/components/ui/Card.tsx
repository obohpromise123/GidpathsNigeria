import type { HTMLAttributes } from 'react'
import { cx } from './cx'

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx('rounded-[var(--radius-card)] border border-sand-200 bg-white p-5 shadow-sm sm:p-6', className)} {...rest} />
}
