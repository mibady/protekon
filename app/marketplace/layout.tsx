import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Compliance Marketplace | PROTEKON",
  description: "Curated California compliance services, templates, and partner integrations for small and mid-sized businesses.",
}

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return children
}
