'use client'

import Image from 'next/image'

/** The Q mark on its own (works on light and dark backgrounds). */
const BrandMark = ({ className = 'h-9', decorative = false }: { className?: string; decorative?: boolean }) => (
  <Image src='/images/brand/qelvoro-mark.png' alt={decorative ? '' : 'Qelvoro'} aria-hidden={decorative || undefined}
    width={545} height={533} className={`w-auto ${className}`} />
)

export default BrandMark
