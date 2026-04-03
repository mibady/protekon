"use client"

import { VerticalPage, type VerticalPageConfig } from "@/components/dashboard/VerticalPage"
import { Warehouse } from "@phosphor-icons/react"
import { getZones, addZone } from "@/lib/actions/wholesale"

const config: VerticalPageConfig = {
  title: "Safety Zones",
  description: "Monitor warehouse zones, forklift operations, and hazmat compliance",
  addButtonLabel: "Add Zone",
  emptyStateMessage: "No zones tracked yet. Add your first zone to start monitoring warehouse safety.",
  icon: Warehouse,
  fetchAction: getZones,
  createAction: addZone,
  formFields: [
    { name: "zone_name", label: "Zone Name", type: "text", required: true, placeholder: "e.g. Cold Storage A" },
    { name: "zone_type", label: "Zone Type", type: "select", options: [
      { value: "warehouse", label: "Warehouse" },
      { value: "loading-dock", label: "Loading Dock" },
      { value: "cold-storage", label: "Cold Storage" },
      { value: "hazmat", label: "Hazmat" },
    ]},
    { name: "forklift_certified_operators", label: "Certified Forklift Operators", type: "number" },
    { name: "hazmat_present", label: "Hazmat Present", type: "checkbox" },
    { name: "last_safety_audit", label: "Last Safety Audit", type: "date" },
    { name: "status", label: "Status", type: "select", options: [
      { value: "compliant", label: "Compliant" },
      { value: "non-compliant", label: "Non-Compliant" },
      { value: "needs-review", label: "Needs Review" },
    ]},
  ],
  columns: [
    { key: "zone_name", label: "Zone" },
    { key: "zone_type", label: "Type" },
    { key: "forklift_certified_operators", label: "Forklift Ops" },
    { key: "hazmat_present", label: "Hazmat", render: "boolean" },
    { key: "last_safety_audit", label: "Last Audit", render: "date" },
    { key: "status", label: "Status", render: "status" },
  ],
  statusStyles: {
    compliant: "bg-green-100 text-green-800",
    "non-compliant": "bg-red-100 text-red-800",
    "needs-review": "bg-yellow-100 text-yellow-800",
  },
}

export default function WholesaleZonesPage(): React.ReactNode {
  return <VerticalPage config={config} />
}
