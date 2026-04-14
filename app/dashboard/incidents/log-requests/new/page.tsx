"use client"

import { ArrowLeft } from "@phosphor-icons/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { createEmployeeLogRequest } from "@/lib/actions/employee-log-requests"

export default function NewEmployeeLogRequestPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createEmployeeLogRequest(fd)
      if ("error" in result) {
        setError(result.error)
      } else {
        router.push("/dashboard/incidents/log-requests")
      }
    })
  }

  return (
    <div className="p-6 lg:p-8 max-w-[640px]">
      <Link href="/dashboard/incidents/log-requests" className="inline-flex items-center gap-2 font-display font-medium text-[11px] tracking-[2px] uppercase text-steel hover:text-midnight mb-6">
        <ArrowLeft size={14} /> Back to log requests
      </Link>

      <h1 className="font-display font-bold text-[28px] text-midnight mb-2">Log a new SB 553 request</h1>
      <p className="font-sans text-[14px] text-steel mb-8">
        Record a request for the workplace-violence incident log. PROTEKON starts the 15-day SLA timer
        and alerts you 48 hours before the deadline if the packet hasn&rsquo;t been released.
      </p>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="block font-display font-medium text-[11px] tracking-[2px] uppercase text-steel mb-2">
            Requester name
          </label>
          <input
            name="requester_name"
            required
            className="w-full bg-brand-white border border-midnight/[0.12] px-4 py-3 font-sans text-[14px] text-midnight focus:border-midnight focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-display font-medium text-[11px] tracking-[2px] uppercase text-steel mb-2">
            Requester email
          </label>
          <input
            name="requester_email"
            type="email"
            required
            className="w-full bg-brand-white border border-midnight/[0.12] px-4 py-3 font-sans text-[14px] text-midnight focus:border-midnight focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-display font-medium text-[11px] tracking-[2px] uppercase text-steel mb-2">
            Requester role
          </label>
          <select
            name="requester_role"
            defaultValue="employee"
            className="w-full bg-brand-white border border-midnight/[0.12] px-4 py-3 font-sans text-[14px] text-midnight focus:border-midnight focus:outline-none"
          >
            <option value="employee">Employee</option>
            <option value="former_employee">Former employee</option>
            <option value="representative">Designated representative</option>
            <option value="agency">Agency / regulator</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-display font-medium text-[11px] tracking-[2px] uppercase text-steel mb-2">
              Period start
            </label>
            <input
              name="period_start"
              type="date"
              required
              className="w-full bg-brand-white border border-midnight/[0.12] px-4 py-3 font-sans text-[14px] text-midnight focus:border-midnight focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-display font-medium text-[11px] tracking-[2px] uppercase text-steel mb-2">
              Period end
            </label>
            <input
              name="period_end"
              type="date"
              required
              className="w-full bg-brand-white border border-midnight/[0.12] px-4 py-3 font-sans text-[14px] text-midnight focus:border-midnight focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block font-display font-medium text-[11px] tracking-[2px] uppercase text-steel mb-2">
            Reason (optional)
          </label>
          <textarea
            name="reason"
            rows={3}
            placeholder="Context from the requester, if provided."
            className="w-full bg-brand-white border border-midnight/[0.12] px-4 py-3 font-sans text-[14px] text-midnight focus:border-midnight focus:outline-none resize-none"
          />
        </div>

        {error && (
          <div className="px-4 py-3 bg-crimson/10 border border-crimson/20 text-crimson font-sans text-[13px]">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-6 py-3 hover:brightness-110 disabled:opacity-50"
        >
          {isPending ? "Logging…" : "Start 15-day SLA"}
        </button>
      </form>
    </div>
  )
}
