"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  House,
  FileText,
  WarningCircle,
  Bell,
  Gear,
  SignOut,
  List,
  X,
  CaretDown,
  User,
  ChartLine,
  Clipboard,
  Buildings,
  Storefront,
  CreditCard,
  Users,
  MagnifyingGlass,
  Question,
  ShieldCheck,
  HardHat,
  FirstAidKit,
  Handshake,
  MapPin,
  Scroll,
  GraduationCap,
  Wrench,
  ClipboardText,
  Plant,
  Warehouse,
  Truck
} from "@phosphor-icons/react"
import { signOut } from "@/lib/actions/auth"
import { getClientProfile } from "@/lib/actions/settings"
import type { ClientProfile } from "@/lib/types"

// Navigation groups per blueprint spec
const navGroups = [
  {
    label: "OVERVIEW",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: House },
      { name: "Compliance Score", href: "/dashboard/reports/compliance-score", icon: ChartLine },
    ]
  },
  {
    label: "DOCUMENTS",
    items: [
      { name: "My Documents", href: "/dashboard/documents", icon: FileText },
      { name: "Request Update", href: "/dashboard/documents/request", icon: FileText },
    ]
  },
  {
    label: "COMPLIANCE",
    items: [
      { name: "Incident Log", href: "/dashboard/incidents", icon: WarningCircle, badge: 2 },
      { name: "Regulatory Updates", href: "/dashboard/regulations", icon: Bell, badge: 3 },
      { name: "Reports", href: "/dashboard/reports", icon: Clipboard },
      { name: "Training", href: "/dashboard/training", icon: GraduationCap },
      { name: "Quarterly Reviews", href: "/dashboard/reports/compliance-score", icon: ChartLine, minTier: "professional" as const },
      { name: "Annual Audit", href: "/dashboard/reports/annual-summary", icon: Clipboard, minTier: "multi-site" as const },
    ]
  },
  {
    label: "BUSINESS TOOLS",
    items: [
      { name: "Poster Compliance", href: "/dashboard/poster-compliance", icon: Scroll },
      { name: "Marketplace", href: "/dashboard/marketplace", icon: Storefront },
    ]
  },
  {
    label: "ACCOUNT",
    items: [
      { name: "Account Settings", href: "/dashboard/settings", icon: Gear },
      { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
      { name: "Team", href: "/dashboard/team", icon: Users },
    ]
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [client, setClient] = useState<ClientProfile | null>(null)

  useEffect(() => {
    getClientProfile().then(setClient)
  }, [])

  const complianceScore = client?.compliance_score ?? 0
  const scoreColor = complianceScore >= 75 ? "#2A7D4F" : complianceScore >= 50 ? "#C9A84C" : "#C41230"
  const clientPlan = client?.plan || "core"

  const tierRank: Record<string, number> = { core: 1, professional: 2, "multi-site": 3 }
  const tierLabel: Record<string, string> = { core: "Core", professional: "Professional", "multi-site": "Multi-Site" }
  const canAccess = (minTier?: string) => !minTier || (tierRank[clientPlan] ?? 1) >= (tierRank[minTier] ?? 1)

  // Get current page name for breadcrumb
  const getPageName = () => {
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length === 1) return "DASHBOARD"
    return segments[segments.length - 1].toUpperCase().replace(/-/g, ' ')
  }

  return (
    <div className="min-h-screen bg-parchment flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:w-[260px] lg:flex-col lg:fixed lg:inset-y-0 bg-void">
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
              <span className="font-display font-normal text-[8px] tracking-[3px] text-gold">
                MANAGED COMPLIANCE
              </span>
            </div>
          </Link>
        </div>

        {/* Client Block */}
        <div className="px-6 py-5 border-b border-brand-white/[0.06]">
          <div className="flex items-center gap-4">
            {/* Score Ring SVG */}
            <div className="relative w-12 h-12">
              <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="rgba(250,250,248,0.1)"
                  strokeWidth="4"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="4"
                  strokeDasharray={`${complianceScore * 1.256} 125.6`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-display font-extrabold text-[14px] text-gold">
                {complianceScore}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-normal text-[13px] text-brand-white">
                {client?.business_name || "Loading..."}
              </span>
              <span className="font-sans font-light text-[11px] text-steel capitalize">
                {client?.vertical || "—"}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-[#2A7D4F]" />
                <span className="font-display font-medium text-[9px] tracking-[2px] uppercase text-[#2A7D4F]">
                  Compliant
                </span>
              </div>
            </div>
          </div>
          <p className="font-sans font-light text-[11px] text-gold mt-3">
            +4 pts this month
          </p>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 scrollbar-dark">
          {/* Vertical-specific nav */}
          {client?.vertical === "construction" && (
            <div className="mb-5">
              <span className="block px-3 mb-2 font-display font-medium text-[8px] tracking-[3px] text-steel">CONSTRUCTION</span>
              <ul className="flex flex-col gap-0.5">
                <li>
                  <Link href="/dashboard/construction/subcontractors" className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${pathname.startsWith("/dashboard/construction") ? "bg-crimson/[0.07] border-l-[3px] border-crimson" : "border-l-[3px] border-transparent hover:bg-brand-white/[0.04]"}`}>
                    <HardHat size={16} className={pathname.startsWith("/dashboard/construction") ? "text-crimson" : "text-steel"} />
                    <span className={`font-display font-medium text-[11px] tracking-[1px] ${pathname.startsWith("/dashboard/construction") ? "text-brand-white" : "text-brand-white/45"}`}>Subcontractors</span>
                  </Link>
                </li>
              </ul>
            </div>
          )}
          {client?.vertical === "healthcare" && (
            <div className="mb-5">
              <span className="block px-3 mb-2 font-display font-medium text-[8px] tracking-[3px] text-steel">HEALTHCARE</span>
              <ul className="flex flex-col gap-0.5">
                <li>
                  <Link href="/dashboard/healthcare/phi-inventory" className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${pathname === "/dashboard/healthcare/phi-inventory" ? "bg-crimson/[0.07] border-l-[3px] border-crimson" : "border-l-[3px] border-transparent hover:bg-brand-white/[0.04]"}`}>
                    <FirstAidKit size={16} className={pathname === "/dashboard/healthcare/phi-inventory" ? "text-crimson" : "text-steel"} />
                    <span className={`font-display font-medium text-[11px] tracking-[1px] ${pathname === "/dashboard/healthcare/phi-inventory" ? "text-brand-white" : "text-brand-white/45"}`}>PHI Inventory</span>
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/healthcare/baa-tracker" className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${pathname === "/dashboard/healthcare/baa-tracker" ? "bg-crimson/[0.07] border-l-[3px] border-crimson" : "border-l-[3px] border-transparent hover:bg-brand-white/[0.04]"}`}>
                    <Handshake size={16} className={pathname === "/dashboard/healthcare/baa-tracker" ? "text-crimson" : "text-steel"} />
                    <span className={`font-display font-medium text-[11px] tracking-[1px] ${pathname === "/dashboard/healthcare/baa-tracker" ? "text-brand-white" : "text-brand-white/45"}`}>BAA Tracker</span>
                  </Link>
                </li>
              </ul>
            </div>
          )}
          {client?.vertical === "real-estate" && (
            <div className="mb-5">
              <span className="block px-3 mb-2 font-display font-medium text-[8px] tracking-[3px] text-steel">REAL ESTATE</span>
              <ul className="flex flex-col gap-0.5">
                <li>
                  <Link href="/dashboard/real-estate/properties" className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${pathname.startsWith("/dashboard/real-estate") ? "bg-crimson/[0.07] border-l-[3px] border-crimson" : "border-l-[3px] border-transparent hover:bg-brand-white/[0.04]"}`}>
                    <MapPin size={16} className={pathname.startsWith("/dashboard/real-estate") ? "text-crimson" : "text-steel"} />
                    <span className={`font-display font-medium text-[11px] tracking-[1px] ${pathname.startsWith("/dashboard/real-estate") ? "text-brand-white" : "text-brand-white/45"}`}>Properties</span>
                  </Link>
                </li>
              </ul>
            </div>
          )}
          {client?.vertical === "manufacturing" && (
            <div className="mb-5">
              <span className="block px-3 mb-2 font-display font-medium text-[8px] tracking-[3px] text-steel">MANUFACTURING</span>
              <ul className="flex flex-col gap-0.5">
                <li>
                  <Link href="/dashboard/manufacturing/equipment" className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${pathname.startsWith("/dashboard/manufacturing") ? "bg-crimson/[0.07] border-l-[3px] border-crimson" : "border-l-[3px] border-transparent hover:bg-brand-white/[0.04]"}`}>
                    <Wrench size={16} className={pathname.startsWith("/dashboard/manufacturing") ? "text-crimson" : "text-steel"} />
                    <span className={`font-display font-medium text-[11px] tracking-[1px] ${pathname.startsWith("/dashboard/manufacturing") ? "text-brand-white" : "text-brand-white/45"}`}>Equipment & LOTO</span>
                  </Link>
                </li>
              </ul>
            </div>
          )}
          {client?.vertical === "hospitality" && (
            <div className="mb-5">
              <span className="block px-3 mb-2 font-display font-medium text-[8px] tracking-[3px] text-steel">HOSPITALITY</span>
              <ul className="flex flex-col gap-0.5">
                <li>
                  <Link href="/dashboard/hospitality/inspections" className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${pathname.startsWith("/dashboard/hospitality") ? "bg-crimson/[0.07] border-l-[3px] border-crimson" : "border-l-[3px] border-transparent hover:bg-brand-white/[0.04]"}`}>
                    <ClipboardText size={16} className={pathname.startsWith("/dashboard/hospitality") ? "text-crimson" : "text-steel"} />
                    <span className={`font-display font-medium text-[11px] tracking-[1px] ${pathname.startsWith("/dashboard/hospitality") ? "text-brand-white" : "text-brand-white/45"}`}>Health Inspections</span>
                  </Link>
                </li>
              </ul>
            </div>
          )}
          {client?.vertical === "agriculture" && (
            <div className="mb-5">
              <span className="block px-3 mb-2 font-display font-medium text-[8px] tracking-[3px] text-steel">AGRICULTURE</span>
              <ul className="flex flex-col gap-0.5">
                <li>
                  <Link href="/dashboard/agriculture/crews" className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${pathname.startsWith("/dashboard/agriculture") ? "bg-crimson/[0.07] border-l-[3px] border-crimson" : "border-l-[3px] border-transparent hover:bg-brand-white/[0.04]"}`}>
                    <Plant size={16} className={pathname.startsWith("/dashboard/agriculture") ? "text-crimson" : "text-steel"} />
                    <span className={`font-display font-medium text-[11px] tracking-[1px] ${pathname.startsWith("/dashboard/agriculture") ? "text-brand-white" : "text-brand-white/45"}`}>Field Crews</span>
                  </Link>
                </li>
              </ul>
            </div>
          )}
          {client?.vertical === "retail" && (
            <div className="mb-5">
              <span className="block px-3 mb-2 font-display font-medium text-[8px] tracking-[3px] text-steel">RETAIL</span>
              <ul className="flex flex-col gap-0.5">
                <li>
                  <Link href="/dashboard/retail/locations" className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${pathname.startsWith("/dashboard/retail") ? "bg-crimson/[0.07] border-l-[3px] border-crimson" : "border-l-[3px] border-transparent hover:bg-brand-white/[0.04]"}`}>
                    <Storefront size={16} className={pathname.startsWith("/dashboard/retail") ? "text-crimson" : "text-steel"} />
                    <span className={`font-display font-medium text-[11px] tracking-[1px] ${pathname.startsWith("/dashboard/retail") ? "text-brand-white" : "text-brand-white/45"}`}>Store Locations</span>
                  </Link>
                </li>
              </ul>
            </div>
          )}
          {client?.vertical === "wholesale" && (
            <div className="mb-5">
              <span className="block px-3 mb-2 font-display font-medium text-[8px] tracking-[3px] text-steel">WHOLESALE</span>
              <ul className="flex flex-col gap-0.5">
                <li>
                  <Link href="/dashboard/wholesale/zones" className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${pathname.startsWith("/dashboard/wholesale") ? "bg-crimson/[0.07] border-l-[3px] border-crimson" : "border-l-[3px] border-transparent hover:bg-brand-white/[0.04]"}`}>
                    <Warehouse size={16} className={pathname.startsWith("/dashboard/wholesale") ? "text-crimson" : "text-steel"} />
                    <span className={`font-display font-medium text-[11px] tracking-[1px] ${pathname.startsWith("/dashboard/wholesale") ? "text-brand-white" : "text-brand-white/45"}`}>Safety Zones</span>
                  </Link>
                </li>
              </ul>
            </div>
          )}
          {client?.vertical === "transportation" && (
            <div className="mb-5">
              <span className="block px-3 mb-2 font-display font-medium text-[8px] tracking-[3px] text-steel">TRANSPORTATION</span>
              <ul className="flex flex-col gap-0.5">
                <li>
                  <Link href="/dashboard/transportation/fleet" className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${pathname.startsWith("/dashboard/transportation") ? "bg-crimson/[0.07] border-l-[3px] border-crimson" : "border-l-[3px] border-transparent hover:bg-brand-white/[0.04]"}`}>
                    <Truck size={16} className={pathname.startsWith("/dashboard/transportation") ? "text-crimson" : "text-steel"} />
                    <span className={`font-display font-medium text-[11px] tracking-[1px] ${pathname.startsWith("/dashboard/transportation") ? "text-brand-white" : "text-brand-white/45"}`}>Fleet & Drivers</span>
                  </Link>
                </li>
              </ul>
            </div>
          )}
          {navGroups.map((group) => (
            <div key={group.label} className="mb-5">
              <span className="block px-3 mb-2 font-display font-medium text-[8px] tracking-[3px] text-steel">
                {group.label}
              </span>
              <ul className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href))
                  const hasAccess = canAccess((item as { minTier?: string }).minTier)
                  return (
                    <li key={item.name}>
                      {hasAccess ? (
                        <Link
                          href={item.href}
                          className={`flex items-center justify-between px-3 py-2.5 transition-colors ${
                            isActive
                              ? 'bg-crimson/[0.07] border-l-[3px] border-crimson'
                              : 'border-l-[3px] border-transparent hover:bg-brand-white/[0.04]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon
                              size={16}
                              weight={isActive ? "fill" : "regular"}
                              className={isActive ? "text-crimson" : "text-steel"}
                            />
                            <span className={`font-display font-medium text-[11px] tracking-[1px] ${
                              isActive ? "text-brand-white" : "text-brand-white/45"
                            }`}>
                              {item.name}
                            </span>
                          </div>
                          {item.badge && (
                            <span className="px-2 py-0.5 bg-crimson text-brand-white font-display font-bold text-[9px] rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      ) : (
                        <div className="flex items-center justify-between px-3 py-2.5 opacity-40 cursor-default">
                          <div className="flex items-center gap-3">
                            <item.icon size={16} className="text-steel/50" />
                            <span className="font-display font-medium text-[11px] tracking-[1px] text-brand-white/30">
                              {item.name}
                            </span>
                          </div>
                          <span className="font-display text-[7px] tracking-[1px] uppercase text-gold/60 bg-gold/[0.08] px-1.5 py-0.5">
                            Upgrade
                          </span>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Tier Badge */}
        <div className="px-4 py-4 border-t border-brand-white/[0.06]">
          <div className="bg-gold/[0.08] border border-gold/20 px-4 py-3 text-center">
            <span className="font-display font-semibold text-[8px] tracking-[3px] uppercase text-gold">
              {tierLabel[clientPlan] || "Core"} Tier
            </span>
            {clientPlan !== "multi-site" && (
              <Link
                href="/dashboard/settings"
                className="block font-sans font-light text-[10px] text-gold/70 mt-1 hover:text-gold transition-colors"
              >
                Upgrade plan &rarr;
              </Link>
            )}
          </div>
        </div>

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
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-void/80 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 w-[260px] bg-void z-50 lg:hidden overflow-y-auto"
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
                <button onClick={() => setSidebarOpen(false)}>
                  <X size={24} className="text-steel" />
                </button>
              </div>
              <nav className="px-4 py-4">
                {navGroups.map((group) => (
                  <div key={group.label} className="mb-5">
                    <span className="block px-3 mb-2 font-display font-medium text-[8px] tracking-[3px] text-steel">
                      {group.label}
                    </span>
                    <ul className="flex flex-col gap-0.5">
                      {group.items.map((item) => {
                        const isActive = pathname === item.href
                        return (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              onClick={() => setSidebarOpen(false)}
                              className={`flex items-center justify-between px-3 py-2.5 transition-colors ${
                                isActive 
                                  ? 'bg-crimson/[0.07] border-l-[3px] border-crimson' 
                                  : 'border-l-[3px] border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <item.icon 
                                  size={16} 
                                  weight={isActive ? "fill" : "regular"} 
                                  className={isActive ? "text-crimson" : "text-steel"}
                                />
                                <span className={`font-display font-medium text-[11px] tracking-[1px] ${
                                  isActive ? "text-brand-white" : "text-brand-white/45"
                                }`}>
                                  {item.name}
                                </span>
                              </div>
                              {item.badge && (
                                <span className="px-2 py-0.5 bg-crimson text-brand-white font-display font-bold text-[9px] rounded-full">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:pl-[260px]">
        {/* Top bar */}
        <header className="h-14 bg-brand-white border-b border-midnight/[0.06] flex items-center justify-between px-6 sticky top-0 z-30">
          {/* Left: Breadcrumb */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="lg:hidden p-2 -ml-2"
            >
              <List size={24} className="text-midnight" />
            </button>
            <h1 className="font-display font-bold text-[14px] tracking-[3px] uppercase text-midnight">
              {getPageName()}
            </h1>
          </div>

          {/* Right: 4 Elements */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Global Search */}
            <div className="hidden md:flex items-center gap-2 bg-midnight/[0.04] px-4 py-2 w-[240px]">
              <MagnifyingGlass size={16} className="text-steel" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent font-sans text-[13px] text-midnight placeholder:text-steel outline-none w-full"
              />
            </div>

            {/* Notification Bell */}
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 hover:bg-midnight/[0.04] transition-colors"
            >
              <Bell size={20} className="text-midnight" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-crimson rounded-full" />
            </button>

            {/* User Avatar */}
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2"
            >
              <div className="w-9 h-9 bg-midnight flex items-center justify-center">
                <span className="font-display font-bold text-[12px] text-parchment">
                  {client?.business_name?.slice(0, 2).toUpperCase() || "—"}
                </span>
              </div>
            </button>

            {/* Help */}
            <button className="p-2 hover:text-crimson transition-colors">
              <Question size={20} className="text-steel" />
            </button>
          </div>

          {/* User Dropdown */}
          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                className="absolute right-6 top-14 w-48 bg-brand-white border border-midnight/[0.08] shadow-lg z-50"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <Link
                  href="/dashboard/settings"
                  className="block px-4 py-3 font-display text-[11px] tracking-[2px] uppercase text-midnight hover:bg-midnight/[0.04] transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  Account Settings
                </Link>
                <Link
                  href="/dashboard/billing"
                  className="block px-4 py-3 font-display text-[11px] tracking-[2px] uppercase text-midnight hover:bg-midnight/[0.04] transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  Billing
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="block w-full text-left px-4 py-3 font-display text-[11px] tracking-[2px] uppercase text-crimson hover:bg-crimson/[0.04] transition-colors border-t border-midnight/[0.06]"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Sign Out
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Page content */}
        <main>
          {children}
        </main>
      </div>
    </div>
  )
}
