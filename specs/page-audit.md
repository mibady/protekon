# Protekon — Complete Page & Functionality Audit
**Generated:** 2026-04-03 | **Files:** 285 tracked | **Pages:** 55+

---

## GLOBAL NAVIGATION

### Nav (components/layout/Nav.tsx)
| Element | Type | Destination |
|---------|------|-------------|
| Solutions | Link + Mega Menu | /solutions |
| Industries | Link | /industries |
| Pricing | Link | /pricing |
| Resources | Link | /resources |
| Samples | Link | /samples |
| About | Link | /about |
| CLIENT LOGIN | Button | /login |
| GET STARTED | Button | /signup |

**Mega Menu (Solutions):**
- Compliance Suite → /solutions/compliance-suite
- Construction Shield → /solutions/construction
- Healthcare Shield → /solutions/healthcare
- Real Estate Shield → /solutions/real-estate
- The Protekon Engine → /about#engine
- Delivery Model → /about#delivery
- Security & Data → /about#security
- API & Integrations → /marketplace

### Footer (components/layout/Footer.tsx)
| Column | Links |
|--------|-------|
| Solutions | /solutions/compliance-suite, /solutions/construction, /solutions/healthcare, /solutions/real-estate |
| Company | /about, /industries, /contact |
| Resources | /resources, /calculator, /samples, /privacy, /terms |
| Social | LinkedIn (ext), X/Twitter (ext) |

---

## PUBLIC PAGES (25 pages)

### 1. Homepage (/)
**Sections:** IntroAnimation, Hero, SocialProof, ProductOverview, DataSection, Comparison, DailyTimeline, BeforeAfter, Pricing, Testimonials, SampleReportCTA, FinalCTA

| Button/CTA | Destination |
|------------|-------------|
| Get Started | /signup |
| See Pricing | /pricing |
| Check Your Score (Free) | /score |
| Talk to Sales | /contact |

---

### 2. Pricing (/pricing)
**3 Plans displayed:**

| Plan | Price | Setup | Target |
|------|-------|-------|--------|
| Core | $597/mo | $297 | Single-location, 10-50 emp |
| Professional | $897/mo | $397 | 50-150 emp, quarterly reviews |
| Multi-Site | $1,297/mo | $597 | 2+ locations, +$197/extra site |

**Comparison table:** PROTEKON vs hire compliance officer, CalChamber toolkit, enterprise GRC, training course, local consultant

| Button | Destination |
|--------|-------------|
| Get Started (per plan) | /signup |
| Check Your Score | /score |

**8 FAQs** (expandable accordion)

---

### 3. About (/about)
**Stats:** 73,960+ Citations, $164M+ Penalties, 14,443 Serious Violations, 68.7% Construction+Manufacturing

**4 Core Values:** Intelligence First, Agent Not Software, Precision Delivery, Institutional Trust

**Sections with anchors:** #engine, #delivery, #security

| Button | Destination |
|--------|-------------|
| Get Started | /signup |

---

### 4. Contact (/contact)
**Contact Info:** hello@protekon.com (mailto), 1-800-555-1234 (tel)

**Form Fields:**
| Field | Type | Required |
|-------|------|----------|
| Name | text | Yes |
| Email | email | Yes |
| Company | text | No |
| Phone | tel | No |
| Subject | select (5 options) | Yes |
| Message | textarea | Yes |

| Button | Action |
|--------|--------|
| Send Message | Form submit (client-side) |

---

### 5. Login (/login)
**Form Fields:**
| Field | Type | Required |
|-------|------|----------|
| Email Address | email | Yes |
| Password | password (show/hide toggle) | Yes |

| Button | Action |
|--------|--------|
| Sign In | signIn() server action |
| Google | OAuth (Supabase) |
| Apple | OAuth (Supabase) |
| Forgot password? | Link → /forgot-password |
| Start your compliance plan | Link → /signup |

---

### 6. Signup (/signup)
**Step 1 — Account:**
| Field | Type | Required |
|-------|------|----------|
| Work Email | email | Yes |
| Create Password | password (show/hide, min 8) | Yes |

**Step 2 — Business Details:**
| Field | Type | Required |
|-------|------|----------|
| Business Name | text | Yes |
| Industry | select (10 options) | Yes |
| Employee Count | select (5 options) | Yes |
| Plan | radio (Core/Professional/Multi-Site) | Yes |
| Number of Locations | select (conditional) | Conditional |

| Button | Action |
|--------|--------|
| Continue | Step 1 → Step 2 |
| Back | Step 2 → Step 1 |
| Start Your Plan | signUp() → redirect /dashboard/intake |

---

### 7. Forgot Password (/forgot-password)
**Form:** Email input → forgotPassword() server action
**Success state:** "Check Your Email" confirmation with try-again option

---

### 8. Solutions Hub (/solutions)
**4 solution cards** linking to vertical pages, plus "How It Works" section

---

### 9-12. Solution Verticals
| Route | Title | Buttons |
|-------|-------|---------|
| /solutions/compliance-suite | SB 553 + Cal/OSHA | Get Started → /signup, Talk to Sales → /contact |
| /solutions/construction | CSLB + Site Safety | Get Started → /signup, Talk to Sales → /contact |
| /solutions/healthcare | Cal/OSHA Healthcare | Get Started → /signup, Talk to Sales → /contact |
| /solutions/real-estate | Habitability Compliance | Get Started → /signup, Talk to Sales → /contact |

Each has: hero, features list, pricing block, included benefits

---

### 13. Industries (/industries)
**9 industry cards:** Construction, Manufacturing, Hospitality, Healthcare, Real Estate, Logistics, Retail, Auto Services + risk levels

### 14. Industries Detail (/industries/[slug])
**Dynamic page** with OSHA violation stats per industry, enforcement patterns, CTA to /signup

---

### 15. Samples (/samples)
**3 sample reports:** SB 553 WVPP (22pg), Construction Sub Report (4pg), Property Municipal Pulse (6pg)

**Email gate form:**
| Field | Type | Required |
|-------|------|----------|
| Email | email | Yes |
| Company Name | text | Yes |

| Button | Action |
|--------|--------|
| Submit | Unlock downloads (submitSampleLead server action) |

---

### 16. Score (/score) — 4-Step Wizard
**Step 1 — Business Context:**
| Field | Type |
|-------|------|
| Industry | select (15 options) |
| Employee Count | select (5 options) |
| Number of Locations | select (4 options) |
| City, State | text |

**Step 2 — Compliance Posture:**
6 yes/no questions with live score ring updating in real-time:
1. Written IIPP?
2. IIPP site-specific?
3. Compliant incident log?
4. Safety training current?
5. Industry-specific programs?
6. Audit-ready today?

**Step 3 — Email Gate:**
| Field | Type | Required |
|-------|------|----------|
| Email | email | Yes |
| Name | text | Yes |
| Phone | tel | No |

**Step 4 — Results:**
- Score ring (0-6), tier badge (green/yellow/red)
- Gap list with citation amounts
- Fine exposure estimate
- PDF report download link

| Button | Action |
|--------|--------|
| Next/Back | Step navigation |
| See My Score | POST /api/score/submit |
| Download PDF | GET /api/score/report?id=... |
| Close These Gaps | Link → /pricing |

---

### 17. Calculator (/calculator)
Interactive penalty calculator using 73,960 OSHA records. Industry selector + employee count → estimated fine exposure.

---

### 18. Resources (/resources)
3 featured resources + 6 articles + 4 downloadable files + newsletter signup form

---

### 19. Marketplace (/marketplace)
6 integration cards (Zapier, Slack, Teams, QuickBooks, Gusto, Google Workspace) + 3 add-on cards

---

### 20-21. Privacy & Terms (/privacy, /terms)
Static legal pages with back-to-home link

---

### 22. Partners (/partners)
6 partner type profiles, 3-step "How It Works", 6 partner benefits

| Button | Destination |
|--------|-------------|
| Explore Pricing | /partners/pricing |
| Apply Now | /partners/apply |

---

### 23. Partner Pricing (/partners/pricing)
| Tier | Price | Client Limit |
|------|-------|-------------|
| Free | $0/mo | 1 client |
| Essentials | $149/client/mo | Up to 10 |
| Professional | $249/client/mo | Up to 50 |
| Enterprise | $399/client/mo | Unlimited |

Interactive margin calculator per tier. All CTAs → /partners/apply

---

### 24. Partner Apply (/partners/apply)
**3-step form:**
- Step 1: Business type, client count, primary industries (multi-select)
- Step 2: Compliance experience, verticals interested (multi-select), tier interest
- Step 3: Name, email, phone, company name

| Button | Action |
|--------|--------|
| Previous Step / Next | Step navigation |
| Submit | POST /api/partners/apply |

---

### 25. Partner Boot Camp (/partners/boot-camp)
6 expandable training modules (Market, Verticals, Score Tool, Packaging & Pricing, + 2 more). Each shows duration, topics, outcomes.

---

## DASHBOARD PAGES (30 pages)

### Sidebar Navigation (app/dashboard/layout.tsx)
**Data source:** getClientProfile() + getDashboardData()

| Group | Items | Tier Gate |
|-------|-------|-----------|
| OVERVIEW | Dashboard, Compliance Score | All |
| DOCUMENTS | My Documents, Request Update | All |
| COMPLIANCE | Incidents, Regulatory Updates, Reports, Training | All |
| | Quarterly Reviews | Professional+ |
| | Annual Audit | Multi-Site only |
| BUSINESS TOOLS | Poster Compliance, Marketplace | All |
| ACCOUNT | Settings, Billing, Team | All |

**Vertical sections** (conditional on client.vertical):
- Construction → Subcontractors
- Healthcare → PHI Inventory, BAA Tracker
- Real Estate → Properties
- Manufacturing → Equipment Registry
- Hospitality → Inspections
- Agriculture → Field Crews
- Retail → Store Locations
- Wholesale → Safety Zones
- Transportation → Fleet

**Sidebar header:** Client name, compliance score ring (color-coded), avatar initials

---

### 26. Dashboard Overview (/dashboard)
**Data source:** getDashboardData()

| Element | Type | Action |
|---------|------|--------|
| Compliance Score card | Display | Links to /dashboard/reports/compliance-score |
| Recent Documents (5) | List | Each links to document detail |
| Recent Incidents (5) | List | Each links to incident detail |
| Quick Actions | Button group | |
| Request Document | Button | → /dashboard/documents/request |
| Report Incident | Button | → /dashboard/incidents/new |
| View Reports | Button | → /dashboard/reports |
| AI Chat | Button | → /dashboard/chat |

---

### 27. Documents (/dashboard/documents)
**Data source:** getDocuments()

| Button | Action |
|--------|--------|
| Request Update | Link → /dashboard/documents/request |
| Download (per doc) | GET /api/documents/download?id=... |
| Filter dropdown | Filter by type/status |
| Search | Text search |

---

### 28. Document Request (/dashboard/documents/request)
**Form Fields:**
| Field | Type | Required |
|-------|------|----------|
| Document Type | select | Yes |
| Notes | textarea | No |
| Priority | select (normal/urgent) | Yes |

| Button | Action |
|--------|--------|
| Submit Request | requestDocument() → fires Inngest compliance/document.requested |

---

### 29. Incidents (/dashboard/incidents)
**Data source:** getIncidents()

| Button | Action |
|--------|--------|
| Report New Incident | Link → /dashboard/incidents/new |
| View Details (per row) | Opens side panel |
| Export CSV | GET /api/export/incidents |
| Filter | Dropdown (severity, status, date) |
| Search | Text search |
| Edit (in panel) | updateIncident() |
| Delete (in panel) | deleteIncident() |
| Close Panel | Closes detail panel |
| Pagination | Next/Previous page |

---

### 30. New Incident (/dashboard/incidents/new)
**Form Fields:**
| Field | Type | Required |
|-------|------|----------|
| Description | textarea | Yes |
| Date | date picker | Yes |
| Time | time input | No |
| Severity | select (minor/moderate/serious/severe) | Yes |
| Type | select | No |
| Injury Occurred | checkbox | No |
| Medical Treatment | checkbox | No |
| Witnesses | text | No |
| Actions Taken | textarea | No |

| Button | Action |
|--------|--------|
| Submit Report | createIncident() → fires Inngest compliance/incident.reported |
| Cancel | Link → /dashboard/incidents |

---

### 31. Regulations (/dashboard/regulations)
**Data source:** getRegulations() (from regulatory_updates table)

| Button | Action |
|--------|--------|
| Acknowledge (per item) | acknowledgeRegulation() — persists to acknowledged_by jsonb |
| Filter | Dropdown (jurisdiction, severity) |

---

### 32. Reports Hub (/dashboard/reports)
6 report cards linking to sub-pages:
- Compliance Score → /dashboard/reports/compliance-score
- Incident Analysis → /dashboard/reports/incident-analysis
- Regulatory Impact → /dashboard/reports/regulatory-impact
- Document History → /dashboard/reports/document-history
- Delivery Log → /dashboard/reports/delivery-log
- Annual Summary → /dashboard/reports/annual-summary

---

### 33. Compliance Score Report (/dashboard/reports/compliance-score)
**Data source:** getComplianceScoreReport()
- Score chart (Recharts line/bar chart)
- Monthly trend data
- Category breakdown

| Button | Action |
|--------|--------|
| Export PDF | GET /api/export/report?type=compliance-score |

---

### 34-37. Other Reports
| Route | Data Source | Export |
|-------|-----------|--------|
| /dashboard/reports/incident-analysis | getIncidentAnalysis() | Export PDF |
| /dashboard/reports/regulatory-impact | getRegulatoryImpact() | Export PDF |
| /dashboard/reports/document-history | getDocumentHistory() | Export PDF |
| /dashboard/reports/delivery-log | getDeliveryLog() | Export PDF |
| /dashboard/reports/annual-summary | getAnnualSummary() | Export PDF |

---

### 38. Alerts (/dashboard/alerts)
**Data source:** getAlerts() (computed from 4 tables)

| Button | Action |
|--------|--------|
| Mark All Read | markAllAlertsRead() |
| Dismiss (per alert) | dismissAlert() |
| Pagination | Next/Previous |

---

### 39. Training (/dashboard/training)
**Data source:** getTrainingRecords()

| Button | Action |
|--------|--------|
| Add Training Record | Opens form/modal |
| Edit (per record) | Inline edit |
| Mark Complete | updateTrainingRecord(status: 'completed') |
| Delete | deleteTrainingRecord() |
| Filter | Status dropdown |
| Search | Text search |
| Export | Export CSV |

**Form (Add/Edit):**
| Field | Type | Required |
|-------|------|----------|
| Training Title | text | Yes |
| Employee Name | text | Yes |
| Date | date | Yes |
| Expiry Date | date | No |
| Status | select | Yes |
| Notes | textarea | No |

---

### 40. Settings (/dashboard/settings)
**5 Tabs:** Profile, Company, Security, Notifications, Billing

**Profile Tab:**
| Field | Action |
|-------|--------|
| Email (read-only) | Display |
| Name | updateProfile() |
| Phone | updateProfile() |

**Company Tab:**
| Field | Action |
|-------|--------|
| Business Name | updateCompany() |
| Industry | updateCompany() |
| Employee Count | updateCompany() |
| Address fields | updateCompany() |

**Security Tab:**
| Field | Action |
|-------|--------|
| Current Password | changePassword() |
| New Password | changePassword() |
| Confirm Password | changePassword() |

**Notifications Tab:**
| Toggle | Action |
|--------|--------|
| Email notifications | updateNotificationPreferences() |
| Document alerts | updateNotificationPreferences() |
| Incident alerts | updateNotificationPreferences() |
| Regulatory updates | updateNotificationPreferences() |

**Billing Tab:**
- Current plan display with feature checklist
- Upgrade CTA for lower tiers

| Button | Action |
|--------|--------|
| Manage Billing | POST /api/stripe/portal → redirect to Stripe |
| Upgrade Plan | POST /api/stripe/checkout |

---

### 41. AI Chat (/dashboard/chat)
**Data source:** useChat() hook → POST /api/chat (Claude Sonnet via Vercel AI SDK)
**RAG context:** Client profile, recent documents, incidents, regulatory updates

| Element | Action |
|---------|--------|
| Message input | Text input with submit |
| Send button | Sends message, streams AI response |
| Message history | Scrollable chat thread |

---

### 42. Intake (/dashboard/intake)
**6 yes/no compliance questions** with live SVG score ring

| Button | Action |
|--------|--------|
| Yes/No (per question) | Toggle answer |
| Submit Assessment | submitIntake() → fires Inngest compliance/intake.submitted |

---

### 43. Marketplace (/dashboard/marketplace)
Integration cards + add-on cards (same as public /marketplace but themed for dashboard)

---

### 44. Poster Compliance (/dashboard/poster-compliance)
**Data source:** getPosterCompliance()

| Button | Action |
|--------|--------|
| Add Location | Opens form |
| Edit (per location) | Inline edit |
| Mark Compliant | updatePosterCompliance() |
| Delete | deletePosterLocation() |

---

### 45-47. Existing Vertical Pages

#### Construction Subcontractors (/dashboard/construction/subcontractors)
**Data source:** getSubcontractors()
| Button | Action |
|--------|--------|
| Add Subcontractor | Opens form |
| Edit | Inline edit |
| Delete | deleteSubcontractor() |
| Verify License | verifyLicense() (CSLB check) |
| Verify Insurance | verifyInsurance() |
| Filter | Status dropdown |
| Search | Text search |
| Export | Export CSV |

#### Healthcare PHI Inventory (/dashboard/healthcare/phi-inventory)
**Data source:** getPhiAssets()
| Button | Action |
|--------|--------|
| Add PHI Asset | Opens form |
| Edit | Inline edit |
| Delete | deletePhiAsset() |

#### Healthcare BAA Tracker (/dashboard/healthcare/baa-tracker)
**Data source:** getBaaAgreements()
| Button | Action |
|--------|--------|
| Add BAA | Opens form |
| Edit | Inline edit |
| Delete | deleteBaaAgreement() |

#### Real Estate Properties (/dashboard/real-estate/properties)
**Data source:** getProperties()
| Button | Action |
|--------|--------|
| Add Property | Opens form |
| Edit | Inline edit |
| Delete | deleteProperty() |

---

### 48-53. New Vertical Pages (Generic VerticalPage Component)
All use `components/dashboard/VerticalPage.tsx` with vertical-specific config.

| Route | Data Source | Table |
|-------|-----------|-------|
| /dashboard/manufacturing/equipment | getManufacturingEquipment() | manufacturing_equipment |
| /dashboard/hospitality/inspections | getHospitalityInspections() | hospitality_inspections |
| /dashboard/agriculture/crews | getAgricultureCrews() | agriculture_crews |
| /dashboard/retail/locations | getRetailLocations() | retail_locations |
| /dashboard/wholesale/zones | getWholesaleZones() | wholesale_zones |
| /dashboard/transportation/fleet | getTransportationFleet() | transportation_fleet |

**Each page has:**
| Button | Action |
|--------|--------|
| Add [Item] | Opens add form (dialog) |
| Edit (per row) | Opens edit form (dialog) |
| Delete (per row) | Deletes with confirmation |
| Search | Text search across columns |

**Form fields vary by vertical** (defined in page config passed to VerticalPage component)

---

## TOTALS

| Category | Count |
|----------|-------|
| Public pages | 25 |
| Dashboard pages | 30 |
| API routes | 13 |
| Forms | 15+ (login, signup, contact, score, partner apply, incident, document request, settings x4, training, verticals) |
| Buttons/CTAs | 100+ |
| Server actions | 50+ exports across 23 files |
| Inngest triggers | 3 (document.requested, incident.reported, intake.submitted) |
| Inngest functions | 10 (5 event, 4 cron, 1 drip) |
