-- Move the RLS helper functions out of the API-exposed `public` schema.
--
-- Supabase's security advisor (lints 0028/0029) flagged that these
-- SECURITY DEFINER helpers could be called directly via /rest/v1/rpc/...
-- They exist only for policies to use, so they now live in `private`,
-- which the Data API does not expose. Policies reference functions by OID,
-- so every existing policy keeps working after the move.

create schema if not exists private;
revoke all on schema private from public;
-- Roles still need USAGE so their policies can evaluate the helpers.
grant usage on schema private to anon, authenticated, service_role;

alter function public.is_admin() set schema private;
alter function public.is_school_member(uuid) set schema private;
alter function public.is_school_admin(uuid) set schema private;
alter function public.shares_school_with(uuid) set schema private;

-- Functions that call the helpers by name must point at the new schema.
-- (CREATE OR REPLACE keeps each function's existing grants.)

create or replace function public.guard_school_update()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  if auth.uid() is not null and not private.is_admin()
     and (new.status is distinct from old.status or new.join_code is distinct from old.join_code) then
    raise exception 'Only platform administrators can change a school''s status or join code'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

create or replace function public.school_participation_summary(p_school_id uuid)
returns table (event_type text, school_level text, category_id text, total bigint)
language plpgsql stable security definer
set search_path = ''
as $$
begin
  if not (private.is_admin() or private.is_school_member(p_school_id)) then
    raise exception 'Not authorised' using errcode = '42501';
  end if;
  return query
    select e.event_type, e.school_level, e.category_id, count(*)::bigint
    from public.usage_events e
    where e.school_id = p_school_id
    group by e.event_type, e.school_level, e.category_id;
end;
$$;

create or replace function public.admin_usage_summary()
returns table (event_type text, total bigint, last_30_days bigint)
language plpgsql stable security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;
  return query
    select e.event_type, count(*)::bigint,
           count(*) filter (where e.created_at > now() - interval '30 days')::bigint
    from public.usage_events e
    group by e.event_type;
end;
$$;

create or replace function public.admin_add_school_member(p_school_id uuid, p_email text, p_role text)
returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare
  v_user uuid;
  v_id uuid;
begin
  if not private.is_admin() then
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
