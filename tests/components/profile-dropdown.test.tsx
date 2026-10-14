// @vitest-environment jsdom
import type React from 'react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Profile from '@/components/profile/ProfileDropdown'

const state = vi.hoisted(() => ({ role: 'org_admin', logout: vi.fn() }))
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({ user: { id: 1, name: 'Ada Obi', email: 'ada@example.com', role: state.role, avatar_url: null }, logout: state.logout }),
}))
// Forward every prop (Radix passes role="menuitem" and handlers to its child via asChild)
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode } & Record<string, unknown>) => (
    <a href={href} {...(rest as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>{children}</a>
  ),
}))
vi.mock('simplebar-react', () => ({ default: ({ children }: { children: ReactNode }) => <div>{children}</div> }))
vi.mock('@iconify/react', () => ({ Icon: () => <span /> }))

describe('profile dropdown', () => {
  beforeEach(() => { state.role = 'org_admin'; state.logout.mockClear() })

  it('opens with the real user details and closes with Escape', async () => {
    const user = userEvent.setup()
    render(<Profile />)
    expect(screen.queryByText('ada@example.com')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /account menu for ada obi/i }))
    expect(await screen.findByText('ada@example.com')).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /my profile/i })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByText('ada@example.com')).not.toBeInTheDocument())
  })

  it('calls logout when Sign Out is pressed', async () => {
    const user = userEvent.setup()
    render(<Profile />)
    await user.click(screen.getByRole('button', { name: /account menu/i }))
    await user.click(await screen.findByRole('button', { name: /sign out/i }))
    expect(state.logout).toHaveBeenCalledTimes(1)
  })

  it('shows billing only to organisation admins', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<Profile />)
    await user.click(screen.getByRole('button', { name: /account menu/i }))
    expect(await screen.findByText('Billing and Subscription')).toBeInTheDocument()
    unmount()
    state.role = 'employee'
    render(<Profile />)
    await user.click(screen.getByRole('button', { name: /account menu/i }))
    expect(await screen.findByText('ada@example.com')).toBeInTheDocument()
    expect(screen.queryByText('Billing and Subscription')).not.toBeInTheDocument()
  })
})
