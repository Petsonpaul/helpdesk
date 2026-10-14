'use client'

import { Icon } from '@iconify/react'
import { Input } from '@/components/ui/input'
import SelectField from './SelectField'
import { useOptions } from '@/hooks/use-options'
import type { Option } from '@/types/api'

export interface FilterDef {
  key: string
  label: string
  type?: 'select' | 'date'
  options?: Option[]
  optionsEndpoint?: string
}

function FilterControl({ f, value, onChange }: { f: FilterDef; value: string; onChange: (v: string) => void }) {
  const { options: remote } = useOptions(f.optionsEndpoint)
  const options = [...(f.options ?? []), ...remote]
  const id = `flt-${f.key}`
  return (
    <div className='min-w-[140px] flex-1 sm:flex-none'>
      <label htmlFor={id} className='mb-1 block text-xs text-muted-foreground'>{f.label}</label>
      {f.type === 'date' ? (
        <Input id={id} type='date' value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <SelectField id={id} value={value} onChange={onChange} options={options} clearLabel='All' />
      )}
    </div>
  )
}

export default function SearchAndFilterBar({
  search, onSearch, searchPlaceholder = 'Search...', filters = [], values, onFilter,
}: {
  search?: string
  onSearch?: (v: string) => void
  searchPlaceholder?: string
  filters?: FilterDef[]
  values: Record<string, string>
  onFilter: (key: string, value: string) => void
}) {
  return (
    <div className='flex flex-wrap items-end gap-3'>
      {onSearch && (
        <div className='relative min-w-[200px] flex-1'>
          <label htmlFor='list-search' className='sr-only'>Search</label>
          <Icon icon='solar:magnifer-linear' width='18' className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
          <Input id='list-search' className='pl-10' placeholder={searchPlaceholder} value={search ?? ''} onChange={(e) => onSearch(e.target.value)} />
        </div>
      )}
      {filters.map((f) => <FilterControl key={f.key} f={f} value={values[f.key] ?? ''} onChange={(v) => onFilter(f.key, v)} />)}
    </div>
  )
}
