import { Icon } from '@/components/shared/Icon'

/** Illustrative line. It is a drawing, not data. */
function TrendSvg() {
  const d = 'M0,88 C30,80 50,58 80,62 S130,92 160,70 S220,26 250,38 S300,16 320,22'
  return (
    <svg viewBox='0 0 320 110' className='h-24 w-full' aria-hidden='true'>
      <defs>
        <linearGradient id='qv-area' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stopColor='#0b57f5' stopOpacity='.30' /><stop offset='1' stopColor='#0b57f5' stopOpacity='0' /></linearGradient>
        <linearGradient id='qv-line' x1='0' y1='0' x2='1' y2='0'><stop offset='0' stopColor='#0b57f5' /><stop offset='1' stopColor='#00a2ff' /></linearGradient>
      </defs>
      {[28, 56, 84].map((y) => <line key={y} x1='0' x2='320' y1={y} y2={y} stroke='currentColor' strokeOpacity='.08' />)}
      <path d={`${d} L320,110 L0,110 Z`} fill='url(#qv-area)' />
      <path d={d} fill='none' stroke='url(#qv-line)' strokeWidth='3' strokeLinecap='round' />
      <circle cx='320' cy='22' r='4.5' fill='#00a2ff' />
    </svg>
  )
}

const STATS = [
  { label: 'Open', icon: 'tabler:circle-dot', tone: 'bg-[#0b57f5]/10 text-[#0b57f5]' },
  { label: 'In progress', icon: 'tabler:progress', tone: 'bg-amber-500/10 text-amber-600' },
  { label: 'Resolved', icon: 'tabler:circle-check', tone: 'bg-emerald-500/10 text-emerald-600' },
]
const ROWS = [
  { label: 'New', icon: 'tabler:sparkles', tone: 'bg-sky-500/10 text-sky-600' },
  { label: 'In progress', icon: 'tabler:progress', tone: 'bg-amber-500/10 text-amber-600' },
  { label: 'Resolved', icon: 'tabler:circle-check', tone: 'bg-emerald-500/10 text-emerald-600' },
]
const NAV = ['tabler:layout-dashboard', 'tabler:ticket', 'tabler:users-group', 'tabler:chart-bar', 'tabler:settings']

/** Layered product preview: window card + floating notification cards. Illustrative layout only: no real or invented figures. */
export default function HeroVisual() {
  return (
    <div role='img' aria-label='Illustrative preview of the Qelvoro dashboard' className='relative mx-auto w-full max-w-[560px] px-2 sm:px-8'>
      <div aria-hidden='true' className='absolute inset-x-4 -inset-y-4 -z-10 rounded-[2rem] bg-gradient-to-tr from-[#0b57f5]/30 via-[#00a2ff]/20 to-transparent blur-2xl' />

      <div aria-hidden='true' className='overflow-hidden rounded-2xl border border-border bg-background/90 shadow-2xl backdrop-blur'>
        <div className='flex items-center gap-2 border-b border-border px-4 py-3'>
          <span className='h-2.5 w-2.5 rounded-full bg-red-400/80' /><span className='h-2.5 w-2.5 rounded-full bg-amber-400/80' /><span className='h-2.5 w-2.5 rounded-full bg-emerald-400/80' />
          <span className='ml-3 h-6 flex-1 rounded-md bg-muted' />
          <span className='h-6 w-6 rounded-full bg-gradient-to-br from-[#0b57f5] to-[#00a2ff]' />
        </div>
        <div className='grid grid-cols-[52px_1fr]'>
          <div className='flex flex-col items-center gap-2 border-r border-border bg-lightprimary/50 py-4'>
            {NAV.map((n, i) => (
              <span key={n} className={`flex h-9 w-9 items-center justify-center rounded-lg ${i === 0 ? 'bg-gradient-to-br from-[#0b57f5] to-[#00a2ff] text-white shadow-md shadow-[#0b57f5]/30' : 'text-muted-foreground'}`}>
                <Icon icon={n} width='18' />
              </span>
            ))}
          </div>
          <div className='space-y-3 p-4'>
            <div className='grid grid-cols-3 gap-2.5'>
              {STATS.map((s) => (
                <div key={s.label} className='rounded-xl border border-border bg-background p-2.5'>
                  <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${s.tone}`}><Icon icon={s.icon} width='16' /></span>
                  <p className='mt-2 text-[11px] text-muted-foreground'>{s.label}</p>
                  <p className='text-lg font-bold leading-tight'>&mdash;</p>
                </div>
              ))}
            </div>
            <div className='rounded-xl border border-border bg-background p-3 text-foreground'>
              <div className='mb-1 flex items-center justify-between'>
                <span className='text-xs font-semibold'>Tickets over time</span>
                <span className='rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground'>Illustrative</span>
              </div>
              <TrendSvg />
            </div>
            <div className='space-y-2'>
              {ROWS.map((r) => (
                <div key={r.label} className='flex items-center gap-3 rounded-xl border border-border bg-background p-2.5'>
                  <span className='h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-muted to-lightprimary' />
                  <div className='min-w-0 flex-1 space-y-1.5'><div className='h-2.5 w-3/4 rounded bg-muted' /><div className='h-2 w-1/2 rounded bg-muted/70' /></div>
                  <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-medium ${r.tone}`}><Icon icon={r.icon} width='12' />{r.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div aria-hidden='true' className='absolute -top-4 right-0 hidden items-center gap-3 rounded-xl border border-border bg-background p-3 shadow-xl sm:flex motion-safe:animate-[qv-float_7s_ease-in-out_infinite]'>
        <span className='flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#0b57f5] to-[#00a2ff] text-white'><Icon icon='tabler:bell-ringing' width='18' /></span>
        <div><p className='text-xs font-semibold'>Ticket assigned</p><p className='text-[11px] text-muted-foreground'>To your support team</p></div>
      </div>
      <div aria-hidden='true' className='absolute -bottom-5 left-0 hidden items-center gap-3 rounded-xl border border-border bg-background p-3 shadow-xl sm:flex motion-safe:animate-[qv-float_9s_ease-in-out_infinite]'>
        <span className='flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600'><Icon icon='tabler:circle-check' width='18' /></span>
        <div><p className='text-xs font-semibold'>Ticket resolved</p><p className='text-[11px] text-muted-foreground'>Requester notified</p></div>
      </div>
    </div>
  )
}
