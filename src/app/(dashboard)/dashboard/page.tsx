'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { LoadingState } from '@/components/shared/StateViews'
import { ROLE_HOME } from '@/lib/permissions'

/** /dashboard sends each signed-in user to their own role's home. */
export default function Page() {
  const { user } = useAuth()
  const router = useRouter()
  useEffect(() => { if (user) router.replace(ROLE_HOME[user.role]) }, [user, router])
  return <LoadingState />
}
