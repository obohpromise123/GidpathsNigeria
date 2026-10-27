import { readdirSync, readFileSync } from 'node:fs'
import { PGlite } from '@electric-sql/pglite'

// Minimal stand-ins for the parts of Supabase our migrations depend on:
// the anon/authenticated/service_role roles, auth.users and auth.uid().
const SUPABASE_STUB = `
  create role anon nologin noinherit;
  create role authenticated nologin noinherit;
  create role service_role nologin noinherit bypassrls;
  create schema auth;
  create table auth.users (
    id uuid primary key default gen_random_uuid(),
    email text,
    raw_user_meta_data jsonb not null default '{}'
  );
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;
  grant usage on schema auth to anon, authenticated, service_role;
  grant execute on function auth.uid() to anon, authenticated, service_role;
  grant usage on schema public to anon, authenticated, service_role;
`

const root = new URL('../', import.meta.url)

export async function createTestDatabase(): Promise<PGlite> {
  const db = new PGlite()
  await db.exec(SUPABASE_STUB)
  const migrationsDir = new URL('migrations/', root)
  for (const file of readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort()) {
    await db.exec(readFileSync(new URL(file, migrationsDir), 'utf8'))
  }
  await db.exec(readFileSync(new URL('seed.sql', root), 'utf8'))
  return db
}

export type Actor = { role: 'anon' } | { role: 'authenticated'; userId: string }

/** Runs one statement as an API caller would, inside a rolled-back-on-error transaction. */
export async function runAs<T = Record<string, unknown>>(db: PGlite, actor: Actor, sql: string, params: unknown[] = []) {
  return db.transaction(async (tx) => {
    await tx.query(`select set_config('request.jwt.claim.sub', $1, true)`, [actor.role === 'authenticated' ? actor.userId : ''])
    await tx.exec(`set local role ${actor.role}`)
    return tx.query<T>(sql, params)
  })
}

/** Creates an auth user (which triggers profile creation) and returns its id. */
export async function createUser(db: PGlite, email: string, opts: { admin?: boolean } = {}): Promise<string> {
  const { rows } = await db.query<{ id: string }>(`insert into auth.users (email) values ($1) returning id`, [email])
  const id = rows[0].id
  if (opts.admin) await db.query(`update public.profiles set platform_role = 'admin' where id = $1`, [id])
  return id
}
