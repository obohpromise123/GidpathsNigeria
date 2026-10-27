import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cx } from './cx'

// Form controls. React 19 passes `ref` through props, so these work directly
// with React Hook Form's register().

const control =
  'block w-full rounded-xl border border-sand-300 bg-white px-3.5 py-2.5 text-base text-slate-900 placeholder:text-slate-400 ' +
  'hover:border-navy-300 focus:border-teal-500 aria-[invalid=true]:border-red-600 disabled:bg-sand-100'

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string
  htmlFor: string
  hint?: ReactNode
  error?: string
  required?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-navy-900">
        {label}
        {required ? (
          <span className="text-red-700"> *</span>
        ) : (
          <span className="font-normal text-slate-500"> (optional)</span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p id={`${htmlFor}-hint`} className="mt-1.5 text-sm text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${htmlFor}-error`} className="mt-1.5 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}

/** aria attributes that connect a control to its Field's hint/error text. */
export const describedBy = (id: string, error?: string) => ({
  'aria-invalid': error ? true : undefined,
  'aria-describedby': error ? `${id}-error` : `${id}-hint`,
})

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement> }) {
  return <input className={cx(control, 'min-h-11', className)} {...rest} />
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { ref?: React.Ref<HTMLTextAreaElement> }) {
  return <textarea className={cx(control, 'min-h-24', className)} {...rest} />
}

export function Select({ className, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { ref?: React.Ref<HTMLSelectElement> }) {
  return <select className={cx(control, 'min-h-11 pr-8', className)} {...rest} />
}

export function Checkbox({
  label,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; ref?: React.Ref<HTMLInputElement> }) {
  return (
    <label className={cx('flex cursor-pointer items-start gap-3 text-sm text-slate-700', className)}>
      <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-teal-600" {...rest} />
      <span>{label}</span>
    </label>
  )
}
