"use client"

// PROTEKON Landing Page
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
      <IntroAnimation onComplete={() => setIntroComplete(true)} />
      
      <div className={`${introComplete ? "opacity-100" : "opacity-0"} transition-opacity duration-500`}>
        <Nav />
        <main>
          <Hero />
          <SocialProof />
          <ProductOverview />
          <DataSection />
          <Comparison />
          <Pricing />
          <Testimonials />
          <SampleReportCTA />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </>
  )
}
