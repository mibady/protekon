"use client"

import { useState } from "react"
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
  ShieldCheck
} from "@phosphor-icons/react"

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
    ]
  },
  {
    label: "BUSINESS TOOLS",
    items: [
      { name: "Subcontractors", href: "/dashboard/subcontractors", icon: Buildings },
      { name: "Marketplace", href: "/marketplace", icon: Storefront },
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

  // Demo compliance score
  const complianceScore = 87
  const scoreColor = complianceScore >= 75 ? "#2A7D4F" : complianceScore >= 50 ? "#C9A84C" : "#C41230"

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
                Demo Construction Co
              </span>
              <span className="font-sans font-light text-[11px] text-steel">
                Los Angeles, CA · Construction
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
          {navGroups.map((group) => (
            <div key={group.label} className="mb-5">
              <span className="block px-3 mb-2 font-display font-medium text-[8px] tracking-[3px] text-steel">
                {group.label}
              </span>
              <ul className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || 
                    (item.href !== "/dashboard" && pathname.startsWith(item.href))
                  return (
                    <li key={item.name}>
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
              Professional Tier
            </span>
            <p className="font-sans font-light text-[10px] text-steel mt-1">
              Next billing: Jan 15, 2026
            </p>
          </div>
        </div>

        {/* Sign Out */}
        <div className="px-4 py-3 border-t border-brand-white/[0.06]">
          <Link 
            href="/login"
            className="flex items-center gap-3 px-3 py-2.5 text-steel hover:text-crimson transition-colors"
          >
            <SignOut size={16} />
            <span className="font-display font-medium text-[11px] tracking-[1px]">
              Sign Out
            </span>
          </Link>
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
              className="fixed inset-y-0 left-0 w-[280px] bg-void z-50 lg:hidden overflow-y-auto"
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
          <div className="flex items-center gap-4">
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
                <span className="font-display font-bold text-[12px] text-parchment">DU</span>
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
                <Link
                  href="/login"
                  className="block px-4 py-3 font-display text-[11px] tracking-[2px] uppercase text-crimson hover:bg-crimson/[0.04] transition-colors border-t border-midnight/[0.06]"
                  onClick={() => setUserMenuOpen(false)}
                >
                  Sign Out
                </Link>
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
