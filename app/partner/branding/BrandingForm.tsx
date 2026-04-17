"use client"

import { useState, useTransition } from "react"
import { uploadPartnerLogo, upsertPartnerBranding, type PartnerBranding } from "@/lib/actions/partner-branding"

interface Props {
  initial: PartnerBranding | null
}

export function BrandingForm({ initial }: Props) {
  const [displayName, setDisplayName] = useState(initial?.display_name ?? "")
  const [contactEmail, setContactEmail] = useState(initial?.contact_email ?? "")
  const [primaryColor, setPrimaryColor] = useState(initial?.primary_color ?? "#C41230")
  const [accentColor, setAccentColor] = useState(initial?.accent_color ?? "#D4AF52")
  const [emailFromName, setEmailFromName] = useState(initial?.email_from_name ?? "")
  const [customDomain, setCustomDomain] = useState(initial?.custom_domain_host ?? "")
  const [hideAttribution, setHideAttribution] = useState(initial?.hide_protekon_attribution ?? false)
  const [logoPath, setLogoPath] = useState(initial?.logo_blob_path ?? "")
  const [status, setStatus] = useState<{ kind: "idle" | "saving" | "ok" | "error"; msg?: string }>({
    kind: "idle",
  })
  const [isPending, startTransition] = useTransition()

  const handleLogoUpload = async (file: File) => {
    setStatus({ kind: "saving", msg: "Uploading logo…" })
    const fd = new FormData()
    fd.set("logo", file)
    const res = await uploadPartnerLogo(fd)
    if (res.ok) {
      setLogoPath(res.path)
      setStatus({ kind: "ok", msg: "Logo uploaded" })
    } else {
      setStatus({ kind: "error", msg: res.error })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStatus({ kind: "saving", msg: "Saving…" })
    startTransition(async () => {
      const fd = new FormData()
      fd.set("display_name", displayName)
      fd.set("contact_email", contactEmail)
      fd.set("primary_color", primaryColor)
      fd.set("accent_color", accentColor)
      fd.set("email_from_name", emailFromName)
      fd.set("custom_domain_host", customDomain)
      if (logoPath) fd.set("logo_blob_path", logoPath)
      if (hideAttribution) fd.set("hide_protekon_attribution", "on")

      const res = await upsertPartnerBranding(fd)
      if (res.ok) setStatus({ kind: "ok", msg: "Branding saved" })
      else setStatus({ kind: "error", msg: res.error })
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Section title="Identity">
        <Field label="Display name" required>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            placeholder="Smith Insurance Group"
            className="w-full border border-midnight/15 px-3 py-2 text-[14px]"
          />
        </Field>
        <Field label="Contact email" required>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required
            placeholder="compliance@partner.com"
            className="w-full border border-midnight/15 px-3 py-2 text-[14px]"
          />
        </Field>
      </Section>

      <Section title="Logo">
        <div className="flex items-start gap-6">
          <div className="w-[200px] h-[80px] bg-parchment border border-midnight/10 flex items-center justify-center overflow-hidden">
            {logoPath ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoPath} alt="Partner logo" className="max-w-full max-h-full" />
            ) : (
              <span className="text-steel text-[12px]">No logo uploaded</span>
            )}
          </div>
          <div className="flex-1">
            <input
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleLogoUpload(file)
              }}
              className="text-[13px]"
            />
            <p className="text-[12px] text-steel mt-1">PNG, JPEG, SVG, or WebP. Max 2MB.</p>
          </div>
        </div>
      </Section>

      <Section title="Colors">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Primary color">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 w-14 border border-midnight/15"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                pattern="^#[0-9A-Fa-f]{6}$"
                className="flex-1 border border-midnight/15 px-3 py-2 text-[14px] font-mono"
              />
            </div>
          </Field>
          <Field label="Accent color">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="h-10 w-14 border border-midnight/15"
              />
              <input
                type="text"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                pattern="^#[0-9A-Fa-f]{6}$"
                className="flex-1 border border-midnight/15 px-3 py-2 text-[14px] font-mono"
              />
            </div>
          </Field>
        </div>
      </Section>

      <Section title="Email sender">
        <Field label="Email “From” name">
          <input
            type="text"
            value={emailFromName}
            onChange={(e) => setEmailFromName(e.target.value)}
            placeholder="Smith Insurance via Protekon"
            className="w-full border border-midnight/15 px-3 py-2 text-[14px]"
          />
          <p className="text-[12px] text-steel mt-1">Leave blank to use default Protekon sender.</p>
        </Field>
        <Field label="Custom domain host (optional)">
          <input
            type="text"
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value)}
            placeholder="compliance.smithgroup.com"
            className="w-full border border-midnight/15 px-3 py-2 text-[14px]"
          />
        </Field>
      </Section>

      <Section title="Attribution">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={hideAttribution}
            onChange={(e) => setHideAttribution(e.target.checked)}
            className="mt-1"
          />
          <div>
            <div className="font-medium text-midnight">Hide Protekon attribution</div>
            <p className="text-[12px] text-steel mt-0.5">
              Replaces the Protekon footer with your own attribution line on emails and documents.
            </p>
          </div>
        </label>
      </Section>

      <Section title="Preview">
        <div className="bg-parchment border border-midnight/10 p-6">
          <div className="text-center mb-4">
            {logoPath ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoPath} alt={displayName || "Partner logo"} className="max-h-[48px] max-w-[200px] mx-auto" />
            ) : (
              <span
                className="font-display font-bold text-[22px] tracking-[1px]"
                style={{ color: primaryColor }}
              >
                {(displayName || "YOUR BRAND").toUpperCase()}
              </span>
            )}
          </div>
          <div className="bg-white border border-midnight/10 p-6 text-[14px] text-steel">
            <div className="font-medium text-midnight mb-1">Sample email body</div>
            Your AI Compliance Officer is online and monitoring California workplace regulations for your business.
          </div>
          <div className="text-center mt-4 text-[11px] text-steel">
            {hideAttribution && displayName
              ? `${displayName} · Workplace Safety Compliance`
              : "Protekon Compliance · California Workplace Safety"}
          </div>
        </div>
      </Section>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending || status.kind === "saving"}
          className="bg-midnight text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-6 py-3 hover:brightness-110 transition-all disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save Branding"}
        </button>
        {status.msg && (
          <span
            className={`text-[13px] ${
              status.kind === "ok" ? "text-green-700" : status.kind === "error" ? "text-crimson" : "text-steel"
            }`}
          >
            {status.msg}
          </span>
        )}
      </div>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display font-bold text-[14px] tracking-[2px] uppercase text-midnight mb-3 border-b border-midnight/10 pb-2">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-midnight mb-1">
        {label}
        {required && <span className="text-crimson ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}
