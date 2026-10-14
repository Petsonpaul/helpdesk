import { Icon } from '@/components/shared/Icon'

export function IconTile({ icon, className = '' }: { icon: string; className?: string }) {
  return (
    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0b57f5] to-[#00a2ff] text-white shadow-lg shadow-[#0b57f5]/25 ${className}`}>
      <Icon icon={icon} width='24' aria-hidden='true' />
    </span>
  )
}

/** Modern feature card: soft border, gradient icon tile, subtle lift on hover (motion-safe). */
export default function FeatureCard({ icon, title, text, heading = 'h3' }: { icon: string; title: string; text: string; heading?: 'h2' | 'h3' }) {
  const H = heading
  return (
    <div className='group relative h-full overflow-hidden rounded-2xl border border-border bg-background p-6 shadow-sm transition-all duration-300 hover:shadow-xl motion-safe:hover:-translate-y-1'>
      <span aria-hidden='true' className='pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-[#0b57f5]/10 to-[#00a2ff]/10 transition-transform duration-500 group-hover:scale-125' />
      <IconTile icon={icon} />
      <H className='mt-5 text-base font-semibold'>{title}</H>
      <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>{text}</p>
    </div>
  )
}
