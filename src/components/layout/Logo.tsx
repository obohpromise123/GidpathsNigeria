import { APP_NAME } from '../../lib/brand'

/** A winding route between two stops — the "path" motif used across the site. */
export function LogoMark({ className = 'size-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="9" fill="#0f1f3d" />
      <path d="M8 23c4 0 4-7 8-7s4-7 8-7" fill="none" stroke="#2fa98d" strokeWidth="3" strokeLinecap="round" />
      <circle cx="8" cy="23" r="2.6" fill="#f2b53d" />
      <circle cx="24" cy="9" r="2.6" fill="#fff" />
    </svg>
  )
}

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className={`text-lg font-extrabold tracking-tight ${inverted ? 'text-white' : 'text-navy-900'}`}>
        {APP_NAME.replace('Nigeria', '')}
        <span className={inverted ? 'text-teal-300' : 'text-teal-600'}>Nigeria</span>
      </span>
    </span>
  )
}

/** Sets the browser tab title (React 19 hoists <title> into <head>). */
export function PageTitle({ title }: { title: string }) {
  return <title>{`${title} · ${APP_NAME}`}</title>
}
