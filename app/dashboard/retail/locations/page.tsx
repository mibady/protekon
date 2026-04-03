"use client"

import { VerticalPage, type VerticalPageConfig } from "@/components/dashboard/VerticalPage"
import { Storefront } from "@phosphor-icons/react"
import { getLocations, addLocation } from "@/lib/actions/retail"

const config: VerticalPageConfig = {
  title: "Store Locations",
  description: "Track fire inspection, ADA compliance, and safety scores across all locations",
  addButtonLabel: "Add Location",
  emptyStateMessage: "No locations tracked yet. Add your first store to start monitoring compliance.",
  icon: Storefront,
  fetchAction: getLocations,
  createAction: addLocation,
  formFields: [
    { name: "store_name", label: "Store Name", type: "text", required: true, placeholder: "e.g. Downtown Flagship" },
    { name: "address", label: "Address", type: "text", placeholder: "Street address" },
    { name: "city", label: "City", type: "text", placeholder: "City" },
    { name: "location_type", label: "Location Type", type: "select", options: [
      { value: "retail", label: "Retail" },
      { value: "warehouse", label: "Warehouse" },
      { value: "outlet", label: "Outlet" },
      { value: "mixed", label: "Mixed Use" },
    ]},
    { name: "fire_inspection_status", label: "Fire Inspection", type: "select", options: [
      { value: "current", label: "Current" },
      { value: "due", label: "Due" },
      { value: "overdue", label: "Overdue" },
    ]},
    { name: "ada_status", label: "ADA Status", type: "select", options: [
      { value: "compliant", label: "Compliant" },
      { value: "non-compliant", label: "Non-Compliant" },
      { value: "in-progress", label: "In Progress" },
    ]},
    { name: "compliance_score", label: "Compliance Score", type: "number" },
  ],
  columns: [
    { key: "store_name", label: "Store" },
    { key: "city", label: "City" },
    { key: "location_type", label: "Type" },
    { key: "fire_inspection_status", label: "Fire Inspection", render: "status" },
    { key: "ada_status", label: "ADA Status", render: "status" },
    { key: "compliance_score", label: "Score" },
  ],
  statusStyles: {
    current: "bg-green-100 text-green-800",
    compliant: "bg-green-100 text-green-800",
    due: "bg-yellow-100 text-yellow-800",
    "in-progress": "bg-yellow-100 text-yellow-800",
    overdue: "bg-red-100 text-red-800",
    "non-compliant": "bg-red-100 text-red-800",
  },
  statusKey: "fire_inspection_status",
}

export default function RetailLocationsPage(): React.ReactNode {
  return <VerticalPage config={config} />
}
