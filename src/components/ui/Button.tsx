import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'
import { cx } from './cx'

type Variant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 select-none'

const variants: Record<Variant, string> = {
  primary: 'bg-navy-900 text-white hover:bg-navy-700',
  accent: 'bg-teal-600 text-white hover:bg-teal-700',
  secondary: 'border border-navy-200 bg-white text-navy-900 hover:border-navy-400 hover:bg-navy-50',
  ghost: 'text-navy-800 hover:bg-navy-50',
  danger: 'bg-red-700 text-white hover:bg-red-800',
}

// Every size keeps a comfortable touch target (40–52px tall).
const sizes: Record<Size, string> = {
  sm: 'min-h-10 px-4 text-sm',
  md: 'min-h-11 px-5 text-[0.95rem]',
  lg: 'min-h-13 px-7 text-base',
}

export const buttonClasses = (variant: Variant = 'primary', size: Size = 'md', className?: string) =>
  cx(base, variants[variant], sizes[size], className)

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

export function Button({ variant, size, loading, className, children, disabled, type = 'button', ...rest }: ButtonProps) {
  return (
    <button type={type} className={buttonClasses(variant, size, className)} disabled={disabled || loading} {...rest}>
      {loading && <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />}
      {children}
    </button>
  )
}

interface ButtonLinkProps extends Omit<LinkProps, 'className'> {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

export function ButtonLink({ variant, size, className, ...rest }: ButtonLinkProps) {
  return <Link className={buttonClasses(variant, size, className)} {...rest} />
}
