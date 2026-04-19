"use client"

import { useState, useTransition } from "react"
import { updateProfile, updateCompany } from "@/lib/actions/settings"
import { CTAButton } from "@/components/v2/primitives/CTAButton"
import type { ClientProfile } from "@/lib/types"

type ProfileTabProps = {
  profile: ClientProfile | null
}

export function ProfileTab({ profile }: ProfileTabProps) {
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [companyMessage, setCompanyMessage] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [companyError, setCompanyError] = useState<string | null>(null)
  const [profilePending, startProfile] = useTransition()
  const [companyPending, startCompany] = useTransition()

  if (!profile) {
    return (
      <div
        className="py-10 text-center font-sans"
        style={{ color: "var(--steel)", fontSize: "14px" }}
      >
        Sign in to manage your profile.
      </div>
    )
  }

  function handleProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setProfileMessage(null)
    setProfileError(null)
    const formData = new FormData(e.currentTarget)
    startProfile(async () => {
      const result = await updateProfile(formData)
      if (result.error) setProfileError(result.error)
      else setProfileMessage("Profile saved.")
    })
  }

  function handleCompany(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCompanyMessage(null)
    setCompanyError(null)
    const formData = new FormData(e.currentTarget)
    startCompany(async () => {
      const result = await updateCompany(formData)
      if (result.error) setCompanyError(result.error)
      else setCompanyMessage("Company saved.")
    })
  }

  return (
    <div className="space-y-10">
      <form onSubmit={handleProfile} className="space-y-4">
        <SectionLabel>Profile</SectionLabel>
        <Field
          label="Business name"
          name="businessName"
          defaultValue={profile.business_name ?? ""}
          required
        />
        <Field
          label="Email"
          name="email"
          type="email"
          defaultValue={profile.email ?? ""}
        />
        <Field
          label="Phone"
          name="phone"
          defaultValue={profile.phone ?? ""}
        />
        {profileError && <Message tone="error">{profileError}</Message>}
        {profileMessage && <Message tone="success">{profileMessage}</Message>}
        <div className="flex justify-end">
          <CTAButton type="submit" icon={false} disabled={profilePending}>
            {profilePending ? "Saving…" : "Save profile"}
          </CTAButton>
        </div>
      </form>

      <form onSubmit={handleCompany} className="space-y-4">
        <SectionLabel>Company</SectionLabel>
        <label className="block">
          <span
            className="block font-display uppercase mb-2"
            style={{
              color: "var(--steel)",
              fontSize: "10px",
              letterSpacing: "2px",
              fontWeight: 600,
            }}
          >
            Vertical
          </span>
          <select
            name="vertical"
            defaultValue={profile.vertical ?? ""}
            className="w-full px-3 py-2 font-sans"
            style={{
              background: "var(--parchment)",
              border: "1px solid rgba(11, 29, 58, 0.15)",
              color: "var(--ink)",
              fontSize: "14px",
            }}
          >
            <option value="">Select vertical…</option>
            <option value="construction">Construction</option>
            <option value="healthcare">Healthcare</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="hospitality">Hospitality</option>
            <option value="retail">Retail</option>
            <option value="transportation">Transportation</option>
            <option value="agriculture">Agriculture</option>
            <option value="wholesale">Wholesale</option>
            <option value="real_estate">Real estate</option>
            <option value="auto_services">Auto services</option>
            <option value="other">Other</option>
          </select>
        </label>
        {companyError && <Message tone="error">{companyError}</Message>}
        {companyMessage && <Message tone="success">{companyMessage}</Message>}
        <div className="flex justify-end">
          <CTAButton type="submit" icon={false} disabled={companyPending}>
            {companyPending ? "Saving…" : "Save company"}
          </CTAButton>
        </div>
      </form>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-display uppercase"
      style={{
        color: "var(--ink)",
        fontSize: "11px",
        letterSpacing: "3px",
        fontWeight: 600,
        borderBottom: "1px solid rgba(11, 29, 58, 0.08)",
        paddingBottom: "0.5rem",
      }}
    >
      {children}
    </div>
  )
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
}: {
  label: string
  name: string
  defaultValue?: string
  type?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span
        className="block font-display uppercase mb-2"
        style={{
          color: "var(--steel)",
          fontSize: "10px",
          letterSpacing: "2px",
          fontWeight: 600,
        }}
      >
        {label}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="w-full px-3 py-2 font-sans"
        style={{
          background: "var(--parchment)",
          border: "1px solid rgba(11, 29, 58, 0.15)",
          color: "var(--ink)",
          fontSize: "14px",
        }}
      />
    </label>
  )
}

function Message({
  tone,
  children,
}: {
  tone: "success" | "error"
  children: React.ReactNode
}) {
  return (
    <div
      className="font-sans"
      style={{
        color: tone === "error" ? "var(--enforcement)" : "var(--steel)",
        fontSize: "13px",
      }}
    >
      {children}
    </div>
  )
}
