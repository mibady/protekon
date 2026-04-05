"use client"

import { VerticalPage, type VerticalPageConfig } from "@/components/dashboard/VerticalPage"
import { FileText } from "@phosphor-icons/react"
import { getBaaAgreements, addBaaAgreement } from "@/lib/actions/healthcare"

const config: VerticalPageConfig = {
  title: "BAA Tracker",
  description: "Track Business Associate Agreements and their expiration status",
  addButtonLabel: "Add BAA",
  emptyStateMessage: "No BAAs on file yet. Add your first BAA to start tracking.",
  icon: FileText,
  fetchAction: getBaaAgreements,
  createAction: addBaaAgreement,
  formFields: [
    { name: "vendor_name", label: "Vendor Name", type: "text", placeholder: "Vendor name", required: true },
    { name: "service_type", label: "Service Type", type: "text", placeholder: "Service type" },
    { name: "phi_types", label: "PHI Types (comma-separated)", type: "text", placeholder: "Names, Addresses, Medical Records" },
    { name: "baa_status", label: "Status", type: "select", options: [
      { value: "active", label: "Active" },
      { value: "pending", label: "Pending" },
      { value: "expired", label: "Expired" },
    ]},
    { name: "signed_date", label: "Signed Date", type: "date" },
    { name: "expiration_date", label: "Expiration Date", type: "date", required: true },
  ],
  columns: [
    { key: "vendor_name", label: "Vendor" },
    { key: "service_type", label: "Service Type" },
    { key: "phi_types", label: "PHI Types", render: "tags" },
    { key: "baa_status", label: "Status", render: "status" },
    { key: "signed_date", label: "Signed", render: "date" },
    { key: "expiration_date", label: "Expiration", render: "date" },
  ],
  statusStyles: {
    active: "bg-[#2A7D4F]/10 text-[#2A7D4F]",
    pending: "bg-gold/10 text-gold",
    expired: "bg-crimson/10 text-crimson",
  },
  statusKey: "baa_status",
}

export default function BaaTrackerPage(): React.ReactNode {
  return <VerticalPage config={config} />
}
