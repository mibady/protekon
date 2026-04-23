# Architectural Framework and Regulatory Mapping for Multi-Vertical Enterprise Compliance Software

> Reference material for the Protekon vertical config rollout. Captures
> worker/third-party/location terminology, compliance document categories,
> NAICS/SIC codes, and regulatory bodies across 27 industry verticals.
> Used as input when building `lib/onboarding/verticals/<slug>.ts` configs.
>
> See `lib/onboarding/verticals/` for the canonical source-of-truth configs
> and `MEMORY.md → Vertical config coverage + rollout` for the tiered
> rollout plan. This document is reference, not source of truth.

## Executive Overview and Architectural Imperatives

The development of enterprise compliance software capable of serving heterogeneous industry verticals requires a highly adaptable, multi-tenant architecture grounded in a robust ontological framework. Organizations increasingly recognize that the financial repercussions of non-compliance are severe, with the cost of non-compliance averaging nearly three times the cost of proactive compliance measures. A minor oversight in regulatory adherence can rapidly cascade into devastating financial penalties; for example, failures to secure protected health data can result in penalties ranging from $141 to over $2.1 million per violation under specific federal frameworks.

A monolithic software architecture cannot accommodate the semantic and regulatory diversity of 27 distinct industry verticals. An application deployed across multiple sectors must dynamically map core relational database entities — such as human capital, external entities, physical geographies, and regulatory documentation — to industry-specific terminology. A failure to localize terminology (e.g., calling a maritime "Vessel" a "Facility," or a television production "Artiste" an "Operator") results in severe friction in user adoption and auditing processes.

## Taxonomical Modeling and Third-Party Risk Management

Before mapping individual verticals, the software must establish an underlying data schema that supports Third-Party Risk Management (TPRM) and internal auditing frameworks. TPRM is a broad risk management discipline encompassing all external entities whose actions or network access may pose risks to the organization.

The software must categorize users and entities using a fluid terminology matrix based on the client's selected NAICS code. Core entities dictating the application's underlying IAM schema:

- **Internal workers** — employees directly managed by the organization. KYE metrics, training certifications, exclusion screening, union affiliations.
- **External workforce** — third parties requiring KYS/KYB due diligence, inherent-risk evaluation, SLAs.
- **Work locations** — physical/digital nodes where operations occur. Interdependency mapping to evaluate concentration risk.

## Sector Group 1: Healthcare, Pharmaceuticals, and Social Assistance

Clinical healthcare requires rigorous management of Protected Health Information (PHI) and electronic PHI (ePHI). Under HIPAA (enforced by HHS/OCR), any software handling patient data must facilitate Business Associate Agreements (BAAs) with all third-party vendors. Employee/medical-staff screening against federal exclusion lists creates immediate False Claims Act liability if missed.

Pharmaceutical and medical-device manufacturing require Good Manufacturing Practice (GMP) compliance — equipment sanitation, material traceability, personnel hygiene, written procedures for every process. Assisted living tracks specialized licenses, caregiver background checks, and state-health-department (e.g., CDPH) compliance.

| Vertical | Worker | Third-Party | Location | Doc Categories | NAICS/SIC | Regulators |
|---|---|---|---|---|---|---|
| Clinical Healthcare | Nurses, Physicians, Clinicians | Vendors, Business Associates, Locum Tenens | Hospitals, Clinics, Wards | PHI/ePHI logs, Medical Screening, Billing/Coding Audits, ICRA | 62 / 80 | FDA, HHS, OCR, CDPH, Joint Commission |
| Pharmaceutical Manufacturing | Operators, Chemists, Technicians | Suppliers, Contract Manufacturers | Plants, Laboratories | GMP Manuals, Batch Records, COAs, Equipment Logs | 324 / 28 | FDA, EPA, OSHA |
| Assisted Living | Caregivers, Aides, Administrators | Subcontractors, Food Service Vendors | Facilities, Centers, Communities | Background Checks, State Licensure, Incident Reports | 62 / 83 | State Health Depts, HHS |

## Sector Group 2: Financial Services, Banking, Insurance, Accounting

Banking and depository institutions require KYC/CDD/EDD workflows, immutable audit trails under GLBA/SOX. Accounting/consulting face unique AML risk via IOLTA trust accounts. Insurance carriers navigate state-by-state rate/form filings (e.g., TDI). ECOA/Regulation B requires 5-year retention.

| Vertical | Worker | Third-Party | Location | Doc Categories | NAICS/SIC | Regulators |
|---|---|---|---|---|---|---|
| Banking | Bankers, Tellers, Analysts | Vendors, Service Providers | Branches, HQ, Offices | KYC/AML, CDD/EDD, SOX Audits, GLBA Plans | 52 / 60 | FDIC, OCC, CFPB, SEC |
| Wealth & Asset Management | Advisors, Brokers, Analysts | Custodians, Broker-Dealers | Offices, Branches | Conflict Disclosures, Trade Surveillance | 52 / 62,67 | SEC, FINRA |
| Insurance | Agents, Adjusters, Actuaries | Reinsurers, TPAs, Independent Agents | Agencies, Branches | Rate Filings, Form Exemptions, Flood Notices | 52 / 63,64 | State Insurance Depts, FEMA |
| Accounting & Consulting | CPAs, Partners, Auditors | Service Providers, Subcontractors | Offices, Firms | IOLTA Audits, TPRM Due Diligence, BO Logs | 54 / 73,87 | PCAOB, AICPA, State Boards |

## Sector Group 3: Manufacturing, Aerospace, and Defense

Aerospace/defense must enforce strict RBAC/ACL for ITAR compliance — access to USML technical data restricted to U.S. citizens. CMMC required for DoD contracts. AS9100 + NADCAP certs track across supply chains. General manufacturing tracks OSHA/ISO 45001. Chemical manufacturing layers RCRA + Clean Air Act + hazardous-waste manifests.

| Vertical | Worker | Third-Party | Location | Doc Categories | NAICS/SIC | Regulators |
|---|---|---|---|---|---|---|
| General Manufacturing | Assemblers, Operators, Machinists | Suppliers, Vendors, Logistics Partners | Plants, Facilities, Factories | OSHA 300, ISO 9001, Safety Training | 31-33 / 20-39 | OSHA, EPA |
| Aerospace & Defense | Engineers, Cleared Personnel, Machinists | Subcontractors, DIB Partners | Bases, Foundries, Plants | ITAR Tech Data Logs, AS9100, DFARS, Export Licenses | 336 / 37 | DoD, DDTC, BIS, FAA |
| Chemical Manufacturing | Chemists, Operators, Handlers | Transporters, Suppliers | Refineries, Plants, Laboratories | RCRA Contingency, Emissions Logs, HazCom | 325 / 28 | EPA, OSHA, DOT |

## Sector Group 4: Construction, Engineering, and Real Estate

Construction (especially healthcare/hospital construction) requires real-time mobile field capture of permits, material certs, ICRA, environmental monitoring. Davis-Bacon prevailing wage tracking. Real estate carries dual fiduciary to owners + tenants, requires NARPM ethics codes, vendor COI tracking.

| Vertical | Worker | Third-Party | Location | Doc Categories | NAICS/SIC | Regulators |
|---|---|---|---|---|---|---|
| General Construction | Laborers, Carpenters, Superintendents | Subcontractors, Trade Partners | Sites, Projects, Lots | Permits, OSHA 300, Prevailing Wage, COIs | 23 / 15-17 | OSHA, Local Municipalities |
| Heavy Civil Construction | Operators, Engineers, Foremen | Subcontractors, Lessors | Sites, Corridors, Projects | EIA, Fall Protection, Equipment Certs | 237 / 16 | OSHA, EPA, DOT |
| Real Estate & Property Mgmt | Property Managers, Leasing Agents | Contractors, Maintenance Crews | Properties, Units, Buildings | PMAs, Rent Rolls, Lease Agreements, COIs | 53 / 65 | HUD, Fair Housing, State RE Commissions |

## Sector Group 5: Transportation, Maritime, Logistics

Maritime demands USCG 33 CFR Part 101 Subpart F Cybersecurity Plans + designated CySO (effective July 2025), ISPS Code SSAS, OFAC sanctions screening with AIS data validation. Ground freight tracks HOS/HazMat. Aviation tracks FAA Airworthiness Directives per component serial number.

| Vertical | Worker | Third-Party | Location | Doc Categories | NAICS/SIC | Regulators |
|---|---|---|---|---|---|---|
| Maritime | Seafarers, Crew, Stevedores | Shipbrokers, Owner-Operators | Vessels, Ports, Terminals | MTS Cybersecurity, ISPS, SSAS, Bill of Lading | 483 / 44 | USCG, MARAD, IMO, OFAC |
| Aviation | Pilots, Flight Attendants, Mechanics | Ground Handlers, Fuel Suppliers | Airports, Hubs, Hangars | Airworthiness Directives, Pilot Logs, Maintenance | 481 / 45 | FAA, NTSB, DOT |
| Motor Freight | Drivers, Warehouse Staff, Dispatchers | Freight Forwarders, 3PLs | Warehouses, Depots, DCs | HOS, HazMat Endorsements, Maintenance | 484,493 / 42 | DOT, FMCSA, OSHA |

## Sector Group 6: Energy, Utilities, Mining, Waste

Mining must track MSHA HazCom + Permit-to-Work (PtW) + Material Safety Data Sheets. Confined spaces, explosives, underground ops require formal PtW verification before work begins. Waste management runs RCRA contingency plans under "One Plan" NRT guidance, Title V air permits, landfill-gas certificates.

| Vertical | Worker | Third-Party | Location | Doc Categories | NAICS/SIC | Regulators |
|---|---|---|---|---|---|---|
| Mining | Miners, Equipment Operators, Geologists | Contractors, Haulers, Consultants | Mines, Quarries, Pits, Sites | HazCom, MSDS, PtW, EIA | 21 / 10-14 | MSHA, EPA, Local Env Agencies |
| Oil/Gas/Utilities | Linemen, Technicians, Operators | Subcontractors, Maintenance Crews | Plants, Refineries, Substations, Rigs | PSM Logs, NERC CIP, Emissions | 211,22 / 13,49 | FERC, NERC, EPA, DOE, PHMSA |
| Waste Management | Handlers, Drivers, Sorters | Haulers, Transporters, Subcontractors | Landfills, Transfer Stations, Recycling | RCRA Contingency, HazMat Manifests, Title V, Liability Certs | 562 / 49 | EPA, State Water Boards, Local Fire |

## Sector Group 7: Telecom, Technology, Entertainment

Tech/cloud services automate SOC 2, ISO 27001, GDPR evidence via cloud API hooks for continuous monitoring. Telecom tower/broadband work requires 5000-lb minimum lifeline breaking strength (WAC 296-32), harness inspections. Entertainment tracks unionized crew (SAG-AFTRA/BECTU), "Broken Lunch" penalties, child-labor permits, daily call sheets, pyro/stunt hazard assessments.

| Vertical | Worker | Third-Party | Location | Doc Categories | NAICS/SIC | Regulators |
|---|---|---|---|---|---|---|
| Telecommunications | Tower Climbers, Broadband Workers, Technicians | Subcontractors, OEMs | Cell Sites, Switch Centers | Fall Protection, Equipment Breaking Strength, OSHA 300 | 517 / 48 | FCC, OSHA, State Labor |
| Technology & IT | Developers, Engineers, Administrators | Vendors, Cloud Providers | Data Centers, HQ, Offices | SOC 2, ISO 27001, GDPR Data Maps, CCPA | 5415,518 / 737 | FTC, EDPB (GDPR) |
| Media & Entertainment | Cast, Crew, Artistes, Talent | Production Companies, Agencies, Catering, Rental Houses | Sets, Unit Bases, Backlots | Call Sheets, Union Contracts, Child Labor Permits, Risk Assessments | 512 / 78 | Labor Unions, OSHA, Film Commissions |

## Sector Group 8: Retail, Hospitality, Food Service

Retail/hospitality payment handling requires PCI-DSS + PA-DSS compliance, automated network vulnerability scans, firewall-config dashboards. High turnover mandates EEOC demographic tracking, I-9 eligibility, workplace training. Food service integrates HACCP plans with temperature logs, local-health-dept inspections.

| Vertical | Worker | Third-Party | Location | Doc Categories | NAICS/SIC | Regulators |
|---|---|---|---|---|---|---|
| Retail | Associates, Cashiers, Clerks | Suppliers, Distributors, Merchandisers | Stores, Outlets, Branches | PCI-DSS, I-9s, OSHA 300, EEOC Demographics | 44-45 / 52-59 | FTC, EEOC, OSHA |
| Hospitality | Housekeepers, Concierges, Front Desk | Franchisees, Contractors, Cleaning Services | Hotels, Resorts, Properties | Franchise Agreements, Fire Safety, PCI-DSS | 721 / 70 | Local Fire Marshals, OSHA, Health Depts |
| Food Service | Servers, Chefs, Cooks, Bartenders | Food Distributors, Caterers | Restaurants, Kitchens, Ghost Kitchens | HACCP, Food Safety Certs, Liquor Licenses, Sanitation | 722 / 58 | FDA, State/Local Health, ABC Boards |

## Sector Group 9: Specialized and Emerging Markets

Commercial cannabis (California DCC/MAUCRSA) requires state-certified seed-to-sale track-and-trace API integration, independent-lab COA verification, daily purchase-limit enforcement (e.g., 28.5g non-concentrated / 8g concentrated per adult per day), rigid age verification, Conditional Use Permit (CUP) storage. Agriculture tracks migrant-labor protections, EPA pesticide use, H-2A visa docs, FSMA audits.

| Vertical | Worker | Third-Party | Location | Doc Categories | NAICS/SIC | Regulators |
|---|---|---|---|---|---|---|
| Commercial Cannabis | Cultivators, Budtenders, Trimmers | Distributors, Testing Labs, Security Contractors | Dispensaries, Premises, Grow Sites | CUP, COAs, Track-and-Trace, Local Authorizations | 111412, 453993 / 01 | DCC (state), Local Planners |
| Agriculture & Forestry | Farmworkers, Agronomists, Harvesters, Loggers | Cooperatives, Transporters, Equipment Suppliers | Farms, Orchards, Tracts, Sites | Pesticide Use Reports, H-2A Visa Docs, FDA FSMA | 11 / 01-09 | USDA, EPA, State Ag Commissioners |

## Deep-Dive: California Regulatory Matrix

California's 35 Air Pollution Control Districts (APCD) and Air Quality Management Districts (AQMD) regulate stationary pollution sources semi-independently from federal bodies. The South Coast AQMD (LA, Riverside, San Bernardino, Orange) enforces some of the world's strictest air-quality rules.

Required tracking for SCAQMD-regulated facilities:

- **Permit to Construct (PC) + Permit to Operate (PO)** lifecycle for new equipment.
- **Title V Permits** for major pollution sources — continuous emissions data aggregation for auto-generated compliance reports.
- **RECLAIM → BARCT Transition** — facilities moving off Regional Clean Air Incentives Market to Best Available Retrofit Control Technology; track retrofit timelines, equipment mods, Rule 219/222 socioeconomic assessments.

Cal/OSHA specifics:

- **Heat illness prevention** — mandatory for outdoor workers in agriculture, construction, entertainment. Software should monitor local weather APIs + alert supervisors at regulatory thresholds for hydration/shade breaks.
- **Cal Health Find Database** — public licensing/incident data for healthcare facilities; align audit prep with CDPH reporting.

## System Architecture: NAICS and SIC Integration

Compliance framework assignment should be automated via hierarchical NAICS→config mapping:

- Organization row holds `Primary_NAICS` attribute.
- Rules engine evaluates `Primary_NAICS` on tenant instantiation:
  - `31|32|33` (Manufacturing) → loads GMP templates, renames "Location" → "Plant", renames "Worker" → "Operator".
  - `44|45` (Retail) → loads PCI-DSS frameworks, renames "Location" → "Store", applies EEOC reporting.
  - `21` (Mining) → loads MSHA HazCom + PtW, renames "Worker" → "Miner", renames "Location" → "Mine Site".
  - `562` (Waste) → loads RCRA contingency + HazMat, renames "Worker" → "Handler", renames "Location" → "Facility".

Legacy SIC bidirectional crosswalk required — some regulators (OSHA, SEC, municipal) still publish data at 4-digit SIC granularity.

## Architectural Synthesis

Monolithic terminology + document-category schemas alienate users and obscure precise legal definitions. Using NAICS/SIC as foundational triggers for dynamic localization lets the UI + compliance tracking modules adapt: a hospital admin sees "Facilities, Nurses, Business Associates" (HIPAA/Joint Commission); a maritime operator sees "Vessels, Seafarers, Shipbrokers" (ISPS/OFAC/USCG) — from the same underlying platform.

Robust architectural mapping of document categories paired with state-specific integration (California's SCAQMD, Cal/OSHA) provides a defensible single source of truth as regulatory complexity accelerates.

---

*Source: Research brief provided 2026-04-23 for Protekon vertical-config
rollout. Use alongside `lib/onboarding/verticals/construction.ts` as the
canonical pattern when building a new `<slug>.ts`.*
