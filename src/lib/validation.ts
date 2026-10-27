import { z } from 'zod'

// Validation rules for the school enquiry form. The database enforces the
// same limits (see school_enquiries in the schema migration).

export const enquirySchema = z.object({
  school_name: z.string().trim().min(2, 'Enter the school’s name').max(200, 'Keep this under 200 characters'),
  contact_name: z.string().trim().min(2, 'Enter your name').max(120, 'Keep this under 120 characters'),
  role_title: z.string().trim().min(2, 'Enter your role, for example “Principal” or “Guidance counsellor”').max(120),
  email: z.string().trim().pipe(z.email('Enter a valid email address').max(254)),
  phone: z
    .string()
    .trim()
    .max(30, 'Keep this under 30 characters')
    .regex(/^[+\d\s()-]*$/, 'Use digits, spaces and + only'),
  state: z.string().min(2, 'Choose a state'),
  student_count: z.string().max(40),
  message: z.string().trim().max(2000, 'Keep your message under 2,000 characters'),
  consent: z.boolean().refine((v) => v, 'Please agree so that we can contact you about your enquiry'),
  /** Honeypot: hidden from people, often filled in by spam bots. */
  website: z.string().max(0, 'Leave this field empty'),
})

export type EnquiryForm = z.infer<typeof enquirySchema>

export const emptyEnquiry: EnquiryForm = {
  school_name: '',
  contact_name: '',
  role_title: '',
  email: '',
  phone: '',
  state: '',
  student_count: '',
  message: '',
  consent: false,
  website: '',
}

/** Converts the validated form into the row we store (empty strings → null). */
export function toEnquiryRow(form: EnquiryForm) {
  const orNull = (s: string) => (s.trim() ? s.trim() : null)
  return {
    school_name: form.school_name,
    contact_name: form.contact_name,
    role_title: form.role_title,
    email: form.email.toLowerCase(),
    phone: orNull(form.phone),
    state: form.state,
    student_count: orNull(form.student_count),
    message: orNull(form.message),
    consent: true as const,
  }
}
