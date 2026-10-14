import { ReactNode } from 'react'
import { DotGrid, GlowBlobs } from './Decor'

export function Section({ children, className = '', tinted = false }: { children: ReactNode; className?: string; tinted?: boolean }) {
  return (
    <section className={`${tinted ? 'bg-lightprimary' : ''} ${className}`}>
      <div className='container mx-auto px-6 py-16 md:py-20'>{children}</div>
    </section>
  )
}

export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className='mx-auto mb-10 max-w-2xl text-center'>
      <h2 className='text-2xl font-bold md:text-3xl'>{title}</h2>
      {subtitle && <p className='mt-3 text-muted-foreground'>{subtitle}</p>}
    </div>
  )
}

export function PageHero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className='relative overflow-hidden bg-lightprimary'>
      <GlowBlobs />
      <DotGrid />
      <div className='container relative mx-auto px-6 py-14 text-center md:py-20'>
        <h1 className='text-3xl font-bold tracking-tight md:text-4xl'>{title}</h1>
        <p className='mx-auto mt-4 max-w-2xl text-muted-foreground'>{subtitle}</p>
      </div>
    </div>
  )
}

export function DraftNotice({ children }: { children: ReactNode }) {
  return (
    <div role='note' className='mb-8 rounded-md border border-border bg-lightprimary px-4 py-3 text-sm'>
      <strong className='font-semibold'>Draft: </strong>{children}
    </div>
  )
}
