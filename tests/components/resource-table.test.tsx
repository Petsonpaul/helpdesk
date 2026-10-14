// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ResourceTable from '@/components/shared/ResourceTable'

interface Row { id: number; name: string }
const columns = [{ key: 'name', header: 'Name', sortable: true }]
const base = { columns, rows: [] as Row[], loading: false }

describe('ResourceTable', () => {
  it('shows loading, error with retry, and empty states', async () => {
    const retry = vi.fn()
    const { rerender } = render(<ResourceTable<Row> {...base} loading />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    rerender(<ResourceTable<Row> {...base} error='Server down' onRetry={retry} />)
    expect(screen.getByText('Server down')).toBeInTheDocument()
    await userEvent.setup().click(screen.getByRole('button', { name: /try again/i }))
    expect(retry).toHaveBeenCalled()
    rerender(<ResourceTable<Row> {...base} emptyTitle='Nothing here' />)
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })

  it('renders rows, sorting and pagination controls', async () => {
    const onSort = vi.fn(); const onPage = vi.fn()
    const user = userEvent.setup()
    render(<ResourceTable<Row> {...base} rows={[{ id: 1, name: 'Accounting' }]} onSort={onSort} onPage={onPage} meta={{ current_page: 1, last_page: 3, total: 40 }} />)
    expect(screen.getByText('Accounting')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /name/i }))
    expect(onSort).toHaveBeenCalledWith('name')
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: /next/i }))
    expect(onPage).toHaveBeenCalledWith(2)
  })
})
