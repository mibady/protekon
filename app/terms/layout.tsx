import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | PROTEKON",
  description: "Terms and conditions for using the PROTEKON compliance management platform.",
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children
}
