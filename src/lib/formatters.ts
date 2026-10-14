import { formatDistanceToNow } from 'date-fns'
import type { Plan } from '@/types/subscription'

export function formatPrice(plan: Plan): string {
  if (plan.priceMonthly === null || !plan.currency) return 'Pricing to be confirmed'
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: plan.currency }).format(plan.priceMonthly) + ' / month'
}

export function timeAgo(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : formatDistanceToNow(d, { addSuffix: true })
}

export function formatDate(iso?: string | null, withTime = false): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return withTime ? d.toLocaleString() : d.toLocaleDateString()
}

export function formatMoney(amount: number | null | undefined, currency?: string | null): string {
  if (amount === null || amount === undefined || !currency) return '—'
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount)
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}
