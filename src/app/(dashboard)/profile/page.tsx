import type { Metadata } from 'next'
import UserProfile from '@/components/profile/UserProfile'

export const metadata: Metadata = { title: 'Profile - Qelvoro' }
export default function Page() { return <UserProfile /> }
