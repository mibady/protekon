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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://protekon.com"

export const metadata: Metadata = {
  title: {
    default: "PROTEKON — Managed Compliance. Delivered.",
    template: "%s | PROTEKON",
  },
  description: "California workplace compliance as a managed service. IIPP, SB 553, incident logging, and regulatory monitoring — all done for you.",
  metadataBase: new URL(siteUrl),
  keywords: [
    "California compliance",
    "IIPP",
    "SB 553",
    "workplace safety",
    "Cal/OSHA",
    "compliance as a service",
    "managed compliance",
    "incident logging",
    "regulatory monitoring",
  ],
  authors: [{ name: "Protekon" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "PROTEKON",
    title: "PROTEKON — Managed Compliance. Delivered.",
    description: "California workplace compliance as a managed service. IIPP, SB 553, incident logging, and regulatory monitoring — all done for you.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "PROTEKON — Managed Compliance" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PROTEKON — Managed Compliance. Delivered.",
    description: "California workplace compliance as a managed service.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${barlowCondensed.variable} ${dmSans.variable}`}>
      <head>
        {(process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview") && (
          // eslint-disable-next-line @next/next/no-sync-scripts
          <script
            data-recording-token="cF1DXcdeEQ0TPFxrwy7AWwY3mAXoCc7RbYnNAhMU"
            data-is-production-environment="false"
            src="https://snippet.meticulous.ai/v1/meticulous.js"
          />
        )}
      </head>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
