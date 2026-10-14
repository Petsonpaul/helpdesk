export interface Plan {
  id: string
  name: string
  description: string
  /** null = price not configured yet. Never invent a price. */
  priceMonthly: number | null
  currency: string | null
  trialDays: number | null
  features: string[]
  /** null = limit not configured yet */
  limits: { agents: number | null; tickets: number | null }
}
