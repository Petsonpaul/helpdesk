import React from 'react'
import Script from 'next/script'
import { DEMO_MODE } from '@/lib/demo'
import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './css/globals.css'
import { ThemeProvider } from '@/providers/theme-provider'
import ServiceWorkerRegister from '@/components/service-worker/ServiceWorkerRegister'

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans',
})

const description = 'Qelvoro helps organisations centralise support requests, manage IT teams, track issues and improve support operations.'

export const metadata: Metadata = {
  robots: DEMO_MODE ? { index: false, follow: false } : undefined, // a demo should not appear in search engines
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'Qelvoro - IT Support, Organised. Issues, Resolved.',
  description,
  applicationName: 'Qelvoro',
  openGraph: {
    title: 'Qelvoro',
    description,
    siteName: 'Qelvoro',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Qelvoro' }],
  },
  twitter: { card: 'summary_large_image', title: 'Qelvoro', description, images: ['/og-image.png'] },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {  
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <link rel='icon' href='/favicon.ico' sizes='any' />
        <link rel='icon' href='/favicon.png' type='image/png' />
        <link rel='apple-touch-icon' href='/apple-touch-icon.png' />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#5d87ff" />
      </head>
      <body className={`${dmSans.className}`}>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange>
          <ServiceWorkerRegister />
          {children}
        </ThemeProvider>
        <Script src='/cursor.js' strategy='afterInteractive' />
      </body>
    </html>
  )
}
