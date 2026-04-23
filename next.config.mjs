import { withSentryConfig } from "@sentry/nextjs"

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self)' },
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
      // Short trade URLs → /score/trade/<slug> (lib/landing-configs/trades registry)
      { source: '/score/roofing',    destination: '/score/trade/roofing',    permanent: true },
      { source: '/score/framing',    destination: '/score/trade/framing',    permanent: true },
      { source: '/score/electrical', destination: '/score/trade/electrical', permanent: true },
      { source: '/score/plumbing',   destination: '/score/trade/plumbing',   permanent: true },
      { source: '/score/hvac',       destination: '/score/trade/hvac',       permanent: true },
      { source: '/score/concrete',   destination: '/score/trade/concrete',   permanent: true },
      { source: '/score/masonry',    destination: '/score/trade/masonry',    permanent: true },
      { source: '/score/gc',         destination: '/score/trade/gc',         permanent: true },
      // Short state URLs → /score/state/<slug> (lib/landing-configs/states registry)
      { source: '/score/michigan',   destination: '/score/state/michigan',   permanent: true },
      { source: '/score/oregon',     destination: '/score/state/oregon',     permanent: true },
      { source: '/score/washington', destination: '/score/state/washington', permanent: true },
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
