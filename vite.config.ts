import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'supabase/tests/**/*.test.ts', 'scripts/**/*.test.ts'],
    // Tests must never talk to a real Supabase project.
    env: { VITE_SUPABASE_URL: '', VITE_SUPABASE_PUBLISHABLE_KEY: '', VITE_SUPABASE_ANON_KEY: '' },
    testTimeout: 30000,
    // Starting an in-memory Postgres (PGlite) can be slow while other tests run.
    hookTimeout: 120000,
  },
})
