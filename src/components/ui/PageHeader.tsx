import type { ReactNode } from 'react'

export function PageHeader({
  eyebrow,
  title,
  children,
  actions,
}: {
  eyebrow?: string
  title: string
  children?: ReactNode
  actions?: ReactNode
}) {
  return (
    <header className="border-b border-sand-200 bg-gradient-to-b from-white to-sand-50">
      <div className="container-page py-10 sm:py-14">
        {eyebrow && <p className="text-sm font-semibold tracking-wider text-teal-700 uppercase">{eyebrow}</p>}
        <h1 className="mt-2 text-3xl sm:text-4xl">{title}</h1>
        {children && <div className="mt-3 max-w-2xl text-lg leading-relaxed text-slate-600">{children}</div>}
        {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
      </div>
    </header>
  )
}
