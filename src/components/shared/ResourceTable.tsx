'use client'

import { ReactNode } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { EmptyState, ErrorState, LoadingState } from './StateViews'

export interface Column<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode
  className?: string
  sortable?: boolean
}

export default function ResourceTable<T extends { id: string | number }>({
  columns, rows, loading, error, onRetry, emptyTitle = 'Nothing to show', emptyText,
  meta, onPage, sort, direction, onSort, renderActions,
}: {
  columns: Column<T>[]
  rows: T[]
  loading: boolean
  error?: string
  onRetry?: () => void
  emptyTitle?: string
  emptyText?: string
  meta?: { current_page: number; last_page: number; total: number }
  onPage?: (p: number) => void
  sort?: string
  direction?: 'asc' | 'desc'
  onSort?: (key: string) => void
  renderActions?: (row: T) => ReactNode
}) {
  if (loading) return <LoadingState label='Loading data' />
  if (error) return <ErrorState message={error} onRetry={onRetry} />
  if (rows.length === 0) return <EmptyState title={emptyTitle}>{emptyText}</EmptyState>

  return (
    <>
      {/* Wide tables scroll inside their own container so the page never overflows sideways */}
      <div className='overflow-x-auto'>
        <table className='w-full min-w-[640px] text-sm'>
          <thead>
            <tr className='border-b border-border text-left'>
              {columns.map((c) => (
                <th key={c.key} scope='col' className={`px-4 py-3 font-semibold ${c.className ?? ''}`}
                  aria-sort={sort === c.key ? (direction === 'asc' ? 'ascending' : 'descending') : undefined}>
                  {c.sortable && onSort ? (
                    <button type='button' onClick={() => onSort(c.key)} className='inline-flex items-center gap-1 hover:text-primary'>
                      {c.header}
                      <Icon icon={sort === c.key ? (direction === 'asc' ? 'tabler:arrow-up' : 'tabler:arrow-down') : 'tabler:arrows-sort'} width='14' aria-hidden='true' />
                    </button>
                  ) : c.header}
                </th>
              ))}
              {renderActions && <th scope='col' className='px-4 py-3'><span className='sr-only'>Actions</span></th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className='border-b border-border last:border-b-0 hover:bg-lightprimary/40'>
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-3 align-middle ${c.className ?? ''}`}>
                    {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '—')}
                  </td>
                ))}
                {renderActions && <td className='px-4 py-3 text-right'>{renderActions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {meta && meta.last_page > 1 && onPage && (
        <div className='flex items-center justify-between gap-3 border-t border-border p-4 text-sm'>
          <Button size='sm' variant='outline' disabled={meta.current_page <= 1} onClick={() => onPage(meta.current_page - 1)}>Previous</Button>
          <span>Page {meta.current_page} of {meta.last_page} ({meta.total} total)</span>
          <Button size='sm' variant='outline' disabled={meta.current_page >= meta.last_page} onClick={() => onPage(meta.current_page + 1)}>Next</Button>
        </div>
      )}
    </>
  )
}
