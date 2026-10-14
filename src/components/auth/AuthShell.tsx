'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import StackedLogo from '@/components/layout/logo/StackedLogo'
import CardBox from '@/components/shared/CardBox'

/** Same visual shell as the existing Login page, reused for the other auth screens. */
export default function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className='min-h-screen w-full flex justify-center items-center bg-lightprimary px-4 py-10'>
      <div className='w-full max-w-[450px]'>
        <CardBox>
          <div className='flex justify-center mb-2'>
            <Link href='/' aria-label='Qelvoro home'><StackedLogo /></Link>
          </div>
          <h1 className='text-center text-lg font-semibold'>{title}</h1>
          {subtitle && <p className='text-sm text-muted-foreground text-center mt-1 mb-6'>{subtitle}</p>}
          {children}
        </CardBox>
      </div>
    </div>
  )
}
