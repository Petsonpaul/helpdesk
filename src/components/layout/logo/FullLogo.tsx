'use client'

import Image from 'next/image'

/** Qelvoro wordmark. Dark text on light backgrounds, white text on dark backgrounds (follows the theme). */
const FullLogo = ({ className = 'h-9' }: { className?: string }) => (
  <>
    <Image src='/images/brand/qelvoro-wordmark.png' alt='Qelvoro' width={948} height={220} priority
      className={`block dark:hidden w-auto ${className}`} />
    <Image src='/images/brand/qelvoro-wordmark-white.png' alt='Qelvoro' width={948} height={220} priority
      className={`hidden dark:block w-auto ${className}`} />
  </>
)

export default FullLogo
