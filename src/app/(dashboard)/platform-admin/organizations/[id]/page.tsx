'use client'
import { useParams } from 'next/navigation'
import OrganizationDetail from '@/components/organizations/OrganizationDetail'

export default function Page() {
  const { id } = useParams<{ id: string }>()
  return <OrganizationDetail id={id} />
}
