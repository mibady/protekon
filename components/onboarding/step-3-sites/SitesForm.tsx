"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Lock, MapPin, Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { StepShell, StepFooterNext } from "@/components/onboarding/StepShell"
import { upsertSites } from "@/lib/actions/onboarding/sites"
import { advanceStep } from "@/lib/actions/onboarding/state"
import type { SiteUpsertInput } from "@/lib/types/onboarding"

type SiteRow = SiteUpsertInput & { localId: string }

type Props = {
  initialSites: SiteRow[]
  operatingStates: string[]
  plan: string
  stepIntro: string
  addButtonLabel: string
  totalSteps: number
}

function makeLocalId(): string {
  return `new-${Math.random().toString(36).slice(2, 10)}`
}

function emptyRow(isPrimary: boolean): SiteRow {
  return {
    localId: makeLocalId(),
    name: "",
    address: null,
    city: null,
    state: null,
    zip: null,
    employeeCount: null,
    isPrimary,
  }
}

function formatAddress(site: SiteRow): string {
  const parts = [site.address, site.city, site.state, site.zip].filter(Boolean)
  return parts.length > 0 ? parts.join(", ") : "Address not added yet"
}

export function SitesForm({
  initialSites,
  operatingStates,
  plan,
  stepIntro,
  addButtonLabel,
  totalSteps,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [rows, setRows] = useState<SiteRow[]>(
    initialSites.length > 0 ? initialSites : [emptyRow(true)],
  )
  const [sheetOpen, setSheetOpen] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [draft, setDraft] = useState<SiteRow>(emptyRow(false))
  const [search, setSearch] = useState("")
  const [addressSelected, setAddressSelected] = useState(false)
  const [isUpgrading, setIsUpgrading] = useState(false)

  const primarySite = rows.find((row) => row.isPrimary) ?? rows[0]
  const canAddLocations = plan === "multi-site"
  const stateOptions = operatingStates.length > 0 ? operatingStates : ["CA"]

  const updatePrimary = <K extends keyof SiteUpsertInput>(
    field: K,
    value: SiteUpsertInput[K],
  ) => {
    setRows((prev) =>
      prev.map((row, index) =>
        row.localId === primarySite.localId || index === 0 ? { ...row, [field]: value } : row,
      ),
    )
  }

  const updateDraft = <K extends keyof SiteUpsertInput>(field: K, value: SiteUpsertInput[K]) => {
    setDraft((prev) => ({ ...prev, [field]: value }))
  }

  const openAddLocation = () => {
    if (!canAddLocations) {
      setUpgradeOpen(true)
      return
    }
    setDraft(emptyRow(false))
    setSearch("")
    setAddressSelected(false)
    setSheetOpen(true)
  }

  const selectTypedAddress = () => {
    const trimmed = search.trim()
    if (!trimmed) return
    setDraft((prev) => ({
      ...prev,
      name: prev.name || `Location ${rows.length + 1}`,
      address: trimmed,
    }))
    setAddressSelected(true)
  }

  const addDraft = () => {
    const name = draft.name.trim()
    if (!name) {
      toast.error("Add a location name.")
      return
    }
    setRows((prev) => [...prev, { ...draft, name, isPrimary: false }])
    setSheetOpen(false)
  }

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: "multi-site" }),
      })
      const body = (await response.json().catch(() => ({}))) as { url?: string; error?: string }
      if (!response.ok || !body.url) {
        toast.error(body.error ?? "Couldn't start checkout.")
        return
      }
      window.location.href = body.url
    } finally {
      setIsUpgrading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!primarySite?.name.trim()) {
      toast.error("Name your primary location.")
      return
    }

    const payload: SiteUpsertInput[] = rows.map((row, index) => ({
      id: row.id,
      name: row.name.trim(),
      address: row.address?.trim() ? row.address.trim() : null,
      city: row.city?.trim() ? row.city.trim() : null,
      state: row.state,
      zip: row.zip?.trim() ? row.zip.trim() : null,
      employeeCount: row.employeeCount,
      isPrimary: index === 0 || row.isPrimary,
    }))

    startTransition(async () => {
      const result = await upsertSites({ sites: payload })
      if (!result.ok) {
        toast.error(
          result.error === "multi_site_required"
            ? "Upgrade to Multi-Site before adding more locations."
            : "Couldn't save sites. Please try again.",
        )
        return
      }
      const advance = await advanceStep(3)
      if (!advance.ok) {
        toast.error("Sites saved, but couldn't advance the wizard.")
        return
      }
      toast.success("Locations saved.")
      router.push("/onboarding/people")
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <StepShell
        stepNumber={2}
        totalSteps={totalSteps}
        title="Confirm your locations"
        intro={stepIntro}
        backHref="/onboarding/business"
      >
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-4">
            <div className="border border-brand-white/[0.1] bg-midnight/50 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-gold/30 bg-gold/10 text-gold">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-[11px] tracking-[2px] text-steel uppercase">
                      Primary Location
                    </div>
                    <Input
                      value={primarySite.name}
                      onChange={(e) => updatePrimary("name", e.target.value)}
                      placeholder="Headquarters / Main yard / Clinic North"
                      className="mt-1 border-0 bg-transparent px-0 font-display text-[18px] font-bold text-parchment shadow-none focus-visible:ring-0"
                    />
                    <div className="font-sans text-[12px] leading-[1.6] text-fog">
                      {formatAddress(primarySite)}
                    </div>
                  </div>
                </div>
                <div className="w-full max-w-40">
                  <Label className="font-display text-[10px] tracking-[2px] text-steel uppercase">
                    Workers
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={primarySite.employeeCount ?? ""}
                    onChange={(e) =>
                      updatePrimary(
                        "employeeCount",
                        e.target.value === "" ? null : Number(e.target.value),
                      )
                    }
                    className="mt-2 bg-void"
                  />
                </div>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
                <Input
                  value={primarySite.address ?? ""}
                  onChange={(e) => updatePrimary("address", e.target.value || null)}
                  placeholder="Address"
                  className="bg-void md:col-span-2"
                />
                <Input
                  value={primarySite.city ?? ""}
                  onChange={(e) => updatePrimary("city", e.target.value || null)}
                  placeholder="City"
                  className="bg-void"
                />
                <div className="grid grid-cols-[80px_1fr] gap-3">
                  <select
                    value={primarySite.state ?? ""}
                    onChange={(e) => updatePrimary("state", e.target.value || null)}
                    className="h-9 rounded-md border border-brand-white/[0.1] bg-void px-3 font-sans text-[13px] text-parchment"
                    aria-label="State"
                  >
                    <option value="">State</option>
                    {stateOptions.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                  <Input
                    value={primarySite.zip ?? ""}
                    onChange={(e) => updatePrimary("zip", e.target.value || null)}
                    placeholder="ZIP"
                    className="bg-void"
                  />
                </div>
              </div>
            </div>

            {rows.slice(1).map((row) => (
              <div
                key={row.localId}
                className="flex items-center justify-between gap-3 border border-brand-white/[0.08] bg-midnight/40 p-4"
              >
                <div>
                  <div className="font-display text-[13px] font-bold tracking-[1px] text-parchment uppercase">
                    {row.name}
                  </div>
                  <div className="font-sans text-[12px] text-fog">{formatAddress(row)}</div>
                </div>
                <div className="font-display text-[11px] tracking-[1px] text-steel">
                  {row.employeeCount ?? 0} workers
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={openAddLocation}
              className="self-start gap-2 border-brand-white/[0.2] bg-transparent hover:border-gold hover:text-gold"
            >
              {canAddLocations ? <Plus className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              {addButtonLabel || "Add Location"}
            </Button>
          </section>

          <div className="flex justify-end">
            <StepFooterNext disabled={isPending || !primarySite.name.trim()} loading={isPending} />
          </div>
        </div>
      </StepShell>

      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent className="border-gold bg-midnight text-parchment">
          <DialogHeader>
            <DialogTitle className="font-display tracking-[1px]">Unlock Multi-Site</DialogTitle>
            <DialogDescription className="font-sans text-[13px] leading-[1.6] text-fog">
              Add every location, separate worker counts by site, and keep compliance coverage
              organized across your full operation.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="bg-gold text-void hover:brightness-110"
            >
              {isUpgrading ? "Opening checkout..." : "Upgrade Subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="border-brand-white/[0.1] bg-midnight text-parchment sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="font-display tracking-[1px] text-parchment">
              Add Location
            </SheetTitle>
            <SheetDescription className="font-sans text-[13px] text-fog">
              Search-style entry now, editable address fields after selection.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-5 px-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    selectTypedAddress()
                  }
                }}
                placeholder="Search address"
                className="h-12 bg-void pl-10 font-sans text-parchment"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={selectTypedAddress}
                disabled={!search.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gold"
              >
                Select
              </Button>
            </div>

            {addressSelected ? (
              <div className="grid grid-cols-1 gap-4">
                <Input
                  value={draft.name}
                  onChange={(e) => updateDraft("name", e.target.value)}
                  placeholder="Location name"
                  className="bg-void"
                />
                <Input
                  value={draft.address ?? ""}
                  onChange={(e) => updateDraft("address", e.target.value || null)}
                  placeholder="Address"
                  className="bg-void"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    value={draft.city ?? ""}
                    onChange={(e) => updateDraft("city", e.target.value || null)}
                    placeholder="City"
                    className="bg-void"
                  />
                  <select
                    value={draft.state ?? ""}
                    onChange={(e) => updateDraft("state", e.target.value || null)}
                    className="h-9 rounded-md border border-brand-white/[0.1] bg-void px-3 font-sans text-[13px] text-parchment"
                    aria-label="State"
                  >
                    <option value="">State</option>
                    {stateOptions.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    value={draft.zip ?? ""}
                    onChange={(e) => updateDraft("zip", e.target.value || null)}
                    placeholder="ZIP"
                    className="bg-void"
                  />
                  <Input
                    type="number"
                    min={0}
                    value={draft.employeeCount ?? ""}
                    onChange={(e) =>
                      updateDraft(
                        "employeeCount",
                        e.target.value === "" ? null : Number(e.target.value),
                      )
                    }
                    placeholder="Workers"
                    className="bg-void"
                  />
                </div>
              </div>
            ) : null}
          </div>
          <SheetFooter>
            <Button
              type="button"
              onClick={addDraft}
              disabled={!addressSelected || !draft.name.trim()}
              className="bg-gold text-void hover:brightness-110"
            >
              Add Location
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </form>
  )
}
