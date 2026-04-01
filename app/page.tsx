"use client"

import { useState } from "react"
import IntroAnimation from "@/components/IntroAnimation"
import Nav from "@/components/layout/Nav"
import Footer from "@/components/layout/Footer"
import Hero from "@/components/sections/Hero"
import SocialProof from "@/components/sections/SocialProof"
import ProductOverview from "@/components/sections/ProductOverview"
import DataSection from "@/components/sections/DataSection"
import Comparison from "@/components/sections/Comparison"
import Pricing from "@/components/sections/Pricing"
import Testimonials from "@/components/sections/Testimonials"
import SampleReportCTA from "@/components/sections/SampleReportCTA"
import FinalCTA from "@/components/sections/FinalCTA"

export default function Home() {
  const [introComplete, setIntroComplete] = useState(false)

  return (
    <>
      {/* Intro Animation - plays once on first visit */}
      <IntroAnimation onComplete={() => setIntroComplete(true)} skipable={true} />

      {/* Main Site Content */}
      <div className={`${introComplete ? "opacity-100" : "opacity-0"} transition-opacity duration-500`}>
        <Nav />
        <main>
          {/* Section 1: Hero (Dark) */}
          <Hero />

          {/* Section 2: Social Proof Bar (Light) */}
          <SocialProof />

          {/* Section 3: Product Overview (Dark) */}
          <ProductOverview />

          {/* Section 4: Data Section (Light) */}
          <DataSection />

          {/* Section 5: Competitive Comparison (Dark) */}
          <Comparison />

          {/* Section 6: Pricing (Light - Ash) */}
          <Pricing />

          {/* Section 7: Testimonials (Dark) */}
          <Testimonials />

          {/* Section 8: Sample Report CTA (Dark) */}
          <SampleReportCTA />

          {/* Section 9: Final CTA Banner (Crimson) */}
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </>
  )
}
