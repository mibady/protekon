import { withSentryConfig } from "@sentry/nextjs"

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
  async redirects() {
    return [
      // Signup → Pricing: accounts are created via Stripe checkout, not free signup
      { source: '/signup', destination: '/pricing', permanent: false },
      // Industry aliases — content covered by existing verticals
      { source: '/industries/hipaa', destination: '/industries/healthcare', permanent: true },
      { source: '/industries/property-management', destination: '/industries/real-estate', permanent: true },
      // Partner portal: /partner is the dashboard
      { source: '/partner/dashboard', destination: '/partner', permanent: true },
    ]
  },
  async rewrites() {
    // /dashboard is the public home for authenticated clients; content is
    // served transparently from /v2/*. This eliminates the redirect chain
    // that was causing /dashboard ↔ /v2/briefing loops — the URL bar
    // stays at /dashboard and Next.js rewrites the request server-side.
    // The /v2/* URLs remain accessible directly for back-compat.
    return [
      { source: '/dashboard', destination: '/v2/briefing' },
      { source: '/dashboard/:path*', destination: '/v2/:path*' },
    ]
  },
}

export default withSentryConfig(nextConfig, {
  org: "ngenius-pros",
  project: "protekon",
  silent: !process.env.CI,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  tunnelRoute: "/sentry-tunnel",
})
