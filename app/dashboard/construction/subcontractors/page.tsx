"use client"

import { VerticalPage, type VerticalPageConfig } from "@/components/dashboard/VerticalPage"
import CoiUploadDialog from "@/components/dashboard/CoiUploadDialog"
import { HardHat } from "@phosphor-icons/react"
import { getSubcontractors, addSubcontractor, verifySubcontractor, deleteSubcontractor } from "@/lib/actions/construction"

const config: VerticalPageConfig = {
  title: "Subcontractors",
  description: "Track subcontractor licenses, insurance, and verification status",
  addButtonLabel: "Add Subcontractor",
  emptyStateMessage: "No subcontractors tracked yet. Add your first subcontractor to start tracking compliance.",
  icon: HardHat,
  fetchAction: getSubcontractors,
  createAction: addSubcontractor,
  deleteAction: deleteSubcontractor,
  verifyAction: verifySubcontractor,
  rowActions: (row, refresh) => (
    <CoiUploadDialog
      subId={String(row.id ?? "")}
      subName={String(row.company_name ?? "Subcontractor")}
      onUploaded={refresh}
    />
  ),
  formFields: [
    { name: "company_name", label: "Company Name", type: "text", placeholder: "Company name", required: true },
    { name: "license_number", label: "License Number", type: "text", placeholder: "License #" },
    { name: "license_status", label: "License Status", type: "select", options: [
      { value: "valid", label: "Valid" },
      { value: "expiring", label: "Expiring" },
      { value: "expired", label: "Expired" },
      { value: "invalid", label: "Invalid" },
    ]},
    { name: "license_expiry", label: "License Expiry", type: "date", required: true },
    { name: "insurance_status", label: "Insurance Status", type: "select", options: [
      { value: "valid", label: "Valid" },
      { value: "expiring", label: "Expiring" },
      { value: "expired", label: "Expired" },
      { value: "invalid", label: "Invalid" },
    ]},
    { name: "insurance_expiry", label: "Insurance Expiry", type: "date", required: true },
  ],
  columns: [
    { key: "company_name", label: "Company" },
    { key: "license_number", label: "License #" },
    { key: "license_status", label: "License Status", render: "status" },
    { key: "license_expiry", label: "License Expiry", render: "date" },
    { key: "insurance_status", label: "Insurance Status", render: "status" },
    { key: "insurance_expiry", label: "Insurance Expiry", render: "date" },
    { key: "verified_at", label: "Verified", render: "boolean" },
  ],
  statusStyles: {
    valid: "bg-[#2A7D4F]/10 text-[#2A7D4F]",
    expiring: "bg-gold/10 text-gold",
    expired: "bg-crimson/10 text-crimson",
    invalid: "bg-crimson/10 text-crimson",
  },
}

export default function SubcontractorsPage(): React.ReactNode {
  return <VerticalPage config={config} />
}
