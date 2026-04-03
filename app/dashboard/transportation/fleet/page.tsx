"use client"

import { VerticalPage, type VerticalPageConfig } from "@/components/dashboard/VerticalPage"
import { Truck } from "@phosphor-icons/react"
import { getFleet, addVehicle, deleteVehicle } from "@/lib/actions/transportation"

const config: VerticalPageConfig = {
  title: "Fleet & Drivers",
  description: "Track vehicles, CDL certifications, and DOT inspection compliance",
  addButtonLabel: "Add Vehicle",
  emptyStateMessage: "No vehicles tracked yet. Add your first vehicle to start monitoring fleet compliance.",
  icon: Truck,
  fetchAction: getFleet,
  createAction: addVehicle,
  deleteAction: deleteVehicle,
  formFields: [
    { name: "vehicle_id", label: "Vehicle ID", type: "text", required: true, placeholder: "e.g. TRK-001" },
    { name: "vehicle_type", label: "Vehicle Type", type: "select", options: [
      { value: "truck", label: "Truck" },
      { value: "van", label: "Van" },
      { value: "trailer", label: "Trailer" },
      { value: "bus", label: "Bus" },
    ]},
    { name: "driver_name", label: "Driver Name", type: "text", placeholder: "Assigned driver" },
    { name: "cdl_status", label: "CDL Status", type: "select", options: [
      { value: "active", label: "Active" },
      { value: "expired", label: "Expired" },
      { value: "suspended", label: "Suspended" },
    ]},
    { name: "cdl_expiry", label: "CDL Expiry", type: "date" },
    { name: "last_dot_inspection", label: "Last DOT Inspection", type: "date" },
    { name: "next_inspection", label: "Next Inspection", type: "date" },
  ],
  columns: [
    { key: "vehicle_id", label: "Vehicle ID" },
    { key: "vehicle_type", label: "Type" },
    { key: "driver_name", label: "Driver" },
    { key: "cdl_status", label: "CDL Status", render: "status" },
    { key: "cdl_expiry", label: "CDL Expiry", render: "date" },
    { key: "next_inspection", label: "Next Inspection", render: "date" },
    { key: "status", label: "Status", render: "status" },
  ],
  statusStyles: {
    active: "bg-green-100 text-green-800",
    expired: "bg-red-100 text-red-800",
    suspended: "bg-red-100 text-red-800",
  },
  statusKey: "cdl_status",
}

export default function TransportationFleetPage(): React.ReactNode {
  return <VerticalPage config={config} />
}
