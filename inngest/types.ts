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
}
