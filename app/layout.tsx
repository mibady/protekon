import type { Metadata } from 'next'
import { Barlow_Condensed, DM_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-display',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PROTEKON — Managed Compliance. Delivered.',
  description: 'California workplace compliance as a managed service. IIPP, SB 553, incident logging, and regulatory monitoring — all done for you.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${barlowCondensed.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
