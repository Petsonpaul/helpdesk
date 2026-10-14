import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: { unoptimized: true },
  async redirects() {
    return [
      // Old template auth URLs -> canonical URLs
      { source: '/auth/login', destination: '/login', permanent: false },
      { source: '/auth/register', destination: '/register', permanent: false },
      // Old template routes -> new structure
      { source: '/apps/tickets', destination: '/tickets', permanent: false },
      { source: '/apps/tickets/create', destination: '/tickets/create', permanent: false },
      { source: '/user-profile', destination: '/profile', permanent: false },
    ]
  },
}

export default nextConfig
