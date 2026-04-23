# Manual QA Checklist — Protekon User-Facing Pages

> Grounded in source code as of 2026-04-23 (main @ 69f0e32). Every `app/**/page.tsx` — 80 pages.
> Each entry: route · file path · **Purpose** (product intent) · **Expected features** (what should be there) · **Actual** (scanned from JSX).
> A discrepancy between *Expected* and *Actual* is a bug to file.
> Tick boxes as you verify live on preview or prod.

## How to use
1. Start logged-out. Walk sections 1-6 (marketing, content, score, partners-marketing, auth) as a prospect.
2. Sign up, complete Stripe checkout, walk section 7 (onboarding) through all 7 steps.
3. Log in as a client, walk section 8 (dashboard) page by page.
4. For a partner account, walk section 9. For token-gated pages (section 10), generate a token from the corresponding admin dashboard page and open in a private window.


## 1. Home (1 pages)

### `/`
**File:** `app/page.tsx`  
**Purpose:** Home / landing  
**Expected features / buttons:**
- [ ] Hero with primary CTA (signup or score tool)
- [ ] Value props (AI Compliance Officer positioning)
- [ ] Social proof / logos section
- [ ] Pricing teaser linking to /pricing
- [ ] Footer nav: /about /pricing /contact /privacy /terms


## 2. Marketing (public, no auth) (14 pages)

### `/about`
**File:** `app/about/page.tsx`  
**Purpose:** About page — company story & positioning  
**Expected features / buttons:**
- [ ] Mission / AI Compliance Officer positioning
- [ ] Team or founder section (if present)
- [ ] CTA back to /pricing or /signup
**Actual (scanned from source):**
- h1: _We Built Protekon to Run Your Compliance Department._

### `/calculator`
**File:** `app/calculator/page.tsx`  
**Purpose:** Compliance cost calculator  
**Expected features / buttons:**
- [ ] Interactive inputs
- [ ] Live estimate display
- [ ] CTA to pricing
**Actual (scanned from source):**
- h1: _What Could a_
- 1 form(s) on page
- server actions imported: samples

### `/contact`
**File:** `app/contact/page.tsx`  
**Purpose:** Contact form  
**Expected features / buttons:**
- [ ] Name / Company / Email / Phone / Message
- [ ] Submit to /api/contact
- [ ] Success/error states
**Actual (scanned from source):**
- h1: _CONTACT US_
- 1 form(s) on page
- server actions imported: contact

### `/industries`
**File:** `app/industries/page.tsx`  
**Purpose:** Industries index  
**Expected features / buttons:**
- [ ] Grid of all 26 verticals linking to each
**Actual (scanned from source):**
- meta.title: _Industries We Serve | PROTEKON_

### `/industries/[slug]`
**File:** `app/industries/[slug]/page.tsx`  
**Purpose:** Per-vertical landing  
**Expected features / buttons:**
- [ ] Vertical-tuned copy
- [ ] Required docs list
- [ ] Signup CTA
**Actual (scanned from source):**
- h1: _data.riskLevel} Risk._

### `/marketplace`
**File:** `app/marketplace/page.tsx`  
**Purpose:** Public marketplace index  
**Expected features / buttons:**
- [ ] Vendor/integration listings
- [ ] Category filter
**Actual (scanned from source):**
- h1: _EXTEND PROTEKON_

### `/partner`
**File:** `app/partner/page.tsx`  
**Purpose:** Partner dashboard  
**Expected features / buttons:**
- [ ] Partner metrics: referred clients, MRR, commission
- [ ] Recent activity
**Actual (scanned from source):**
- server actions imported: partner-portal

### `/pricing`
**File:** `app/pricing/page.tsx`  
**Purpose:** Pricing page — 3 tiers + multi-site add-on  
**Expected features / buttons:**
- [ ] Three plan cards: $597 / $897 / $1,297 (location-based)
- [ ] Multi-site +$197/site overage note
- [ ] Per-plan CTA → Stripe checkout
- [ ] FAQ accordion
- [ ] Setup fee disclosure
**Actual (scanned from source):**
- 1 form(s) on page
- server actions imported: score

### `/samples`
**File:** `app/samples/page.tsx`  
**Purpose:** Sample reports email gate  
**Expected features / buttons:**
- [ ] Email gate form
- [ ] Submit to /api/samples/gate returning download link
- [ ] Sample categories grid
**Actual (scanned from source):**
- h1: _See What Your Compliance Officer Produces._
- server actions imported: samples

### `/solutions`
**File:** `app/solutions/page.tsx`  
**Purpose:** Solutions hub  
**Expected features / buttons:**
- [ ] Links into the 4 vertical solution pages
**Actual (scanned from source):**
- h1: _COMPLIANCE VERTICALS_

### `/solutions/compliance-suite`
**File:** `app/solutions/compliance-suite/page.tsx`  
**Purpose:** Compliance Suite solution  
**Expected features / buttons:**
- [ ] Feature grid
- [ ] Capabilities list (6)
- [ ] ICP callouts
- [ ] CTA to pricing
**Actual (scanned from source):**
- h1: _SB 553 + CAL/OSHA COMPLIANCE_

### `/solutions/construction`
**File:** `app/solutions/construction/page.tsx`  
**Purpose:** Construction solution  
**Expected features / buttons:**
- [ ] COI, subs, SB 553 WVPP pitch
- [ ] Doc list
- [ ] CTA
**Actual (scanned from source):**
- h1: _YOUR SUB&apos;S LICENSE SHOWS CLEAR. THEIR WORKERS&apos; COMP LAPSED THREE WEEKS_

### `/solutions/healthcare`
**File:** `app/solutions/healthcare/page.tsx`  
**Purpose:** Healthcare solution  
**Expected features / buttons:**
- [ ] HIPAA SRA, BBP, ATD, BAA tracker pitch
- [ ] Doc list
- [ ] CTA
**Actual (scanned from source):**
- h1: _CAL/OSHA HEALTHCARE COMPLIANCE_

### `/solutions/real-estate`
**File:** `app/solutions/real-estate/page.tsx`  
**Purpose:** Real-estate solution  
**Expected features / buttons:**
- [ ] Property portfolio + vendor COI pitch
- [ ] Doc list
- [ ] CTA
**Actual (scanned from source):**
- h1: _HABITABILITY COMPLIANCE_


## 3. Blog & Resources (6 pages)

### `/blog`
**File:** `app/blog/page.tsx`  
**Purpose:** Blog index  
**Expected features / buttons:**
- [ ] Hero pill-category filter (URL-shareable)
- [ ] Tier tabs
- [ ] Article grid
- [ ] Pagination
**Actual (scanned from source):**
- h1: _The Protekon Blog_
- meta.title: _Compliance Intelligence Blog | PROTEKON_

### `/blog/[slug]`
**File:** `app/blog/[slug]/page.tsx`  
**Purpose:** Blog post  
**Expected features / buttons:**
- [ ] Cover image section (bg-parchment, -mt-8)
- [ ] PortableText body
- [ ] Related posts
- [ ] Newsletter CTA
**Actual (scanned from source):**
- h1: _{post.title}_

### `/blog/category/[slug]`
**File:** `app/blog/category/[slug]/page.tsx`  
**Purpose:** Blog category archive  
**Expected features / buttons:**
- [ ] Filtered article grid
**Actual (scanned from source):**
- h1: _{categoryTitle}_

### `/resources`
**File:** `app/resources/page.tsx`  
**Purpose:** Resources hub  
**Expected features / buttons:**
- [ ] Categories: articles / guides / whitepapers / templates
**Actual (scanned from source):**
- meta.title: _Compliance Resources & Guides | PROTEKON_

### `/resources/[slug]`
**File:** `app/resources/[slug]/page.tsx`  
**Purpose:** Resource page  
**Expected features / buttons:**
- [ ] Cover image + PortableText body
- [ ] Download CTA (email gate)
**Actual (scanned from source):**
- h1: _{resource.title}_

### `/resources/articles`
**File:** `app/resources/articles/page.tsx`  
**Purpose:** Articles index under resources  
**Expected features / buttons:**
- [ ] Article grid
**Actual (scanned from source):**
- h1: _All Resources_
- meta.title: _Compliance Articles, Guides & Templates_


## 4. Score Tool (lead-gen funnel) (5 pages)

### `/score`
**File:** `app/score/page.tsx`  
**Purpose:** Posture score tool — funnel entry  
**Expected features / buttons:**
- [ ] Industry picker
- [ ] Routes to /score/california or /score/trade/[trade]
- [ ] Explainer copy
**Actual (scanned from source):**
- meta.title: _Free Compliance Score | PROTEKON_

### `/score/california`
**File:** `app/score/california/page.tsx`  
**Purpose:** CA benchmark score  
**Expected features / buttons:**
- [ ] Score percentile display
- [ ] CTA to get full report via email gate
**Actual (scanned from source):**
- h1: _Cal/OSHA fined_

### `/score/national`
**File:** `app/score/national/page.tsx`  
**Purpose:** National benchmark score  
**Expected features / buttons:**
- [ ] Score display
- [ ] CTA
**Actual (scanned from source):**
- h1: _OSHA issued_

### `/score/state/[state]`
**File:** `app/score/state/[state]/page.tsx`  
**Purpose:** Per-state score  
**Expected features / buttons:**
- [ ] State-filtered benchmark
- [ ] CTA

### `/score/trade/[trade]`
**File:** `app/score/trade/[trade]/page.tsx`  
**Purpose:** Per-trade score  
**Expected features / buttons:**
- [ ] Trade-filtered benchmark
- [ ] CTA


## 5. Partners Marketing (channel-partner pitch) (4 pages)

### `/partners`
**File:** `app/partners/page.tsx`  
**Purpose:** Partner program landing (channel-partner marketing)  
**Expected features / buttons:**
- [ ] ScalePad-style pitch
- [ ] Boot-camp CTA
- [ ] Pricing preview
- [ ] Apply CTA to /partners/apply

### `/partners/apply`
**File:** `app/partners/apply/page.tsx`  
**Purpose:** Partner application form  
**Expected features / buttons:**
- [ ] Multi-field form
- [ ] Submit to /api/partners/apply
- [ ] Success state
**Actual (scanned from source):**
- h1: _Application received._
- server actions imported: score

### `/partners/boot-camp`
**File:** `app/partners/boot-camp/page.tsx`  
**Purpose:** Partner boot-camp marketing  
**Expected features / buttons:**
- [ ] Agenda
- [ ] Sign-up CTA

### `/partners/pricing`
**File:** `app/partners/pricing/page.tsx`  
**Purpose:** Partner pricing / revenue split  
**Expected features / buttons:**
- [ ] Wholesale pricing
- [ ] Margin calculator


## 6. Auth (3 pages)

### `/forgot-password`
**File:** `app/forgot-password/page.tsx`  
**Purpose:** Forgot password  
**Expected features / buttons:**
- [ ] Email field
- [ ] Submit sends magic link
- [ ] Success state
**Actual (scanned from source):**
- h1: _Check Your Email_
- 1 form(s) on page
- server actions imported: auth

### `/login`
**File:** `app/login/page.tsx`  
**Purpose:** Login  
**Expected features / buttons:**
- [ ] Email + password
- [ ] Magic link option
- [ ] Error state
- [ ] Forgot-password link
- [ ] Signup link
**Actual (scanned from source):**
- h1: _Sign In_
- 1 form(s) on page
- server actions imported: auth

### `/signup`
**File:** `app/signup/page.tsx`  
**Purpose:** Signup (self-serve)  
**Expected features / buttons:**
- [ ] Email + password + business name
- [ ] Terms checkbox
- [ ] Submit fires auth/user.signed-up then Stripe checkout redirect
**Actual (scanned from source):**
- h1: _{step === 1 ? "Create Your Account" : "What should we call you?"}_
- 1 form(s) on page
- server actions imported: auth


## 7. Onboarding Wizard (post-signup, gated) (8 pages)

### `/onboarding`
**File:** `app/onboarding/page.tsx`  
**Purpose:** Onboarding router  
**Expected features / buttons:**
- [ ] Reads client.last_onboarding_step_completed
- [ ] Redirects to correct step or /dashboard if completed
**Actual (scanned from source):**
- server actions imported: onboarding/state

### `/onboarding/automations`
**File:** `app/onboarding/automations/page.tsx`  
**Purpose:** Step 7 — Automations  
**Expected features / buttons:**
- [ ] Toggles: expirationSweep, regulatoryAlerts, thirdPartyCoiRequests
- [ ] Finish stamps onboarding_status=completed and redirects to /dashboard
**Actual (scanned from source):**
- server actions imported: onboarding/state

### `/onboarding/business`
**File:** `app/onboarding/business/page.tsx`  
**Purpose:** Step 1 — Business snapshot  
**Expected features / buttons:**
- [ ] Vertical Popover+Command select
- [ ] Worker count
- [ ] States multi-select (Popover+Command)
- [ ] Continue to /onboarding/tools
**Actual (scanned from source):**
- server actions imported: onboarding/state

### `/onboarding/documents`
**File:** `app/onboarding/documents/page.tsx`  
**Purpose:** Step 6 — Documents  
**Expected features / buttons:**
- [ ] Required + recommended doc pickers from vertical config
- [ ] Upload to /api/onboarding/documents/upload (Vercel Blob)
**Actual (scanned from source):**
- server actions imported: onboarding/state

### `/onboarding/people`
**File:** `app/onboarding/people/page.tsx`  
**Purpose:** Step 4 — People/workers  
**Expected features / buttons:**
- [ ] CSV upload to /api/onboarding/workers/csv
- [ ] Add-one flow
- [ ] Continue
**Actual (scanned from source):**
- server actions imported: onboarding/state

### `/onboarding/sites`
**File:** `app/onboarding/sites/page.tsx`  
**Purpose:** Step 3 — Sites (conditional)  
**Expected features / buttons:**
- [ ] Hidden for single-location verticals (staffing, building_services, facilities_mgmt, security)
- [ ] Add/edit/remove site forms
**Actual (scanned from source):**
- server actions imported: onboarding/state

### `/onboarding/subs`
**File:** `app/onboarding/subs/page.tsx`  
**Purpose:** Step 5 — Third parties (conditional)  
**Expected features / buttons:**
- [ ] Hidden when vertical.stepVisibility.thirdParties is false
- [ ] Add subs/vendors/client-sites per vertical terminology
**Actual (scanned from source):**
- server actions imported: onboarding/state

### `/onboarding/tools`
**File:** `app/onboarding/tools/page.tsx`  
**Purpose:** Step 2 — Current tools & gaps  
**Expected features / buttons:**
- [ ] Tool checklist
- [ ] Known gaps
- [ ] Continue
**Actual (scanned from source):**
- server actions imported: onboarding/state


## 8. Internal Dashboard (authed client portal) (28 pages)

### `/dashboard`
**File:** `app/dashboard/page.tsx`  
**Purpose:** Overview  
**Expected features / buttons:**
- [ ] Posture score card
- [ ] Company / Sites / Workers / Subs / Documents counts (gated by completedSteps)
- [ ] Upcoming expirations feed
- [ ] Recent activity feed
- [ ] Quick-action tiles

### `/dashboard/acknowledgments`
**File:** `app/dashboard/acknowledgments/page.tsx`  
**Purpose:** Acknowledgments  
**Expected features / buttons:**
- [ ] Pending / Signed / Expired tabs
- [ ] Resend link button
- [ ] Download signed PDF
- [ ] Filter by employee/document
**Actual (scanned from source):**
- server actions imported: acknowledgments

### `/dashboard/activity`
**File:** `app/dashboard/activity/page.tsx`  
**Purpose:** Activity feed  
**Expected features / buttons:**
- [ ] System + user event log
- [ ] Filter by type/user
- [ ] Export CSV
**Actual (scanned from source):**
- server actions imported: audit-trail, alerts

### `/dashboard/audit-trail`
**File:** `app/dashboard/audit-trail/page.tsx`  
**Purpose:** Audit trail  
**Expected features / buttons:**
- [ ] Immutable who/what/when/where log
- [ ] Filter by entity/actor
- [ ] Export audit package to /api/export/audit-package
**Actual (scanned from source):**
- 1 form(s) on page
- server actions imported: audit-trail

### `/dashboard/benchmarks`
**File:** `app/dashboard/benchmarks/page.tsx`  
**Purpose:** Benchmarks  
**Expected features / buttons:**
- [ ] Peer/industry comparison score
- [ ] Per-category breakdowns
- [ ] Drill-downs
**Actual (scanned from source):**
- server actions imported: osha, rollup

### `/dashboard/briefing`
**File:** `app/dashboard/briefing/page.tsx`  
**Purpose:** AI briefing  
**Expected features / buttons:**
- [ ] Chat interface to /api/chat
- [ ] Context-aware compliance Q&A

### `/dashboard/calendar`
**File:** `app/dashboard/calendar/page.tsx`  
**Purpose:** Compliance calendar  
**Expected features / buttons:**
- [ ] Monthly grid of due dates
- [ ] Color-coded priority
- [ ] Export to ICS
**Actual (scanned from source):**
- server actions imported: calendar

### `/dashboard/coi-verification`
**File:** `app/dashboard/coi-verification/page.tsx`  
**Purpose:** COI verification  
**Expected features / buttons:**
- [ ] Upload COI to /api/construction/coi-upload
- [ ] AI extraction status
- [ ] Coverage-vs-requirement diff
- [ ] Approve/reject
**Actual (scanned from source):**
- server actions imported: coi, construction

### `/dashboard/coverage`
**File:** `app/dashboard/coverage/page.tsx`  
**Purpose:** Coverage index  
**Expected features / buttons:**
- [ ] 9 coverage types grid (compliance_calendar, enforcement_alerts, industry stats, nearby enforcement, regulatory updates, etc.)
- [ ] Link into each type

### `/dashboard/coverage/[type]`
**File:** `app/dashboard/coverage/[type]/page.tsx`  
**Purpose:** Coverage type list  
**Expected features / buttons:**
- [ ] Table of resources (v2 drill-down v1 template)
- [ ] Search/sort
- [ ] Row links to /dashboard/coverage/[type]/[id]

### `/dashboard/coverage/[type]/[id]`
**File:** `app/dashboard/coverage/[type]/[id]/page.tsx`  
**Purpose:** Coverage detail  
**Expected features / buttons:**
- [ ] 3-section layout: summary / details / scope
- [ ] String-only columns per Session 29 pattern

### `/dashboard/documents`
**File:** `app/dashboard/documents/page.tsx`  
**Purpose:** Documents hub  
**Expected features / buttons:**
- [ ] Generated + uploaded docs table
- [ ] Generate-new flow (category + AI generate)
- [ ] Download signed/versioned PDFs
- [ ] Request-new fires document-generation event
**Actual (scanned from source):**
- server actions imported: documents

### `/dashboard/form-1099`
**File:** `app/dashboard/form-1099/page.tsx`  
**Purpose:** 1099 tooling  
**Expected features / buttons:**
- [ ] Subcontractor 1099 tracking
- [ ] Threshold alerts
- [ ] Export
**Actual (scanned from source):**
- server actions imported: nec-1099, construction

### `/dashboard/incidents`
**File:** `app/dashboard/incidents/page.tsx`  
**Purpose:** Incident log  
**Expected features / buttons:**
- [ ] Report new (SB 553 PII-stripped)
- [ ] Log list
- [ ] Follow-up schedule
- [ ] Export to /api/export/incidents
**Actual (scanned from source):**
- server actions imported: incidents

### `/dashboard/integrations`
**File:** `app/dashboard/integrations/page.tsx`  
**Purpose:** Integrations  
**Expected features / buttons:**
- [ ] Connect/disconnect per provider
- [ ] Authorize flow to /api/integrations/[provider]/authorize then callback
- [ ] Status per integration
**Actual (scanned from source):**
- server actions imported: integrations

### `/dashboard/knowledge`
**File:** `app/dashboard/knowledge/page.tsx`  
**Purpose:** Knowledge base  
**Expected features / buttons:**
- [ ] Searchable internal KB
- [ ] Per-topic articles
- [ ] Possibly vector-indexed via Upstash
**Actual (scanned from source):**
- server actions imported: knowledge

### `/dashboard/marketplace`
**File:** `app/dashboard/marketplace/page.tsx`  
**Purpose:** Client-side marketplace  
**Expected features / buttons:**
- [ ] Add-ons/integrations user can enable
- [ ] Per-item detail + install CTA

### `/dashboard/my-business`
**File:** `app/dashboard/my-business/page.tsx`  
**Purpose:** Business profile  
**Expected features / buttons:**
- [ ] Edit client row fields
- [ ] Vertical, states, EIN, address
- [ ] Save via server action
**Actual (scanned from source):**
- server actions imported: settings, sites

### `/dashboard/pipeline`
**File:** `app/dashboard/pipeline/page.tsx`  
**Purpose:** Pipeline  
**Expected features / buttons:**
- [ ] VERIFY WITH IAN: sales/deal pipeline concept — confirm intent
**Actual (scanned from source):**
- server actions imported: reports

### `/dashboard/projects`
**File:** `app/dashboard/projects/page.tsx`  
**Purpose:** Projects  
**Expected features / buttons:**
- [ ] Per-project compliance rollup
- [ ] Add project
- [ ] Assign sites/workers/docs
**Actual (scanned from source):**
- server actions imported: projects, construction

### `/dashboard/reg-changes`
**File:** `app/dashboard/reg-changes/page.tsx`  
**Purpose:** Regulatory changes feed  
**Expected features / buttons:**
- [ ] Recent regulatory updates for client vertical + states
- [ ] Acknowledge/mute
- [ ] Cron-driven by regulatory-scan
**Actual (scanned from source):**
- server actions imported: reports

### `/dashboard/safety-programs`
**File:** `app/dashboard/safety-programs/page.tsx`  
**Purpose:** Safety programs  
**Expected features / buttons:**
- [ ] Required + optional program list
- [ ] Per-program status: drafted / signed / expired
- [ ] Per-program action triggers document generation
**Actual (scanned from source):**
- server actions imported: safety-programs, construction

### `/dashboard/scheduled-reports`
**File:** `app/dashboard/scheduled-reports/page.tsx`  
**Purpose:** Scheduled reports  
**Expected features / buttons:**
- [ ] Report cadence config
- [ ] Recipient list
- [ ] Next-delivery preview
**Actual (scanned from source):**
- server actions imported: scheduled-deliveries

### `/dashboard/sub-onboarding`
**File:** `app/dashboard/sub-onboarding/page.tsx`  
**Purpose:** Sub-onboarding admin  
**Expected features / buttons:**
- [ ] Invite subs via token links (/sub/[token])
- [ ] Status tracker
- [ ] Resend/revoke
**Actual (scanned from source):**
- server actions imported: sub-onboarding

### `/dashboard/team`
**File:** `app/dashboard/team/page.tsx`  
**Purpose:** Team (internal users)  
**Expected features / buttons:**
- [ ] Invite team member via email to /team/invite/[token]
- [ ] Role assignment (user_roles table, migration 047)
- [ ] Remove user
**Actual (scanned from source):**
- server actions imported: team

### `/dashboard/training`
**File:** `app/dashboard/training/page.tsx`  
**Purpose:** Training records  
**Expected features / buttons:**
- [ ] Required trainings per vertical
- [ ] Assign to workers
- [ ] Track completion
- [ ] Material viewer /api/training/materials/[slug]
**Actual (scanned from source):**
- server actions imported: training

### `/dashboard/vendor-risk`
**File:** `app/dashboard/vendor-risk/page.tsx`  
**Purpose:** Vendor risk  
**Expected features / buttons:**
- [ ] Vendor/sub roster with COI + license status
- [ ] Risk scoring
- [ ] Request COI renewal
**Actual (scanned from source):**
- server actions imported: vendor-risk

### `/dashboard/whats-happening`
**File:** `app/dashboard/whats-happening/page.tsx`  
**Purpose:** Whats-happening feed  
**Expected features / buttons:**
- [ ] Curated news + enforcement events for client
**Actual (scanned from source):**
- server actions imported: osha


## 9. Partner Portal (authed partner portal) (5 pages)

### `/partner/assessments`
**File:** `app/partner/assessments/page.tsx`  
**Purpose:** Partner assessments  
**Expected features / buttons:**
- [ ] Assessment tool for leads at /api/partner/assessments
- [ ] Lead capture
- [ ] Send-assessment CTA
**Actual (scanned from source):**
- h1: _Assessments_
- server actions imported: partner-portal

### `/partner/branding`
**File:** `app/partner/branding/page.tsx`  
**Purpose:** Partner white-label branding  
**Expected features / buttons:**
- [ ] Logo upload
- [ ] Color palette
- [ ] Subdomain / custom domain
**Actual (scanned from source):**
- h1: _White-Label Branding_
- meta.title: _Branding — Partner Portal | Protekon_
- server actions imported: partner-branding

### `/partner/enablement`
**File:** `app/partner/enablement/page.tsx`  
**Purpose:** Partner enablement hub  
**Expected features / buttons:**
- [ ] Sales collateral, decks, scripts
**Actual (scanned from source):**
- h1: _Build the practice._
- meta.title: _Partner Enablement | PROTEKON_

### `/partner/enablement/[slug]`
**File:** `app/partner/enablement/[slug]/page.tsx`  
**Purpose:** Enablement asset  
**Expected features / buttons:**
- [ ] Asset detail + download

### `/partner/settings`
**File:** `app/partner/settings/page.tsx`  
**Purpose:** Partner account settings  
**Expected features / buttons:**
- [ ] Team members
- [ ] Payout info
- [ ] API keys
**Actual (scanned from source):**
- h1: _Partner Settings_
- 3 form(s) on page
- server actions imported: partner-portal


## 10. Token-Gated Public Pages (3 pages)

### `/ack/[token]`
**File:** `app/ack/[token]/page.tsx`  
**Purpose:** Token-gated acknowledgment  
**Expected features / buttons:**
- [ ] Read-only doc view
- [ ] E-signature pad
- [ ] Sign posts to /api/ack/sign/[token] and stamps audit_log
**Actual (scanned from source):**
- h1: _{title}_

### `/sub/[token]`
**File:** `app/sub/[token]/page.tsx`  
**Purpose:** Token-gated subcontractor onboarding  
**Expected features / buttons:**
- [ ] Self-service intake for subs invited by client
- [ ] Upload COI/W9
- [ ] Submit to /api/sub-onboarding/submit/[token]
**Actual (scanned from source):**
- h1: _{title}_

### `/team/invite/[token]`
**File:** `app/team/invite/[token]/page.tsx`  
**Purpose:** Token-gated team invite  
**Expected features / buttons:**
- [ ] Accept invite creates auth user and assigns role
- [ ] Sets user_roles row


## 11. Admin / Content Studio (1 pages)

### `/studio/[[...tool]]`
**File:** `app/studio/[[...tool]]/page.tsx`  
**Purpose:** Sanity Studio catch-all  
**Expected features / buttons:**
- [ ] Same as /studio


## 12. Legal (2 pages)

### `/privacy`
**File:** `app/privacy/page.tsx`  
**Purpose:** Privacy policy  
**Expected features / buttons:**
- [ ] Static legal copy
**Actual (scanned from source):**
- h1: _PRIVACY POLICY_

### `/terms`
**File:** `app/terms/page.tsx`  
**Purpose:** Terms of service  
**Expected features / buttons:**
- [ ] Static legal copy
**Actual (scanned from source):**
- h1: _TERMS OF SERVICE_
