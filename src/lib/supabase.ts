import type { SupabaseClient } from '@supabase/supabase-js'
import { supabaseConfig } from './config'

let client: Promise<SupabaseClient | null> | null = null

/**
 * The Supabase client, or null in demo mode. Uses only the public browser key.
 * Loaded on demand so demo-mode visitors never download the Supabase library.
 */
export function getSupabase(): Promise<SupabaseClient | null> {
  const config = supabaseConfig
  client ??= config
    ? import('@supabase/supabase-js').then(({ createClient }) =>
        createClient(config.url, config.key, {
          auth: { persistSession: true, autoRefreshToken: true },
        }),
      )
    : Promise.resolve(null)
  return client
}
