'use client'

import Link from 'next/link'
import BrandMark from './BrandMark'

const Logo = () => (
  <Link href='/dashboard' aria-label='Qelvoro dashboard'>
    <BrandMark className='h-9' decorative />
  </Link>
)

export default Logo
