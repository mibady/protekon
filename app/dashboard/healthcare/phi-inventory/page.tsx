"use client"

import { VerticalPage, type VerticalPageConfig } from "@/components/dashboard/VerticalPage"
import { Database } from "@phosphor-icons/react"
import { getPhiAssets, addPhiAsset } from "@/lib/actions/healthcare"

const config: VerticalPageConfig = {
  title: "PHI Inventory",
  description: "Track systems containing protected health information",
  addButtonLabel: "Add System",
  emptyStateMessage: "No PHI systems inventoried yet. Add your first system to start tracking.",
  icon: Database,
  fetchAction: getPhiAssets,
  createAction: addPhiAsset,
  formFields: [
    { name: "system_name", label: "System Name", type: "text", placeholder: "System name", required: true },
    { name: "system_type", label: "System Type", type: "select", options: [
      { value: "EHR", label: "EHR" },
      { value: "Lab", label: "Lab" },
      { value: "Imaging", label: "Imaging" },
      { value: "Billing", label: "Billing" },
      { value: "Other", label: "Other" },
    ]},
    { name: "phi_content_types", label: "PHI Content Types (comma-separated)", type: "text", placeholder: "Names, SSN, Diagnoses" },
    { name: "encrypted_at_rest", label: "Encrypted at Rest", type: "checkbox" },
    { name: "encrypted_in_transit", label: "Encrypted in Transit", type: "checkbox" },
    { name: "risk_level", label: "Risk Level", type: "select", options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
      { value: "critical", label: "Critical" },
    ]},
  ],
  columns: [
    { key: "system_name", label: "System Name" },
    { key: "system_type", label: "Type" },
    { key: "phi_content_types", label: "PHI Types", render: "tags" },
    { key: "encrypted_at_rest", label: "Encrypted Rest", render: "boolean" },
    { key: "encrypted_in_transit", label: "Encrypted Transit", render: "boolean" },
    { key: "risk_level", label: "Risk Level", render: "status" },
    { key: "last_assessed_at", label: "Last Assessed", render: "date" },
  ],
  statusStyles: {
    low: "bg-[#2A7D4F]/10 text-[#2A7D4F]",
    medium: "bg-gold/10 text-gold",
    high: "bg-gold/10 text-gold",
    critical: "bg-crimson/10 text-crimson",
  },
  statusKey: "risk_level",
}

export default function PhiInventoryPage(): React.ReactNode {
  return <VerticalPage config={config} />
}
