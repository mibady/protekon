export type Events = {
  "auth/user.signed-up": {
    data: {
      userId: string
      email: string
    }
  }
  "compliance/intake.submitted": {
    data: {
      email: string
      businessName: string
      vertical: string
      answers: Record<string, boolean>
    }
  }
  "compliance/document.requested": {
    data: {
      clientId: string
      email: string
      businessName: string
      documentType: string
      vertical: string
    }
  }
  "compliance/incident.reported": {
    data: {
      clientId: string
      businessName: string
      incidentData: {
        description: string
        location: string
        date: string
        severity: string
      }
    }
  }
  "billing/payment.failed": {
    data: {
      clientId: string
      email: string
      businessName: string
      amount: number
      invoiceId: string
    }
  }
  "billing/payment.succeeded": {
    data: {
      clientId: string
      invoiceId: string
    }
  }
  "score/lead.created": {
    data: {
      lead_id: string
      email: string
      name: string
      score: number
      score_tier: string
      gaps: Array<{ key: string; label: string; description: string }>
      industry: string
      fine_low: number
      fine_high: number
      partner_ref?: string
    }
  }
  "onboarding/business.snapshot.submitted": {
    data: {
      clientId: string
      vertical: string
      operatingStates: string[]
    }
  }
  "onboarding/people.imported": {
    data: {
      clientId: string
      invitedUserIds: string[]
      importedWorkerIds: string[]
    }
  }
  "onboarding/automations.configured": {
    data: {
      clientId: string
      automations: Record<string, boolean>
    }
  }
}
