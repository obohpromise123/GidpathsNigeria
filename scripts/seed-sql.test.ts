// @vitest-environment node
import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'
import { buildSeedCatalog } from '../src/data/seed/index.ts'
import { catalogToSql } from './seed-sql.ts'

it('supabase/seed.sql is up to date with src/data/seed (run `npm run seed:sql` if this fails)', () => {
  const onDisk = readFileSync(new URL('../supabase/seed.sql', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
  expect(onDisk).toBe(catalogToSql(buildSeedCatalog()))
})
