// @vitest-environment jsdom
import type React from 'react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import SubscriptionBanner from '@/components/billing/SubscriptionBanner'
import AccessRestricted from '@/components/billing/AccessRestricted'
import PortalDisabled from '@/components/billing/PortalDisabled'
import type { SubscriptionState } from '@/types/auth'

const state = vi.hoisted(() => ({ sub: null as unknown }))
vi.mock('@/hooks/use-auth', () => ({ useAuth: () => ({ user: { id: 1, role: 'org_admin', subscription: state.sub } }) }))
// Forward every prop (Radix passes role="menuitem" and handlers to its child via asChild)
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode } & Record<string, unknown>) => (
    <a href={href} {...(rest as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>{children}</a>
  ),
}))
vi.mock('@iconify/react', () => ({ Icon: () => <span /> }))

const DAY = 86_400_000
const sub = (over: Partial<SubscriptionState> = {}): SubscriptionState => ({
  status: 'trialing', plan_name: null, trial_ends_at: new Date(Date.now() + 9 * DAY).toISOString(), current_period_end: null, grace_ends_at: null,
  access: 'full', server_time: new Date().toISOString(), can_manage_billing: true, ...over,
})

describe('subscription banner', () => {
  it('shows days left and a billing link to billing managers', () => {
    state.sub = sub()
    render(<SubscriptionBanner />)
    expect(screen.getByText(/your trial ends in/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /choose a plan/i })).toHaveAttribute('href', '/admin/billing')
  })
  it('says "ending soon" in words, not only colour, when urgent', () => {
    state.sub = sub({ trial_ends_at: new Date(Date.now() + 1 * DAY).toISOString() })
    render(<SubscriptionBanner />)
    expect(screen.getByText(/trial ending soon/i)).toBeInTheDocument()
  })
  it('shows nothing to people who cannot manage billing', () => {
    state.sub = sub({ can_manage_billing: false })
    const { container } = render(<SubscriptionBanner />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('access restricted screen', () => {
  it('offers billing to managers and explains that data is safe', () => {
    render(<AccessRestricted sub={sub({ status: 'expired', access: 'restricted' })} />)
    expect(screen.getByText(/access is restricted/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /go to billing/i })).toBeInTheDocument()
    expect(screen.getByText(/have not been deleted/i)).toBeInTheDocument()
  })
  it('never offers a purchase link to other users', () => {
    render(<AccessRestricted sub={sub({ status: 'expired', access: 'restricted', can_manage_billing: false })} />)
    expect(screen.queryByRole('link', { name: /billing/i })).not.toBeInTheDocument()
    expect(screen.getByText(/let your organisation/i)).toBeInTheDocument()
  })
})

describe('portal disabled screen', () => {
  it('names the organisation and keeps the message calm', () => {
    render(<PortalDisabled organizationName='Acme Ltd' />)
    expect(screen.getByText(/acme ltd has/i)).toBeInTheDocument()
  })
})
