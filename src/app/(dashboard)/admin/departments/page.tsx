'use client'
import ResourcePage from '@/components/shared/ResourcePage'
import { StatusPill } from '@/components/shared/Badges'
import { DEPARTMENTS, setDepartmentActive } from '@/services/department.service'

interface Dept { id: number; name: string; description: string | null; is_active: boolean; users_count: number }

export default function Page() {
  return (
    <ResourcePage<Dept>
      title='Departments'
      crumbs={[{ title: 'Home', to: '/admin' }, { title: 'Departments' }]}
      endpoint={DEPARTMENTS}
      searchPlaceholder='Search departments'
      columns={[
        { key: 'name', header: 'Department', sortable: true },
        { key: 'description', header: 'Description', render: (r) => r.description ?? '—' },
        { key: 'users_count', header: 'People' },
        { key: 'is_active', header: 'Status', render: (r) => <StatusPill value={r.is_active ? 'active' : 'inactive'} /> },
      ]}
      form={{ noun: 'department', fields: [{ name: 'name', label: 'Name', required: true }, { name: 'description', label: 'Description', type: 'textarea' }] }}
      actions={[
        { label: 'Deactivate', show: (r) => r.is_active, confirm: { title: 'Deactivate department?', body: 'It will no longer be offered when creating tickets. Existing tickets keep their department.', confirmLabel: 'Deactivate', destructive: true }, run: (r) => setDepartmentActive(r.id, false) },
        { label: 'Activate', show: (r) => !r.is_active, run: (r) => setDepartmentActive(r.id, true) },
      ]}
    />
  )
}
