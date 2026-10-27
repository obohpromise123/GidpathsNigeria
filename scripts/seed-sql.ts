import type { Catalog } from '../src/data/types.ts'

// Converts the bundled catalog into idempotent SQL (`on conflict do nothing`),
// so re-running the seed never overwrites changes made by administrators.

type Row = Record<string, unknown>

function literal(value: unknown): string {
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') return `'${value.replaceAll("'", "''")}'`
  if (Array.isArray(value)) {
    return value.length === 0 ? `'{}'::text[]` : `array[${value.map(literal).join(', ')}]::text[]`
  }
  return `${literal(JSON.stringify(value))}::jsonb`
}

function insert(table: string, rows: Row[], columns: string[]): string {
  if (rows.length === 0) return ''
  const values = rows.map((r) => `  (${columns.map((c) => literal(r[c])).join(', ')})`).join(',\n')
  return `insert into public.${table} (${columns.join(', ')}) values\n${values}\non conflict do nothing;\n`
}

const keys = (rows: Row[], omit: string[] = []) => Object.keys(rows[0] ?? {}).filter((k) => !omit.includes(k))

export function catalogToSql(catalog: Catalog): string {
  const parts: [string, Row[], string[]][] = [
    ['career_categories', catalog.categories as unknown as Row[], keys(catalog.categories as unknown as Row[])],
    ['subject_pathways', catalog.pathways as unknown as Row[], keys(catalog.pathways as unknown as Row[])],
    ['courses', catalog.courses as unknown as Row[], keys(catalog.courses as unknown as Row[])],
    ['careers', catalog.careers as unknown as Row[], keys(catalog.careers as unknown as Row[])],
    ['course_pathways', catalog.coursePathways as unknown as Row[], ['course_id', 'pathway_id']],
    ['course_careers', catalog.courseCareers as unknown as Row[], ['course_id', 'career_id']],
    ['educational_sources', catalog.sources as unknown as Row[], keys(catalog.sources as unknown as Row[])],
    ['institutions', catalog.institutions as unknown as Row[], keys(catalog.institutions as unknown as Row[])],
    // uuid-keyed tables: let the database generate IDs.
    ['institution_programmes', catalog.programmes as unknown as Row[], keys(catalog.programmes as unknown as Row[], ['id'])],
    ['admission_requirements', catalog.admissions as unknown as Row[], keys(catalog.admissions as unknown as Row[], ['id'])],
    ['quiz_questions', catalog.quizQuestions as unknown as Row[], keys(catalog.quizQuestions as unknown as Row[])],
    ['quiz_options', catalog.quizOptions as unknown as Row[], keys(catalog.quizOptions as unknown as Row[])],
  ]
  const header =
    '-- GENERATED FILE — do not edit by hand.\n' +
    '-- Source: src/data/seed/*.ts. Regenerate with `npm run seed:sql`.\n' +
    '-- Safe to re-run: existing rows are left untouched.\n\n'
  return header + parts.map(([table, rows, cols]) => insert(table, rows, cols)).join('\n')
}
