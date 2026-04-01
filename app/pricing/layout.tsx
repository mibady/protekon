import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for California workplace compliance. Plans from $297/month with IIPP, SB 553, and regulatory monitoring included.",
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
