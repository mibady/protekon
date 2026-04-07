import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | PROTEKON",
  description: "How PROTEKON collects, uses, and protects your data. Our commitment to privacy and compliance data security.",
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children
}
