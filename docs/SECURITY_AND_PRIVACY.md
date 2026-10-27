# Security and privacy notes

PathNigeria is used by minors. The design goal is to **hold as little personal data as possible** and to enforce every permission **in the database**, not just in the user interface.

## What data exists

| Who | What is stored | Where |
| --- | --- | --- |
| Students | Onboarding and quiz answers. No name, contact details, birth date or location. | The student's own browser, in `sessionStorage` (cleared when the tab closes). Never sent to the server. |
| Students (anonymous counts) | Event type (`onboarding_completed`, `quiz_completed`, `roadmap_viewed`), class level, top suggested career area, and a school **only if** the student entered a valid code **and** ticked the consent box. | `usage_events` table. No user ID, device ID, IP address or answers. |
| School staff and admins | Email, optional display name, platform role, school memberships. | Supabase Auth plus the `profiles` and `school_memberships` tables. |
| School enquiries | School name, contact name, role, work email, optional phone, state, size range, message, consent. | `school_enquiries`; readable by platform admins only. |

There is no advertising, no analytics service and no third-party tracker. The font is self-hosted, so the site makes no Google Fonts requests.

## How access is enforced

All rules are in `supabase/migrations/20261023000200_security.sql` and are tested in `supabase/tests/rls.test.ts`.

- **RLS is enabled on every table**, and all API privileges are revoked first, then granted explicitly. A table with no policy allows nothing.
- **Public content** (courses, careers, pathways, institutions, admission requirements, sources, quiz) can be read by anyone. Only platform admins can insert, update or delete it. Unpublished courses and careers, and inactive quiz questions, are visible only to admins.
- **Roles cannot be self-assigned.** Users can update only their own `display_name` (a column-level grant). Admins are promoted only in the SQL editor.
- **Schools:** members see only their own school, its staff and its subscription. School admins can edit their school's profile, but a trigger blocks changes to `status` and `join_code` by anyone except platform admins. Only platform admins manage memberships and subscriptions.
- **Usage data:** nobody can insert into `usage_events` directly. The `record_usage_event()` function validates every value. School staff can read only **aggregates** for their own school (`school_participation_summary()`), and the dashboard also hides groups smaller than 5.
- **Enquiries:** anyone can submit one, but submitters cannot set a status or admin notes, and only admins can read them.
- **Verification:** a record cannot be "verified" without a source and a date (CHECK constraints). Triggers write each change to `verification_records`, which nobody can edit or delete through the API.
- **Saved quiz sessions** (for future student accounts) are visible only to their owner.
- **SECURITY DEFINER functions** pin `search_path = ''` and check permissions themselves. EXECUTE is revoked from `public` and granted only to the roles that need it.

## Frontend safeguards

- Only the **publishable** key is used in the browser. The secret/service-role key must never appear in the project.
- Error messages are mapped to friendly text (`src/data/errors.ts`). Raw SQL and stack traces are never shown.
- The sign-in error does not reveal whether an email has an account.
- The `?next=` redirect after sign-in accepts only paths on this site (no open redirects).
- External links use `rel="noreferrer"`.

## Known gaps to address before scale

- **Rate limiting:** the enquiry form and `record_usage_event()` are open to the public. A honeypot field filters simple bots. Before wide launch, add Cloudflare Turnstile or rate limits, and consider pruning old `usage_events`.
- **School code guessing:** `lookup_school_code()` returns a school's name for a valid code. Codes are random 8-character strings, so guessing is impractical, but rotate any code that leaks.
- **Legal review:** have a lawyer review the privacy and terms pages and the consent wording against the Nigeria Data Protection Act 2023. Decide data-retention periods for enquiries and usage events.
- **Admin accounts:** require strong passwords and consider enabling MFA in Supabase Auth for platform admins.
- **Backups:** the Supabase free plan does not include point-in-time recovery. Export important data regularly.
