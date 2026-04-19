import { PageHeader } from "@/components/v2/primitives/PageHeader"
import {
  getYearSummary,
  listVendorPayments,
} from "@/lib/actions/nec-1099"
import { getSubcontractors } from "@/lib/actions/construction"
import { Nec1099PageClient } from "@/components/v2/subs/Nec1099PageClient"

/**
 * 1099-NEC dashboard surface.
 *
 * Default year = current year. Renders the threshold-flagged subs summary,
 * recent payments, and "Add payment" / "Import CSV" / "Export packet"
 * actions. Year changes are client-side (page revalidates via
 * `router.refresh()` after year-param change + server action).
 *
 * NOTE: we fetch the default-year data server-side for a fast first paint;
 * year switching is handled client-side via a transition that calls the
 * server actions on demand.
 */
export const dynamic = "force-dynamic"

type PageProps = {
  searchParams?: Promise<{ year?: string }>
}

type SubRow = { id: string; company_name: string | null }

export default async function Form1099Page({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {}
  const now = new Date()
  const requestedYear = sp.year ? Number(sp.year) : now.getFullYear()
  const taxYear =
    Number.isInteger(requestedYear) &&
    requestedYear >= 2000 &&
    requestedYear <= 2100
      ? requestedYear
      : now.getFullYear()

  const [summary, payments, subsRaw] = await Promise.all([
    getYearSummary(taxYear),
    listVendorPayments(taxYear),
    getSubcontractors(),
  ])

  const subs: SubRow[] = (subsRaw as Array<Record<string, unknown>>).map(
    (r) => ({
      id: String(r.id ?? ""),
      company_name: (r.company_name as string | null) ?? null,
    })
  )

  return (
    <>
      <PageHeader
        eyebrow="MY SUBS · 1099-NEC"
        title="Every sub over six hundred dollars — surfaced before January."
        subtitle="Log payments year-round, import a vendor ledger, and export a clean packet when it's time to file."
      />
      <Nec1099PageClient
        taxYear={taxYear}
        summary={summary}
        payments={payments}
        subs={subs}
      />
    </>
  )
}
