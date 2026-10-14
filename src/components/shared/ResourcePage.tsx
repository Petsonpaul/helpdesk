'use client'

import { ReactNode, useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import BreadcrumbComp from '@/components/layout/BreadcrumbComp'
import CardBox from '@/components/shared/CardBox'
import { Button } from '@/components/ui/button'
import ResourceTable, { Column } from './ResourceTable'
import SearchAndFilterBar, { FilterDef } from './SearchAndFilterBar'
import EntityForm, { FieldDef, FormValues } from './EntityForm'
import ConfirmationDialog from './ConfirmationDialog'
import { api } from '@/lib/api-client'
import { useDebounce } from '@/hooks/use-debounce'
import type { Paginated } from '@/types/api'

export interface RowAction<T> {
  label: string
  /** hide the action unless the server says it is allowed (e.g. row.can_refund) */
  show?: (row: T) => boolean
  confirm?: { title: string; body: string; confirmLabel?: string; destructive?: boolean }
  run: (row: T) => Promise<unknown>
}

export interface ResourceFormConfig<T> {
  noun: string
  fields: FieldDef[]
  createLabel?: string
  hideCreate?: boolean
  canEdit?: boolean
  toInitial?: (row: T) => FormValues
  /** extra values always sent with the form (e.g. a fixed type) */
  extra?: FormValues
}

/**
 * One server-driven list screen: search, filters, sorting, pagination, create/edit dialog and row actions.
 * It talks only to the documented API; the server decides what each user may see or do.
 */
export default function ResourcePage<T extends { id: string | number }>({
  title, crumbs, endpoint, columns, filters = [], searchable = true, searchPlaceholder,
  form, actions = [], rowHref, headerActions, renderRowExtra, emptyTitle, emptyText, perPage = 15,
  initialFilters, quickViews,
}: {
  title: string
  crumbs: { title: string; to?: string }[]
  endpoint: string
  columns: Column<T>[]
  filters?: FilterDef[]
  searchable?: boolean
  searchPlaceholder?: string
  form?: ResourceFormConfig<T>
  actions?: RowAction<T>[]
  rowHref?: (row: T) => string
  headerActions?: ReactNode
  /** extra per-row buttons (e.g. "Open" or "Members") */
  renderRowExtra?: (row: T) => ReactNode
  emptyTitle?: string
  emptyText?: string
  perPage?: number
  /** filters applied when the page first opens (e.g. from a shortcut link) */
  initialFilters?: Record<string, string>
  /** one-click filter shortcuts shown above the search bar */
  quickViews?: { label: string; filters: Record<string, string> }[]
}) {
  const [search, setSearch] = useState('')
  const debounced = useDebounce(search)
  const [values, setValues] = useState<Record<string, string>>(initialFilters ?? {})
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<string | undefined>()
  const [direction, setDirection] = useState<'asc' | 'desc'>('asc')
  const [editing, setEditing] = useState<T | null>(null)
  const [creating, setCreating] = useState(false)
  const [pending, setPending] = useState<{ action: RowAction<T>; row: T } | null>(null)
  const [actionError, setActionError] = useState('')

  const params = useMemo(() => {
    const p: Record<string, string | number> = { page, per_page: perPage }
    if (debounced) p.search = debounced
    if (sort) { p.sort = sort; p.direction = direction }
    Object.entries(values).forEach(([k, v]) => { if (v) p[k] = v })
    return p
  }, [page, perPage, debounced, sort, direction, values])

  const { data, error, isLoading, mutate } = useSWR(
    [endpoint, JSON.stringify(params)],
    () => api.get<Paginated<T>>(endpoint, params),
    { shouldRetryOnError: false, keepPreviousData: true },
  )

  const onSort = (key: string) => {
    if (sort === key) setDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSort(key); setDirection('asc') }
    setPage(1)
  }
  const onFilter = (k: string, v: string) => { setValues((p) => ({ ...p, [k]: v })); setPage(1) }

  const runAction = useCallback(async (action: RowAction<T>, row: T) => {
    setActionError('')
    try { await action.run(row); await mutate() }
    catch (e) { setActionError(e instanceof Error ? e.message : 'The action failed.') }
  }, [mutate])

  const hasActions = !!(form?.canEdit !== false && form) || actions.length > 0 || !!rowHref || !!renderRowExtra

  return (
    <>
      <BreadcrumbComp title={title} items={crumbs} />
      <CardBox className='p-0'>
        <div className='flex flex-col gap-4 border-b border-border p-4'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div className='flex-1' />
            <div className='flex flex-wrap gap-2'>
              {headerActions}
              {form && !form.hideCreate && <Button onClick={() => setCreating(true)}>{form.createLabel ?? `Add ${form.noun}`}</Button>}
            </div>
          </div>
          {quickViews && quickViews.length > 0 && (
            <div role='group' aria-label='Quick views' className='flex flex-wrap gap-2'>
              {quickViews.map((q) => {
                const active = JSON.stringify(Object.entries(q.filters).sort()) === JSON.stringify(Object.entries(values).filter(([, v]) => v).sort())
                return (
                  <Button key={q.label} size='sm' variant={active ? 'default' : 'outline'} aria-pressed={active}
                    onClick={() => { setValues({ ...q.filters }); setPage(1) }}>
                    {q.label}
                  </Button>
                )
              })}
            </div>
          )}
          <SearchAndFilterBar
            search={searchable ? search : undefined}
            onSearch={searchable ? (v) => { setSearch(v); setPage(1) } : undefined}
            searchPlaceholder={searchPlaceholder}
            filters={filters}
            values={values}
            onFilter={onFilter}
          />
          {actionError && <p role='alert' className='text-sm text-red-600'>{actionError}</p>}
        </div>

        <ResourceTable<T>
          columns={columns}
          rows={data?.data ?? []}
          loading={isLoading && !data}
          error={error ? (error as Error).message : undefined}
          onRetry={() => mutate()}
          emptyTitle={emptyTitle}
          emptyText={emptyText}
          meta={data?.meta}
          onPage={setPage}
          sort={sort}
          direction={direction}
          onSort={onSort}
          renderActions={hasActions ? (row) => (
            <div className='flex flex-wrap justify-end gap-2'>
              {renderRowExtra?.(row)}
              {rowHref && <Button size='sm' variant='outline' asChild><Link href={rowHref(row)}>View</Link></Button>}
              {form && form.canEdit !== false && <Button size='sm' variant='outline' onClick={() => setEditing(row)}>Edit</Button>}
              {actions.filter((a) => !a.show || a.show(row)).map((a) => (
                <Button key={a.label} size='sm' variant={a.confirm?.destructive ? 'outline' : 'outline'}
                  onClick={() => (a.confirm ? setPending({ action: a, row }) : runAction(a, row))}>
                  {a.label}
                </Button>
              ))}
            </div>
          ) : undefined}
        />
      </CardBox>

      {form && (
        <>
          <EntityForm
            open={creating}
            onOpenChange={setCreating}
            title={form.createLabel ?? `Add ${form.noun}`}
            fields={form.fields}
            initial={form.extra}
            onSubmit={async (v) => { await api.post(endpoint, { ...form.extra, ...v }); await mutate() }}
          />
          <EntityForm
            open={!!editing}
            onOpenChange={(o) => { if (!o) setEditing(null) }}
            title={`Edit ${form.noun}`}
            fields={form.fields}
            initial={editing ? (form.toInitial ? form.toInitial(editing) : (editing as unknown as FormValues)) : undefined}
            onSubmit={async (v) => { await api.patch(`${endpoint}/${editing!.id}`, { ...form.extra, ...v }); await mutate() }}
          />
        </>
      )}

      {pending?.action.confirm && (
        <ConfirmationDialog
          open
          onOpenChange={(o) => { if (!o) setPending(null) }}
          title={pending.action.confirm.title}
          body={pending.action.confirm.body}
          confirmLabel={pending.action.confirm.confirmLabel}
          destructive={pending.action.confirm.destructive}
          onConfirm={async () => { await pending.action.run(pending.row); await mutate() }}
        />
      )}
    </>
  )
}
