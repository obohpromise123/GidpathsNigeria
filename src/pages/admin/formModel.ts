import { z } from 'zod'
import type { Row } from '../../data/repository'
import type { FieldDef, Lookups, ResourceDef } from './resources'

// Converts between database rows and form values, and builds a Zod
// validation schema from a resource description.

export type FormValue = string | string[] | boolean
export type FormValues = Record<string, FormValue>

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

function currentLinks(field: FieldDef, row: Row, lookups: Lookups): string[] {
  if (!row.id) return []
  if (field.relation === 'course_pathways') {
    return lookups.catalog.coursePathways.filter((l) => l.course_id === row.id).map((l) => l.pathway_id)
  }
  return lookups.catalog.courseCareers.filter((l) => l.course_id === row.id).map((l) => l.career_id)
}

export function toFormValues(def: ResourceDef, row: Row, lookups: Lookups): FormValues {
  const values: FormValues = {}
  for (const f of def.fields) {
    const v = row[f.name]
    switch (f.type) {
      case 'relation':
        values[f.name] = currentLinks(f, row, lookups)
        break
      case 'list':
        values[f.name] = ((v as string[] | null) ?? []).join('\n')
        break
      case 'multiselect':
        values[f.name] = [...((v as string[] | null) ?? [])]
        break
      case 'checkbox':
        values[f.name] = Boolean(v)
        break
      case 'date':
        values[f.name] = v ? String(v).slice(0, 10) : ''
        break
      default:
        values[f.name] = v === null || v === undefined ? '' : String(v)
    }
  }
  return values
}

export interface SavePlan {
  row: Row
  links: { table: 'course_pathways' | 'course_careers'; ids: string[] }[]
}

export function fromFormValues(def: ResourceDef, values: FormValues, isNew: boolean): SavePlan {
  const row: Row = {}
  const links: SavePlan['links'] = []
  for (const f of def.fields) {
    if (f.createOnly && !isNew) continue
    const v = values[f.name]
    switch (f.type) {
      case 'relation':
        links.push({ table: f.relation!, ids: v as string[] })
        continue
      case 'list':
        row[f.name] = String(v ?? '')
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean)
        continue
      case 'multiselect':
        row[f.name] = v as string[]
        continue
      case 'checkbox':
        row[f.name] = Boolean(v)
        continue
      case 'number': {
        const s = String(v ?? '').trim()
        row[f.name] = s === '' ? (f.emptyValue ?? null) : Number(s)
        continue
      }
      default: {
        const s = String(v ?? '').trim()
        if (s === '' && f.omitIfEmpty) continue
        row[f.name] = s === '' ? (f.emptyValue ?? null) : s
      }
    }
  }
  if (def.idMode === 'slug' && isNew) {
    row.id = (row.id as string | null) || slugify(String(values[def.slugFrom ?? 'name'] || values.name || values.title || ''))
  }
  if (def.idMode === 'generated') delete row.id
  return { row, links }
}

const isUrl = (v: string) => !v || /^https?:\/\/\S+$/.test(v)
const isEmail = (v: string) => !v || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)
const isDate = (v: string) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v)

function fieldSchema(f: FieldDef): z.ZodType {
  switch (f.type) {
    case 'checkbox':
      return z.boolean()
    case 'multiselect':
    case 'relation':
      return z.array(z.string())
    default: {
      let s = z.string().trim()
      if (f.required) s = s.min(1, `${f.label} is required`)
      if (f.max) s = s.max(f.max, `Keep this under ${f.max} characters`)
      if (f.name === 'id') {
        return s.max(60, 'Keep this under 60 characters').regex(/^[a-z0-9-]*$/, 'Use lowercase letters, numbers and dashes only')
      }
      if (f.name === 'join_code') return s.regex(/^([A-Z0-9]{6,12})?$/, 'Use 6–12 capital letters or numbers')
      if (f.type === 'url') return s.refine(isUrl, 'Enter a full web address starting with https://')
      if (f.type === 'email') return s.refine(isEmail, 'Enter a valid email address')
      if (f.type === 'date') return s.refine(isDate, 'Enter a valid date')
      if (f.type === 'number') return s.regex(/^\d*$/, 'Enter a whole number')
      return s
    }
  }
}

export function buildSchema(def: ResourceDef) {
  const shape: Record<string, z.ZodType> = {}
  for (const f of def.fields) shape[f.name] = fieldSchema(f)
  return z.object(shape).superRefine((values, ctx) => {
    const v = values as FormValues
    if (def.verification && v.verification_status === 'verified') {
      if (!v.source_id) ctx.addIssue({ code: 'custom', path: ['source_id'], message: 'Choose the official source you checked' })
      if (!v.last_verified_at) ctx.addIssue({ code: 'custom', path: ['last_verified_at'], message: 'Enter the date you checked the source' })
    }
    if (def.key === 'subscriptions' || def.key === 'sponsorships') {
      if (v.starts_on && v.ends_on && String(v.ends_on) < String(v.starts_on)) {
        ctx.addIssue({ code: 'custom', path: ['ends_on'], message: 'The end date must be after the start date' })
      }
    }
  })
}
