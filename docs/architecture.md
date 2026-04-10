# Protekon — Architecture & Page Map

> Auto-generated 2026-04-06. Source of truth for all user-facing pages, API routes, and system architecture.

---

## Route Summary

| Section | Pages | Auth Required |
|---------|-------|---------------|
| Marketing (public) | 18 | No |
| Auth | 3 | No |
| Dashboard (client portal) | 24 | Yes |
| Partner Portal | 3 | Yes |
| Partner Marketing (public) | 4 | No |
| **Total** | **52** | — |
| API Routes | 16 | Mixed |
| Inngest Functions | 10 files (11 exports) | N/A |
| Server Actions | 5 modules | N/A |
| Migrations | 9 | N/A |

---

## 1. Marketing Pages (Public)

| Route | File | Purpose |
|-------|------|---------|
| `/` | `app/page.tsx` | Landing page — Hero, Pricing, Testimonials, Comparison, SocialProof, CTA |
| `/about` | `app/about/page.tsx` | Company info |
| `/contact` | `app/contact/page.tsx` | Contact form |
| `/pricing` | `app/pricing/page.tsx` | Plan tiers ($597 / $897 / $1,297) |
| `/calculator` | `app/calculator/page.tsx` | Compliance cost calculator |
| `/resources` | `app/resources/page.tsx` | Resource hub |
| `/samples` | `app/samples/page.tsx` | Sample report downloads (email-gated) |
| `/score` | `app/score/page.tsx` | Free compliance score tool |
| `/marketplace` | `app/marketplace/page.tsx` | Integration marketplace |
| `/industries` | `app/industries/page.tsx` | Industry index |
| `/industries/[slug]` | `app/industries/[slug]/page.tsx` | Dynamic vertical landing pages |
| `/solutions` | `app/solutions/page.tsx` | Solutions overview |
| `/solutions/construction` | `app/solutions/construction/page.tsx` | Construction vertical |
| `/solutions/healthcare` | `app/solutions/healthcare/page.tsx` | Healthcare / HIPAA vertical |
| `/solutions/real-estate` | `app/solutions/real-estate/page.tsx` | Real estate vertical |
| `/solutions/compliance-suite` | `app/solutions/compliance-suite/page.tsx` | Full compliance suite |
| `/privacy` | `app/privacy/page.tsx` | Privacy policy |
| `/terms` | `app/terms/page.tsx` | Terms of service |

## 2. Auth Pages (Public)

| Route | File | Purpose |
|-------|------|---------|
| `/login` | `app/login/page.tsx` | Email + password login |
| `/signup` | `app/signup/page.tsx` | Registration |
| `/forgot-password` | `app/forgot-password/page.tsx` | Password reset |
| `/auth/callback` | `app/auth/callback/route.ts` | Supabase OAuth callback handler |

## 3. Dashboard — Client Portal (Protected)

Middleware at `middleware.ts` protects `/dashboard/:path*` via Supabase session.

### Core Pages

| Route | File | Purpose |
|-------|------|---------|
| `/dashboard` | `app/dashboard/page.tsx` | Overview — compliance score, recent activity, alerts |
| `/dashboard/documents` | `app/dashboard/documents/page.tsx` | Document hub — all compliance docs |
| `/dashboard/documents/request` | `app/dashboard/documents/request/page.tsx` | Request new document generation |
| `/dashboard/incidents` | `app/dashboard/incidents/page.tsx` | Incident log |
| `/dashboard/incidents/new` | `app/dashboard/incidents/new/page.tsx` | Report new incident |
| `/dashboard/regulations` | `app/dashboard/regulations/page.tsx` | Regulatory feed — updates & changes |
| `/dashboard/alerts` | `app/dashboard/alerts/page.tsx` | Alert center |
| `/dashboard/training` | `app/dashboard/training/page.tsx` | Employee training records |
| `/dashboard/intake` | `app/dashboard/intake/page.tsx` | Client onboarding intake form |
| `/dashboard/settings` | `app/dashboard/settings/page.tsx` | Account settings |
| `/dashboard/chat` | `app/dashboard/chat/page.tsx` | AI Compliance Officer chat |
| `/dashboard/marketplace` | `app/dashboard/marketplace/page.tsx` | Integration marketplace (in-app) |
| `/dashboard/poster-compliance` | `app/dashboard/poster-compliance/page.tsx` | Workplace poster compliance tracker |

### Reports

| Route | File | Purpose |
|-------|------|---------|
| `/dashboard/reports` | `app/dashboard/reports/page.tsx` | Reports hub |
| `/dashboard/reports/compliance-score` | `app/dashboard/reports/compliance-score/page.tsx` | Compliance score history & trends |
| `/dashboard/reports/incident-analysis` | `app/dashboard/reports/incident-analysis/page.tsx` | Incident trends & analysis |
| `/dashboard/reports/document-history` | `app/dashboard/reports/document-history/page.tsx` | Document generation history |
| `/dashboard/reports/regulatory-impact` | `app/dashboard/reports/regulatory-impact/page.tsx` | Regulatory change impact |
| `/dashboard/reports/delivery-log` | `app/dashboard/reports/delivery-log/page.tsx` | Scheduled delivery log |
| `/dashboard/reports/annual-summary` | `app/dashboard/reports/annual-summary/page.tsx` | Annual compliance summary |

### Vertical Sub-Dashboards

Each vertical adds specialized pages under `/dashboard/<vertical>/`.

| Route | File | Purpose |
|-------|------|---------|
| `/dashboard/agriculture/crews` | `app/dashboard/agriculture/crews/page.tsx` | Crew management & H-2A compliance |
| `/dashboard/construction/subcontractors` | `app/dashboard/construction/subcontractors/page.tsx` | Sub-contractor compliance tracking |
| `/dashboard/healthcare/baa-tracker` | `app/dashboard/healthcare/baa-tracker/page.tsx` | BAA agreement tracker (HIPAA) |
| `/dashboard/healthcare/phi-inventory` | `app/dashboard/healthcare/phi-inventory/page.tsx` | PHI asset inventory (HIPAA) |
| `/dashboard/hospitality/inspections` | `app/dashboard/hospitality/inspections/page.tsx` | Health inspection tracking |
| `/dashboard/manufacturing/equipment` | `app/dashboard/manufacturing/equipment/page.tsx` | Equipment compliance & maintenance |
| `/dashboard/real-estate/properties` | `app/dashboard/real-estate/properties/page.tsx` | Property portfolio compliance |
| `/dashboard/retail/locations` | `app/dashboard/retail/locations/page.tsx` | Multi-location compliance |
| `/dashboard/transportation/fleet` | `app/dashboard/transportation/fleet/page.tsx` | Fleet DOT compliance |
| `/dashboard/wholesale/zones` | `app/dashboard/wholesale/zones/page.tsx` | Distribution zone compliance |

## 4. Partner Portal (Protected)

Middleware protects `/partner/:path*` via Supabase session.

| Route | File | Purpose |
|-------|------|---------|
| `/partner` | `app/partner/page.tsx` | Partner dashboard — clients, revenue, assessments |
| `/partner/assessments` | `app/partner/assessments/page.tsx` | Client compliance assessments |
| `/partner/settings` | `app/partner/settings/page.tsx` | Partner account settings |

### Partner Marketing (Public)

| Route | File | Purpose |
|-------|------|---------|
| `/partners` | `app/partners/page.tsx` | Partner program landing page |
| `/partners/apply` | `app/partners/apply/page.tsx` | Partner application form |
| `/partners/pricing` | `app/partners/pricing/page.tsx` | Partner pricing / revenue share |
| `/partners/boot-camp` | `app/partners/boot-camp/page.tsx` | Partner onboarding boot camp |

---

## 5. API Routes

| Endpoint | Methods | Auth | Purpose |
|----------|---------|------|---------|
| `/api/inngest` | POST | Webhook | Inngest event handler |
| `/api/chat` | POST | Yes | AI Compliance Officer (Anthropic via AI SDK) |
| `/api/compliance/score` | GET | Yes | Calculate client compliance % |
| `/api/documents/download` | GET | Yes | Stream generated PDF documents |
| `/api/export/incidents` | GET | Yes | Export incidents as CSV/PDF |
| `/api/export/report` | GET | Yes | Export reports as PDF |
| `/api/upload` | POST | Yes | File upload to Vercel Blob |
| `/api/samples/gate` | POST | No | Email gate for sample downloads |
| `/api/score/submit` | POST | No | Submit free compliance score quiz |
| `/api/score/report` | GET | No | Retrieve score report |
| `/api/stripe/checkout` | POST | Yes | Create Stripe checkout session |
| `/api/stripe/portal` | POST | Yes | Redirect to Stripe customer portal |
| `/api/stripe/webhook` | POST | Webhook | Stripe payment event handler |
| `/api/partners/apply` | POST | No | Submit partner application |
| `/api/partner/assessments` | GET, POST | Yes | CRUD partner client assessments |
| `/api/admin/partners` | GET, PATCH | Admin | Partner management (approve/reject) |

---

## 6. Inngest Workflows (Background Jobs)

| File | Function(s) | Trigger | Purpose |
|------|-------------|---------|---------|
| `intake-pipeline.ts` | `intakePipeline` | `compliance/intake.submitted` | Score gaps → upsert client → generate docs → send welcome |
| `post-signup.ts` | `postSignup` | `auth/user.signed-up` | Create client record → send onboarding email |
| `monthly-audit.ts` | `monthlyAudit`, `clientMonthlyAudit` | Cron `0 9 1 * *` / fan-out | Orchestrator fans out per-client audit + report + email |
| `document-generation.ts` | `documentGeneration` | `compliance/document.requested` | Gather data → PDF via pdf-lib → upload Blob → notify |
| `incident-report.ts` | `incidentReport` | `compliance/incident.reported` | Strip PII (SB 553) → log → schedule follow-up |
| `payment-failed.ts` | `paymentFailed` | `billing/payment.failed` | 3 escalating notices over 10 days → suspend if unpaid |
| `regulatory-scan.ts` | `regulatoryScan` | Cron | Scan regulatory sources → match to client verticals → alert |
| `scheduled-delivery.ts` | `scheduledDelivery` | Event | Execute scheduled document deliveries |
| `score-drip.ts` | `scoreDrip` | Event | Drip email sequence after free score submission |
| `training-reminders.ts` | `trainingReminders` | Event | Training certification expiry reminders |

---

## 7. Server Actions

| File | Domain | Key Functions |
|------|--------|---------------|
| `lib/actions/assessments.ts` | Partner assessments | CRUD partner client assessments |
| `lib/actions/clients.ts` | Client management | Get/update client profile, company settings |
| `lib/actions/documents.ts` | Document management | List, request, download compliance docs |
| `lib/actions/incidents.ts` | Incident reporting | List, create, update incidents |
| `lib/actions/partners.ts` | Partner management | Apply, list clients, update profile |

Additional action files exist per vertical (agriculture, construction, healthcare, hospitality, manufacturing, real-estate, retail, transportation, wholesale) plus cross-cutting (alerts, auth, contact, dashboard, intake, poster-compliance, reports, samples, scheduled-deliveries, score, settings, training).

---

## 8. Database Schema (9 Migrations)

| Migration | Description |
|-----------|-------------|
| 001 `initial_schema` | Core tables: clients, incidents, documents, audits, training_records |
| 002 `expansion` | intake_submissions, sample_report_leads, scheduled_deliveries, regulatory_updates |
| 003 `alignment` | Schema alignment with Shield CaaS |
| 004 `vertical_tables` | construction_subs, property_portfolio, municipal_ordinances, phi_assets, baa_agreements, poster_compliance + 6 vertical tables (manufacturing_equipment, hospitality_inspections, agriculture_crews, retail_locations, wholesale_zones, transportation_fleet) |
| 005 `score_leads` | Score quiz leads table |
| 006 `partner_applications` | Partner application submissions |
| 007 `partner_portal` | contact_submissions, partner_profiles, partner_clients, partner_assessments |
| 008 `indexes_and_defaults` | Plan default starter→core, client_id indexes on 6 tables, dropped audit_log RLS |
| 009 `fk_fix_and_osha_cleanup` | Re-pointed 6 vertical FKs from auth.users→clients, dropped shield_osha_violations |

All tables have RLS policies. Clients see only their own data via `auth.uid()`.

---

## 9. Components

| Category | Count | Location |
|----------|-------|----------|
| shadcn/ui primitives | 57 | `components/ui/` |
| App components | 2 | `components/` (navbar.tsx, sidebar.tsx) |
| Page-level components | Inline | Co-located in page files |
| **Total** | **59** | — |

---

## 10. Auth & Middleware

- **Provider:** Supabase Auth (email/password + magic links)
- **OAuth:** Google + Apple (not yet enabled)
- **Session:** `@supabase/ssr` cookie-based sessions
- **Middleware:** `middleware.ts` protects `/dashboard/*` and `/partner/*`
- **Callback:** `/auth/callback` handles OAuth redirect

---

## 11. External Services

| Service | Purpose | Status |
|---------|---------|--------|
| Supabase | Database + Auth + RLS | Live (9 migrations deployed) |
| Stripe | Payments (checkout, portal, webhooks) | Wired |
| Inngest | Durable workflows (10 functions) | Wired |
| Resend | Transactional email | Wired |
| Vercel Blob | Document storage | Wired |
| Vercel Analytics | Usage tracking | Wired |
| Anthropic (AI SDK) | AI Compliance Officer chat | Wired |
| pdf-lib | PDF document generation | Wired |

---

## 12. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FACE (Frontend)                          │
│  Next.js 16.2 · shadcn/ui · Tailwind CSS · Framer Motion       │
│                                                                 │
│  Marketing (18p) │ Auth (3p) │ Dashboard (24p) │ Partner (7p)   │
└────────────┬────────────────────────────────────┬───────────────┘
             │                                    │
             │  Server Actions (26 modules)       │  API Routes (16)
             │  Form submissions, CRUD            │  Score, export, upload,
             │                                    │  Stripe, chat, Inngest
             │                                    │
┌────────────▼────────────────────────────────────▼───────────────┐
│                        DNA (Backend)                            │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐   │
│  │ Supabase │  │  Stripe  │  │  Resend  │  │ Vercel Blob   │   │
│  │ DB + RLS │  │ Payments │  │  Email   │  │ Doc Storage   │   │
│  │ Auth     │  │          │  │          │  │               │   │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Inngest (Workflows)                    │   │
│  │  intake-pipeline · monthly-audit · document-generation   │   │
│  │  incident-report · payment-failed · post-signup          │   │
│  │  regulatory-scan · scheduled-delivery · score-drip       │   │
│  │  training-reminders                                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    HEAD (AI Layer)                        │   │
│  │  Anthropic Claude (AI SDK) → /dashboard/chat             │   │
│  │  AI Compliance Officer — contextual compliance guidance   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```
