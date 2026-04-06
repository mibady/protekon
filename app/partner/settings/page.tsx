"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { User, Buildings, Bell, Shield } from "@phosphor-icons/react"
import { getPartnerProfile, updatePartnerProfile } from "@/lib/actions/partner-portal"
import type { PartnerProfile } from "@/lib/types/partner"
import { toast } from "sonner"

const TIER_LABELS: Record<PartnerProfile["tier"], string> = {
  free: "Free",
  essentials: "Essentials",
  professional: "Professional",
  enterprise: "Enterprise",
}

export default function PartnerSettingsPage() {
  const [profile, setProfile] = useState<PartnerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("business")
  const [isSaving, setIsSaving] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    getPartnerProfile().then((data) => {
      setProfile(data)
      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    if (!formRef.current) return
    setIsSaving(true)

    const formData = new FormData(formRef.current)
    const result = await updatePartnerProfile(formData)

    setIsSaving(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Settings saved")
      const updated = await getPartnerProfile()
      setProfile(updated)
    }
  }

  const tabs = [
    { id: "business", label: "Business", icon: Buildings },
    { id: "contact", label: "Contact", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "branding", label: "Branding", icon: Shield },
  ]

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-midnight/20 border-t-midnight rounded-full animate-spin mx-auto mb-4" />
          <p className="font-sans text-[14px] text-steel">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-[28px] text-midnight">Partner Settings</h1>
        <p className="font-sans text-[14px] text-steel mt-1">
          Manage your partner account and preferences
        </p>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-8">
        {/* Sidebar Tabs */}
        <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 font-display text-[11px] tracking-[2px] uppercase whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-midnight text-parchment"
                  : "bg-white border border-ash text-steel hover:text-midnight hover:border-midnight"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          className="bg-white border border-ash p-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "business" && (
            <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
              <h2 className="font-display font-bold text-[18px] text-midnight mb-6">Business Information</h2>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-display text-[12px] tracking-[2px] uppercase text-steel">
                    Company Name
                  </label>
                  <input
                    name="company_name"
                    type="text"
                    defaultValue={profile?.company_name || ""}
                    className="border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:border-midnight focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-display text-[12px] tracking-[2px] uppercase text-steel">
                    Partner Tier
                  </label>
                  <div className="border border-ash px-4 py-3 bg-fog/30 font-sans text-[14px] text-steel">
                    {profile?.tier ? TIER_LABELS[profile.tier] : "—"}
                    <span className="font-sans text-[12px] text-steel ml-2">(contact support to change)</span>
                  </div>
                </div>
              </div>
            </form>
          )}

          {activeTab === "contact" && (
            <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
              <h2 className="font-display font-bold text-[18px] text-midnight mb-6">Contact Information</h2>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-display text-[12px] tracking-[2px] uppercase text-steel">
                    Contact Name
                  </label>
                  <input
                    name="contact_name"
                    type="text"
                    defaultValue={profile?.contact_name || ""}
                    className="border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:border-midnight focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-display text-[12px] tracking-[2px] uppercase text-steel">
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={profile?.email || ""}
                    className="border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:border-midnight focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-display text-[12px] tracking-[2px] uppercase text-steel">
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    defaultValue={profile?.phone || ""}
                    className="border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:border-midnight focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </form>
          )}

          {activeTab === "notifications" && (
            <div>
              <h2 className="font-display font-bold text-[18px] text-midnight mb-6">Notification Preferences</h2>
              <div className="flex flex-col gap-6">
                {[
                  { key: "new_assessments", label: "Assessment Completions", description: "Get notified when a prospect completes an assessment" },
                  { key: "client_alerts", label: "Client Compliance Alerts", description: "Receive alerts when client compliance scores drop" },
                  { key: "revenue_reports", label: "Revenue Reports", description: "Get monthly revenue summary reports" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-4 border-b border-ash last:border-0">
                    <div>
                      <span className="font-sans text-[14px] font-medium text-midnight block">{item.label}</span>
                      <span className="font-sans text-[13px] text-steel">{item.description}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="sr-only peer"
                        onChange={() => toast.info("Notification preferences coming soon")}
                      />
                      <div className="w-11 h-6 bg-ash peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-ash after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-crimson" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "branding" && (
            <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
              <h2 className="font-display font-bold text-[18px] text-midnight mb-6">Branding</h2>
              <p className="font-sans text-[14px] text-steel mb-6">
                Customize how your partner portal and client-facing documents appear.
                White-label branding is available on Professional and Enterprise tiers.
              </p>
              {profile?.tier === "professional" || profile?.tier === "enterprise" ? (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-display text-[12px] tracking-[2px] uppercase text-steel">
                      Logo URL
                    </label>
                    <input
                      name="logo_url"
                      type="url"
                      defaultValue={profile?.branding?.logo_url || ""}
                      placeholder="https://example.com/logo.png"
                      className="border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:border-midnight focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-display text-[12px] tracking-[2px] uppercase text-steel">
                      Primary Brand Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        name="primary_color"
                        type="color"
                        defaultValue={profile?.branding?.primary_color || "#C41230"}
                        className="w-12 h-12 border border-ash cursor-pointer"
                      />
                      <input
                        type="text"
                        defaultValue={profile?.branding?.primary_color || "#C41230"}
                        readOnly
                        className="border border-ash px-4 py-3 font-mono text-[14px] text-midnight bg-fog/30 w-32"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-fog/30 border border-ash p-6 text-center">
                  <p className="font-sans text-[14px] text-steel mb-3">
                    White-label branding requires a Professional or Enterprise tier.
                  </p>
                  <span className="font-display text-[11px] tracking-[2px] uppercase text-crimson">
                    Contact support to upgrade
                  </span>
                </div>
              )}
            </form>
          )}

          {/* Save Button */}
          {activeTab !== "notifications" && (
            <div className="flex items-center justify-end mt-8 pt-8 border-t border-ash">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-midnight text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-8 py-3 hover:bg-midnight/90 transition-colors disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
