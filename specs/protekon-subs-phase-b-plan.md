# protekon-subs-phase-b Plan — Sub Onboarding + Safety Programs + 1099-NEC

## Objective
Close out the 3 remaining subs surfaces. All three require net-new backend (tables + actions + public sub portal). Scope is intentionally MVP: shipping functional flows with TODOs for the harder integrations (OCR, accounting APIs, e-file) rather than blocking on them.

## Surfaces in scope
| Surface | Remix JSX | Net-new backend |
|---|---|---|
| Sub Onboarding | `phase3b.jsx:20` | `sub_onboarding_tokens` + `sub_onboarding_submissions` tables + public `/sub/[token]` portal + actions |
| Safety Programs | `phase3b.jsx:150` | `sub_safety_programs` table + program_templates static const + reviewer actions |
| 1099-NEC | `phase3b.jsx:246` | `vendor_payments` table + CSV import route + threshold computation |

## Discovery findings (2026-04-19)
- Shipped: `construction_subs` (migration 002 + CSLB columns added in 031) → sub_onboarding creates/updates these rows
- No `safety_programs`, no `vendor_payments`, no `sub_onboarding_*` tables anywhere in migrations 001–048
- `lib/pdf-training.ts` pattern available for signed W-9/MSA PDFs
- @vercel/blob installed (used in W1 + COI upload) — used for doc uploads

## MVP scope boundaries
- **OCR on W-9/MSA:** deferred. Submitted docs are stored as-is to Vercel Blob with manual review flag. TODO(later): pipe through Document AI.
- **Accounting API (QuickBooks/Sage):** deferred. 1099 import is CSV-only for MVP with a documented schema. TODO(later): OAuth flow + live ingest.
- **E-file to Track1099/Tax1099:** deferred. 1099 export produces a clean CSV + PDF packet for manual upload. TODO(later): direct API.
- **Template library for safety programs:** MVP ships a static TypeScript const (`SAFETY_PROGRAM_TEMPLATES`). No downloadable templates yet. TODO(later): upload real templates to Supabase Storage.

## Team Members
| Role | Agent | Responsibility |
|------|-------|----------------|
| Lead | lead | Orchestrate |
| DB Builder | builder-db | Migration 049 (3 new tables + subs for onboarding) |
| Backend Builder | builder-api | 3 action files + 1 public API route for onboarding |
| Frontend Builder | builder-ui | 3 dashboard surfaces + public `/sub/[token]` portal |
| Validator | validator | tsc + lint + build + migration dry-run |
| Fixer | fixer | Contingent |
| Auditor | auditor | Static |

## Contract

### Migration 049 — 4 net-new tables
```sql
-- Sub onboarding: invite token + multi-step submission record
CREATE TABLE IF NOT EXISTS sub_onboarding_tokens (
  token text PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  sub_id uuid REFERENCES construction_subs(id) ON DELETE CASCADE,   -- nullable: may create new sub on submit
  sub_company_name text NOT NULL,
  contact_email text NOT NULL,
  contact_name text,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  invited_by uuid NOT NULL REFERENCES auth.users(id)
);
ALTER TABLE sub_onboarding_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY sub_onboarding_tokens_deny_all ON sub_onboarding_tokens
  FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE TABLE IF NOT EXISTS sub_onboarding_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL REFERENCES sub_onboarding_tokens(token) ON DELETE CASCADE,
  sub_id uuid REFERENCES construction_subs(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  legal_name text NOT NULL,
  ein text,                                 -- Tax ID from W-9
  address text,
  w9_pdf_url text,
  msa_signed_pdf_url text,
  msa_signed_at timestamptz,
  w9_uploaded_at timestamptz,
  notes text,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','approved','rejected')),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id),
  submitted_ip inet,
  submitted_user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE sub_onboarding_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY sub_onboarding_submissions_select_own ON sub_onboarding_submissions
  FOR SELECT TO authenticated USING (client_id = auth.uid());
CREATE POLICY sub_onboarding_submissions_update_own ON sub_onboarding_submissions
  FOR UPDATE TO authenticated USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());

-- Safety programs: IIPP/HazCom/WVPP/Heat/Respirator per sub
CREATE TABLE IF NOT EXISTS sub_safety_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_id uuid NOT NULL REFERENCES construction_subs(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  program_type text NOT NULL CHECK (program_type IN ('iipp','hazcom','wvpp','heat','respirator','fall_protection','confined_space','lockout_tagout')),
  document_url text,
  effective_date date,
  last_reviewed_at timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','expired')),
  reviewer_notes text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sub_id, program_type)
);
ALTER TABLE sub_safety_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY ssp_select_own ON sub_safety_programs FOR SELECT TO authenticated USING (client_id = auth.uid());
CREATE POLICY ssp_insert_own ON sub_safety_programs FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid());
CREATE POLICY ssp_update_own ON sub_safety_programs FOR UPDATE TO authenticated USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());
CREATE POLICY ssp_delete_own ON sub_safety_programs FOR DELETE TO authenticated USING (client_id = auth.uid());

-- Vendor payments (for 1099-NEC threshold tracking)
CREATE TABLE IF NOT EXISTS vendor_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_id uuid NOT NULL REFERENCES construction_subs(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  payment_date date NOT NULL,
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  category text,                            -- "labor", "materials", "services", ...
  tax_year int NOT NULL,
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','csv','quickbooks','sage')),
  external_id text,                         -- idempotency key for CSV/API imports
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sub_id, external_id) DEFERRABLE INITIALLY IMMEDIATE
);
CREATE INDEX vendor_payments_client_year_idx ON vendor_payments(client_id, tax_year);
CREATE INDEX vendor_payments_sub_year_idx ON vendor_payments(sub_id, tax_year);
ALTER TABLE vendor_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY vp_select_own ON vendor_payments FOR SELECT TO authenticated USING (client_id = auth.uid());
CREATE POLICY vp_insert_own ON vendor_payments FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid());
CREATE POLICY vp_update_own ON vendor_payments FOR UPDATE TO authenticated USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());
CREATE POLICY vp_delete_own ON vendor_payments FOR DELETE TO authenticated USING (client_id = auth.uid());
```

### Backend — 3 new action files + 1 public API route
```ts
// lib/actions/sub-onboarding.ts
export async function listOnboardingSubmissions(): Promise<OnboardingSubmission[]>
export async function inviteSub(formData: FormData): Promise<{ success?: boolean; error?: string; tokenUrl?: string }>
export async function approveSubmission(id: string): Promise<ActionResult>   // creates/links construction_subs + sets approved
export async function rejectSubmission(id: string, reason: string): Promise<ActionResult>

// lib/actions/safety-programs.ts
export async function listSafetyPrograms(): Promise<SafetyProgram[]>
export async function upsertSafetyProgram(formData: FormData): Promise<ActionResult>
export async function reviewSafetyProgram(id: string, decision: 'approved'|'rejected', notes?: string): Promise<ActionResult>
export const SAFETY_PROGRAM_TEMPLATES: Record<ProgramType, { title: string; authority: string; reviewIntervalDays: number; description: string }>

// lib/actions/nec-1099.ts  (the filename avoids numeric-first convention)
export async function listVendorPayments(taxYear?: number): Promise<VendorPayment[]>
export async function getYearSummary(taxYear: number): Promise<Array<{ sub_id: string; company_name: string; total: number; ein: string | null; status: 'flagged'|'below' }>>
export async function addPayment(formData: FormData): Promise<ActionResult>
export async function importCsv(formData: FormData): Promise<{ success?: boolean; error?: string; imported: number; skipped: number }>   // expects { sub_id | ein | company_name, payment_date, amount, category? }

// app/api/sub-onboarding/submit/[token]/route.ts (public)
// GET → returns token validity + current submission state
// POST → accepts multipart form (w9 file + msa signature data + fields) → stores in Blob + inserts submission row + marks token used
```

### Frontend deliverables
- `app/dashboard/sub-onboarding/page.tsx` — list submissions + invites + "Invite sub" modal
- `app/dashboard/safety-programs/page.tsx` — subs × 8 program types matrix, click cell to upsert/review
- `app/dashboard/form-1099/page.tsx` — year picker + threshold-flagged subs table + "Import CSV" modal + "Manual payment" modal + "Export 1099 packet" (CSV + simple PDF via `lib/pdf.ts`)
- `app/sub/[token]/page.tsx` — **NEW public portal**: 3-step flow (Company info → W-9 upload → MSA sign). No sidebar, no banner, no auth. Token-gated.
- `components/v2/subs/**` — extend existing subtree with: SubOnboardingPageClient, InviteSubModal, SubmissionReviewModal, SafetyProgramsMatrix, SafetyProgramDetail, Nec1099PageClient, CsvImportModal, ManualPaymentModal, Year1099Table, + for portal: SubPortalShell, W9UploadStep, MsaSignStep, CompanyInfoStep

## File Ownership
| Agent | Owns | Does NOT Touch |
|-------|------|----------------|
| builder-db | `supabase/migrations/049_subs_phase_b.sql` | Everything else |
| builder-api | `lib/actions/sub-onboarding.ts`, `lib/actions/safety-programs.ts`, `lib/actions/nec-1099.ts`, `app/api/sub-onboarding/submit/[token]/route.ts` | Everything else |
| builder-ui | `app/dashboard/{sub-onboarding,safety-programs,form-1099}/page.tsx`, `app/sub/[token]/**` (new public route), `components/v2/subs/**` (extend existing subtree) | Everything else |

**Hard exclusions:** all other lib/actions/* (read-only — construction.ts, coi.ts, vendor-risk.ts), all migrations 001–048, inngest/, other app/api/, all W1-W5+RBAC+Phase A component subtrees, Sidebar, ReportingBanner, primitives.

## Tasks

### B-T1: DB — migration 049 (4 net-new tables + RLS)
- **Owner:** builder-db
- **Deps:** none

### B-T2: Backend — 3 action files + public submit API route
- **Owner:** builder-api
- **Deps:** B-T1

### B-T3: Frontend — 3 surfaces + public /sub/[token] portal
- **Owner:** builder-ui
- **Deps:** B-T2

### B-T4: Validate
- **Owner:** validator
- **Deps:** B-T3

### B-T5: Fix (contingent)
- **Owner:** fixer
- **Deps:** B-T4

### B-T6: Audit
- **Owner:** auditor
- **Deps:** B-T4

## Validation Criteria
- [ ] Migration 049 applies cleanly
- [ ] RLS on 4 tables blocks cross-client reads
- [ ] 3 dashboard surfaces no longer render UnderConstruction
- [ ] Public `/sub/[token]` page works without auth (admin client + token validation)
- [ ] W-9 + MSA uploads hit Vercel Blob
- [ ] CSV import flags rows ≥ $600 per sub per tax year
- [ ] pnpm tsc, lint, build all pass
- [ ] Wave 1–5 + RBAC + Phase A files untouched

## Handoff
Ready for: `/build "specs/protekon-subs-phase-b-plan.md"`
