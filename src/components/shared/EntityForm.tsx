'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { FormField } from './FormField'
import SelectField from './SelectField'
import { ApiError } from '@/lib/api-client'
import { useOptions } from '@/hooks/use-options'
import type { Option } from '@/types/api'

export type FieldType = 'text' | 'email' | 'textarea' | 'select' | 'number' | 'datetime-local' | 'checkbox' | 'multicheck'
export interface FieldDef {
  name: string
  label: string
  type?: FieldType
  required?: boolean
  options?: Option[]
  /** load options from the API instead of hardcoding them */
  optionsEndpoint?: string
  help?: string
  placeholder?: string
}
export type FormValues = Record<string, unknown>

function Field({ f, value, error, onChange }: { f: FieldDef; value: unknown; error?: string; onChange: (v: unknown) => void }) {
  const { options: remote } = useOptions(f.optionsEndpoint)
  const options = f.options ?? remote
  const id = `f-${f.name}`
  const common = { id, 'aria-invalid': !!error, 'aria-describedby': error ? `${id}-err` : undefined }
  const type = f.type ?? 'text'

  if (type === 'checkbox') {
    return (
      <div>
        <label className='flex items-center gap-2 text-sm font-medium'>
          <input type='checkbox' checked={!!value} onChange={(e) => onChange(e.target.checked)} className='h-4 w-4' /> {f.label}
        </label>
        {f.help && <p className='mt-1 text-xs text-muted-foreground'>{f.help}</p>}
        {error && <p role='alert' className='mt-1 text-xs text-red-600'>{error}</p>}
      </div>
    )
  }
  if (type === 'multicheck') {
    const selected = (Array.isArray(value) ? value : []) as (string | number)[]
    return (
      <fieldset>
        <legend className='mb-2 block text-sm font-medium'>{f.label}</legend>
        <div className='max-h-40 space-y-1 overflow-y-auto rounded-md border border-border p-2'>
          {options.length === 0 && <p className='text-xs text-muted-foreground'>No options available.</p>}
          {options.map((o) => (
            <label key={o.value} className='flex items-center gap-2 text-sm'>
              <input type='checkbox' className='h-4 w-4' checked={selected.includes(o.value)}
                onChange={(e) => onChange(e.target.checked ? [...selected, o.value] : selected.filter((x) => x !== o.value))} />
              {o.label}
            </label>
          ))}
        </div>
        {error && <p role='alert' className='mt-1 text-xs text-red-600'>{error}</p>}
      </fieldset>
    )
  }
  return (
    <FormField id={id} label={f.label} error={error} help={f.help}>
      {type === 'textarea' ? (
        <Textarea {...common} rows={4} value={String(value ?? '')} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : type === 'select' ? (
        <SelectField {...common} value={String(value ?? '')} onChange={onChange} options={options} placeholder='Select...' />
      ) : (
        <Input {...common} type={type} value={String(value ?? '')} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </FormField>
  )
}

/** Generic create/edit form in a dialog. Validates required fields, shows server field errors, blocks double submits. */
export default function EntityForm({
  open, onOpenChange, title, description, fields, initial, submitLabel = 'Save', onSubmit,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  title: string
  description?: string
  fields: FieldDef[]
  initial?: FormValues
  submitLabel?: string
  onSubmit: (values: FormValues) => Promise<unknown>
}) {
  const [values, setValues] = useState<FormValues>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => { if (open) { setValues(initial ?? {}); setErrors({}); setFormError('') } }, [open, initial])

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    const found: Record<string, string> = {}
    for (const f of fields) {
      const v = values[f.name]
      if (f.required && (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0))) found[f.name] = `${f.label} is required.`
    }
    setErrors(found)
    if (Object.keys(found).length) return
    setBusy(true); setFormError('')
    try { await onSubmit(values); onOpenChange(false) }
    catch (err) {
      if (err instanceof ApiError) {
        setErrors(Object.fromEntries(Object.entries(err.fieldErrors).map(([k, v]) => [k, v[0]])))
        setFormError(err.message)
      } else setFormError('Something went wrong. Please try again.')
    } finally { setBusy(false) }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!busy) onOpenChange(o) }}>
      <DialogContent className='max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description ?? ' '}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className='flex flex-col gap-4'>
          {fields.map((f) => (
            <Field key={f.name} f={f} value={values[f.name]} error={errors[f.name]} onChange={(v) => setValues((p) => ({ ...p, [f.name]: v }))} />
          ))}
          {formError && <p role='alert' className='text-sm text-red-600'>{formError}</p>}
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
            <Button type='submit' disabled={busy}>{busy ? 'Saving...' : submitLabel}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
