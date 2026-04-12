"use client"

import { Car } from "@phosphor-icons/react"
import { VerticalPage, type VerticalPageConfig } from "@/components/dashboard/VerticalPage"
import { getAutoServiceShops, saveAutoServiceShop } from "@/lib/actions/auto-services"

const config: VerticalPageConfig = {
  title: "Auto Services",
  description: "Cal/OSHA spray booth ventilation (T8 §5153), hazmat handling, ASE certification tracking, and EPA inspection readiness.",
  addButtonLabel: "Add Shop Profile",
  emptyStateMessage: "No auto service shop profile yet. Add your shop details to track compliance.",
  icon: Car,
  fetchAction: getAutoServiceShops,
  createAction: saveAutoServiceShop,
  formFields: [
    {
      name: "shop_type",
      label: "Shop Type",
      type: "select",
      options: [
        { value: "general", label: "General Repair" },
        { value: "body", label: "Body Shop" },
        { value: "transmission", label: "Transmission" },
        { value: "tire", label: "Tire Shop" },
        { value: "oil-change", label: "Oil Change / Quick Lube" },
        { value: "dealership", label: "Dealership Service" },
        { value: "fleet-service", label: "Fleet Service" },
        { value: "other", label: "Other" },
      ],
    },
    { name: "bay_count", label: "Service Bays", type: "number", placeholder: "0" },
    { name: "hazmat_handling", label: "Handles Hazmat", type: "checkbox" },
    { name: "paint_booth", label: "Has Paint/Spray Booth", type: "checkbox" },
    { name: "ase_certifications", label: "ASE Certifications (comma-separated)", type: "text", placeholder: "A1, A2, A5, L1" },
    { name: "waste_disposal_method", label: "Waste Disposal Method", type: "text", placeholder: "Licensed hauler, on-site treatment, etc." },
    { name: "last_epa_inspection", label: "Last EPA Inspection", type: "date" },
  ],
  columns: [
    { key: "shop_type", label: "Type", render: "status" },
    { key: "bay_count", label: "Bays", render: "text" },
    { key: "hazmat_handling", label: "Hazmat", render: "boolean" },
    { key: "paint_booth", label: "Spray Booth", render: "boolean" },
    { key: "ase_certifications", label: "ASE Certs", render: "tags" },
    { key: "last_epa_inspection", label: "Last EPA Inspection", render: "date" },
  ],
  statusKey: "shop_type",
  statusStyles: {
    general: "bg-midnight/10 text-midnight",
    body: "bg-crimson/10 text-crimson",
    transmission: "bg-gold/10 text-gold",
    tire: "bg-steel/10 text-steel",
    "oil-change": "bg-[#16A34A]/10 text-[#16A34A]",
    dealership: "bg-[#6366F1]/10 text-[#6366F1]",
    "fleet-service": "bg-midnight/10 text-midnight",
    other: "bg-steel/10 text-steel",
  },
}

export default function AutoServicesPage() {
  return <VerticalPage config={config} />
}
