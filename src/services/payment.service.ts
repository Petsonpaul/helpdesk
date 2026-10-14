import { api } from '@/lib/api-client'

export interface BillingSummary {
  plan: { id: string; name: string } | null
  /** trialing | active | past_due | grace | expired | cancelled | none */
  status: string
  trial_ends_at: string | null
  current_period_end: string | null
  grace_ends_at: string | null
  renewal_status: string | null
  plans: { id: string; name: string; description: string; price_monthly: number | null; currency: string | null; features: string[] }[]
  payments: { id: string; reference: string; amount: number; currency: string; status: string; paid_at: string | null }[]
}
export const getBilling = async () => (await api.get<{ data: BillingSummary }>('/organization/billing')).data
/** Server creates the Paystack transaction and returns the hosted payment page URL. */
export const startCheckout = (plan_id: string) => api.post<{ authorization_url: string }>('/billing/checkout', { plan_id })
/** A browser redirect proves nothing. Only this server-verified status counts. */
export const verifyPayment = async (reference: string) => (await api.get<{ status: 'pending' | 'success' | 'failed' }>('/billing/verify', { reference })).status
export const refundPayment = (id: string | number) => api.post<void>(`/platform-admin/payments/${id}/refund`)
