"use client"

import { VerticalPage, type VerticalPageConfig } from "@/components/dashboard/VerticalPage"
import { Buildings } from "@phosphor-icons/react"
import { getProperties, addProperty } from "@/lib/actions/real-estate"

const config: VerticalPageConfig = {
  title: "Properties",
  description: "Track properties in your portfolio and their compliance status",
  addButtonLabel: "Add Property",
  emptyStateMessage: "No properties in your portfolio yet. Add your first property to start tracking compliance.",
  icon: Buildings,
  fetchAction: getProperties,
  createAction: addProperty,
  formFields: [
    { name: "property_name", label: "Property Name", type: "text", placeholder: "Property name", required: true },
    { name: "address", label: "Address", type: "text", placeholder: "Street address" },
    { name: "city", label: "City", type: "text", placeholder: "City" },
    { name: "state", label: "State", type: "text", placeholder: "State" },
    { name: "units", label: "Units", type: "number" },
    { name: "property_type", label: "Property Type", type: "select", options: [
      { value: "residential", label: "Residential" },
      { value: "commercial", label: "Commercial" },
      { value: "mixed", label: "Mixed" },
      { value: "industrial", label: "Industrial" },
    ]},
    { name: "compliance_status", label: "Compliance Status", type: "select", options: [
      { value: "compliant", label: "Compliant" },
      { value: "at-risk", label: "At Risk" },
      { value: "non-compliant", label: "Non-Compliant" },
    ]},
  ],
  columns: [
    { key: "property_name", label: "Property Name" },
    { key: "address", label: "Address" },
    { key: "city", label: "City" },
    { key: "units", label: "Units" },
    { key: "property_type", label: "Type" },
    { key: "compliance_status", label: "Compliance Status", render: "status" },
  ],
  statusStyles: {
    compliant: "bg-[#2A7D4F]/10 text-[#2A7D4F]",
    "at-risk": "bg-gold/10 text-gold",
    "non-compliant": "bg-crimson/10 text-crimson",
  },
  statusKey: "compliance_status",
}

export default function PropertiesPage(): React.ReactNode {
  return <VerticalPage config={config} />
}
