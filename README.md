# PathNigeria

A free career discovery platform for Nigerian secondary school students (JSS 1 – SS 3). Students explore their interests, subject pathways, courses, careers and admission requirements, then build a printable roadmap. Schools can run guidance sessions and see **anonymous** participation totals. Administrators manage the content library and verify admission information against official sources.

> **Status:** MVP for school demonstrations. Runs fully in **demo mode** with no accounts or API keys. Connect a free Supabase project for live data, staff sign-in and real enquiries.

---

## Contents

1. [Quick start (Windows PowerShell)](#1-quick-start-windows-powershell)
2. [Demo mode](#2-demo-mode)
3. [Connecting Supabase (live mode)](#3-connecting-supabase-live-mode)
4. [Scripts](#4-scripts)
5. [Testing](#5-testing)
6. [Building and deploying](#6-building-and-deploying)
7. [How the project is organised](#7-how-the-project-is-organised)
8. [Security and privacy](#8-security-and-privacy)
9. [Content accuracy](#9-content-accuracy)
10. [Feature status](#10-feature-status)

---

## 1. Quick start (Windows PowerShell)

**You need:** [Node.js](https://nodejs.org) **22.18 or newer** (the LTS version is fine) and Git.

```powershell
# Check your versions
node --version
npm --version

# From the project folder
cd C:\Users\hp\Desktop\Gid_pathNigeria
npm install
npm run dev
```

Open **http://localhost:5173** in your browser. Press `Ctrl + C` in PowerShell to stop the server.

If PowerShell says *"running scripts is disabled on this system"* when you run `npm`, run this once and try again:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

## 2. Demo mode

When no Supabase settings are provided, the app runs in **demo mode**:

- All courses, careers, pathways and quiz questions come from the bundled files in `src/data/seed/`.
- A yellow banner on every page says *"Demo mode: using built-in sample data. Nothing you do here is saved…"*.
- **Staff sign in** offers three fictional roles (platform administrator, school administrator, counsellor) so you can show the dashboards to a school.
- Admin edits and school enquiries are held **in the browser tab only** and are lost on reload. The enquiry form says plainly that the enquiry was **not sent**.
- The demo school (**Demo Secondary School (sample)**, code `DEMO2026`) shows generated sample participation figures, labelled as sample data.

## 3. Connecting Supabase (live mode)

Supabase provides the PostgreSQL database and sign-in. The free plan is enough for an MVP. As of October 2026 the free plan includes a 500 MB database, 50,000 monthly active users and 2 active projects. **Free projects pause after 1 week of inactivity** — see [supabase.com/pricing](https://supabase.com/pricing).

### 3.1 Create the project

1. Create a project at [supabase.com](https://supabase.com).
2. In **Authentication → Sign In / Providers**, keep **Email** enabled and **turn off "Allow new users to sign up"**. Staff accounts should only be created by invitation.
3. In **Authentication → URL Configuration**, set the **Site URL** to your website address (use `http://localhost:5173` while developing).

### 3.2 Create the database tables

Apply the files in `supabase/migrations/` **in filename order**, then the seed data. Either:

**Option A – SQL editor (simplest):** open **SQL Editor** in the Supabase dashboard and run, one at a time:

1. `supabase/migrations/20261023000100_schema.sql`
2. `supabase/migrations/20261023000200_security.sql`
3. `supabase/migrations/20261027000300_private_helpers.sql`
4. `supabase/seed.sql`

**Option B – Supabase CLI:**

```powershell
npx supabase login
npx supabase link --project-ref YOUR-PROJECT-REF
npx supabase db push        # applies supabase/migrations
# then run supabase/seed.sql in the SQL editor
```

> The migrations include explicit `GRANT` statements. This matters because Supabase stopped exposing new tables to the API automatically (default for new projects since 30 May 2026, and for all projects from 30 October 2026).

### 3.3 Create your first administrator

1. **Authentication → Users → Invite user** and enter your email. Accept the invitation and set a password.
2. In the **SQL Editor**, promote the account (roles can never be changed from the website itself):

```sql
update public.profiles set platform_role = 'admin' where email = 'you@example.com';
```

To give school staff access: invite them the same way, create their school in **Admin → Schools**, then add them in **Admin → School staff**.

### 3.4 Add your keys to the app

In the dashboard, open **Project Settings → API Keys** and copy the **Project URL** and the **publishable** key (`sb_publishable_…`; older projects call it the "anon" key).

```powershell
Copy-Item .env.example .env.local
notepad .env.local
```

```ini
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Restart `npm run dev`. The demo banner disappears and data now comes from Supabase.

> ⚠️ **Never** put the `secret` / `service_role` key in `.env.local` or anywhere in this project. Anything starting with `VITE_` is published inside the website for anyone to read. The publishable key is designed to be public: the database's Row Level Security rules decide what it can do.

## 4. Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the development server at http://localhost:5173 |
| `npm run build` | Typechecks and builds the production site into `dist/` |
| `npm run preview` | Serves the built `dist/` folder locally to check it |
| `npm run typecheck` | Checks TypeScript types only |
| `npm test` | Runs all automated tests once |
| `npm run test:watch` | Re-runs tests as you edit |
| `npm run seed:sql` | Regenerates `supabase/seed.sql` from `src/data/seed/*.ts` |

## 5. Testing

```powershell
npm test
```

There are **106 automated tests** in four groups:

- **Business logic** (`src/lib/*.test.ts`, `src/pages/admin/formModel.test.ts`, `src/data/**/*.test.ts`): recommendation scoring and explanations, roadmap building, search and filters, enquiry validation, privacy suppression of small groups, admin form rules, demo-mode behaviour, and the integrity of the bundled content (every link valid, nothing marked "verified").
- **User journeys** (`src/app.test.tsx`): the full student flow (onboarding → quiz → results → roadmap), changing answers, course search, enquiry validation, the demo-mode enquiry message, redirects away from protected pages, access denied for the wrong role, and admin course creation with validation.
- **Database security** (`supabase/tests/rls.test.ts`): applies the real migrations to **PGlite** (PostgreSQL running inside Node.js) and checks the Row Level Security rules as anonymous visitors, ordinary users, school staff and administrators, and checks that every admin form produces records the real schema accepts. You don't need Docker or a Supabase account to run these.
- **Seed sync** (`scripts/seed-sql.test.ts`): fails if `src/data/seed` was edited without running `npm run seed:sql`.

**Manual checks worth doing before a demonstration:** run `npm run build` and `npm run preview`, then click through on a phone (or with your browser's device toolbar at 390 px wide). Check keyboard navigation with `Tab`, `Shift+Tab`, `Enter` and the arrow keys on quiz answers.

## 6. Building and deploying

```powershell
npm run build
npm run preview   # optional: check the built site at http://localhost:4173
```

The result is a static website in `dist/`. Any static host works. Checked against providers' pages on 23 October 2026:

| Host | Commercial use on free plan | Notes |
| --- | --- | --- |
| **Cloudflare Pages** (recommended) | No restriction found in Cloudflare's own documentation | 500 builds/month, unlimited static requests. Without a `404.html`, Pages already serves the app for every address, so no extra setup is needed for this single-page app. |
| Netlify Free | Allowed (per Netlify staff); free projects may be shut down without notice | 300 credits/month. Add a file `public/_redirects` containing `/*  /index.html  200`. |
| Vercel Hobby | **Not allowed** — non-commercial only | Use Vercel Pro instead if you prefer Vercel. |

Re-check these terms before launch; they change.

**Cloudflare Pages steps:**

1. Push this repository to GitHub.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** → choose the repository.
3. Build command `npm run build`, output directory `dist`.
4. Under **Environment variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (leave both out to deploy a demo).
5. Deploy, then add the site address to Supabase **Authentication → URL Configuration** (Site URL and redirect URLs).

## 7. How the project is organised

```
src/
  main.tsx               App entry: providers + router
  router.tsx             Every page's address (admin/school pages load lazily)
  index.css              Design tokens (colours, font) and print styles
  components/ui/         Design system: Button, Card, Badge, Form fields, Dialog, ChipGroup, States…
  components/layout/     Header, footer, demo banner, logo
  pages/                 One file per page; pages/admin and pages/school for staff areas
  features/              Student journey state (session storage) and hooks
  auth/                  Sign-in state and the RequireRole guard
  data/
    types.ts             Shapes of every record (mirrors the database)
    seed/                The bundled content library — single source of truth
    repository.ts        The data interface the whole app uses
    demoRepository.ts    In-memory implementation (demo mode)
    supabaseRepository.ts  Supabase implementation (live mode)
  lib/
    recommend.ts         Quiz scoring and explanations (rule-based, transparent)
    roadmap.ts           Turns results into a roadmap
    search.ts            Course/career search and filters
supabase/
  migrations/            Versioned SQL: schema, then security (RLS, grants, functions)
  seed.sql               Generated from src/data/seed by `npm run seed:sql`
  tests/                 Database security tests (PGlite)
scripts/                 Seed SQL generator
docs/                    Admission update workflow, security and privacy notes
```

**Key ideas, for learning:**

- **One interface, two backends.** Pages call `getRepository()` and never talk to Supabase directly. That is what lets the app run with no backend at all (demo mode), and it keeps database code in one place.
- **Content lives in data, not in the UI.** Courses, careers and quiz questions are rows in the database (or seed files). Editing them in the admin dashboard changes the site with no code changes.
- **Security lives in the database.** `RequireRole` only hides screens. The real protection is Row Level Security in `20261023000200_security.sql`, which refuses unauthorised requests even if someone calls the API directly.
- **The quiz is explainable.** Every answer adds points to interest areas. Career areas are scored from those points, and every point is kept as "evidence", so each suggestion can say *why* it appeared. See the comments at the top of `src/lib/recommend.ts`.
- **Small downloads.** Student pages load first. Admin pages, school pages and the Supabase library are separate files that load only when needed, which matters for students on mobile data.

## 8. Security and privacy

See [docs/SECURITY_AND_PRIVACY.md](docs/SECURITY_AND_PRIVACY.md) for full details. In short:

- Students never create accounts or give names, phone numbers, birth dates or locations. Their answers stay in `sessionStorage`, which is cleared when the tab closes.
- Only anonymous counts are recorded (event type, class level, top career area, and optionally the school if the student enters a code **and** ticks the box to share). School dashboards hide any group smaller than 5.
- Row Level Security is enabled on every table. Grants are explicit. Roles cannot be changed through the API. Verification history is append-only.
- No advertising, analytics services or third-party trackers. Fonts are self-hosted.
- The privacy and terms pages are **drafts** and must be reviewed by a lawyer (including against the Nigeria Data Protection Act 2023) before public launch.

## 9. Content accuracy

Information is labelled as one of three types:

| Label | Meaning |
| --- | --- |
| **General guidance** | A plain-language explanation (course descriptions, typical subjects). |
| **Verification required** | Believed typical, but not yet checked against an official source for a specific institution and year. |
| **Verified** | An administrator checked it against an official source (e.g. JAMB IBASS) and recorded the source and date. |
| **Sample data** | Fictional, for demonstration only (e.g. "Sample University"). |

**Nothing in the bundled seed data is marked verified.** The general admission patterns are typical combinations and must be confirmed before students rely on them. The database will not accept "Verified" without a source and a date. Follow [docs/ADMISSION_UPDATE_WORKFLOW.md](docs/ADMISSION_UPDATE_WORKFLOW.md) to verify records each admission cycle.

The 31 courses and 35 careers are general educational explanations written for this MVP. Have a qualified guidance counsellor review them before wide use. PathNigeria is not affiliated with JAMB, WAEC, NECO, NABTEB, NUC, NBTE, NCCE or any institution.

## 10. Feature status

### Completed and tested

- Landing page, how it works, career areas, "For schools" section, FAQ, footer with privacy/terms/contact
- Student onboarding (4 optional steps, no personal data, optional school code with explicit opt-in)
- Career interest quiz: 16 questions, one at a time, progress bar, back/skip, "not sure" options, resumes where you left off
- Results with several suggestions, each with reasons, an interest profile, and links to explore beyond the results
- Subject pathways (5), course explorer (31 courses, search and 4 filters, shareable URLs), course detail pages
- Career explorer (35 careers) and career detail pages with licensing notes
- Admission guidance: explanation of the process, verification labels, a filterable list of records
- Personalised roadmap (8 sections) with print/save-as-PDF and text download
- School information page and enquiry form (validation, spam honeypot, honest demo-mode message)
- Admin dashboard: overview, CRUD for courses, careers, pathways, career areas, institutions, programmes, admission requirements, sources, schools, subscriptions and sponsorships; enquiry management; school staff management; verification workflow and audit history
- School dashboard: profile (editable by school admins), staff list, school code, anonymous participation with small-group suppression, subscription status, printable report
- Database schema, RLS policies, grants and RPC functions, with 42 security and schema tests
- Live Supabase project (PathNigeria, London) verified end to end: student journey, enquiries, admin editing and verification, schools, counsellor access
- Demo mode for everything above

### Needs configuration

- Supabase project, migrations, seed and first admin (section 3)
- Real contact details in `src/lib/brand.ts`
- Legal review of the privacy and terms pages
- Verification of admission records by an administrator
- A custom domain and hosting account (section 6)

### Deferred to later phases (by design)

- Student accounts with saved results (the database tables and owner-only security rules already exist: `quiz_sessions`, `quiz_responses`, `career_recommendations`)
- Editing quiz questions and their scoring in the admin dashboard (edit `src/data/seed/quiz.ts` and re-seed for now)
- Online payments and billing (subscriptions are recorded manually; no payment is processed)
- Email notifications for new enquiries (no paid email service is used; check Admin → Enquiries)
- Rate limiting for the public enquiry form and usage events beyond the honeypot (consider Cloudflare Turnstile or Supabase Edge Function limits)
- Parent services and clearly labelled sponsored institution listings
- Offline support and translations into Nigerian languages
