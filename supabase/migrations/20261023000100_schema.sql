-- PathNigeria schema: tables, constraints and indexes.
-- Security (RLS policies, grants, functions) lives in the next migration.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ───────────────────────── Accounts & schools ─────────────────────────

-- One row per signed-in user (staff only in the MVP; students explore anonymously).
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text,
  display_name  text check (char_length(display_name) <= 120),
  platform_role text not null default 'user' check (platform_role in ('user', 'admin')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.schools (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(name) between 2 and 200),
  state         text,
  school_type   text not null default 'other' check (school_type in ('public', 'private', 'mission', 'other')),
  contact_email text check (contact_email is null or char_length(contact_email) <= 254),
  -- Code students may type to share ANONYMOUS participation counts with their school.
  join_code     text not null unique default upper(substr(md5(gen_random_uuid()::text), 1, 8))
                check (join_code ~ '^[A-Z0-9]{6,12}$'),
  status        text not null default 'prospect' check (status in ('prospect', 'active', 'inactive')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.school_memberships (
  id         uuid primary key default gen_random_uuid(),
  school_id  uuid not null references public.schools (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  role       text not null check (role in ('school_admin', 'counsellor')),
  created_at timestamptz not null default now(),
  unique (school_id, user_id)
);
create index school_memberships_user_idx on public.school_memberships (user_id);

-- Billing is NOT implemented. Status changes are made manually by a platform admin.
create table public.subscriptions (
  id         uuid primary key default gen_random_uuid(),
  school_id  uuid not null references public.schools (id) on delete cascade,
  plan       text not null default 'pilot' check (char_length(plan) between 1 and 60),
  status     text not null default 'none' check (status in ('none', 'trial', 'active', 'past_due', 'cancelled')),
  starts_on  date,
  ends_on    date,
  notes      text,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (starts_on is null or ends_on is null or ends_on >= starts_on)
);
create index subscriptions_school_idx on public.subscriptions (school_id);

create table public.sponsorships (
  id           uuid primary key default gen_random_uuid(),
  sponsor_name text not null check (char_length(sponsor_name) between 2 and 200),
  sponsor_type text not null default 'other'
               check (sponsor_type in ('corporate', 'foundation', 'ngo', 'government', 'individual', 'other')),
  school_id    uuid references public.schools (id) on delete set null,
  seats        integer check (seats is null or seats > 0),
  status       text not null default 'pledged' check (status in ('pledged', 'active', 'ended')),
  starts_on    date,
  ends_on      date,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  check (starts_on is null or ends_on is null or ends_on >= starts_on)
);

-- ───────────────────────── Educational content ─────────────────────────
-- Content tables use readable text IDs ("computer-science") so URLs and seed
-- data stay simple. Foreign keys cascade if an ID is ever renamed.

create table public.career_categories (
  id          text primary key check (id ~ '^[a-z0-9-]+$'),
  name        text not null unique,
  description text not null default '',
  interests   text[] not null default '{}',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.subject_pathways (
  id           text primary key check (id ~ '^[a-z0-9-]+$'),
  name         text not null unique,
  summary      text not null default '',
  overview     text not null default '',
  subjects     text[] not null default '{}',
  skills       text[] not null default '{}',
  interests    text[] not null default '{}',
  limitations  text not null default '',
  alternatives text not null default '',
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.courses (
  id                text primary key check (id ~ '^[a-z0-9-]+$'),
  name              text not null unique,
  category_id       text not null references public.career_categories (id) on update cascade on delete restrict,
  summary           text not null default '',
  description       text not null default '',
  what_you_learn    text[] not null default '{}',
  helpful_subjects  text[] not null default '{}',
  workplaces        text[] not null default '{}',
  skills            text[] not null default '{}',
  further_study     text[] not null default '{}',
  interests         text[] not null default '{}',
  institution_types text[] not null default '{}',
  typical_duration  text not null default '',
  published         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index courses_category_idx on public.courses (category_id);

create table public.course_pathways (
  course_id  text not null references public.courses (id) on update cascade on delete cascade,
  pathway_id text not null references public.subject_pathways (id) on update cascade on delete cascade,
  primary key (course_id, pathway_id)
);
create index course_pathways_pathway_idx on public.course_pathways (pathway_id);

create table public.careers (
  id                 text primary key check (id ~ '^[a-z0-9-]+$'),
  title              text not null unique,
  category_id        text not null references public.career_categories (id) on update cascade on delete restrict,
  summary            text not null default '',
  responsibilities   text[] not null default '{}',
  interests          text[] not null default '{}',
  skills             text[] not null default '{}',
  work_environments  text[] not null default '{}',
  start_now          text[] not null default '{}',
  alternative_routes text not null default '',
  licensing          text not null default '',
  published          boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index careers_category_idx on public.careers (category_id);

create table public.course_careers (
  course_id text not null references public.courses (id) on update cascade on delete cascade,
  career_id text not null references public.careers (id) on update cascade on delete cascade,
  primary key (course_id, career_id)
);
create index course_careers_career_idx on public.course_careers (career_id);

-- ───────────────────────── Institutions & admissions ─────────────────────────

create table public.educational_sources (
  id          text primary key check (id ~ '^[a-z0-9-]+$'),
  title       text not null,
  publisher   text not null default '',
  url         text check (url is null or url ~ '^https?://'),
  source_type text not null default 'other'
              check (source_type in ('official_jamb', 'official_institution', 'official_regulator', 'other')),
  accessed_at date,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.institutions (
  id                  text primary key check (id ~ '^[a-z0-9-]+$'),
  name                text not null unique,
  short_name          text,
  type                text not null check (type in ('university', 'polytechnic', 'college_of_education', 'technical_college', 'other')),
  ownership           text not null default 'other' check (ownership in ('federal', 'state', 'private', 'other')),
  state               text,
  website             text check (website is null or website ~ '^https?://'),
  verification_status text not null default 'unverified' check (verification_status in ('verified', 'unverified', 'sample')),
  source_id           text references public.educational_sources (id) on update cascade on delete set null,
  last_verified_at    date,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  -- A record can only be "verified" if we know where and when it was checked.
  constraint institutions_verified_needs_source
    check (verification_status <> 'verified' or (source_id is not null and last_verified_at is not null))
);

create table public.institution_programmes (
  id                  uuid primary key default gen_random_uuid(),
  institution_id      text not null references public.institutions (id) on update cascade on delete cascade,
  course_id           text not null references public.courses (id) on update cascade on delete cascade,
  award               text,
  verification_status text not null default 'unverified' check (verification_status in ('verified', 'unverified', 'sample')),
  source_id           text references public.educational_sources (id) on update cascade on delete set null,
  last_verified_at    date,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique nulls not distinct (institution_id, course_id, award),
  constraint programmes_verified_needs_source
    check (verification_status <> 'verified' or (source_id is not null and last_verified_at is not null))
);
create index institution_programmes_course_idx on public.institution_programmes (course_id);

create table public.admission_requirements (
  id                  uuid primary key default gen_random_uuid(),
  course_id           text not null references public.courses (id) on update cascade on delete cascade,
  -- NULL = general guidance that is not specific to one institution.
  institution_id      text references public.institutions (id) on update cascade on delete cascade,
  admission_cycle     text,
  olevel_requirements text,
  utme_subjects       text[] not null default '{}',
  direct_entry        text,
  notes               text,
  verification_status text not null default 'unverified' check (verification_status in ('verified', 'unverified', 'sample')),
  source_id           text references public.educational_sources (id) on update cascade on delete set null,
  last_verified_at    date,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique nulls not distinct (course_id, institution_id, admission_cycle),
  constraint admissions_verified_needs_source
    check (verification_status <> 'verified' or (source_id is not null and last_verified_at is not null))
);
create index admission_requirements_course_idx on public.admission_requirements (course_id);
create index admission_requirements_institution_idx on public.admission_requirements (institution_id);
create index admission_requirements_status_idx on public.admission_requirements (verification_status);

-- Append-only audit trail, written automatically by triggers (next migration).
create table public.verification_records (
  id              uuid primary key default gen_random_uuid(),
  record_table    text not null check (record_table in ('institutions', 'institution_programmes', 'admission_requirements')),
  record_id       text not null,
  previous_status text check (previous_status in ('verified', 'unverified', 'sample')),
  new_status      text not null check (new_status in ('verified', 'unverified', 'sample')),
  source_id       text references public.educational_sources (id) on update cascade on delete set null,
  notes           text,
  reviewer_id     uuid references public.profiles (id) on delete set null,
  created_at      timestamptz not null default now()
);
create index verification_records_record_idx on public.verification_records (record_table, record_id);

-- ───────────────────────── Quiz ─────────────────────────

create table public.quiz_questions (
  id         text primary key check (id ~ '^[a-z0-9-]+$'),
  prompt     text not null,
  helper     text,
  kind       text not null check (kind in ('likert', 'choice')),
  sort_order integer not null default 0,
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quiz_options (
  id          text primary key check (id ~ '^[a-z0-9-]+$'),
  question_id text not null references public.quiz_questions (id) on update cascade on delete cascade,
  label       text not null,
  -- e.g. {"tech": 2, "logic": 1}
  weights     jsonb not null default '{}' check (jsonb_typeof(weights) = 'object'),
  is_unsure   boolean not null default false,
  sort_order  integer not null default 0
);
create index quiz_options_question_idx on public.quiz_options (question_id);

-- Saved quiz results for SIGNED-IN users only (future student accounts).
-- Anonymous students' answers never leave their browser.
create table public.quiz_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  school_id    uuid references public.schools (id) on delete set null,
  school_level text,
  started_at   timestamptz not null default now(),
  completed_at timestamptz
);
create index quiz_sessions_user_idx on public.quiz_sessions (user_id);

create table public.quiz_responses (
  session_id  uuid not null references public.quiz_sessions (id) on delete cascade,
  question_id text not null references public.quiz_questions (id) on update cascade on delete cascade,
  option_id   text not null references public.quiz_options (id) on update cascade on delete cascade,
  primary key (session_id, question_id)
);

create table public.career_recommendations (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.quiz_sessions (id) on delete cascade,
  category_id text not null references public.career_categories (id) on update cascade on delete cascade,
  score       numeric(5, 2) not null check (score between 0 and 100),
  rank        smallint not null check (rank > 0),
  reasons     jsonb not null default '[]',
  unique (session_id, category_id)
);

-- ───────────────────────── Schools: enquiries & usage ─────────────────────────

create table public.school_enquiries (
  id            uuid primary key default gen_random_uuid(),
  school_name   text not null check (char_length(school_name) between 2 and 200),
  contact_name  text not null check (char_length(contact_name) between 2 and 120),
  role_title    text not null check (char_length(role_title) between 2 and 120),
  email         text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone         text check (phone is null or char_length(phone) <= 30),
  state         text not null check (char_length(state) between 2 and 60),
  student_count text check (student_count is null or char_length(student_count) <= 40),
  message       text check (message is null or char_length(message) <= 2000),
  consent       boolean not null check (consent),
  status        text not null default 'new' check (status in ('new', 'contacted', 'demo_scheduled', 'closed')),
  admin_notes   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index school_enquiries_created_idx on public.school_enquiries (created_at desc);

-- Anonymous, aggregate-only activity. No names, no answers, no device IDs.
create table public.usage_events (
  id           bigint generated always as identity primary key,
  event_type   text not null check (event_type in ('onboarding_completed', 'quiz_completed', 'roadmap_viewed')),
  school_level text check (school_level in ('jss1', 'jss2', 'jss3', 'ss1', 'ss2', 'ss3', 'other')),
  category_id  text references public.career_categories (id) on update cascade on delete set null,
  school_id    uuid references public.schools (id) on delete set null,
  created_at   timestamptz not null default now()
);
create index usage_events_created_idx on public.usage_events (created_at);
create index usage_events_school_idx on public.usage_events (school_id, created_at);

-- ───────────────────────── updated_at triggers ─────────────────────────

do $$
declare t text;
begin
  foreach t in array array[
    'profiles', 'schools', 'subscriptions', 'sponsorships', 'career_categories', 'subject_pathways',
    'courses', 'careers', 'educational_sources', 'institutions', 'institution_programmes',
    'admission_requirements', 'quiz_questions', 'school_enquiries'
  ] loop
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end;
$$;
