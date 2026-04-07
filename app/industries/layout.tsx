import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Industries We Serve | PROTEKON",
  description: "California compliance management for construction, manufacturing, healthcare, hospitality, real estate, logistics, retail, and auto services.",
}

export default function IndustriesLayout({ children }: { children: React.ReactNode }) {
  return children
}
