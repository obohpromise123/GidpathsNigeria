import { Search } from 'lucide-react'
import { Input, Select } from './ui/Form'

export function SearchBox({ value, onChange, label, placeholder }: { value: string; onChange: (v: string) => void; label: string; placeholder: string }) {
  return (
    <div className="relative">
      <label htmlFor="search" className="sr-only">
        {label}
      </label>
      <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-slate-400" />
      <Input id="search" type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="pl-11" />
    </div>
  )
}

export function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  options: { id: string; label: string }[]
  allLabel: string
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold tracking-wide text-slate-600 uppercase">
        {label}
      </label>
      <Select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </Select>
    </div>
  )
}
