export type ProviderStatus = "wired" | "coming_soon"
export type ProviderCategory =
  | "Accounting"
  | "Payroll"
  | "Signatures"
  | "Documents"
  | "Notifications"
  | "Regulatory"
  | "Field"

export type ProviderConfig = {
  id: string
  name: string
  category: ProviderCategory
  status: ProviderStatus
  note: string
  authorizeUrl?: string // undefined for coming_soon
  tokenUrl?: string
  scopes?: string[]
  clientIdEnv?: string
  clientSecretEnv?: string
  extraAuthorizeParams?: Record<string, string>
}

export const PROVIDERS: Record<string, ProviderConfig> = {
  slack: {
    id: "slack",
    name: "Slack",
    category: "Notifications",
    status: "wired",
    note: "Push alerts to your team channels",
    authorizeUrl: "https://slack.com/oauth/v2/authorize",
    tokenUrl: "https://slack.com/api/oauth.v2.access",
    scopes: ["chat:write", "incoming-webhook"],
    clientIdEnv: "SLACK_CLIENT_ID",
    clientSecretEnv: "SLACK_CLIENT_SECRET",
  },
  docusign: {
    id: "docusign",
    name: "DocuSign",
    category: "Signatures",
    status: "wired",
    note: "Policy acknowledgments - auditable signature",
    authorizeUrl: "https://account.docusign.com/oauth/auth",
    tokenUrl: "https://account.docusign.com/oauth/token",
    scopes: ["signature"],
    clientIdEnv: "DOCUSIGN_INTEGRATION_KEY",
    clientSecretEnv: "DOCUSIGN_SECRET_KEY",
  },
  quickbooks: {
    id: "quickbooks",
    name: "QuickBooks",
    category: "Accounting",
    status: "coming_soon",
    note: "Sub payment data - W-9 sync",
  },
  gusto: {
    id: "gusto",
    name: "Gusto",
    category: "Payroll",
    status: "coming_soon",
    note: "Worker roster - training assignments",
  },
  dropbox: {
    id: "dropbox",
    name: "Dropbox",
    category: "Documents",
    status: "coming_soon",
    note: "Document intake from shared folder",
  },
  google_drive: {
    id: "google_drive",
    name: "Google Drive",
    category: "Documents",
    status: "coming_soon",
    note: "Document intake from shared Drive",
  },
  xero: {
    id: "xero",
    name: "Xero",
    category: "Accounting",
    status: "coming_soon",
    note: "Alternative to QuickBooks",
  },
  rippling: {
    id: "rippling",
    name: "Rippling",
    category: "Payroll",
    status: "coming_soon",
    note: "Alternative to Gusto",
  },
  adp: {
    id: "adp",
    name: "ADP",
    category: "Payroll",
    status: "coming_soon",
    note: "Enterprise payroll",
  },
  cal_osha: {
    id: "cal_osha",
    name: "Cal/OSHA public records",
    category: "Regulatory",
    status: "coming_soon",
    note: "Inspection & citation history imports",
  },
  fed_osha: {
    id: "fed_osha",
    name: "Fed OSHA enforcement feed",
    category: "Regulatory",
    status: "coming_soon",
    note: "Rulemaking alerts - citation feed",
  },
}

export function getProvider(id: string): ProviderConfig | null {
  return PROVIDERS[id] ?? null
}

export function listProviders(): ProviderConfig[] {
  return Object.values(PROVIDERS)
}
