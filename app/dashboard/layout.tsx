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
  User
} from "@phosphor-icons/react"

const navItems = [
  { name: "Overview", href: "/dashboard", icon: House },
  { name: "Documents", href: "/dashboard/documents", icon: FileText },
  { name: "Incidents", href: "/dashboard/incidents", icon: WarningCircle },
  { name: "Alerts", href: "/dashboard/alerts", icon: Bell },
  { name: "Settings", href: "/dashboard/settings", icon: Gear },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-parchment flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-void border-r border-brand-white/[0.06]">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-brand-white/[0.06]">
          <Link href="/" className="flex items-center gap-2">
            <svg viewBox="0 0 48 84" className="w-6 h-10">
              <rect x="0" y="0" width="13" height="84" fill="#FAFAF8" />
              <rect x="13" y="0" width="35" height="13" fill="#FAFAF8" />
              <rect x="35" y="13" width="13" height="27" fill="#FAFAF8" />
              <rect x="0" y="40" width="48" height="10" fill="#C41230" />
            </svg>
            <span className="font-display font-bold text-[16px] tracking-[4px] text-brand-white">
              PROT<span className="text-crimson">E</span>KON
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/dashboard" && pathname.startsWith(item.href))
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 font-display font-medium text-[12px] tracking-[2px] uppercase transition-colors ${
                      isActive 
                        ? 'bg-crimson/10 text-crimson border-l-2 border-crimson' 
                        : 'text-steel hover:text-parchment hover:bg-brand-white/[0.04]'
                    }`}
                  >
                    <item.icon size={18} weight={isActive ? "fill" : "regular"} />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Compliance Score */}
        <div className="px-4 py-6 border-t border-brand-white/[0.06]">
          <div className="bg-midnight p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-display font-medium text-[10px] tracking-[2px] uppercase text-steel">
                Compliance Score
              </span>
              <span className="font-display font-black text-[24px] text-gold">87</span>
            </div>
            <div className="h-2 bg-void">
              <div className="h-full bg-gold" style={{ width: '87%' }} />
            </div>
            <p className="font-sans text-[11px] text-steel/60 mt-2">
              2 items need attention
            </p>
          </div>
        </div>

        {/* User */}
        <div className="px-4 py-4 border-t border-brand-white/[0.06]">
          <button 
            onClick={() => {}}
            className="w-full flex items-center gap-3 px-4 py-3 text-steel hover:text-crimson transition-colors"
          >
            <SignOut size={18} />
            <span className="font-display font-medium text-[12px] tracking-[2px] uppercase">
              Sign Out
            </span>
          </button>
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
              className="fixed inset-y-0 left-0 w-64 bg-void z-50 lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="h-16 flex items-center justify-between px-6 border-b border-brand-white/[0.06]">
                <Link href="/" className="flex items-center gap-2">
                  <svg viewBox="0 0 48 84" className="w-6 h-10">
                    <rect x="0" y="0" width="13" height="84" fill="#FAFAF8" />
                    <rect x="13" y="0" width="35" height="13" fill="#FAFAF8" />
                    <rect x="35" y="13" width="13" height="27" fill="#FAFAF8" />
                    <rect x="0" y="40" width="48" height="10" fill="#C41230" />
                  </svg>
                  <span className="font-display font-bold text-[16px] tracking-[4px] text-brand-white">
                    PROT<span className="text-crimson">E</span>KON
                  </span>
                </Link>
                <button onClick={() => setSidebarOpen(false)}>
                  <X size={24} className="text-steel" />
                </button>
              </div>
              <nav className="px-4 py-6">
                <ul className="flex flex-col gap-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 font-display font-medium text-[12px] tracking-[2px] uppercase transition-colors ${
                            isActive 
                              ? 'bg-crimson/10 text-crimson border-l-2 border-crimson' 
                              : 'text-steel hover:text-parchment'
                          }`}
                        >
                          <item.icon size={18} weight={isActive ? "fill" : "regular"} />
                          {item.name}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:pl-64">
        {/* Top bar */}
        <header className="h-16 bg-brand-white border-b border-midnight/[0.06] flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="lg:hidden p-2 -ml-2"
            >
              <List size={24} className="text-midnight" />
            </button>
            <h1 className="font-display font-bold text-[14px] tracking-[2px] uppercase text-midnight">
              Shield CaaS Dashboard
            </h1>
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-midnight/[0.04] transition-colors"
            >
              <div className="w-8 h-8 bg-midnight flex items-center justify-center">
                <User size={16} className="text-parchment" />
              </div>
              <span className="hidden sm:block font-display font-medium text-[12px] text-midnight">
                Demo User
              </span>
              <CaretDown size={14} className="text-steel" />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  className="absolute right-0 top-full mt-2 w-48 bg-brand-white border border-midnight/[0.08] shadow-lg z-50"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <Link
                    href="/dashboard/settings"
                    className="block px-4 py-3 font-display text-[11px] tracking-[2px] uppercase text-midnight hover:bg-midnight/[0.04] transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Settings
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
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
