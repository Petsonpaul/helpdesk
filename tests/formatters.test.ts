import { describe, expect, it } from 'vitest'
import { formatBytes, formatDate, formatMoney, formatPrice } from '@/lib/formatters'
import type { Plan } from '@/types/subscription'

const plan = (over: Partial<Plan> = {}): Plan => ({ id: 'p', name: 'P', description: '', priceMonthly: null, currency: null, trialDays: null, features: [], limits: { agents: null, tickets: null }, ...over })

describe('formatters', () => {
  it('never invents a price', () => {
    expect(formatPrice(plan())).toBe('Pricing to be confirmed')
    expect(formatPrice(plan({ priceMonthly: 10, currency: 'USD' }))).toContain('10')
  })
  it('handles missing values', () => {
    expect(formatDate(null)).toBe('—')
    expect(formatDate('not a date')).toBe('—')
    expect(formatMoney(null, 'USD')).toBe('—')
  })
  it('formats bytes', () => {
    expect(formatBytes(500)).toBe('500 B')
    expect(formatBytes(2048)).toBe('2.0 KB')
  })
})
