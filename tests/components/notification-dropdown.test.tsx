// @vitest-environment jsdom
import type React from 'react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Notifications from '@/components/notifications/NotificationDropdown'

const state = vi.hoisted(() => ({
  hook: {} as Record<string, unknown>,
  push: vi.fn(), markRead: vi.fn(), markAll: vi.fn(), refresh: vi.fn(), toggleSound: vi.fn(),
}))
const setHook = (over: Record<string, unknown> = {}) => {
  state.hook = { items: [], unread: 0, loading: false, error: '', markRead: state.markRead, markAll: state.markAll, refresh: state.refresh, soundEnabled: false, soundAvailable: true, toggleSound: state.toggleSound, ...over }
}
vi.mock('@/hooks/use-notifications', () => ({ useNotifications: () => state.hook }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: state.push }) }))
// Forward every prop (Radix passes role="menuitem" and handlers to its child via asChild)
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode } & Record<string, unknown>) => (
    <a href={href} {...(rest as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>{children}</a>
  ),
}))
vi.mock('simplebar-react', () => ({ default: ({ children }: { children: ReactNode }) => <div>{children}</div> }))
vi.mock('simplebar-react/dist/simplebar.min.css', () => ({}))
vi.mock('@iconify/react', () => ({ Icon: () => <span /> }))

const items = [
  { id: 'n1', type: 'ticket.assigned', title: 'Ticket assigned to you', body: 'TCK-5', url: '/tickets/5', read_at: null, created_at: '2026-10-12T09:00:00Z' },
  { id: 'n2', type: 'ticket.reply', title: 'Support replied', body: null, url: null, read_at: '2026-10-12T09:30:00Z', created_at: '2026-10-12T09:10:00Z' },
]

describe('notification dropdown', () => {
  beforeEach(() => { [state.push, state.markRead, state.markAll, state.refresh, state.toggleSound].forEach((m) => m.mockClear()); setHook() })

  it('shows the unread count from the data in the button label and panel', async () => {
    setHook({ items, unread: 1 })
    render(<Notifications />)
    expect(screen.getByRole('button', { name: 'Notifications, 1 unread' })).toBeInTheDocument()
    await userEvent.setup().click(screen.getByRole('button', { name: /notifications, 1 unread/i }))
    expect(await screen.findByText('1 new')).toBeInTheDocument()
    expect(screen.getByText('Ticket assigned to you')).toBeInTheDocument()
  })

  it('marks one notification read and opens its link', async () => {
    setHook({ items, unread: 1 })
    const user = userEvent.setup()
    render(<Notifications />)
    await user.click(screen.getByRole('button', { name: /notifications/i }))
    await user.click(await screen.findByText('Ticket assigned to you'))
    expect(state.markRead).toHaveBeenCalledWith('n1')
    expect(state.push).toHaveBeenCalledWith('/tickets/5')
  })

  it('marks all as read', async () => {
    setHook({ items, unread: 1 })
    const user = userEvent.setup()
    render(<Notifications />)
    await user.click(screen.getByRole('button', { name: /notifications/i }))
    await user.click(await screen.findByRole('button', { name: /mark all as read/i }))
    expect(state.markAll).toHaveBeenCalledTimes(1)
  })

  it('shows empty and error states', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<Notifications />)
    await user.click(screen.getByRole('button', { name: /notifications/i }))
    expect(await screen.findByText('You have no notifications.')).toBeInTheDocument()
    unmount()
    setHook({ error: 'boom' })
    render(<Notifications />)
    await user.click(screen.getByRole('button', { name: /notifications/i }))
    expect(await screen.findByText('Notifications could not be loaded.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /try again/i }))
    expect(state.refresh).toHaveBeenCalled()
  })

  it('has a visible sound toggle', async () => {
    const user = userEvent.setup()
    render(<Notifications />)
    await user.click(screen.getByRole('button', { name: /notifications/i }))
    await user.click(await screen.findByRole('button', { name: /turn notification sound on/i }))
    expect(state.toggleSound).toHaveBeenCalledTimes(1)
  })
})
