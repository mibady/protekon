"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Mail,
  Cloud,
  Calculator,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { StepShell, StepFooterNext } from "@/components/onboarding/StepShell"
import { recordToolIntent } from "@/lib/actions/onboarding/connect-tools"
import { advanceStep } from "@/lib/actions/onboarding/state"
import type { IntegrationProviderKey } from "@/lib/types/onboarding"

type Category = {
  id: string
  title: string
  description: string
  icon: LucideIcon
  providers: { key: IntegrationProviderKey; label: string }[]
}

const CATEGORIES: Category[] = [
  {
    id: "email",
    title: "Email",
    description:
      "Sync inbound compliance mail so Protekon can triage renewals and OSHA letters.",
    icon: Mail,
    providers: [
      { key: "gmail", label: "Gmail" },
      { key: "outlook", label: "Outlook" },
    ],
  },
  {
    id: "cloud",
    title: "Cloud drive",
    description:
      "Pull existing policies, training certificates, and incident reports automatically.",
    icon: Cloud,
    providers: [
      { key: "google_drive", label: "Google Drive" },
      { key: "onedrive", label: "OneDrive" },
      { key: "dropbox", label: "Dropbox" },
    ],
  },
  {
    id: "accounting",
    title: "Accounting",
    description:
      "Tie COI tracking and vendor spend to the ledgers you already trust.",
    icon: Calculator,
    providers: [
      { key: "quickbooks", label: "QuickBooks" },
      { key: "sage_intacct", label: "Sage Intacct" },
      { key: "foundation", label: "Foundation" },
    ],
  },
  {
    id: "compliance",
    title: "Existing compliance tool",
    description:
      "Replace or augment the patchwork you already run. We'll mirror the data.",
    icon: ShieldCheck,
    providers: [
      { key: "mycoi", label: "myCOI" },
      { key: "evident", label: "Evident" },
      { key: "procore", label: "Procore" },
      { key: "billy", label: "Billy" },
    ],
  },
]

type Props = {
  initialIntents: IntegrationProviderKey[]
}

export function ConnectToolsForm({ initialIntents }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [openCategory, setOpenCategory] = useState<Category | null>(null)
  const [selected, setSelected] = useState<Set<IntegrationProviderKey>>(
    new Set(initialIntents),
  )

  const handleOpenChange = (open: boolean) => {
    if (!open) setOpenCategory(null)
  }

  const toggleProvider = (key: IntegrationProviderKey) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const submitIntents = () => {
    if (!openCategory) return
    const picks = openCategory.providers
      .map((p) => p.key)
      .filter((key) => selected.has(key))

    if (picks.length === 0) {
      toast.error("Pick at least one provider to request access.")
      return
    }

    startTransition(async () => {
      const results = await Promise.all(picks.map((key) => recordToolIntent(key)))
      const failed = results.filter((r) => !r.ok)
      if (failed.length > 0) {
        toast.error("Couldn't record one or more providers. Please try again.")
        return
      }
      toast.success(
        `Request queued for ${picks.length} provider${picks.length === 1 ? "" : "s"}.`,
      )
      setOpenCategory(null)
      router.refresh()
    })
  }

  const continueToNext = () => {
    startTransition(async () => {
      const result = await advanceStep(2)
      if (!result.ok) {
        toast.error("Couldn't save progress. Please try again.")
        return
      }
      router.push("/onboarding/sites")
    })
  }

  return (
    <StepShell
      stepNumber={2}
      totalSteps={7}
      title="Connect your existing tools"
      intro="We stub the plumbing now so Phase 2 lights up without another setup meeting. Every integration is marked Coming Soon — we'll email you the moment it ships."
      backHref="/onboarding/business"
    >
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {CATEGORIES.map((category) => {
            const Icon = category.icon
            const requestedCount = category.providers.filter((p) =>
              selected.has(p.key),
            ).length
            return (
              <div
                key={category.id}
                className="flex flex-col gap-4 border border-brand-white/[0.1] bg-midnight/50 p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center border border-brand-white/[0.1] bg-void">
                      <Icon className="h-5 w-5 text-gold" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-display text-[16px] font-bold text-parchment">
                        {category.title}
                      </h3>
                      {requestedCount > 0 ? (
                        <p className="font-sans text-[12px] text-gold">
                          {requestedCount} provider{requestedCount === 1 ? "" : "s"} queued
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <Badge variant="secondary">Coming soon</Badge>
                </div>
                <p className="font-sans text-[13px] leading-[1.6] text-fog">
                  {category.description}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenCategory(category)}
                  className="self-start"
                >
                  Request access
                </Button>
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-between border-t border-brand-white/[0.08] pt-6">
          <p className="font-sans text-[13px] text-steel">
            No integrations required. You can come back from Settings later.
          </p>
          <Button
            type="button"
            onClick={continueToNext}
            disabled={isPending}
            className="gap-2"
          >
            <StepFooterNext loading={isPending} label="Continue" />
          </Button>
        </div>
      </div>

      <Dialog open={openCategory !== null} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request access — {openCategory?.title}</DialogTitle>
            <DialogDescription>
              Pick the providers you want Protekon to connect once this ships.
              We&apos;ll email you the minute they&apos;re live.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            {openCategory?.providers.map((p) => {
              const checked = selected.has(p.key)
              return (
                <label
                  key={p.key}
                  htmlFor={`provider-${p.key}`}
                  className="flex items-center gap-3 border border-brand-white/[0.1] px-3 py-2"
                >
                  <Checkbox
                    id={`provider-${p.key}`}
                    checked={checked}
                    onCheckedChange={() => toggleProvider(p.key)}
                  />
                  <Label htmlFor={`provider-${p.key}`} className="cursor-pointer">
                    {p.label}
                  </Label>
                </label>
              )
            })}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpenCategory(null)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={submitIntents} disabled={isPending}>
              Queue requests
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StepShell>
  )
}
