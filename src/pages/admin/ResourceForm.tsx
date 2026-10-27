import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { Controller, useForm, type Resolver } from 'react-hook-form'
import { Button } from '../../components/ui/Button'
import { ChipGroup } from '../../components/ui/ChipGroup'
import { Checkbox, describedBy, Field, Input, Select, Textarea } from '../../components/ui/Form'
import { Notice } from '../../components/ui/Notice'
import { friendlyError } from '../../data/errors'
import { buildSchema, type FormValues } from './formModel'
import type { FieldDef, Lookups, ResourceDef } from './resources'

export function ResourceForm({
  def,
  initial,
  isNew,
  lookups,
  onSave,
  onCancel,
}: {
  def: ResourceDef
  initial: FormValues
  isNew: boolean
  lookups: Lookups
  onSave: (values: FormValues) => Promise<void>
  onCancel: () => void
}) {
  const schema = useMemo(() => buildSchema(def), [def])
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) as unknown as Resolver<FormValues>, defaultValues: initial })

  const submit = async (values: FormValues) => {
    setServerError(null)
    try {
      await onSave(values)
    } catch (e) {
      setServerError(friendlyError(e))
    }
  }

  const renderField = (f: FieldDef) => {
    const id = `field-${f.name}`
    const error = errors[f.name]?.message as string | undefined
    const disabled = f.createOnly && !isNew
    const wide = ['textarea', 'list', 'multiselect', 'relation'].includes(f.type)
    const common = { id, disabled, ...describedBy(id, error) }

    if (f.type === 'checkbox') {
      return (
        <div key={f.name} className="sm:col-span-2">
          <Checkbox id={id} label={f.label} {...register(f.name)} />
        </div>
      )
    }
    if (f.type === 'multiselect' || f.type === 'relation') {
      return (
        <div key={f.name} className="sm:col-span-2">
          <Controller
            control={control}
            name={f.name}
            render={({ field }) => (
              <ChipGroup
                legend={f.label}
                hint={f.help}
                options={f.options?.(lookups) ?? []}
                value={(field.value as string[]) ?? []}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      )
    }

    let control_: React.ReactNode
    if (f.type === 'select') {
      control_ = (
        <Select {...common} {...register(f.name)}>
          <option value="">{f.emptyLabel ?? (f.required ? 'Choose…' : 'None')}</option>
          {(f.options?.(lookups) ?? []).map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </Select>
      )
    } else if (f.type === 'textarea' || f.type === 'list') {
      control_ = <Textarea {...common} rows={f.type === 'list' ? 4 : 3} {...register(f.name)} />
    } else {
      const type = f.type === 'url' ? 'url' : f.type === 'email' ? 'email' : f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text'
      control_ = <Input {...common} type={type} min={f.type === 'number' ? 0 : undefined} {...register(f.name)} />
    }

    const hint = f.type === 'list' ? [f.help, 'Put each item on its own line.'].filter(Boolean).join(' ') : f.help
    return (
      <Field key={f.name} label={f.label} htmlFor={id} required={f.required} error={error} hint={hint} className={wide ? 'sm:col-span-2' : undefined}>
        {control_}
      </Field>
    )
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      {def.notice && (
        <Notice kind="info" className="mb-5">
          {def.notice}
        </Notice>
      )}
      <div className="grid gap-5 sm:grid-cols-2">{def.fields.map(renderField)}</div>
      {serverError && (
        <Notice kind="error" className="mt-5">
          {serverError}
        </Notice>
      )}
      <div className="sticky bottom-0 -mx-5 mt-6 flex flex-col-reverse gap-3 border-t border-sand-200 bg-white px-5 pt-4 pb-1 sm:-mx-6 sm:flex-row sm:justify-end sm:px-6">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isSubmitting}>
          {isNew ? `Create ${def.singular}` : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}
