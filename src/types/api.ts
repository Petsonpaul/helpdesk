/** Shared API types. The full contract is in docs/api-documentation.md */
export interface ApiValidationErrors { [field: string]: string[] }
export interface ApiErrorBody { message?: string; code?: string; errors?: ApiValidationErrors }

export interface Paginated<T> {
  data: T[]
  meta: { current_page: number; last_page: number; per_page: number; total: number }
}

export interface Option { value: string | number; label: string }

/** Every metric/chart is calculated by the backend; the frontend only draws it. */
export interface Stat {
  key: string; label: string; value: number | string; hint?: string
  /** optional relative app link (e.g. /tickets?view=unassigned) that turns the card into a shortcut */
  href?: string
}
export interface ChartDef {
  key: string
  title: string
  type: 'line' | 'area' | 'bar' | 'donut'
  /** x-axis labels for line/area/bar */
  categories?: string[]
  /** slice labels for donut (series[0].data holds the values) */
  labels?: string[]
  series: { name: string; data: number[] }[]
  /** true when the values are estimates (e.g. net receipts), so the UI can say so */
  estimated?: boolean
}
export interface FeedItem { id: string; text: string; time: string; url?: string | null }
export interface AnnouncementItem {
  id: string; title: string; category: string; severity: string; published_at: string
  body?: string; maintenance_start?: string | null; maintenance_end?: string | null
  read: boolean; acknowledged: boolean; requires_acknowledgement: boolean
}
export interface MetricsPayload {
  stats: Stat[]
  charts: ChartDef[]
  recent?: FeedItem[]
  announcements?: AnnouncementItem[]
}
