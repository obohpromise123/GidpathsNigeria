// Usage: npm run seed:sql   (Node 22.18+ runs TypeScript directly)
import { writeFileSync } from 'node:fs'
import { buildSeedCatalog } from '../src/data/seed/index.ts'
import { catalogToSql } from './seed-sql.ts'

const out = new URL('../supabase/seed.sql', import.meta.url)
writeFileSync(out, catalogToSql(buildSeedCatalog()))
console.log(`Wrote ${out.pathname}`)
