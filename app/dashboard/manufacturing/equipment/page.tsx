"use client"

import { VerticalPage, type VerticalPageConfig } from "@/components/dashboard/VerticalPage"
import { Wrench } from "@phosphor-icons/react"
import { getEquipment, addEquipment, deleteEquipment } from "@/lib/actions/manufacturing"

const config: VerticalPageConfig = {
  title: "Equipment & LOTO Tracker",
  description: "Track machinery, lockout/tagout status, and inspection schedules",
  addButtonLabel: "Add Equipment",
  emptyStateMessage: "No equipment tracked yet. Add your first machine to start monitoring LOTO compliance.",
  icon: Wrench,
  fetchAction: getEquipment,
  createAction: addEquipment,
  deleteAction: deleteEquipment,
  formFields: [
    { name: "equipment_name", label: "Equipment Name", type: "text", required: true, placeholder: "e.g. CNC Mill #3" },
    { name: "equipment_type", label: "Type", type: "select", options: [
      { value: "machinery", label: "Machinery" },
      { value: "electrical", label: "Electrical" },
      { value: "hydraulic", label: "Hydraulic" },
      { value: "pneumatic", label: "Pneumatic" },
      { value: "other", label: "Other" },
    ]},
    { name: "serial_number", label: "Serial Number", type: "text", placeholder: "Optional" },
    { name: "loto_status", label: "LOTO Status", type: "select", options: [
      { value: "current", label: "Current" },
      { value: "due", label: "Due for Review" },
      { value: "overdue", label: "Overdue" },
    ]},
    { name: "risk_level", label: "Risk Level", type: "select", options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
    ]},
    { name: "last_inspection", label: "Last Inspection", type: "date" },
    { name: "next_inspection", label: "Next Inspection", type: "date" },
    { name: "notes", label: "Notes", type: "text", placeholder: "Optional notes" },
  ],
  columns: [
    { key: "equipment_name", label: "Equipment" },
    { key: "equipment_type", label: "Type" },
    { key: "serial_number", label: "Serial #" },
    { key: "loto_status", label: "LOTO Status", render: "status" },
    { key: "risk_level", label: "Risk", render: "status" },
    { key: "next_inspection", label: "Next Inspection", render: "date" },
  ],
  statusStyles: {
    current: "bg-green-100 text-green-800",
    due: "bg-yellow-100 text-yellow-800",
    overdue: "bg-red-100 text-red-800",
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  },
  statusKey: "loto_status",
}

export default function ManufacturingEquipmentPage(): React.ReactNode {
  return <VerticalPage config={config} />
}
