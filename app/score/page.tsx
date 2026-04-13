import type { Metadata } from "next"
import { Suspense } from "react"
import Nav from "@/components/layout/Nav"
import Footer from "@/components/layout/Footer"
import ScoreWizard from "@/components/score/ScoreWizard"

export const metadata: Metadata = {
  title: "Free Compliance Score | PROTEKON",
  description:
    "Answer 11 baseline questions plus industry-specific checks to get your compliance score. See exactly where your gaps are, what fines you face, and how to fix them — free, instant, no login required.",
  openGraph: {
    title: "Free Compliance Score | PROTEKON",
    description:
      "Get your workplace compliance score in under 3 minutes. 27 industries. Real Cal/OSHA + federal enforcement data. Instant gap analysis.",
  },
}

export default function ScorePage() {
  return (
    <main className="min-h-screen bg-void">
      <Nav />
      {/* SSR hero text for crawlers — hidden once wizard renders */}
      <noscript>
        <section className="pt-32 pb-16 px-8 max-w-[800px] mx-auto text-center">
          <h1 className="font-display font-black text-[48px] leading-[0.92] text-parchment mb-6">
            FREE COMPLIANCE SCORE
          </h1>
          <p className="font-sans text-[16px] text-fog leading-relaxed">
            Answer 11 baseline questions plus industry-specific checks to find out
            where your workplace compliance gaps are. Covers IIPP, SB 553, HazCom,
            Emergency Action Plans, OSHA 300 logs, and more. 27 industries supported.
            Real Cal/OSHA and federal enforcement data. Instant results — no login required.
          </p>
        </section>
      </noscript>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        }
      >
        <ScoreWizard />
      </Suspense>
      <Footer />
    </main>
  )
}
