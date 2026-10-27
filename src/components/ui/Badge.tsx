import { BadgeCheck, CircleAlert, FlaskConical, Info } from 'lucide-react'
import type { ReactNode } from 'react'
import type { VerificationStatus } from '../../data/types'
import { cx } from './cx'

type Tone = 'neutral' | 'navy' | 'teal' | 'sun' | 'red' | 'green'

const tones: Record<Tone, string> = {
  neutral: 'bg-sand-100 text-slate-700 ring-sand-300',
  navy: 'bg-navy-50 text-navy-800 ring-navy-200',
  teal: 'bg-teal-50 text-teal-800 ring-teal-200',
  sun: 'bg-sun-100 text-sun-700 ring-sun-300',
  red: 'bg-red-50 text-red-800 ring-red-200',
  green: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
}

export function Badge({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export const VERIFICATION_INFO: Record<VerificationStatus, { label: string; tone: Tone; icon: typeof Info; description: string }> = {
  verified: {
    label: 'Verified',
    tone: 'green',
    icon: BadgeCheck,
    description: 'Checked against an official source on the date shown.',
  },
  unverified: {
    label: 'Verification required',
    tone: 'sun',
    icon: CircleAlert,
    description: 'Not yet checked against an official source. Confirm it before relying on it.',
  },
  sample: {
    label: 'Sample data',
    tone: 'neutral',
    icon: FlaskConical,
    description: 'Invented for demonstration only. Not real information.',
  },
}

/** Shows how trustworthy a factual record is. */
export function VerificationBadge({ status }: { status: VerificationStatus }) {
  const v = VERIFICATION_INFO[status]
  const Icon = v.icon
  return (
    <Badge tone={v.tone}>
      <Icon aria-hidden className="size-3.5" />
      <span title={v.description}>{v.label}</span>
    </Badge>
  )
}

/** Marks text that is a general explanation rather than official information. */
export function GeneralInfoBadge() {
  return (
    <Badge tone="navy">
      <Info aria-hidden className="size-3.5" />
      <span title="A general explanation, not official admission information">General guidance</span>
    </Badge>
  )
}
