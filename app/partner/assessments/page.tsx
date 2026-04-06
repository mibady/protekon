"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { PaperPlaneTilt } from "@phosphor-icons/react"
import { getPartnerAssessments } from "@/lib/actions/partner-portal"
import AssessmentTable from "@/components/partner/AssessmentTable"
import SendAssessmentDialog from "@/components/partner/SendAssessmentDialog"
import type { PartnerAssessment } from "@/lib/types/partner"

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<PartnerAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const loadAssessments = useCallback(() => {
    setLoading(true)
    getPartnerAssessments().then((data) => {
      setAssessments(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    loadAssessments()
  }, [loadAssessments])

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="font-display font-bold text-[22px] tracking-[3px] uppercase text-midnight">
            Assessments
          </h1>
          <p className="font-sans text-[13px] text-steel mt-1">
            Send compliance assessments to prospects and track results.
          </p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 bg-crimson text-brand-white px-5 py-2.5 font-display font-semibold text-[12px] tracking-[2px] uppercase hover:bg-crimson/90 transition-colors"
        >
          <PaperPlaneTilt size={14} weight="bold" />
          Send Assessment
        </button>
      </motion.div>

      {/* Assessment Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <AssessmentTable assessments={assessments} loading={loading} />
      </motion.div>

      {/* Send Assessment Dialog */}
      <SendAssessmentDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={loadAssessments}
      />
    </div>
  )
}
