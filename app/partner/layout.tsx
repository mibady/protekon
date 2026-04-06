import type { Metadata } from "next"
import Link from "next/link"
import { getPartnerProfile } from "@/lib/actions/partner-portal"
import PartnerSidebar from "@/components/partner/PartnerSidebar"

export const metadata: Metadata = {
  title: "Partner Portal | PROTEKON",
}

export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getPartnerProfile()

  if (!profile || profile.status !== "approved") {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center p-6">
        <div className="bg-brand-white border border-midnight/[0.08] p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 bg-crimson/10 flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-crimson fill-none stroke-crimson stroke-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="font-display font-bold text-[18px] tracking-[3px] uppercase text-midnight mb-2">
            Access Denied
          </h1>
          {!profile ? (
            <p className="font-sans text-[13px] text-steel mb-6">
              No partner profile found. Please apply to the partner program to access this portal.
            </p>
          ) : (
            <p className="font-sans text-[13px] text-steel mb-6">
              Your partner application is <strong className="text-midnight">{profile.status}</strong>. You&apos;ll receive an email once your account is approved.
            </p>
          )}
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-midnight text-brand-white px-6 py-2.5 font-display font-semibold text-[12px] tracking-[2px] uppercase hover:bg-midnight/90 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-parchment flex">
      <PartnerSidebar profile={profile} />

      {/* Main content */}
      <div className="flex-1 lg:pl-[260px]">
        {/* Top bar */}
        <header className="h-14 bg-brand-white border-b border-midnight/[0.06] flex items-center px-6 sticky top-0 z-30">
          <h1 className="font-display font-bold text-[14px] tracking-[3px] uppercase text-midnight">
            Partner Portal
          </h1>
        </header>

        <main>
          {children}
        </main>
      </div>
    </div>
  )
}
