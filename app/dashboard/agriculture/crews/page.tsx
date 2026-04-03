"use client"

import { VerticalPage, type VerticalPageConfig } from "@/components/dashboard/VerticalPage"
import { Plant } from "@phosphor-icons/react"
import { getCrews, addCrew } from "@/lib/actions/agriculture"

const config: VerticalPageConfig = {
  title: "Field Crews",
  description: "Manage crew safety, heat illness prevention, and field compliance",
  addButtonLabel: "Add Crew",
  emptyStateMessage: "No crews tracked yet. Add your first crew to monitor heat illness prevention compliance.",
  icon: Plant,
  fetchAction: getCrews,
  createAction: addCrew,
  formFields: [
    { name: "crew_name", label: "Crew Name", type: "text", required: true, placeholder: "e.g. North Field Team" },
    { name: "field_location", label: "Field Location", type: "text", placeholder: "e.g. Salinas Valley Plot 12" },
    { name: "crew_size", label: "Crew Size", type: "number" },
    { name: "heat_plan_status", label: "Heat Plan Status", type: "select", options: [
      { value: "active", label: "Active" },
      { value: "expired", label: "Expired" },
      { value: "pending", label: "Pending" },
    ]},
    { name: "water_station", label: "Water Station Available", type: "checkbox" },
    { name: "shade_available", label: "Shade Available", type: "checkbox" },
    { name: "last_safety_check", label: "Last Safety Check", type: "date" },
  ],
  columns: [
    { key: "crew_name", label: "Crew" },
    { key: "field_location", label: "Location" },
    { key: "crew_size", label: "Size" },
    { key: "heat_plan_status", label: "Heat Plan", render: "status" },
    { key: "water_station", label: "Water", render: "boolean" },
    { key: "shade_available", label: "Shade", render: "boolean" },
    { key: "last_safety_check", label: "Last Check", render: "date" },
  ],
  statusStyles: {
    active: "bg-green-100 text-green-800",
    expired: "bg-red-100 text-red-800",
    pending: "bg-yellow-100 text-yellow-800",
  },
  statusKey: "heat_plan_status",
}

export default function AgricultureCrewsPage(): React.ReactNode {
  return <VerticalPage config={config} />
}
