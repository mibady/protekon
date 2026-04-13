import type { Metadata } from "next"
import { Suspense } from "react"
import Nav from "@/components/layout/Nav"
import Footer from "@/components/layout/Footer"
import ScoreWizard from "@/components/score/ScoreWizard"
import ScoreLanding from "./score-landing"

export const metadata: Metadata = {
  title: "Free Compliance Score | PROTEKON",
  description:
    "Take a quick assessment plus industry-specific checks to get your compliance score. See exactly where your gaps are, what fines you face, and how to fix them — free, instant, no login required.",
  openGraph: {
    title: "Free Compliance Score | PROTEKON",
    description:
      "Get your workplace compliance score in under 3 minutes. 27 industries. Real Cal/OSHA + federal enforcement data. Instant gap analysis.",
  },
}

export default async function ScorePage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string }>
}) {
  const params = await searchParams
  const showWizard = params.start === "true"

  return (
    <main className="min-h-screen bg-void">
      <Nav />
      {showWizard ? (
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          }
        >
          <ScoreWizard />
        </Suspense>
      ) : (
        <ScoreLanding />
      )}
      <Footer />
    </main>
  )
}
