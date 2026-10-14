'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/navigation/AppSidebar'
import { AuthProvider } from '@/providers/auth-provider'
import { useAuth } from '@/hooks/use-auth'
import { ErrorState, LoadingState } from '@/components/shared/StateViews'
import { Button } from '@/components/ui/button'
import { canAccessPath, ROLE_HOME } from '@/lib/permissions'
import { isOpenWhenPortalDisabled, isOpenWhenRestricted, isPortalDisabled, isRestricted } from '@/lib/subscription'
import PortalDisabled from '@/components/billing/PortalDisabled'
import SubscriptionBanner from '@/components/billing/SubscriptionBanner'
import DemoBar from '@/components/demo/DemoBar'
import AccessRestricted from '@/components/billing/AccessRestricted'

function Shell({ children }: { children: React.ReactNode }) {
  const { user, status, errorMessage, refresh } = useAuth()
  const pathname = usePathname()

  // This only decides what to show; Laravel enforces access on every API request.
  if (status === 'loading' || status === 'unauthenticated' || (status === 'authenticated' && !user)) return <LoadingState label='Checking your session...' />
  if (status === 'error') return <ErrorState message={errorMessage || 'We could not reach the server.'} onRetry={refresh} />
  const allowed = user ? canAccessPath(user.role, pathname) : false
  // The server decides `access`; this only chooses what to show. Laravel also blocks restricted features.
  const sub = user?.subscription ?? null
  const blocked = isRestricted(sub) && !isOpenWhenRestricted(pathname)
  const portalOff = isPortalDisabled(user) && !isOpenWhenPortalDisabled(pathname)

  return (
    <>
    <DemoBar />
    <div className='flex w-full min-h-screen'>
      <div className='page-wrapper flex w-full'>
        <div className='xl:block hidden'>
          <Sidebar />
        </div>
        <div className='body-wrapper w-full bg-background'>
          <Header />
          <div className={`container mx-auto px-6 py-30`}>
            {allowed && !blocked && !portalOff && <SubscriptionBanner />}
            {allowed ? (portalOff ? <PortalDisabled organizationName={user?.organization?.name} /> : blocked && sub ? <AccessRestricted sub={sub} /> : children) : (
              <div role='alert' className='flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center'>
                <h2 className='text-lg font-semibold'>You do not have access to this page</h2>
                <Button asChild><Link href={user ? ROLE_HOME[user.role] : '/login'}>Go to my dashboard</Link></Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthProvider>
      <Shell>{children}</Shell>
    </AuthProvider>
  )
}
