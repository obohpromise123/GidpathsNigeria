import type { ReactNode } from 'react'

export function AdminHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-slate-600">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

/** A table that scrolls sideways inside its card on small screens (never the whole page). */
export function DataTable({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="relative overflow-x-auto rounded-[var(--radius-card)] border border-sand-200 bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-sand-200 bg-sand-50 text-xs tracking-wide text-slate-600 uppercase">
          <tr>
            {head.map((h, i) => (
              <th key={h || i} scope="col" className="px-4 py-3 font-semibold">
                {h || <span className="sr-only">Actions</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-sand-200">{children}</tbody>
      </table>
    </div>
  )
}
