import Link from 'next/link'
import FullLogo from '@/components/layout/logo/FullLogo'
import { PUBLIC_NAV, SITE } from '@/lib/route-config'

export default function PublicFooter() {
  return (
    <footer className='border-t border-border bg-background'>
      <div className='container mx-auto grid gap-10 px-6 py-12 md:grid-cols-3'>
        <div className='flex flex-col gap-3'>
          <FullLogo />
          <p className='max-w-xs text-sm text-muted-foreground'>{SITE.description}</p>
        </div>
        <div>
          <h4 className='mb-3 text-sm font-semibold'>Product</h4>
          <ul className='flex flex-col gap-2 text-sm text-muted-foreground'>
            {PUBLIC_NAV.map((i) => (
              <li key={i.href}><Link href={i.href} className='hover:text-primary'>{i.title}</Link></li>
            ))}
            <li><Link href='/login' className='hover:text-primary'>Login</Link></li>
          </ul>
        </div>
        <div>
          <h4 className='mb-3 text-sm font-semibold'>Legal</h4>
          <ul className='flex flex-col gap-2 text-sm text-muted-foreground'>
            <li><Link href='/terms' className='hover:text-primary'>Terms of Service</Link></li>
            <li><Link href='/privacy' className='hover:text-primary'>Privacy Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className='border-t border-border py-4 text-center text-xs text-muted-foreground'>
        &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
      </div>
    </footer>
  )
}
