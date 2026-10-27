-- PathNigeria security: helper functions, Row Level Security, grants and RPCs.
--
-- Principles
--  * Every table has RLS enabled. No policy = no access.
--  * Public educational content is readable by anyone; only platform admins write it.
--  * School staff see only their own school's records, and only AGGREGATE usage.
--  * Anonymous visitors can submit an enquiry and record anonymous usage, nothing else.
--  * Roles are never changeable through the API (promote admins in the SQL editor).
--  * Grants are explicit because Supabase no longer exposes new tables automatically.

-- ───────────────────────── Helper functions ─────────────────────────
-- SECURITY DEFINER lets policies check membership without recursive RLS.
-- search_path is pinned to '' so the functions cannot be hijacked.

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and platform_role = 'admin'
  );
$$;

create or replace function public.is_school_member(p_school_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.school_memberships where school_id = p_school_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_school_admin(p_school_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.school_memberships
    where school_id = p_school_id and user_id = auth.uid() and role = 'school_admin'
  );
$$;

create or replace function public.shares_school_with(p_user_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.school_memberships mine
    join public.school_memberships theirs on theirs.school_id = mine.school_id
    where mine.user_id = auth.uid() and theirs.user_id = p_user_id
  );
$$;

-- ───────────────────────── Triggers ─────────────────────────

-- Create a profile automatically when someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, nullif(left(coalesce(new.raw_user_meta_data ->> 'display_name', ''), 120), ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- School admins may edit their school's profile but not its status or join code.
create or replace function public.guard_school_update()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  if auth.uid() is not null and not public.is_admin()
     and (new.status is distinct from old.status or new.join_code is distinct from old.join_code) then
    raise exception 'Only platform administrators can change a school''s status or join code'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger guard_school_update
  before update on public.schools
  for each row execute function public.guard_school_update();

-- Record who changed a verification status, when, and against which source.
create or replace function public.log_verification_change()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or new.verification_status is distinct from old.verification_status
     or new.last_verified_at is distinct from old.last_verified_at then
    insert into public.verification_records (record_table, record_id, previous_status, new_status, source_id, reviewer_id)
    values (
      tg_table_name,
      new.id::text,
      case when tg_op = 'UPDATE' then old.verification_status end,
      new.verification_status,
      new.source_id,
      auth.uid()
    );
  end if;
  return new;
end;
$$;

create trigger log_verification_change
  after insert or update on public.institutions
  for each row execute function public.log_verification_change();
create trigger log_verification_change
  after insert or update on public.institution_programmes
  for each row execute function public.log_verification_change();
create trigger log_verification_change
  after insert or update on public.admission_requirements
  for each row execute function public.log_verification_change();

-- Stamp subscription changes with the admin who made them.
create or replace function public.stamp_subscription()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_by = auth.uid();
  return new;
end;
$$;

create trigger stamp_subscription
  before insert or update on public.subscriptions
  for each row execute function public.stamp_subscription();

-- ───────────────────────── Start from zero privileges ─────────────────────────

do $$
declare t text;
begin
  foreach t in array array[
    'profiles', 'schools', 'school_memberships', 'subscriptions', 'sponsorships',
    'career_categories', 'subject_pathways', 'courses', 'course_pathways', 'careers', 'course_careers',
    'educational_sources', 'institutions', 'institution_programmes', 'admission_requirements',
    'verification_records', 'quiz_questions', 'quiz_options', 'quiz_sessions', 'quiz_responses',
    'career_recommendations', 'school_enquiries', 'usage_events'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;
end;
$$;

-- ───────────────────────── Public educational content ─────────────────────────

do $$
declare t text;
begin
  foreach t in array array[
    'career_categories', 'subject_pathways', 'course_pathways', 'course_careers',
    'educational_sources', 'institutions', 'institution_programmes', 'admission_requirements', 'quiz_options'
  ] loop
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
    execute format('create policy "Anyone can read" on public.%I for select to anon, authenticated using (true)', t);
    execute format(
      'create policy "Admins can insert" on public.%I for insert to authenticated with check (public.is_admin())', t);
    execute format(
      'create policy "Admins can update" on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format(
      'create policy "Admins can delete" on public.%I for delete to authenticated using (public.is_admin())', t);
  end loop;
end;
$$;

-- Courses, careers and quiz questions can be hidden (unpublished / inactive) by admins.
grant select on public.courses, public.careers, public.quiz_questions to anon, authenticated;
grant insert, update, delete on public.courses, public.careers, public.quiz_questions to authenticated;

create policy "Anyone can read published courses" on public.courses
  for select to anon, authenticated using (published or public.is_admin());
create policy "Admins can insert" on public.courses for insert to authenticated with check (public.is_admin());
create policy "Admins can update" on public.courses for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete" on public.courses for delete to authenticated using (public.is_admin());

create policy "Anyone can read published careers" on public.careers
  for select to anon, authenticated using (published or public.is_admin());
create policy "Admins can insert" on public.careers for insert to authenticated with check (public.is_admin());
create policy "Admins can update" on public.careers for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete" on public.careers for delete to authenticated using (public.is_admin());

create policy "Anyone can read active questions" on public.quiz_questions
  for select to anon, authenticated using (active or public.is_admin());
create policy "Admins can insert" on public.quiz_questions for insert to authenticated with check (public.is_admin());
create policy "Admins can update" on public.quiz_questions for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete" on public.quiz_questions for delete to authenticated using (public.is_admin());

-- Verification history: admins read and add; nobody edits or deletes history.
grant select, insert on public.verification_records to authenticated;
create policy "Admins can read" on public.verification_records for select to authenticated using (public.is_admin());
create policy "Admins can add" on public.verification_records for insert to authenticated with check (public.is_admin());

-- ───────────────────────── Profiles ─────────────────────────

grant select on public.profiles to authenticated;
-- Column-level grant: users may change their display name, never their role.
grant update (display_name) on public.profiles to authenticated;

create policy "Read own, colleagues' or (admin) all profiles" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin() or public.shares_school_with(id));
create policy "Update own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- ───────────────────────── Schools ─────────────────────────

grant select, insert, update, delete on public.schools to authenticated;
create policy "Members and admins read schools" on public.schools
  for select to authenticated using (public.is_admin() or public.is_school_member(id));
create policy "Admins create schools" on public.schools
  for insert to authenticated with check (public.is_admin());
create policy "Admins and school admins update schools" on public.schools
  for update to authenticated
  using (public.is_admin() or public.is_school_admin(id))
  with check (public.is_admin() or public.is_school_admin(id));
create policy "Admins delete schools" on public.schools
  for delete to authenticated using (public.is_admin());

grant select, insert, update, delete on public.school_memberships to authenticated;
create policy "Read memberships of own school" on public.school_memberships
  for select to authenticated
  using (public.is_admin() or user_id = auth.uid() or public.is_school_member(school_id));
create policy "Admins add members" on public.school_memberships
  for insert to authenticated with check (public.is_admin());
create policy "Admins change members" on public.school_memberships
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins remove members" on public.school_memberships
  for delete to authenticated using (public.is_admin());

grant select, insert, update, delete on public.subscriptions to authenticated;
create policy "Members and admins read subscriptions" on public.subscriptions
  for select to authenticated using (public.is_admin() or public.is_school_member(school_id));
create policy "Admins create subscriptions" on public.subscriptions
  for insert to authenticated with check (public.is_admin());
create policy "Admins update subscriptions" on public.subscriptions
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete subscriptions" on public.subscriptions
  for delete to authenticated using (public.is_admin());

grant select, insert, update, delete on public.sponsorships to authenticated;
create policy "Admins manage sponsorships" on public.sponsorships
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ───────────────────────── Enquiries ─────────────────────────

-- Anyone may submit; only admins may read. The public cannot set status or notes.
grant insert on public.school_enquiries to anon, authenticated;
grant select, update, delete on public.school_enquiries to authenticated;
create policy "Anyone can submit an enquiry" on public.school_enquiries
  for insert to anon, authenticated
  with check (status = 'new' and admin_notes is null);
create policy "Admins read enquiries" on public.school_enquiries
  for select to authenticated using (public.is_admin());
create policy "Admins update enquiries" on public.school_enquiries
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete enquiries" on public.school_enquiries
  for delete to authenticated using (public.is_admin());

-- ───────────────────────── Usage events ─────────────────────────

-- No direct inserts or reads: use record_usage_event() and the summary functions.
grant select on public.usage_events to authenticated;
create policy "Admins read usage" on public.usage_events
  for select to authenticated using (public.is_admin());

-- ───────────────────────── Saved quiz results (signed-in users) ─────────────────────────

grant select, insert, update, delete on public.quiz_sessions, public.quiz_responses, public.career_recommendations to authenticated;

create policy "Owners manage their sessions" on public.quiz_sessions
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Owners manage their responses" on public.quiz_responses
  for all to authenticated
  using (exists (select 1 from public.quiz_sessions s where s.id = session_id and s.user_id = auth.uid()))
  with check (exists (select 1 from public.quiz_sessions s where s.id = session_id and s.user_id = auth.uid()));
create policy "Owners manage their recommendations" on public.career_recommendations
  for all to authenticated
  using (exists (select 1 from public.quiz_sessions s where s.id = session_id and s.user_id = auth.uid()))
  with check (exists (select 1 from public.quiz_sessions s where s.id = session_id and s.user_id = auth.uid()));

-- ───────────────────────── RPC functions ─────────────────────────

-- Record an anonymous usage event. A valid school code links it to a school.
create or replace function public.record_usage_event(
  p_event_type text,
  p_school_level text default null,
  p_category_id text default null,
  p_school_code text default null
)
returns void
language plpgsql security definer
set search_path = ''
as $$
declare
  v_school uuid;
begin
  if p_event_type not in ('onboarding_completed', 'quiz_completed', 'roadmap_viewed') then
    raise exception 'Unknown event type' using errcode = '22023';
  end if;
  if nullif(trim(p_school_code), '') is not null then
    select id into v_school from public.schools
    where join_code = upper(trim(p_school_code)) and status <> 'inactive';
  end if;
  insert into public.usage_events (event_type, school_level, category_id, school_id)
  values (
    p_event_type,
    case when p_school_level in ('jss1', 'jss2', 'jss3', 'ss1', 'ss2', 'ss3', 'other') then p_school_level end,
    (select c.id from public.career_categories c where c.id = p_category_id),
    v_school
  );
end;
$$;

-- Returns the school's name for a valid code (so students can confirm it), else null.
create or replace function public.lookup_school_code(p_code text)
returns text
language sql stable security definer
set search_path = ''
as $$
  select name from public.schools
  where join_code = upper(trim(p_code)) and status <> 'inactive';
$$;

-- Aggregate participation for one school. Counts only, never individuals.
create or replace function public.school_participation_summary(p_school_id uuid)
returns table (event_type text, school_level text, category_id text, total bigint)
language plpgsql stable security definer
set search_path = ''
as $$
begin
  if not (public.is_admin() or public.is_school_member(p_school_id)) then
    raise exception 'Not authorised' using errcode = '42501';
  end if;
  return query
    select e.event_type, e.school_level, e.category_id, count(*)::bigint
    from public.usage_events e
    where e.school_id = p_school_id
    group by e.event_type, e.school_level, e.category_id;
end;
$$;

-- Platform-wide usage counts for the admin dashboard.
create or replace function public.admin_usage_summary()
returns table (event_type text, total bigint, last_30_days bigint)
language plpgsql stable security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;
  return query
    select e.event_type, count(*)::bigint,
           count(*) filter (where e.created_at > now() - interval '30 days')::bigint
    from public.usage_events e
    group by e.event_type;
end;
$$;

-- Lets an admin attach an existing user (by email) to a school.
create or replace function public.admin_add_school_member(p_school_id uuid, p_email text, p_role text)
returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare
  v_user uuid;
  v_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;
  select id into v_user from public.profiles where lower(email) = lower(trim(p_email));
  if v_user is null then
    raise exception 'No account exists for that email. Invite the user in Supabase Auth first.' using errcode = 'P0002';
  end if;
  insert into public.school_memberships (school_id, user_id, role)
  values (p_school_id, v_user, p_role)
  on conflict (school_id, user_id) do update set role = excluded.role
  returning id into v_id;
  return v_id;
end;
$$;

-- Function privileges: Postgres grants EXECUTE to PUBLIC by default, so revoke first.
revoke execute on function
  public.is_admin(), public.is_school_member(uuid), public.is_school_admin(uuid), public.shares_school_with(uuid),
  public.record_usage_event(text, text, text, text), public.lookup_school_code(text),
  public.school_participation_summary(uuid), public.admin_usage_summary(),
  public.admin_add_school_member(uuid, text, text),
  public.handle_new_user(), public.guard_school_update(), public.log_verification_change(), public.stamp_subscription()
from public, anon, authenticated;

grant execute on function public.record_usage_event(text, text, text, text), public.lookup_school_code(text)
  to anon, authenticated;
grant execute on function
  public.is_admin(), public.is_school_member(uuid), public.is_school_admin(uuid), public.shares_school_with(uuid),
  public.school_participation_summary(uuid), public.admin_usage_summary(), public.admin_add_school_member(uuid, text, text)
  to authenticated;
-- Anonymous visitors evaluate is_admin() inside public-content policies.
grant execute on function public.is_admin() to anon;
