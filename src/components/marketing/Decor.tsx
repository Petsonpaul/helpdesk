/** Decorative, non-interactive background pieces for marketing pages. All aria-hidden. */

/** Soft dotted grid that fades out toward the edges. */
export function DotGrid({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden='true' className={`pointer-events-none absolute inset-0 h-full w-full text-primary/15 ${className}`}>
      <defs>
        <pattern id='qv-dots' width='24' height='24' patternUnits='userSpaceOnUse'><circle cx='2' cy='2' r='1.3' fill='currentColor' /></pattern>
        <radialGradient id='qv-fade' cx='50%' cy='45%' r='65%'><stop offset='0' stopColor='#fff' /><stop offset='1' stopColor='#000' /></radialGradient>
        <mask id='qv-mask'><rect width='100%' height='100%' fill='url(#qv-fade)' /></mask>
      </defs>
      <rect width='100%' height='100%' fill='url(#qv-dots)' mask='url(#qv-mask)' />
    </svg>
  )
}

/** Two blurred colour glows in the Qelvoro blues. */
export function GlowBlobs() {
  return (
    <div aria-hidden='true' className='pointer-events-none absolute inset-0 overflow-hidden'>
      <div className='absolute -left-24 -top-28 h-96 w-96 rounded-full bg-[#0b57f5]/15 blur-3xl' />
      <div className='absolute -right-16 top-1/3 h-96 w-96 rounded-full bg-[#00a2ff]/15 blur-3xl' />
    </div>
  )
}

/** Curved divider that blends a tinted section into the page background. */
export function WaveDivider({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden='true' viewBox='0 0 1440 80' preserveAspectRatio='none' className={`pointer-events-none block h-12 w-full fill-background md:h-16 ${className}`}>
      <path d='M0,40 C240,84 480,0 720,32 C960,64 1200,6 1440,40 L1440,80 L0,80 Z' />
    </svg>
  )
}
