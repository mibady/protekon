"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { User, Building, Bell, Shield, CreditCard, EnvelopeSimple } from "@phosphor-icons/react"
import { getClientProfile, updateProfile, updateCompany, changePassword, getNotificationPreferences, updateNotificationPreferences } from "@/lib/actions/settings"
import type { ClientProfile } from "@/lib/types"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [billingLoading, setBillingLoading] = useState(false)
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>({
    regulatory_updates: true,
    document_reminders: true,
    weekly_summaries: true,
    incident_alerts: true,
    marketing_emails: false,
  })
  const [client, setClient] = useState<ClientProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    getClientProfile().then((data) => {
      setClient(data)
      setLoading(false)
    })
    getNotificationPreferences().then(setNotifPrefs)
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)

    let result

    if (activeTab === "profile" && formRef.current) {
      const formData = new FormData(formRef.current)
      result = await updateProfile(formData)
    } else if (activeTab === "company" && formRef.current) {
      const formData = new FormData(formRef.current)
      result = await updateCompany(formData)
    } else if (activeTab === "security" && formRef.current) {
      const formData = new FormData(formRef.current)
      result = await changePassword(formData)
    }

    setIsSaving(false)

    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      // Refresh client data
      const updated = await getClientProfile()
      setClient(updated)
    }
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "company", label: "Company", icon: Building },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "billing", label: "Billing", icon: CreditCard },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-[28px] text-midnight">Settings</h1>
        <p className="font-sans text-[14px] text-steel mt-1">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-8">
        {/* Sidebar */}
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
          {activeTab === "profile" && (
            <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
              <h2 className="font-display font-bold text-[18px] text-midnight mb-6">Profile Information</h2>
              <div className="flex flex-col gap-2 mb-8">
                <label className="font-display text-[10px] tracking-[2px] uppercase text-steel">
                  Business Name
                </label>
                <input
                  name="businessName"
                  type="text"
                  defaultValue={client?.business_name || ""}
                  className="border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:border-midnight focus:outline-none transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2 mb-8">
                <label className="font-display text-[10px] tracking-[2px] uppercase text-steel">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  defaultValue={client?.email || ""}
                  className="border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:border-midnight focus:outline-none transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2 mb-8">
                <label className="font-display text-[10px] tracking-[2px] uppercase text-steel">
                  Phone Number
                </label>
                <input
                  name="phone"
                  type="tel"
                  defaultValue={client?.phone || ""}
                  className="border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:border-midnight focus:outline-none transition-colors"
                />
              </div>
            </form>
          )}

          {activeTab === "company" && (
            <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
              <h2 className="font-display font-bold text-[18px] text-midnight mb-6">Company Information</h2>
              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <div className="flex flex-col gap-2">
                  <label className="font-display text-[10px] tracking-[2px] uppercase text-steel">
                    Industry
                  </label>
                  <select
                    name="industry"
                    defaultValue={client?.vertical || ""}
                    className="border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:border-midnight focus:outline-none transition-colors"
                  >
                    <option value="construction">Construction</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="hospitality">Hospitality</option>
                    <option value="retail">Retail</option>
                    <option value="agriculture">Agriculture</option>
                    <option value="transportation">Transportation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-display text-[10px] tracking-[2px] uppercase text-steel">
                    Plan
                  </label>
                  <select
                    name="plan"
                    defaultValue={client?.plan || "starter"}
                    className="border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:border-midnight focus:outline-none transition-colors"
                  >
                    <option value="starter">Starter</option>
                    <option value="professional">Professional</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>
            </form>
          )}

          {activeTab === "notifications" && (
            <div>
              <h2 className="font-display font-bold text-[18px] text-midnight mb-6">Notification Preferences</h2>
              <div className="flex flex-col gap-6">
                {[
                  { key: "regulatory_updates", label: "Regulatory Updates", description: "Get notified when Cal/OSHA regulations change" },
                  { key: "document_reminders", label: "Document Reminders", description: "Receive reminders for document reviews and renewals" },
                  { key: "weekly_summaries", label: "Weekly Summaries", description: "Get a weekly compliance status summary" },
                  { key: "incident_alerts", label: "Incident Alerts", description: "Receive alerts when new incidents are logged" },
                  { key: "marketing_emails", label: "Marketing Emails", description: "Receive product updates and tips" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-4 border-b border-ash last:border-0">
                    <div>
                      <span className="font-sans text-[14px] font-medium text-midnight block">{item.label}</span>
                      <span className="font-sans text-[13px] text-steel">{item.description}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifPrefs[item.key] ?? false}
                        onChange={async (e) => {
                          const updated = { ...notifPrefs, [item.key]: e.target.checked }
                          setNotifPrefs(updated)
                          await updateNotificationPreferences(updated)
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-ash peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-ash after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-crimson"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
              <h2 className="font-display font-bold text-[18px] text-midnight mb-6">Security Settings</h2>
              <div className="mb-8">
                <h3 className="font-display text-[14px] font-bold text-midnight mb-4">Change Password</h3>
                <div className="flex flex-col gap-4">
                  <input
                    name="newPassword"
                    type="password"
                    placeholder="New Password"
                    minLength={8}
                    className="border border-ash px-4 py-3 font-sans text-[14px] text-midnight placeholder:text-steel focus:border-midnight focus:outline-none transition-colors"
                  />
                  <input
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm New Password"
                    minLength={8}
                    className="border border-ash px-4 py-3 font-sans text-[14px] text-midnight placeholder:text-steel focus:border-midnight focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="pt-8 border-t border-ash">
                <h3 className="font-display text-[14px] font-bold text-midnight mb-4">Two-Factor Authentication</h3>
                <p className="font-sans text-[14px] text-steel mb-4">
                  Add an extra layer of security to your account by enabling two-factor authentication.
                </p>
                <button type="button" className="font-display text-[11px] tracking-[2px] uppercase text-crimson border border-crimson px-6 py-3 hover:bg-crimson hover:text-parchment transition-colors">
                  Enable 2FA
                </button>
              </div>
            </form>
          )}

          {activeTab === "billing" && (
            <div>
              <h2 className="font-display font-bold text-[18px] text-midnight mb-6">Billing & Subscription</h2>
              <div className="bg-fog/30 p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">
                      Current Plan
                    </span>
                    <span className="font-display font-bold text-[20px] text-midnight">
                      {client?.plan ? client.plan.charAt(0).toUpperCase() + client.plan.slice(1) : "—"}
                    </span>
                  </div>
                  <span className="font-display font-bold text-[24px] text-gold">
                    {client?.plan === "starter" ? "$297/mo" : client?.plan === "professional" ? "$497/mo" : client?.plan === "enterprise" ? "$797/mo" : "—"}
                  </span>
                </div>
                <p className="font-sans text-[13px] text-steel mb-4">
                  Manage your subscription, update payment methods, and view invoices through the Stripe billing portal.
                </p>
                <button
                  onClick={async () => {
                    setBillingLoading(true)
                    try {
                      const res = await fetch("/api/stripe/portal", { method: "POST" })
                      const data = await res.json()
                      if (data.url) {
                        window.location.href = data.url
                      } else {
                        setError(data.error || "Unable to open billing portal")
                      }
                    } catch {
                      setError("Unable to open billing portal")
                    } finally {
                      setBillingLoading(false)
                    }
                  }}
                  disabled={billingLoading}
                  className="bg-midnight text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-6 py-3 hover:bg-midnight/90 transition-colors disabled:opacity-50"
                >
                  {billingLoading ? "Opening..." : "Manage Subscription"}
                </button>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex items-center justify-between mt-8 pt-8 border-t border-ash">
            <div>
              {error && (
                <span className="font-sans text-[13px] text-crimson">{error}</span>
              )}
              <span className={`font-sans text-[13px] text-green-600 transition-opacity ${saved ? "opacity-100" : "opacity-0"}`}>
                Settings saved successfully
              </span>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-midnight text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-8 py-3 hover:bg-midnight/90 transition-colors disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
