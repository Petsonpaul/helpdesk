import { api } from '@/lib/api-client'
import type { Plan } from '@/types/subscription'

/**
 * DRAFT development data - NOT confirmed pricing.
 * getPlans() asks the Laravel API (GET /api/v1/plans) first and only
 * falls back to this list while the backend is not available.
 */
export const DRAFT_PLANS: Plan[] = [
  {
    id: 'draft-starter',
    name: 'Starter',
    description: 'For small teams getting their support organised.',
    priceMonthly: null,
    currency: null,
    trialDays: 14,
    features: ['Ticket management', 'Departments and support teams', 'In-app notifications'],
    limits: { agents: null, tickets: null },
  },
  {
    id: 'draft-growth',
    name: 'Growth',
    description: 'For growing organisations with several support teams.',
    priceMonthly: null,
    currency: null,
    trialDays: 14,
    features: ['Everything in Starter', 'Reports and analytics', 'Ticket assignment and escalation'],
    limits: { agents: null, tickets: null },
  },
  {
    id: 'draft-enterprise',
    name: 'Enterprise',
    description: 'For larger organisations with advanced needs.',
    priceMonthly: null,
    currency: null,
    trialDays: null,
    features: ['Everything in Growth', 'Optional external customer portal', 'Priority platform support'],
    limits: { agents: null, tickets: null },
  },
]

export async function getPlans(): Promise<{ plans: Plan[]; isDraft: boolean }> {
  try {
    const res = await api.get<{ data: Plan[] }>('/plans')
    if (res?.data?.length) return { plans: res.data, isDraft: false }
  } catch {
    /* backend not reachable yet - fall through to draft data */
  }
  return { plans: DRAFT_PLANS, isDraft: true }
}
