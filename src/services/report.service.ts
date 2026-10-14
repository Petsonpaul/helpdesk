export const REPORTS_ENDPOINT = '/reports'
/** Dashboard payloads (stats + charts) are calculated by the backend per role. */
export const DASHBOARD_ENDPOINT = {
  super_admin: '/dashboards/super-admin',
  org_admin: '/dashboards/organization',
  support_manager: '/dashboards/support-manager',
  technician: '/dashboards/technician',
  employee: '/dashboards/employee',
  customer: '/dashboards/customer',
} as const
