'use client'
import { useState } from 'react'
import ResourcePage from '@/components/shared/ResourcePage'
import { StatusPill } from '@/components/shared/Badges'
import { Button } from '@/components/ui/button'
import TeamMembersDialog from '@/components/teams/TeamMembersDialog'
import { TEAMS, setTeamActive } from '@/services/team.service'

interface Team { id: number; name: string; description: string | null; members_count: number; is_active: boolean }

export default function Page() {
  const [members, setMembers] = useState<Team | null>(null)
  return (
    <>
      <ResourcePage<Team>
        title='Support teams'
        crumbs={[{ title: 'Home', to: '/admin' }, { title: 'Support teams' }]}
        endpoint={TEAMS}
        searchPlaceholder='Search teams'
        columns={[
          { key: 'name', header: 'Team', sortable: true },
          { key: 'description', header: 'Description', render: (r) => r.description ?? '—' },
          { key: 'members_count', header: 'Members' },
          { key: 'is_active', header: 'Status', render: (r) => <StatusPill value={r.is_active ? 'active' : 'inactive'} /> },
        ]}
        form={{ noun: 'team', fields: [{ name: 'name', label: 'Name', required: true }, { name: 'description', label: 'Description', type: 'textarea' }] }}
        renderRowExtra={(r) => <Button size='sm' variant='outline' onClick={() => setMembers(r)}>Members</Button>}
        actions={[
          { label: 'Deactivate', show: (r) => r.is_active, confirm: { title: 'Deactivate team?', body: 'It will no longer receive new tickets. Existing tickets keep their team.', confirmLabel: 'Deactivate', destructive: true }, run: (r) => setTeamActive(r.id, false) },
          { label: 'Activate', show: (r) => !r.is_active, run: (r) => setTeamActive(r.id, true) },
        ]}
      />
      {members && <TeamMembersDialog teamId={members.id} teamName={members.name} onClose={() => setMembers(null)} />}
    </>
  )
}
