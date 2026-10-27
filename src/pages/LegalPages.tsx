import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { PageTitle } from '../components/layout/Logo'
import { Notice } from '../components/ui/Notice'
import { PageHeader } from '../components/ui/PageHeader'
import { APP_NAME, CONTACT } from '../lib/brand'

function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="container-page max-w-3xl space-y-8 py-10 leading-relaxed text-slate-700 [&_h2]:text-xl [&_li]:ml-5 [&_li]:list-disc [&_ul]:mt-2 [&_ul]:space-y-1.5">
      {children}
    </div>
  )
}

const DraftNotice = () => (
  <Notice kind="warning" title="Draft for the pilot version">
    This text explains how the current version works. It must be reviewed by a qualified lawyer (including against the Nigeria Data Protection Act
    2023) before public launch.
  </Notice>
)

export function PrivacyPage() {
  return (
    <>
      <PageTitle title="Privacy" />
      <PageHeader eyebrow="Privacy" title="How we protect your information">
        {APP_NAME} is designed for young people, so we collect as little information as possible.
      </PageHeader>
      <Prose>
        <DraftNotice />
        <section>
          <h2>Students</h2>
          <ul>
            <li>You do not need an account. We never ask for your name, phone number, date of birth or home address.</li>
            <li>
              Your onboarding and quiz answers are stored only in your browser’s <em>session storage</em>. They are cleared when you close the browser tab,
              and they are not sent to our servers.
            </li>
            <li>
              To understand how the service is used, we count anonymous events: “onboarding completed”, “quiz completed” and “roadmap viewed”, with your
              class level and the top career area suggested. These counts contain no name, answers, device ID or location.
            </li>
            <li>
              If you enter a school code <strong>and</strong> tick the box to share, those anonymous counts are added to your school’s totals. Your school
              cannot see your answers or results.
            </li>
            <li>We do not use advertising, advertising cookies or third-party tracking.</li>
          </ul>
        </section>
        <section>
          <h2>School staff and administrators</h2>
          <ul>
            <li>Staff accounts store an email address, an optional display name and the school role (for example counsellor).</li>
            <li>Sign-in is handled by our database provider, Supabase. Passwords are never visible to us.</li>
            <li>Each school can see only its own information.</li>
          </ul>
        </section>
        <section>
          <h2>School enquiries</h2>
          <p>
            When a school representative submits an enquiry, we store the professional contact details provided so that we can reply. We do not sell or
            share them, or add them to marketing lists.
          </p>
        </section>
        <section>
          <h2>Parents and guardians</h2>
          <p>
            Because students do not create accounts or give personal details, we do not hold personal data about individual students. If you have
            questions, please contact us.
          </p>
        </section>
        <section>
          <h2>Contact and requests</h2>
          <p>
            To ask about, correct or delete information we hold (for example a staff account or an enquiry), contact {CONTACT.email}.
          </p>
        </section>
      </Prose>
    </>
  )
}

export function TermsPage() {
  return (
    <>
      <PageTitle title="Terms of use" />
      <PageHeader eyebrow="Terms of use" title="Using this service" />
      <Prose>
        <DraftNotice />
        <section>
          <h2>Guidance, not guarantees</h2>
          <ul>
            <li>The interest quiz is an exploration tool. It is not a scientifically validated psychometric test, a diagnosis or a prediction of success.</li>
            <li>Suggestions do not replace advice from qualified guidance counsellors, teachers or parents.</li>
            <li>We do not guarantee admission, employment, income or professional status for any course or career.</li>
          </ul>
        </section>
        <section>
          <h2>Accuracy of admission information</h2>
          <ul>
            <li>Admission requirements change and differ between institutions. Each record shows whether it has been verified, the source and the date.</li>
            <li>Always confirm requirements with JAMB (including JAMB IBASS) and the institution’s official website before making decisions.</li>
          </ul>
        </section>
        <section>
          <h2>Independence</h2>
          <p>
            {APP_NAME} is independent. It is not affiliated with or endorsed by JAMB, WAEC, NECO, NABTEB, the NUC, NBTE, NCCE, any ministry or any
            institution, unless we clearly state otherwise.
          </p>
        </section>
        <section>
          <h2>Sponsored content</h2>
          <p>
            If we ever show promotions from institutions or sponsors, they will be clearly labelled as sponsored and kept separate from career
            suggestions, which are never paid for.
          </p>
        </section>
        <section>
          <h2>Acceptable use</h2>
          <p>Please don’t misuse the service, attempt to access accounts or data that are not yours, or submit false enquiries.</p>
        </section>
      </Prose>
    </>
  )
}

export function ContactPage() {
  return (
    <>
      <PageTitle title="Contact" />
      <PageHeader eyebrow="Contact" title="Get in touch">
        Questions, corrections to course information, or interest from your school — we’d love to hear from you.
      </PageHeader>
      <Prose>
        <Notice kind="info">These contact details are placeholders and will be updated before launch.</Notice>
        <dl className="grid gap-6 sm:grid-cols-3">
          <div>
            <dt className="font-semibold text-navy-900">Email</dt>
            <dd>{CONTACT.email}</dd>
          </div>
          <div>
            <dt className="font-semibold text-navy-900">Phone</dt>
            <dd>{CONTACT.phone}</dd>
          </div>
          <div>
            <dt className="font-semibold text-navy-900">Address</dt>
            <dd>{CONTACT.address}</dd>
          </div>
        </dl>
        <p>
          Schools can also use the{' '}
          <Link to="/schools#enquiry" className="font-semibold text-teal-700 underline">
            school enquiry form
          </Link>
          . If you spot an error in admission information, please tell us which course and institution, and where you found the official information.
        </p>
      </Prose>
    </>
  )
}
