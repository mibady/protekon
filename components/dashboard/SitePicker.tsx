"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Buildings, CaretDown } from "@phosphor-icons/react"
import { listSites, selectSite, type Site } from "@/lib/actions/sites"

type Props = {
  plan: string | null | undefined
}

function readSiteCookie(): string {
  if (typeof document === "undefined") return "all"
  const match = document.cookie.match(/(?:^|;\s*)protekon_site_id=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : "all"
}

export default function SitePicker({ plan }: Props) {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string>("all")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  useEffect(() => {
    setSelectedId(readSiteCookie())
  }, [])

  useEffect(() => {
    if (plan !== "multi-site") {
      setLoading(false)
      return
    }
    listSites().then((rows) => {
      setSites(rows)
      setLoading(false)
    })
  }, [plan])

  if (plan !== "multi-site") return null
  if (loading) return null
  if (sites.length <= 1) return null

  const selected = selectedId === "all"
    ? { name: "All sites", is_primary: false }
    : sites.find((s) => s.id === selectedId) ?? { name: "All sites", is_primary: false }

  const choose = (id: string) => {
    setSelectedId(id)
    setOpen(false)
    startTransition(async () => {
      await selectSite(id)
      router.refresh()
    })
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        className="flex items-center gap-2 px-3 py-2 border border-midnight/20 bg-brand-white hover:border-gold transition-colors font-display text-[11px] tracking-[1px] uppercase text-midnight disabled:opacity-50"
      >
        <Buildings size={14} weight="bold" />
        <span className="max-w-[140px] truncate">{selected.name}</span>
        <CaretDown size={12} weight="bold" className={open ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-[220px] bg-brand-white border border-midnight/20 shadow-lg z-50">
          <button
            type="button"
            onClick={() => choose("all")}
            className={`w-full text-left px-3 py-2 text-[13px] font-sans hover:bg-midnight/5 ${selectedId === "all" ? "bg-gold/10 text-midnight font-semibold" : "text-midnight"}`}
          >
            All sites
          </button>
          <div className="h-px bg-midnight/[0.08]" />
          {sites.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => choose(s.id)}
              className={`w-full text-left px-3 py-2 text-[13px] font-sans hover:bg-midnight/5 flex items-center justify-between ${selectedId === s.id ? "bg-gold/10 text-midnight font-semibold" : "text-midnight"}`}
            >
              <span className="truncate">{s.name}</span>
              {s.is_primary && (
                <span className="font-display text-[9px] tracking-[1px] uppercase text-gold ml-2">Primary</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
