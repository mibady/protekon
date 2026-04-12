# New Source Publications — Extracted Data for Protekon App

> Extracted from 8 new source documents added 2026-04-12
> These supplement the original 16 OSHA publications in `extracted-data.md`
> Covers: HIPAA, BAA, ATD, DOT/FMCSA, Machine Guarding, Silica, Pesticide Safety, Rent Control, Spray Booth

---

## 17. Guide to Privacy and Security of Electronic Health Information (ONC/HHS, v2.0, April 2015)

**Category:** HIPAA / Healthcare Privacy & Security
**Source File:** `privacy-and-security-guide.pdf` (62 pages)
**Template:** HIPAA Security Risk Analysis
**Regulation:** HIPAA Privacy Rule (45 CFR Part 160 & 164), Security Rule, Breach Notification Rule

### Key Entities
- **Covered Entities (CEs):** Health care providers who bill electronically, health plans, clearinghouses
- **Business Associates (BAs):** Persons/entities performing functions involving PHI access (claims processing, IT management, data analysis, etc.)
- BAs are **directly liable** for Security Rule and Breach Notification Rule violations

### HIPAA Privacy Rule — Uses & Disclosures
- **No authorization needed:** Treatment, payment, health care operations; disclosures to family/friends involved in care; public health reporting; preventing imminent danger
- **Authorization required:** Psychotherapy notes, marketing, PHI sales/licensing, research (in some cases)
- **Minimum necessary standard:** Use only the minimum PHI needed for the purpose
- **De-identified data:** Not PHI if properly de-identified (expert determination or 18 identifiers removed)

### Patient Rights
- Notice of Privacy Practices (NPP) — must be provided at first visit
- Right to access/copy PHI (30 days to respond; 4 business days for Meaningful Use)
- Right to request amendments (60 days to respond)
- Right to accounting of disclosures (6-year lookback)
- Right to restrict disclosures (mandatory if patient pays out-of-pocket in full)
- Right to confidential communications

### HIPAA Security Rule — 5 Components
1. **Administrative Safeguards:** Security officer, risk analysis, workforce training, sanctions policy
2. **Physical Safeguards:** Facility access controls, workstation security, device/media controls
3. **Technical Safeguards:** Access controls, audit logs, integrity controls, encryption, auto-logoff
4. **Organizational Standards:** BA agreements, group health plan requirements
5. **Policies & Procedures:** Written, reviewed periodically, retained 6+ years

### 7-Step Security Management Process
1. Lead culture, select team, learn (designate security officer)
2. Document process, findings, actions
3. Review existing security of ePHI (perform Security Risk Analysis)
4. Develop action plan (prioritize high-impact risks)
5. Manage and mitigate risks (implement plan, train workforce, communicate with patients, update BA contracts)
6. Attest for Meaningful Use security objective
7. Monitor, audit, and update security ongoing

### Breach Notification
- **Breach:** Impermissible use/disclosure of unsecured PHI that compromises security/privacy
- **Presumed breach** unless risk assessment shows low probability of compromise
- **500+ individuals:** Notify HHS Secretary promptly + media if 500+ in one state
- **<500 individuals:** Notify HHS within 60 days of calendar year end
- **Encryption = safe harbor:** Properly encrypted data is not "unsecured PHI"

### Penalties
| Intent | Min/Incident | Annual Cap |
|--------|-------------|-----------|
| Did not know | $100–$50,000 | $1.5M |
| Reasonable cause | $1,000–$50,000 | $1.5M |
| Willful neglect (corrected <30d) | $10,000–$50,000 | $1.5M |
| Willful neglect (not corrected) | $50,000 | $1.5M |

### Protekon Feature Mapping
- **HIPAA Security Risk Analysis template** — 7-step process, checklists, documentation requirements
- **Client dashboard** — compliance status tracking for HIPAA requirements
- **Document templates** — NPP, BA agreements, breach notification letters
- **Training tracker** — workforce HIPAA training records

---

## 18. Key Privacy and Security Considerations for Healthcare APIs (ONC/HHS, December 2017)

**Category:** HIPAA / API Security
**Source File:** `privacy-security-api.pdf` (25 pages)
**Template:** HIPAA Security Risk Analysis (supplemental — API/tech layer)
**Regulation:** HIPAA, NIST 800-53, OAuth 2.0, SMART on FHIR

### Key Privacy Considerations
1. Enable HIPAA right of access via electronic interface (e-signature, patient portal)
2. Granular patient choice — select specific health info categories to share
3. Clear revocation methods for sharing permissions
4. Organizational privacy policies aligned with NIST 800-53 privacy controls

### Key Security Considerations
1. **Encryption:** TLS 1.2+ with AES cipher suites; disable SSL and early TLS
2. **Input validation:** Prevent fuzzing, injection attacks; disable verbose error messages
3. **Identity proofing:** Verify identity before issuing credentials (NIST SP 800-63a)
4. **Credentialing:** Complex passwords, SHA-2 hashed, securely stored
5. **Authentication:** OpenID Connect + OAuth 2.0; multi-factor preferred
6. **Authorization:** OAuth 2.0 per SMART App Authorization Guide; short-lived tokens
7. **Service provider security:** Evaluate cloud/hosting infrastructure; maintain SLAs
8. **Data integrity:** Monitoring software, DNSSEC, hide HTTP headers
9. **Patient portal security:** XSS prevention with security-encoding libraries
10. **Organizational security policies:** NIST Cybersecurity Framework (Identify, Protect, Detect, Respond, Recover)

### NIST Security Control Families for APIs
| Family | Focus | Key Consideration |
|--------|-------|------------------|
| Access Control (AC) | Confidentiality | Prevent unauthorized data leakage |
| Audit & Accountability (AU) | Confidentiality, Integrity | API audit logging standards |
| Contingency Planning (CP) | Availability | Include API in disaster recovery |
| Identification & Auth (IA) | Confidentiality | Authentication config for API tracking |
| System & Comms Protection (SC) | Confidentiality | Cryptography type/strength requirements |
| System & Info Integrity (SI) | Integrity | Data integrity monitoring for unauthorized changes |

---

## 19. Model Business Associate Agreement (HHS)

**Category:** HIPAA / BAA Template
**Source File:** `model-business-associate-agreement.pdf` (9 pages)
**Template:** BAA Tracker
**Regulation:** 45 CFR §164.501, HIPAA Privacy/Security/Breach Notification Rules, HITECH Act

### Key Definitions
- **PHI:** Protected Health Information created/received by BA from/on behalf of CE
- **Breach:** Acquisition, access, use, or disclosure of PHI not permitted under Privacy Rule
- **Security Incident:** Attempted or successful unauthorized access, use, disclosure, modification, or destruction
- **Unsecured PHI:** PHI not rendered unusable/unreadable/indecipherable per HHS guidance
- **Data Aggregation:** Combining PHI from multiple CEs for analytics
- **Designated Record Set:** Records used to make decisions about individuals

### BA Obligations
1. Use/disclose PHI only as permitted by BAA, Privacy Rule, or law
2. Use **minimum necessary** standard for all uses/disclosures
3. Implement administrative, physical, and technical safeguards for ePHI
4. Report unauthorized uses/disclosures within **5 business days**
5. Report breaches of unsecured PHI within **30 calendar days**
6. Reimburse CE for breach costs caused by BA
7. Mitigate harmful effects of impermissible disclosures
8. Ensure subcontractors agree to same restrictions
9. Notify CE of all subcontracts involving PHI within **30 days** (post on website)
10. Provide audit report (AT-C 315, HITRUST, or equivalent) upon request
11. Furnish PHI copies to CE upon request
12. Forward individual access requests to CE within **10 business days**
13. Amend PHI within **15 business days** of CE request
14. Document and account for all disclosures per 45 CFR §164.528
15. Make books/records available to HHS Secretary

### CE Obligations
- Notify BA of NPP limitations, permission changes, restrictions
- Not request BA to use/disclose PHI in ways CE couldn't under HIPAA

### Termination
- CE may terminate if BA breaches material term (30-day cure period)
- BA may terminate if CE breaches material term (30-day cure period)
- Upon termination: return or destroy all PHI (or extend protections if infeasible)

### Protekon Feature Mapping
- **BAA Tracker template** — fill-in-the-blank agreement with all required clauses
- **Document management** — track active BAAs, expiration dates, subcontractor notifications
- **Compliance dashboard** — BA compliance monitoring, breach notification tracking

---

## 20. Cal/OSHA T8 §5199 — Aerosol Transmissible Diseases Standard

**Category:** Cal/OSHA / Infectious Disease Control
**Source File:** `CalOSHA-T8-5199-ATD-Standard.txt` (saved from web)
**Template:** ATD Plan
**Regulation:** California Code of Regulations, Title 8, Section 5199

### Scope — Covered Facilities
- Hospitals, SNFs, clinics, medical offices, outpatient facilities
- Home health, long-term care, hospice
- Paramedic/EMS (including firefighter-provided)
- Medical transport
- Police services (during transport/detention of ATD cases)
- Public health services (contact tracing, screening)
- Correctional facilities, homeless shelters, drug treatment programs
- Pathology labs, medical examiners, coroners, mortuaries
- Laboratories handling ATPs/ATP-L
- HVAC maintenance in contaminated areas

### Employer Categories
| Category | Requirements |
|----------|-------------|
| **Full Standard** (hospitals, etc.) | Complete ATD Exposure Control Plan — subsections (a)(d)(e)(f)(g)(h)(i)(j) |
| **Referring Employers** (screen & refer) | Reduced — subsections (a)(c)(j) only |
| **Laboratories** | Biosafety Plan — subsections (a)(f)(i)(j) |

### ATD Exposure Control Plan — Required Elements (17 items)
1. Named administrator(s) knowledgeable in infection control
2. Job classifications with occupational exposure
3. High hazard procedures list
4. Tasks requiring PPE/respiratory protection
5. Engineering controls, work practices, decontamination by work area
6. Source control measures
7. AirID case identification, isolation, referral/transfer procedures
8. Medical services procedures including vaccinations
9. Exposure incident response procedures
10. Exposure incident evaluation and corrective action
11. Employee communication procedures for disease status
12. Inter-employer communication for exposure incidents
13. Adequate PPE supply procedures
14. Training procedures
15. Recordkeeping procedures
16. Employee involvement in plan review
17. Surge procedures for epidemics/emergencies

### Engineering Controls — AIIR Requirements
- **Negative pressure** maintained and verified daily (smoke trails)
- **12+ ACH** (minimum 6 ACH outdoor air supply)
- HEPA filtration for recirculated air
- Ducts under negative pressure before filtration
- Doors/windows closed during isolation
- **99.9% removal efficiency** ventilation before unprotected entry after case vacates
- Annual inspection and performance monitoring

### Respiratory Protection
| Situation | Minimum Respirator |
|-----------|-------------------|
| Entering AIIR in use | N95 filtering facepiece |
| High hazard procedures on AirID cases | PAPR with HEPA filter |
| Lab operations | Per Biosafety Plan risk assessment |
| Transporting unmasked AirID case | N95 (PAPR for high hazard) |

### Medical Services
- **TB surveillance:** Annual TB testing; referral for conversions
- **Vaccinations:** All Appendix E vaccines within 10 working days of assignment
- **Seasonal influenza:** Available to all employees with occupational exposure
- **Exposure incidents:**
  - Report RATD cases to local health officer (Title 17)
  - Notify other employers within **72 hours**
  - Exposure analysis within **72 hours**
  - Employee notification within **96 hours**
  - Post-exposure medical evaluation ASAP
- **Precautionary removal:** Full pay/benefits maintained until determined non-infectious

### Training Requirements
- Initial assignment + annually (not to exceed 12 months)
- Interactive Q&A required (within 24 hours if not in-person)
- Content: ATD explanation, transmission modes, exposure control plan, PPE, respirators, TB surveillance, vaccines, exposure incident procedures, surge plan

### Recordkeeping
| Record Type | Retention |
|------------|-----------|
| Medical records | Employment + 30 years |
| Training records | 3 years |
| Plan review records | 3 years |
| Exposure incident records | Per Section 3204 |
| Vaccine unavailability | 3 years |
| AII room unavailability | 3 years |
| Engineering control inspections | 5 years |
| Respiratory protection | Per Section 5144 |

### Protekon Feature Mapping
- **ATD Plan template** — exposure control plan with all 17 required elements
- **Compliance checklist** — AIIR requirements, respirator fit testing schedule
- **Training tracker** — annual ATD training records per employee
- **Medical services** — TB surveillance, vaccination tracking, exposure incident log
- **Document generation** — pre-filled ATD plan based on facility type

---

## 21. Driver Qualification File Checklist (FMCSA, Rev. July 2017)

**Category:** DOT/FMCSA / Transportation Safety
**Source File:** `Driver Qualification Checklist_508.pdf` (2 pages)
**Template:** Driver Qualification File
**Regulation:** 49 CFR 391

### Ongoing Updates (Annual)
| Document | Regulation | Retention |
|----------|-----------|-----------|
| Inquiry to State Agencies for MVR | 49 CFR 391.25(a)(c) | 3 years |
| Review of Driving Record (annual) | 49 CFR 391.25(c)(2) | 3 years |
| Driver's Certification of Violations | 49 CFR 391.27 | 3 years |
| Medical Exam Report & Certificate | 49 CFR 391.43 | 3 years |
| Medical Examiner Registry verification | 49 CFR 391.51(b)(9) | 3 years |

### Initial DQ File Documents
| Document | Regulation | Retention |
|----------|-----------|-----------|
| Application for Employment | 49 CFR 391.21 | Employment + 3 years |
| Road Test Certificate or Equivalent | 49 CFR 391.31(e) | Employment + 3 years |
| Safety Performance History Request | 49 CFR 391.23(a)(1)(b) | Employment + 3 years |
| Driver Correction/Rebuttal (if any) | 49 CFR 391.23(i)(2)(j)(3) | Employment + 3 years |
| 3-Year Driving Record from States | 49 CFR 391.23(a)(1)(b) | Employment + 3 years |
| Pre-Employment Drug & Alcohol Docs | 49 CFR 40.25(j); 382.301 | Per substance abuse chapter |

### Conditional Documents
| Document | Regulation | When Required | Retention |
|----------|-----------|--------------|-----------|
| Entry-Level Driver Training Cert | 49 CFR 380.509(b) | CDL drivers <1yr experience | 3 years |
| LCV Driver Training Certificate | 49 CFR 380.401 | LCV operators | Employment + 3 years |
| LCV Certificate of Grandfathering | 49 CFR 380.111 | LCV operators | Employment + 3 years |
| Multiple-Employer Drivers | 49 CFR 391.63 | Multi-employer drivers | Employment + 3 years |
| Skill Performance Evaluation Cert | 49 CFR 391.49 | Specific situations | 3 years |

### Key Requirements
- **30-day deadline:** Previous employer investigation and state MVR request must be completed within 30 days of hire
- **Annual reviews:** MVR from state agencies, driving record review, violation certification, medical exam — all annually
- **Medical examiner:** Must verify examiner is on National Registry of Certified Medical Examiners
- **Drug/alcohol:** Must ask about positive tests or refusals in past 3 years before hire

### Protekon Feature Mapping
- **DQ File template** — checklist with all required documents and retention periods
- **Compliance dashboard** — track annual renewal dates, flag overdue items
- **Document upload** — store MVRs, medical certificates, training certs
- **Alert system** — notify before medical exam expiration (24-month cycle)

---

## 22. Cal/OSHA Guide for the Manufacturing Industry (DOSH)

**Category:** Cal/OSHA / Manufacturing Safety
**Source File:** `Manufacturing Guide - DOSH.pdf` (48 pages)
**Template:** Machine Guarding + Spray Booth Maintenance
**Regulation:** California Code of Regulations, Title 8 (various sections)

### Machine Guarding (T8 §3942-4186)

#### General Guarding Requirements (§3942)
- Guards must be properly designed, substantial, and secured in place
- Guard clearance from moving parts per Table G-1 (material type × distance × mesh size)
- Guards must allow access for adjustment/lubrication

#### Points of Operation (§4184)
- Machines with grinding, shearing, punching, pressing, squeezing, drawing, cutting, rolling, mixing that present hazard **must be guarded**
- Foot-operated devices (treadles, pedals, switches) protected from unintended operation (§4185)

#### Process Machine Power Control (§4000)
- Prime mover stopping device within easy reach of operator
- Emergency disconnect within easy reach (§4001)
- Controls interlocked for multi-operator machines (§4000(c))
- Controls designed to prevent accidental operation (§4000(d))

#### Specific Equipment Requirements
| Equipment | Key Guard Requirements | Section |
|-----------|---------------------|---------|
| Grinders (stationary) | Safe foundations, band clamps, standard wheel/arbor guards | §3576 |
| Grinders (portable) | 180° max exposure, guard between operator and wheel | §3583(d) |
| Pulleys & Belts | Enclosed or guarded within 7 feet of work surface | §4060-4071 |
| Saws (circular) | Hood covering blade, anti-kickback device | §4300-4312 |
| Presses | Point-of-operation guards, two-hand controls, interlocks | §4202-4211 |
| Die casting (hot) | Two-hand controls or constant pressure single control | §4261 |
| Die casting (cold) | Two-hand controls or interlocking gate guard | §4261 |
| Forging machines | Flywheel stop, ram block | §4239 |

#### Lockout/Blockout (§3314)
- Mechanical blocks to prevent accidental movement
- De-energize electrical equipment before working on it
- Disconnect shall be locked open (§2320.4)

### Spray Booth / Coating Operations (T8 §5153)

#### Ventilation Requirements
- Confine spray coating to properly constructed and ventilated booths (§5153(a))
- **Mechanical ventilation throughout spraying** and for sufficient time after operation (§5153(b)(1))
- Flammable vapors kept to **<20% of lower explosive limit** (§5153(d))
- Spray booth operator must wear **respirator** when downstream from spray object (§5153(g))
- Completely enclose operations that disperse hazardous liquid above open-surface tanks (§5154(i))

#### Spray Cleaning & Degreasing (§5154)
- Vapor degreasing: maintain vapor level below top edge of tank (§5154(h)(1))
- Design solvent control systems to prevent overheating (§5154(h)(1))
- Clean-out doors on degreasing equipment (§5154(h)(2))

#### Ventilation General (§5143)
- Design exhaust ducts to prevent collapse (§5143(a)(2))
- Inspection doors every 12 feet for ducts up to 12" diameter (§5143(a)(3))
- Clean-out door for fan servicing and drain (§5143(a)(3))
- Do not connect two+ operations to same exhaust if combination may ignite/react (§5143(a)(4))
- Test ventilation rate after installation, alterations, or maintenance, and at least **annually** (§5143(a)(5))
- Keep test records for at least **5 years** (§5143(a)(5))
- Operate system continuously during process and after completion per conditions (§5143(b))

### Protekon Feature Mapping
- **Machine Guarding template** — equipment-specific guard requirements with Cal/OSHA sections
- **Spray Booth Maintenance template** — ventilation testing schedule, vapor monitoring, PPE requirements
- **Compliance checklist** — guard inspection items per equipment type
- **Ventilation log** — annual testing records (5-year retention per §5143(a)(5))

---

## 23. Pesticide Training — Employer's Written Handler Training Program (Cal EPA/DPR, Rev. 10/2023)

**Category:** Cal EPA / Pesticide Safety
**Source File:** `enf_23-20_1.pdf` (4 pages)
**Template:** Pesticide Safety
**Regulation:** 3 CCR Section 6724

### Trainer Qualifications (for restricted materials / agricultural production)
- California certified applicator (commercial or private)
- Agricultural Pest Control Adviser
- County Biologist License (Pesticide Regulation or Investigation/Environmental Monitoring)
- UC Extension Advisor
- Instructor training program graduate
- California Registered Professional Forester
- Other DPR-approved qualification

### Program Requirements
- **Written program** must be maintained while in use + **2 years after retirement**
- Training in a manner employee can understand, at distraction-free location
- Must be completed **before** employee handles pesticides
- Updated for any new pesticides or training topics
- Repeated **at least annually**
- Trainer must be **present throughout entire presentation** and respond to questions

### Required Training Topics (Yes/No checklist)
1. Pesticide product labeling — precautionary statements, required PPE
2. Applicator responsibility to protect persons, animals, property
3. Need for, limitations, use, removal, sanitation of required PPE
4. Safety requirements — engineering controls, handling, transporting, storing, disposing, spill cleanup
5. Where/how pesticides may be encountered (surfaces, residues, clothing, drift)
6. Hazards — acute, chronic, delayed effects, sensitization (per labeling, SDS, PSIS)
7. Routes of body entry
8. Signs and symptoms of overexposure
9. Routine decontamination procedures (hand washing, shower, change clothes, wash work clothes separately)
10. How SDSs provide hazard/emergency/treatment information
11. Hazard communication program (§6723) — location of use records, PSIS leaflets, SDSs
12. Medical supervision requirements for organophosphate/carbamate pesticides (DANGER/WARNING signal word)
13. First aid, emergency decontamination, eye flushing
14. How/when to obtain emergency medical care
15. Heat-related illness prevention (T8 CCR §3395)
16. Regulatory requirements (§6602-6793) — labeling, measurement, equipment maintenance, PPE, storage/transport, application exclusion zones, early entry, minimal exposure pesticides
17. Environmental concerns — drift, runoff, wildlife, bee protection
18. Field posting and restricted entry intervals (agricultural)
19. No taking pesticides/containers home
20. Hazards to children and pregnant women
21. How to report suspected violations
22. Restricted Use Pesticide / California restricted material identification
23. Certified applicator supervision requirements
24. Employee rights (information access, physician access, anti-retaliation, violation reporting)

### PSIS Leaflets Referenced
- A-1 through A-10
- N-1 through N-8

### Protekon Feature Mapping
- **Pesticide Safety template** — pre-filled handler training program with all 24 topics
- **Training tracker** — annual completion dates per employee
- **Document management** — PSIS leaflet tracking, SDS inventory
- **Compliance checklist** — trainer qualification verification

---

## 24. Model Business Associate Agreement (HHS/OCR)

*See entry #19 above — same document.*

---

## 25. 2025 Landlord Tenant Guide

**Category:** Civil Law / Real Estate
**Source File:** `2025_Landlord_Tenant_Guide.pdf`
**Template:** Rent Control Guide
**Regulation:** CA AB 1482 (Tenant Protection Act) + local codes

**Note:** PDF could not be fully rendered (requires poppler-utils). Based on filename and context, this is a 2025 California landlord-tenant rights guide that should cover:

### Expected Content (to verify when rendering available)
- AB 1482 Tenant Protection Act (rent caps, just cause eviction)
- Security deposit rules (AB 12 — 2024 changes)
- Habitability standards
- Repair and maintenance obligations
- Notice requirements (3-day, 30-day, 60-day, 90-day)
- Rent increase limitations (5% + CPI, max 10%)
- Just cause eviction requirements
- Local rent control ordinances (LA, SF, Oakland, etc.)
- Tenant rights and remedies
- Landlord rights and remedies

### Protekon Feature Mapping
- **Rent Control Guide template** — compliance checklist for CA landlord-tenant law
- **Real estate vertical** — property management compliance tracking
- **Alert system** — rent increase cap calculations, notice period reminders

---

## 26. Silica Exposure Control Model Program

**Category:** OSHA / Construction Safety
**Source File:** `Silica-exposure-control-model.docx`
**Template:** Silica Exposure Control
**Regulation:** 29 CFR 1926.1153

**Note:** DOCX format — could not be directly read. Based on filename, this is OSHA's model exposure control plan for respirable crystalline silica in construction.

### Expected Content (to verify when DOCX readable)
- Written exposure control plan requirements
- Table 1 compliance (specified exposure control methods per task)
- Alternative exposure control methods
- Exposure assessment procedures
- Engineering controls (wet methods, ventilation, enclosed cabs)
- Respiratory protection requirements
- Medical surveillance (initial and periodic)
- Housekeeping practices
- Training requirements
- Recordkeeping

### Key Thresholds
- **PEL:** 50 µg/m³ (8-hour TWA)
- **Action Level:** 25 µg/m³ (8-hour TWA)
- **Medical surveillance:** Required for employees exposed above PEL for 30+ days/year

### Protekon Feature Mapping
- **Silica Exposure Control template** — model written plan with Table 1 controls
- **Construction vertical** — silica-specific compliance checklist
- **Medical surveillance** — tracking exposure duration and exam schedule
- **Training tracker** — silica awareness training records

---

## 27. Machine Guarding Presentation (Cal/OSHA)

**Category:** Cal/OSHA / Machine Guarding
**Source File:** `Machine Guarding.pptx`
**Template:** Machine Guarding (supplemental to Manufacturing Guide)
**Regulation:** Cal/OSHA T8 §4001-4005 + related sections

**Note:** PPTX format — could not be directly read. This likely contains:
- Visual examples of proper machine guarding
- Guard types (barrier, interlocked, adjustable, self-adjusting)
- Point-of-operation protection methods
- Common violations with photos
- Cal/OSHA citation examples

### Protekon Feature Mapping
- **Machine Guarding template** — supplement to Manufacturing Guide extraction
- **Training materials** — visual aids for machine guarding training
