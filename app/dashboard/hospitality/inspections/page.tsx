"use client"

import { VerticalPage, type VerticalPageConfig } from "@/components/dashboard/VerticalPage"
import { ClipboardText } from "@phosphor-icons/react"
import { getInspections, addInspection } from "@/lib/actions/hospitality"

const config: VerticalPageConfig = {
  title: "Health Inspections",
  description: "Track health, fire, and safety inspections across your properties",
  addButtonLabel: "Add Inspection",
  emptyStateMessage: "No inspections recorded yet. Add your first inspection to start tracking compliance.",
  icon: ClipboardText,
  fetchAction: getInspections,
  createAction: addInspection,
  formFields: [
    { name: "inspection_type", label: "Inspection Type", type: "select", options: [
      { value: "health", label: "Health" },
      { value: "fire", label: "Fire" },
      { value: "safety", label: "Safety" },
    ]},
    { name: "inspector", label: "Inspector", type: "text", placeholder: "Inspector name" },
    { name: "inspection_date", label: "Inspection Date", type: "date", required: true },
    { name: "score", label: "Score", type: "number" },
    { name: "violations", label: "Violations", type: "number" },
    { name: "findings", label: "Findings", type: "text", placeholder: "Summary of findings" },
    { name: "next_inspection", label: "Next Inspection", type: "date" },
    { name: "status", label: "Status", type: "select", options: [
      { value: "passed", label: "Passed" },
      { value: "failed", label: "Failed" },
      { value: "pending", label: "Pending" },
    ]},
  ],
  columns: [
    { key: "inspection_type", label: "Type" },
    { key: "inspector", label: "Inspector" },
    { key: "inspection_date", label: "Date", render: "date" },
    { key: "score", label: "Score" },
    { key: "violations", label: "Violations" },
    { key: "status", label: "Status", render: "status" },
    { key: "next_inspection", label: "Next Inspection", render: "date" },
  ],
  statusStyles: {
    passed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    pending: "bg-yellow-100 text-yellow-800",
  },
}

export default function HospitalityInspectionsPage(): React.ReactNode {
  return <VerticalPage config={config} />
}
