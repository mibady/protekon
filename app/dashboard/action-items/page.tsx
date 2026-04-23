import { PageHeader } from "@/components/v2/primitives/PageHeader"
import { listActionItems, createActionItem } from "@/lib/actions/action-items"
import { revalidatePath } from "next/cache"

export const dynamic = "force-dynamic"

export default async function ActionItemsPage() {
  const items = await listActionItems()

  async function requestPropertyReview() {
    "use server"
    const fd = new FormData()
    fd.set("action_type", "property_review")
    fd.set("title", "Property review requested")
    fd.set(
      "description",
      "Requested from Action Items page. Assign to the regional compliance officer."
    )
    await createActionItem(fd)
    revalidatePath("/dashboard/action-items")
  }

  return (
    <div className="px-8 pt-10 pb-16 max-w-6xl w-full mx-auto">
      <PageHeader
        eyebrow="MY BUSINESS · ACTION ITEMS"
        title="Every follow-up, tracked to completion."
        subtitle="Review requests, sign-offs, and outstanding compliance tasks — surfaced here the moment someone creates them."
      />

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display font-bold text-[14px] tracking-[2px] uppercase text-midnight">
          Open items ({items.filter((i) => i.status === "open").length})
        </h2>
        <form action={requestPropertyReview}>
          <button
            type="submit"
            data-testid="request-property-review"
            className="bg-crimson text-brand-white px-6 py-2.5 font-display font-semibold text-[12px] tracking-[2px] uppercase hover:bg-crimson/90 transition-colors"
          >
            Request Property Review
          </button>
        </form>
      </div>

      <div className="mt-6 bg-brand-white border border-midnight/[0.08]">
        {items.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-sans text-[13px] text-steel">
              No action items yet. Use the button above to create one.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-parchment border-b border-midnight/[0.08]">
              <tr>
                <th className="text-left px-4 py-3 font-display font-semibold text-[11px] tracking-[1.5px] uppercase text-steel">
                  Title
                </th>
                <th className="text-left px-4 py-3 font-display font-semibold text-[11px] tracking-[1.5px] uppercase text-steel">
                  Type
                </th>
                <th className="text-left px-4 py-3 font-display font-semibold text-[11px] tracking-[1.5px] uppercase text-steel">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-display font-semibold text-[11px] tracking-[1.5px] uppercase text-steel">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-midnight/[0.04] last:border-b-0"
                >
                  <td className="px-4 py-3 font-sans text-[13px] text-midnight">
                    {item.title}
                  </td>
                  <td className="px-4 py-3 font-sans text-[12px] text-steel">
                    {item.action_type.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 font-sans text-[12px]">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-[11px] uppercase tracking-[1px] font-display font-semibold ${
                        item.status === "completed"
                          ? "bg-forest/10 text-forest"
                          : item.status === "cancelled"
                          ? "bg-steel/10 text-steel"
                          : "bg-crimson/10 text-crimson"
                      }`}
                    >
                      {item.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-sans text-[12px] text-steel">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
