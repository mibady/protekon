"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  House,
  ClipboardText,
  GraduationCap,
  BookOpen,
  Palette,
  Gear,
  SignOut,
  List,
  X,
} from "@phosphor-icons/react"
import { signOut } from "@/lib/actions/auth"
import type { PartnerProfile } from "@/lib/types/partner"

const TIER_COLORS: Record<PartnerProfile["tier"], string> = {
  free: "text-steel",
  essentials: "text-steel",
  professional: "text-gold",
  enterprise: "text-crimson",
}

const TIER_BG: Record<PartnerProfile["tier"], string> = {
  free: "bg-steel/10",
  essentials: "bg-steel/10",
  professional: "bg-gold/10",
  enterprise: "bg-crimson/10",
}

const navItems = [
  { name: "Dashboard", href: "/partner", icon: House, exact: true },
  { name: "Assessments", href: "/partner/assessments", icon: ClipboardText, exact: false },
  { name: "Enablement", href: "/partner/enablement", icon: BookOpen, exact: false },
  { name: "Branding", href: "/partner/branding", icon: Palette, exact: false },
  { name: "Boot Camp", href: "/partners/boot-camp", icon: GraduationCap, exact: false, external: true },
  { name: "Settings", href: "/partner/settings", icon: Gear, exact: false },
]

function NavItem({
  item,
  pathname,
  onClick,
}: {
  item: (typeof navItems)[number]
  pathname: string
  onClick?: () => void
}) {
  const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
  return (
    <li>
      <Link
        href={item.href}
        onClick={onClick}
        className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
          isActive
            ? "bg-crimson/[0.07] border-l-[3px] border-crimson"
            : "border-l-[3px] border-transparent hover:bg-brand-white/[0.04]"
        }`}
      >
        <item.icon
          size={16}
          weight={isActive ? "fill" : "regular"}
          className={isActive ? "text-crimson" : "text-steel"}
        />
        <span
          className={`font-display font-medium text-[11px] tracking-[1px] ${
            isActive ? "text-brand-white" : "text-brand-white/45"
          }`}
        >
          {item.name}
        </span>
      </Link>
    </li>
  )
}

function SidebarContent({
  profile,
  pathname,
  onNavClick,
}: {
  profile: PartnerProfile
  pathname: string
  onNavClick?: () => void
}) {
  const tierColor = TIER_COLORS[profile.tier]
  const tierBg = TIER_BG[profile.tier]

  return (
    <>
      {/* Brand Block */}
      <div className="px-6 py-5 border-b border-brand-white/[0.06]">
        <Link href="/" className="flex items-center gap-3">
          <svg viewBox="0 0 48 84" className="w-7 h-12">
            <rect x="0" y="0" width="13" height="84" fill="#FAFAF8" />
            <rect x="13" y="0" width="35" height="13" fill="#FAFAF8" />
            <rect x="35" y="13" width="13" height="27" fill="#FAFAF8" />
            <rect x="0" y="40" width="48" height="10" fill="#C41230" />
          </svg>
          <div className="flex flex-col">
            <span className="font-display font-bold text-[20px] tracking-[6px] text-brand-white">
              PROT<span className="text-crimson">E</span>KON
            </span>
            <span className="font-display font-normal text-[10px] tracking-[3px] text-gold">
              PARTNER PORTAL
            </span>
          </div>
        </Link>
      </div>

      {/* Partner Block */}
      <div className="px-6 py-5 border-b border-brand-white/[0.06]">
        <p className="font-sans font-medium text-[13px] text-brand-white leading-snug">
          {profile.company_name}
        </p>
        <p className="font-sans font-light text-[11px] text-steel mt-0.5">
          {profile.contact_name}
        </p>
        <div className="mt-3">
          <span
            className={`inline-block px-2 py-0.5 font-display font-semibold text-[10px] tracking-[2px] uppercase ${tierBg} ${tierColor}`}
          >
            {profile.tier} tier
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-4">
        <span className="block px-3 mb-2 font-display font-medium text-[10px] tracking-[3px] text-steel">
          NAVIGATION
        </span>
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              pathname={pathname}
              onClick={onNavClick}
            />
          ))}
        </ul>
      </nav>

      {/* Sign Out */}
      <div className="px-4 py-3 border-t border-brand-white/[0.06]">
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 text-steel hover:text-crimson transition-colors w-full"
          >
            <SignOut size={16} />
            <span className="font-display font-medium text-[11px] tracking-[1px]">
              Sign Out
            </span>
          </button>
        </form>
      </div>
    </>
  )
}

interface PartnerSidebarProps {
  profile: PartnerProfile
}

export default function PartnerSidebar({ profile }: PartnerSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-[260px] lg:flex-col lg:fixed lg:inset-y-0 bg-void">
        <SidebarContent profile={profile} pathname={pathname} />
      </aside>

      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3.5 left-4 z-40 p-2"
      >
        <List size={24} className="text-midnight" />
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-void/80 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 w-[260px] bg-void z-50 lg:hidden flex flex-col overflow-y-auto"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="px-6 py-5 flex items-center justify-between border-b border-brand-white/[0.06]">
                <Link href="/" className="flex items-center gap-3">
                  <svg viewBox="0 0 48 84" className="w-6 h-10">
                    <rect x="0" y="0" width="13" height="84" fill="#FAFAF8" />
                    <rect x="13" y="0" width="35" height="13" fill="#FAFAF8" />
                    <rect x="35" y="13" width="13" height="27" fill="#FAFAF8" />
                    <rect x="0" y="40" width="48" height="10" fill="#C41230" />
                  </svg>
                  <span className="font-display font-bold text-[18px] tracking-[5px] text-brand-white">
                    PROT<span className="text-crimson">E</span>KON
                  </span>
                </Link>
                <button onClick={() => setMobileOpen(false)}>
                  <X size={24} className="text-steel" />
                </button>
              </div>
              <SidebarContent profile={profile} pathname={pathname} onNavClick={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
