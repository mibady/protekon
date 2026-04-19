"use client"

import { useEffect, useMemo, useState } from "react"
import { Toaster, toast } from "sonner"
import type { IntegrationRow } from "@/lib/actions/integrations"
import { StatsHeader } from "./StatsHeader"
import { IntegrationCard } from "./IntegrationCard"

type Props = {
  integrations: IntegrationRow[]
  connectedProvider: string | null
  errorCode: string | null
  errorProvider: string | null
  errorDetail: string | null
}

type CategoryFilter = "All" | string

/**
 * Client shell for /dashboard/integrations.
 *
 * Owns:
 *  - Category filter state (All + unique categories from the registry)
 *  - Flash toasts for ?connected=... success and ?error=... failure
 *  - Local <Toaster /> mount (no app-wide toaster is wired yet in the
 *    dashboard layout, so we scope sonner to this surface)
 */
export function IntegrationsPageClient({
  integrations,
  connectedProvider,
  errorCode,
  errorProvider,
  errorDetail,
}: Props) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All")

  const categories = useMemo<string[]>(() => {
    const set = new Set<string>()
    for (const i of integrations) set.add(i.category)
    return Array.from(set).sort()
  }, [integrations])

  const visible = useMemo<IntegrationRow[]>(() => {
    if (activeCategory === "All") return integrations
    return integrations.filter((i) => i.category === activeCategory)
  }, [integrations, activeCategory])

  const connectedCount = useMemo<number>(
    () => integrations.filter((i) => i.connected).length,
    [integrations],
  )

  // Flash toasts from URL params (callback redirect outcomes)
  useEffect(() => {
    if (connectedProvider) {
      const match = integrations.find((i) => i.id === connectedProvider)
      const name = match?.name ?? connectedProvider
      toast.success(`${name} connected.`)
    }
  }, [connectedProvider, integrations])

  useEffect(() => {
    if (!errorCode) return
    const match = errorProvider
      ? integrations.find((i) => i.id === errorProvider)
      : null
    const providerName = match?.name ?? errorProvider ?? "provider"
    const detail = errorDetail ? ` — ${errorDetail}` : ""
    toast.error(`Could not connect ${providerName} (${errorCode})${detail}`)
  }, [errorCode, errorProvider, errorDetail, integrations])

  return (
    <>
      <Toaster position="top-right" richColors closeButton />

      <StatsHeader connected={connectedCount} total={integrations.length} />

      {/* Category filter chip row */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div
          className="font-display uppercase"
          style={{
            color: "var(--steel)",
            fontSize: "10px",
            letterSpacing: "2px",
            fontWeight: 600,
          }}
        >
          Filter
        </div>
        {(["All", ...categories] as const).map((c) => {
          const active = activeCategory === c
          return (
            <button
              key={c}
              type="button"
              onClick={() => setActiveCategory(c)}
              className="font-display uppercase"
              style={{
                background: active ? "var(--void)" : "transparent",
                color: active ? "var(--parchment)" : "var(--steel)",
                border: active ? "none" : "1px solid rgba(11, 29, 58, 0.12)",
                padding: "6px 10px",
                fontSize: "10px",
                letterSpacing: "2px",
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {c}
            </button>
          )
        })}
      </div>

      {/* Grid of provider cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {visible.map((i) => (
          <IntegrationCard key={i.id} integration={i} />
        ))}
      </div>

      {visible.length === 0 ? (
        <div
          className="mt-6 p-6 font-sans"
          style={{
            background: "var(--parchment)",
            border: "1px solid rgba(11, 29, 58, 0.08)",
            color: "var(--steel)",
            fontSize: "13px",
            lineHeight: 1.55,
          }}
        >
          No providers in this category yet.
        </div>
      ) : null}

      {/* Environment setup callout */}
      <div
        className="mt-10 font-sans italic"
        style={{
          color: "var(--steel)",
          fontSize: "12px",
          lineHeight: 1.55,
        }}
      >
        INTEGRATIONS_ENCRYPTION_KEY + per-provider client ID/secret env vars
        must be set in Vercel before Connect works.
      </div>
    </>
  )
}
