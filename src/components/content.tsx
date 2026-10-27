import {
  ArrowRight,
  Briefcase,
  Compass,
  GraduationCap,
  HardHat,
  HeartPulse,
  Laptop,
  Megaphone,
  Palette,
  Scale,
  Sprout,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { useCatalog } from '../data/CatalogProvider'
import { categoryName } from '../data/selectors'
import type { Career, Course } from '../data/types'
import { Badge } from './ui/Badge'
import { Notice } from './ui/Notice'

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  technology: Laptop,
  health: HeartPulse,
  engineering: HardHat,
  business: Briefcase,
  'law-society': Scale,
  media: Megaphone,
  'education-care': GraduationCap,
  agriculture: Sprout,
  creative: Palette,
  technical: Wrench,
}

export function CategoryIcon({ id, className = 'size-5' }: { id: string; className?: string }) {
  const Icon = CATEGORY_ICONS[id] ?? Compass
  return <Icon aria-hidden className={className} />
}

export function CourseCard({ course }: { course: Course }) {
  const catalog = useCatalog()
  return (
    <Link
      to={`/courses/${course.id}`}
      className="group flex h-full flex-col rounded-[var(--radius-card)] border border-sand-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
    >
      <div className="flex items-center gap-2 text-xs font-semibold text-teal-700">
        <CategoryIcon id={course.category_id} className="size-4" />
        {categoryName(catalog, course.category_id)}
      </div>
      <h3 className="mt-2 text-lg group-hover:text-teal-700">{course.name}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-600">{course.summary}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-navy-800">
        View course <ArrowRight aria-hidden className="size-4 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}

export function CareerCard({ career }: { career: Career }) {
  const catalog = useCatalog()
  return (
    <Link
      to={`/careers/${career.id}`}
      className="group flex h-full flex-col rounded-[var(--radius-card)] border border-sand-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
    >
      <div className="flex items-center gap-2 text-xs font-semibold text-teal-700">
        <CategoryIcon id={career.category_id} className="size-4" />
        {categoryName(catalog, career.category_id)}
      </div>
      <h3 className="mt-2 text-lg group-hover:text-teal-700">{career.title}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-600">{career.summary}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-navy-800">
        Explore career <ArrowRight aria-hidden className="size-4 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}

export function BulletList({ items, empty = 'Not yet added.' }: { items: string[]; empty?: string }) {
  if (items.length === 0) return <p className="text-slate-500">{empty}</p>
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 leading-relaxed">
          <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-teal-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function Section({ title, children, badge, id }: { title: string; children: ReactNode; badge?: ReactNode; id?: string }) {
  return (
    <section id={id} className="print-break-avoid">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xl">{title}</h2>
        {badge}
      </div>
      <div className="mt-3 text-slate-700">{children}</div>
    </section>
  )
}

export function TagList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((i) => (
        <Badge key={i} tone="neutral">
          {i}
        </Badge>
      ))}
    </div>
  )
}

/** Reminder shown wherever we make suggestions. */
export function ExploratoryNotice({ className }: { className?: string }) {
  return (
    <Notice kind="info" title="These are ideas to explore, not a final answer" className={className}>
      This is an interest-exploration tool, not a scientific test or a prediction of success. Your interests can change, and many paths can lead to a
      good future. Talk with a guidance counsellor, teacher or parent before making important decisions.
    </Notice>
  )
}
