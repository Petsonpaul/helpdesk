export interface OrganizationSettings {
  name: string
  external_support_enabled: boolean
  /** minutes before an unacknowledged ticket is escalated; null = not configured */
  acknowledgement_minutes: number | null
}
