import { Check } from 'lucide-react'
import { cx } from './cx'

export interface ChipOption {
  id: string
  label: string
}

/**
 * A set of large, tappable choices. Works as multi-select by default, or as
 * a single choice with `single`. Each chip is a toggle button (aria-pressed).
 */
export function ChipGroup({
  legend,
  hint,
  options,
  value,
  onChange,
  single = false,
  max,
}: {
  legend: string
  hint?: string
  options: ChipOption[]
  value: string[]
  onChange: (value: string[]) => void
  single?: boolean
  max?: number
}) {
  const toggle = (id: string) => {
    if (single) return onChange(value.includes(id) ? [] : [id])
    if (value.includes(id)) return onChange(value.filter((v) => v !== id))
    if (max && value.length >= max) return
    onChange([...value, id])
  }
  return (
    <fieldset>
      <legend className="text-lg font-bold text-navy-900">{legend}</legend>
      {hint && <p className="mt-1 text-sm text-slate-600">{hint}</p>}
      <div className="mt-4 flex flex-wrap gap-2.5">
        {options.map((o) => {
          const selected = value.includes(o.id)
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={selected}
              onClick={() => toggle(o.id)}
              className={cx(
                'inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-left text-sm font-medium transition-colors',
                selected
                  ? 'border-teal-600 bg-teal-600 text-white'
                  : 'border-sand-300 bg-white text-slate-800 hover:border-teal-400 hover:bg-teal-50',
              )}
            >
              {selected && <Check aria-hidden className="size-4" />}
              {o.label}
            </button>
          )
        })}
      </div>
      {max && !single && (
        <p className="mt-2 text-xs text-slate-500" aria-live="polite">
          {value.length} of up to {max} chosen
        </p>
      )}
    </fieldset>
  )
}
