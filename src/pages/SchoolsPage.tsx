import { zodResolver } from '@hookform/resolvers/zod'
import { BookOpen, ChartColumn, CircleCheck, ClipboardList, Compass, ShieldCheck, Users } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { PageTitle } from '../components/layout/Logo'
import { Button } from '../components/ui/Button'
import { Checkbox, describedBy, Field, Input, Select, Textarea } from '../components/ui/Form'
import { Notice } from '../components/ui/Notice'
import { PageHeader } from '../components/ui/PageHeader'
import { friendlyError } from '../data/errors'
import { getRepository } from '../data/repository'
import { APP_NAME } from '../lib/brand'
import { isDemoMode } from '../lib/config'
import { NIGERIAN_STATES, STUDENT_COUNT_RANGES } from '../lib/nigeria'
import { emptyEnquiry, enquirySchema, toEnquiryRow, type EnquiryForm } from '../lib/validation'

const BENEFITS = [
  { icon: ClipboardList, title: 'Organise guidance activities', text: 'Run structured career sessions with a clear flow: onboarding, interest quiz, results discussion and roadmap.' },
  { icon: BookOpen, title: 'Reliable course information', text: 'Give students one place to explore courses, careers and pathways, with verification labels on admission facts.' },
  { icon: Users, title: 'Support counsellors', text: 'Students arrive at counselling sessions with a printed roadmap, making conversations more focused.' },
  { icon: ChartColumn, title: 'Class-level summaries', text: 'See anonymous totals — how many students took part and which career areas are popular — never individual answers.' },
  { icon: Compass, title: 'A consistent experience', text: 'Every student gets the same quality of exploration, regardless of class size or counsellor workload.' },
  { icon: ShieldCheck, title: 'Built for minors’ privacy', text: 'Students don’t need accounts or give names. Your school sees aggregate information only.' },
]

function EnquiryFormSection() {
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryForm>({ resolver: zodResolver(enquirySchema), defaultValues: emptyEnquiry })

  const onSubmit = async (form: EnquiryForm) => {
    setServerError(null)
    try {
      await (await getRepository()).submitEnquiry(toEnquiryRow(form))
      setSubmitted(true)
      reset()
    } catch (e) {
      setServerError(friendlyError(e))
    }
  }

  if (submitted) {
    return (
      <div role="status" className="rounded-[var(--radius-card)] border border-teal-200 bg-teal-50 p-8 text-center">
        <CircleCheck aria-hidden className="mx-auto size-12 text-teal-600" />
        {isDemoMode ? (
          <>
            <h3 className="mt-4 text-2xl">Demo mode: your enquiry was not sent</h3>
            <p className="mx-auto mt-2 max-w-md text-slate-700">
              This copy of {APP_NAME} is running without a database. Your enquiry is held only in this browser tab, so you can see how it appears in the
              demo admin dashboard. It will disappear when you reload the page.
            </p>
          </>
        ) : (
          <>
            <h3 className="mt-4 text-2xl">Thank you — we’ve received your enquiry</h3>
            <p className="mx-auto mt-2 max-w-md text-slate-700">Someone from our team will contact you using the email address you provided.</p>
          </>
        )}
        <Button variant="secondary" className="mt-6" onClick={() => setSubmitted(false)}>
          Send another enquiry
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="rounded-[var(--radius-card)] border border-sand-200 bg-white p-5 sm:p-8">
      {isDemoMode && (
        <Notice kind="warning" className="mb-6">
          Demo mode: submissions are <strong>not</strong> sent to anyone. Configure Supabase to receive real enquiries.
        </Notice>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="School name" htmlFor="school_name" required error={errors.school_name?.message} className="sm:col-span-2">
          <Input id="school_name" autoComplete="organization" {...register('school_name')} {...describedBy('school_name', errors.school_name?.message)} />
        </Field>
        <Field label="Your name" htmlFor="contact_name" required error={errors.contact_name?.message}>
          <Input id="contact_name" autoComplete="name" {...register('contact_name')} {...describedBy('contact_name', errors.contact_name?.message)} />
        </Field>
        <Field label="Your role" htmlFor="role_title" required error={errors.role_title?.message}>
          <Input
            id="role_title"
            autoComplete="organization-title"
            placeholder="e.g. Principal"
            {...register('role_title')}
            {...describedBy('role_title', errors.role_title?.message)}
          />
        </Field>
        <Field label="Work email" htmlFor="email" required error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" {...register('email')} {...describedBy('email', errors.email?.message)} />
        </Field>
        <Field label="Phone number" htmlFor="phone" error={errors.phone?.message}>
          <Input id="phone" type="tel" autoComplete="tel" {...register('phone')} {...describedBy('phone', errors.phone?.message)} />
        </Field>
        <Field label="State" htmlFor="state" required error={errors.state?.message}>
          <Select id="state" {...register('state')} {...describedBy('state', errors.state?.message)}>
            <option value="">Choose a state</option>
            {NIGERIAN_STATES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="Number of students" htmlFor="student_count">
          <Select id="student_count" {...register('student_count')}>
            <option value="">Prefer not to say</option>
            {STUDENT_COUNT_RANGES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="How can we help?" htmlFor="message" error={errors.message?.message} className="sm:col-span-2">
          <Textarea id="message" rows={4} {...register('message')} {...describedBy('message', errors.message?.message)} />
        </Field>
        {/* Honeypot for spam bots: hidden from people and screen readers. */}
        <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
          <label htmlFor="website">Website</label>
          <input id="website" tabIndex={-1} autoComplete="off" {...register('website')} />
        </div>
        <div className="sm:col-span-2">
          <Checkbox
            {...register('consent')}
            aria-invalid={errors.consent ? true : undefined}
            label={
              <>
                I agree that {APP_NAME} may store these details and contact me about this enquiry. We will not share them or use them for marketing
                lists.
              </>
            }
          />
          {errors.consent && <p className="mt-1.5 text-sm font-medium text-red-700">{errors.consent.message}</p>}
        </div>
      </div>
      {serverError && (
        <Notice kind="error" className="mt-5">
          {serverError}
        </Notice>
      )}
      <Button type="submit" variant="accent" size="lg" className="mt-6 w-full sm:w-auto" loading={isSubmitting}>
        Request a school demonstration
      </Button>
    </form>
  )
}

export default function SchoolsPage() {
  return (
    <>
      <PageTitle title="For schools" />
      <PageHeader eyebrow="For schools" title="Structured career guidance for every student">
        {APP_NAME} helps principals and guidance counsellors give students a clear, consistent way to explore subjects, courses and careers — while
        keeping student data private.
      </PageHeader>
      <div className="container-page py-12">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b) => (
            <li key={b.title} className="rounded-[var(--radius-card)] border border-sand-200 bg-white p-6">
              <b.icon aria-hidden className="size-8 text-teal-600" />
              <h2 className="mt-4 text-lg">{b.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{b.text}</p>
            </li>
          ))}
        </ul>

        <section className="mt-14 grid gap-8 lg:grid-cols-2" aria-labelledby="session">
          <div>
            <h2 id="session" className="text-2xl">
              What a guidance session looks like
            </h2>
            <ol className="mt-5 space-y-4">
              {[
                'The counsellor shares the school code with a class.',
                'Students complete onboarding and the interest quiz on phones or a computer lab — about 15 minutes.',
                'Students discuss their suggested career areas in small groups.',
                'Each student prints or downloads a roadmap to discuss with parents and the counsellor.',
                'The school sees anonymous participation totals on its dashboard.',
              ].map((s, i) => (
                <li key={s} className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-white">{i + 1}</span>
                  <span className="pt-1 leading-relaxed">{s}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="space-y-4">
            <Notice kind="tip" title="Free for students, always">
              Core student guidance stays free. Schools may subscribe in future for structured programmes and reporting. Sponsors can also fund access
              for more students.
            </Notice>
            <Notice kind="info" title="What schools can and cannot see">
              Schools see totals only, such as how many students finished the quiz in each class level and which career areas were most common. Schools
              cannot see any individual student’s answers or roadmap.
            </Notice>
            <Notice kind="info" title="Current stage">
              We are running pilot demonstrations with schools. There is no online payment, and no school is billed without a signed agreement.
            </Notice>
          </div>
        </section>

        <section id="enquiry" className="mt-14 scroll-mt-24" aria-labelledby="enquiry-title">
          <div className="grid gap-8 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <h2 id="enquiry-title" className="text-3xl">
                Request a school demonstration
              </h2>
              <p className="mt-3 leading-relaxed text-slate-600">
                Tell us a little about your school and we’ll arrange a demonstration. We only ask for the professional contact details we need to reply.
              </p>
            </div>
            <div className="lg:col-span-3">
              <EnquiryFormSection />
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
