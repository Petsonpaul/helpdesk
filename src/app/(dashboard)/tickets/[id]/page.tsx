'use client'
import { useParams } from 'next/navigation'
import TicketDetailView from '@/components/tickets/TicketDetailView'

export default function Page() {
  const { id } = useParams<{ id: string }>()
  return <TicketDetailView id={id} />
}
