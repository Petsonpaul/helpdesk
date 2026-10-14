'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { useTheme } from 'next-themes'
import FullLogo from '@/components/layout/logo/FullLogo'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { PUBLIC_NAV } from '@/lib/route-config'

export default function PublicNav() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => setMounted(true), [])
  const dark = mounted && resolvedTheme === 'dark'

  return (
    <header className='sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur'>
      <nav aria-label='Main' className='container mx-auto flex items-center justify-between gap-4 px-6 py-4'>
        <Link href='/' aria-label='Qelvoro home'>
          <FullLogo />
        </Link>

        <ul className='hidden items-center gap-8 lg:flex'>
          {PUBLIC_NAV.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className='text-sm font-medium text-foreground hover:text-primary'>
                {item.title}
              </Link>
            </li>
          ))}
        </ul>

        <div className='flex items-center gap-2'>
          <button
            type='button'
            aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
            onClick={() => setTheme(dark ? 'light' : 'dark')}
            className='flex h-10 w-10 items-center justify-center rounded-full hover:bg-lightprimary hover:text-primary'>
            <Icon icon={dark ? 'solar:sun-bold-duotone' : 'tabler:moon'} width='20' />
          </button>
          <Button variant='outline' asChild className='hidden sm:inline-flex'>
            <Link href='/login'>Login</Link>
          </Button>
          <Button asChild className='hidden sm:inline-flex'>
            <Link href='/register'>Start free trial</Link>
          </Button>
          <button
            type='button'
            aria-label='Open menu'
            onClick={() => setOpen(true)}
            className='flex h-10 w-10 items-center justify-center rounded-full hover:bg-lightprimary hover:text-primary lg:hidden'>
            <Icon icon='tabler:menu-2' width='22' />
          </button>
        </div>
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side='right' className='w-72 p-6'>
          <SheetTitle className='sr-only'>Menu</SheetTitle>
          <ul className='mt-8 flex flex-col gap-1'>
            {PUBLIC_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className='block rounded-md px-3 py-2 text-base font-medium hover:bg-lightprimary hover:text-primary'>
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
          <div className='mt-6 flex flex-col gap-3'>
            <Button variant='outline' asChild>
              <Link href='/login' onClick={() => setOpen(false)}>Login</Link>
            </Button>
            <Button asChild>
              <Link href='/register' onClick={() => setOpen(false)}>Start free trial</Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
