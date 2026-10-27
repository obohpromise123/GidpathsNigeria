// Decides whether the app talks to Supabase ("live") or uses bundled sample
// data ("demo"). Demo mode needs no accounts, keys or internet services.

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY)?.trim()

export const supabaseConfig = url && key ? { url, key } : null

export const isDemoMode = supabaseConfig === null
