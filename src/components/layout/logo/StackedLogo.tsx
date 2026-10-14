'use client'

import Image from 'next/image'

/** Q mark above the wordmark. Used on sign-in style screens. */
const StackedLogo = ({ className = 'h-28' }: { className?: string }) => (
  <>
    <Image src='/images/brand/qelvoro-stacked.png' alt='Qelvoro' width={948} height={799} priority
      className={`block dark:hidden w-auto ${className}`} />
    <Image src='/images/brand/qelvoro-stacked-white.png' alt='Qelvoro' width={948} height={799} priority
      className={`hidden dark:block w-auto ${className}`} />
  </>
)

export default StackedLogo
