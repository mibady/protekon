import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for California workplace compliance. Full managed plans from $597/month with IIPP, SB 553, incident logging, and regulatory monitoring included.",
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
