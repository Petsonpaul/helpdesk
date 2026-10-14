'use client'

import * as SelectPrimitive from '@radix-ui/react-select'
import { Icon } from '@/components/shared/Icon'
import { cn } from '@/lib/utils'

const CLEAR = '__clear__'

export interface SelectOption { value: string | number; label: string }

export interface SelectFieldProps {
  id?: string
  /** '' means "nothing chosen" */
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  /** shown when nothing is chosen */
  placeholder?: string
  /** adds a first item that clears the choice (e.g. "All" in filters) */
  clearLabel?: string
  disabled?: boolean
  className?: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
  'aria-label'?: string
}

function Item({ value, label }: { value: string; label: string }) {
  return (
    <SelectPrimitive.Item
      value={value}
      className='relative flex cursor-pointer select-none items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm outline-none transition-colors data-[disabled]:opacity-50 data-[highlighted]:bg-lightprimary data-[highlighted]:text-primary data-[state=checked]:font-medium'>
      <SelectPrimitive.ItemText>{label}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator>
        <Icon icon='tabler:check' width='16' aria-hidden='true' className='text-primary' />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

/**
 * Modern dropdown (replaces the browser's plain select): rounded trigger with a turning chevron,
 * floating panel with a soft shadow, highlighted row, check mark on the chosen item.
 * Keyboard: arrows, Home/End, type-to-search, Enter/Space to choose, Esc to close.
 */
export default function SelectField({ id, value, onChange, options, placeholder = 'Select...', clearLabel, disabled, className, ...aria }: SelectFieldProps) {
  const current = value === '' ? (clearLabel ? CLEAR : '') : value
  return (
    <SelectPrimitive.Root value={current} onValueChange={(v) => onChange(v === CLEAR ? '' : v)} disabled={disabled}>
      <SelectPrimitive.Trigger
        id={id}
        {...aria}
        className={cn(
          'group flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 text-left text-sm shadow-sm transition-colors',
          'hover:border-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 data-[state=open]:border-primary',
          'data-[placeholder]:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-red-500',
          className,
        )}>
        <span className='min-w-0 flex-1 truncate'><SelectPrimitive.Value placeholder={clearLabel ?? placeholder} /></span>
        <SelectPrimitive.Icon asChild>
          <Icon icon='tabler:chevron-down' width='16' aria-hidden='true' className='shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180' />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position='popper'
          sideOffset={6}
          collisionPadding={8}
          className='z-[100] min-w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-16px)] overflow-hidden rounded-xl border border-border bg-background p-1.5 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2'>
          <SelectPrimitive.Viewport className='max-h-64 overflow-y-auto'>
            {clearLabel && <Item value={CLEAR} label={clearLabel} />}
            {options.map((o) => <Item key={String(o.value)} value={String(o.value)} label={o.label} />)}
            {options.length === 0 && !clearLabel && <p className='px-3 py-2 text-sm text-muted-foreground'>No options available</p>}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}
