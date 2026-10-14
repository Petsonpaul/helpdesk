'use client'
import ResourcePage from '@/components/shared/ResourcePage'
import { StatusPill } from '@/components/shared/Badges'
import { setUserActive } from '@/services/organization.service'
import { ROLE_LABEL } from '@/lib/permissions'
import type { Role } from '@/types/auth'
import type { FieldDef } from '@/components/shared/EntityForm'

interface UserRow { id: number; name: string; email: string; role: string; department: string | null; team: string | null; is_active: boolean; can_manage: boolean }

const fields: FieldDef[] = [
  { name: 'name', label: 'Full name', required: true },
  { name: 'email', label: 'Email address', type: 'email', required: true },
  { name: 'role', label: 'Role', type: 'select', required: true, optionsEndpoint: '/options/roles' },
  { name: 'department_id', label: 'Department', type: 'select', optionsEndpoint: '/options/departments' },
  { name: 'team_id', label: 'Support team', type: 'select', optionsEndpoint: '/options/teams' },
]

export default function Page() {
  return (
    <ResourcePage<UserRow>
      title='Users'
      crumbs={[{ title: 'Home', to: '/admin' }, { title: 'Users' }]}
      endpoint='/users'
      searchPlaceholder='Search name or email'
      filters={[
        { key: 'role', label: 'Role', optionsEndpoint: '/options/roles' },
        { key: 'department_id', label: 'Department', optionsEndpoint: '/options/departments' },
        { key: 'is_active', label: 'Status', options: [{ value: '1', label: 'Active' }, { value: '0', label: 'Inactive' }] },
      ]}
      columns={[
        { key: 'name', header: 'Name', sortable: true },
        { key: 'email', header: 'Email' },
        { key: 'role', header: 'Role', render: (r) => ROLE_LABEL[r.role as Role] ?? r.role },
        { key: 'department', header: 'Department', render: (r) => r.department ?? '—' },
        { key: 'team', header: 'Support team', render: (r) => r.team ?? '—' },
        { key: 'is_active', header: 'Status', render: (r) => <StatusPill value={r.is_active ? 'active' : 'inactive'} /> },
      ]}
      form={{ noun: 'user', fields, createLabel: 'Invite user' }}
      actions={[
        { label: 'Deactivate', show: (r) => r.is_active && r.can_manage, confirm: { title: 'Deactivate this user?', body: 'They will no longer be able to sign in to your organisation. Their tickets are kept.', confirmLabel: 'Deactivate', destructive: true }, run: (r) => setUserActive(r.id, false) },
        { label: 'Activate', show: (r) => !r.is_active && r.can_manage, run: (r) => setUserActive(r.id, true) },
      ]}
    />
  )
}
