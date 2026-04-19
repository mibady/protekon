/**
 * Populate SEO cache files from pre-generated metadata.
 * Run: pnpm tsx scripts/sanity/populate-seo-cache.ts
 * Then: pnpm tsx scripts/sanity/generate-blog-seo.ts --apply
 */
import { writeFileSync, mkdirSync, existsSync } from "fs"
import { join, resolve } from "path"

const CACHE_DIR = resolve(process.cwd(), "scripts/sanity/.cache-seo")
if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true })

interface SeoEntry {
  docId: string
  title: string
  slug: string
  metaTitle: string
  metaDescription: string
}

const entries: SeoEntry[] = [
  {
    docId: "blog-108",
    title: "The Complete Guide to SB 553 Workplace Violence Prevention Plans",
    slug: "the-complete-guide-to-sb-553-workplace-violence-prevention-plans",
    metaTitle: "SB 553 Compliance Guide: Workplace Violence Prevention",
    metaDescription: "Everything California employers need about SB 553 workplace violence prevention plans. Learn WVPP requirements, training mandates, incident logs, and enforcement penalties step by step.",
  },
  {
    docId: "blog-109",
    title: "IIPP Essentials: Building Your Injury and Illness Prevention Program",
    slug: "iipp-essentials-building-your-injury-and-illness-prevention-program",
    metaTitle: "IIPP Requirements: Build a Cal/OSHA-Ready Program",
    metaDescription: "Master the 8 required IIPP elements for California employers. Avoid common citation triggers with this step-by-step guide to building an inspection-ready prevention program.",
  },
  {
    docId: "blog-110",
    title: "Heat Illness Prevention: California Employer Requirements",
    slug: "heat-illness-prevention-california-employer-requirements",
    metaTitle: "California Heat Illness Prevention Requirements",
    metaDescription: "California outdoor and indoor heat illness prevention standards explained. Temperature triggers, water and shade rules, acclimatization protocols, and Cal/OSHA enforcement patterns.",
  },
  {
    docId: "blog-111",
    title: "Hazard Communication (HazCom/GHS) Compliance Guide",
    slug: "hazard-communication-hazcom-ghs-compliance-guide",
    metaTitle: "HazCom GHS Compliance Guide for California Employers",
    metaDescription: "Complete guide to California hazard communication compliance. GHS alignment, written program requirements, Safety Data Sheets, container labeling, and employee training mandates.",
  },
  {
    docId: "blog-112",
    title: "OSHA 300 Log: Recordkeeping Requirements and Best Practices",
    slug: "osha-300-log-recordkeeping-requirements-and-best-practices",
    metaTitle: "OSHA 300 Log: Recordkeeping Requirements Guide",
    metaDescription: "Master OSHA recordkeeping with this guide to the 300 Log, 300A Summary, and 301 Incident Report. Posting deadlines, electronic submission rules, and common errors to avoid.",
  },
  {
    docId: "blog-113",
    title: "Emergency Action Plans: What Every Employer Must Have",
    slug: "emergency-action-plans-what-every-employer-must-have",
    metaTitle: "Emergency Action Plans: OSHA Requirements Guide",
    metaDescription: "Build an OSHA-compliant emergency action plan that works when seconds count. Evacuation procedures, alarm systems, designated roles, and employee training requirements explained.",
  },
  {
    docId: "blog-114",
    title: "Incident Investigation: From Report to Prevention",
    slug: "incident-investigation-from-report-to-prevention",
    metaTitle: "Incident Investigation: Root Cause Analysis Guide",
    metaDescription: "Investigate workplace incidents effectively using root cause analysis and the 5 Whys method. Documentation requirements, corrective action tracking, and turning incidents into prevention.",
  },
  {
    docId: "blog-115",
    title: "Training Records Management: Documentation That Protects You",
    slug: "training-records-management-documentation-that-protects-you",
    metaTitle: "Training Records Management: Compliance Guide",
    metaDescription: "The compliance training documentation framework every employer needs. What to record, retention periods, language requirements, and why training without documentation never happened.",
  },
  {
    docId: "blog-116",
    title: "Cal/OSHA Enforcement Intelligence: What Every CA Employer Needs to Know",
    slug: "cal-osha-enforcement-intelligence-what-every-ca-employer-needs-to-know",
    metaTitle: "Cal/OSHA Enforcement: Inspections and Penalties",
    metaDescription: "How Cal/OSHA enforcement works, what triggers inspections, how penalties are calculated, and proven strategies to protect your California business from costly citations and fines.",
  },
  {
    docId: "blog-117",
    title: "Federal OSHA vs. State Plans: Understanding Your Jurisdiction",
    slug: "federal-osha-vs-state-plans-understanding-your-jurisdiction",
    metaTitle: "Federal OSHA vs State Plans: Know Your Jurisdiction",
    metaDescription: "Navigate the 22 federal OSHA states, 25 state plan states, and 4 hybrid states. Understand which workplace safety rules apply to your business and what multi-state employers must know.",
  },
  {
    docId: "blog-118",
    title: "HIPAA Compliance for California Healthcare Practices",
    slug: "hipaa-compliance-for-california-healthcare-practices",
    metaTitle: "HIPAA Compliance for California Healthcare Practices",
    metaDescription: "HIPAA Privacy Rule, Security Rule, breach notification, risk assessments, BAA management, and California CMIA additions. What every healthcare practice must do to stay compliant.",
  },
  {
    docId: "blog-119",
    title: "Subcontractor Risk Management: Lien, License and Insurance Compliance",
    slug: "subcontractor-risk-management-lien-license-and-insurance-compliance",
    metaTitle: "Subcontractor Risk: License, Lien and Insurance",
    metaDescription: "General contractor liability for subcontractor safety explained. CSLB license verification, workers comp requirements, mechanic's lien exposure, and the prequalification process.",
  },
  {
    docId: "blog-120",
    title: "Municipal Ordinance Compliance: Navigating Local Regulations",
    slug: "municipal-ordinance-compliance-navigating-local-regulations",
    metaTitle: "Municipal Compliance: Local Regulation Requirements",
    metaDescription: "City and county regulations that layer on top of state and federal requirements. Fire permits, health inspections, building codes, and how to track compliance across jurisdictions.",
  },
  {
    docId: "blog-121",
    title: "Workplace Violence Prevention Laws Beyond California: CT, MD, MN, NJ, WA, TX, VA",
    slug: "workplace-violence-prevention-laws-beyond-california-ct-md-mn-nj-wa-tx-va",
    metaTitle: "Workplace Violence Prevention Laws: 7 States Guide",
    metaDescription: "Seven states following California's SB 553 lead on workplace violence prevention. State-by-state requirements, differences from SB 553, and what multi-state employers must prepare.",
  },
  {
    docId: "blog-122",
    title: "The National Compliance Landscape: 50-State OSHA Overview",
    slug: "the-national-compliance-landscape-50-state-osha-overview",
    metaTitle: "50-State OSHA Compliance: National Overview Map",
    metaDescription: "All 50 states mapped by OSHA jurisdiction. Federal vs state plan vs hybrid states, which have stricter rules, and how enforcement intelligence covers every workplace jurisdiction.",
  },
  {
    docId: "blog-123",
    title: "Agriculture Compliance Guide: Platform-Wide and Vertical-Specific Requirements",
    slug: "agriculture-compliance-guide-platform-wide-and-vertical-specific-requirements",
    metaTitle: "Agriculture Compliance: Cal/OSHA Safety Requirements",
    metaDescription: "Agriculture compliance covering IIPP, heat illness, wildfire smoke protection, and pesticide safety. Cal/OSHA enforcement patterns and required safety programs for farm operations.",
  },
  {
    docId: "blog-124",
    title: "Agriculture Enforcement Intelligence: Citations, Penalties and Trends",
    slug: "agriculture-enforcement-intelligence-citations-penalties-and-trends",
    metaTitle: "Agriculture OSHA Citations: Penalties and Trends",
    metaDescription: "Top cited violations in agriculture operations. Average penalties, heat illness fatality data, pesticide exposure citations, and seasonal Cal/OSHA enforcement patterns for employers.",
  },
  {
    docId: "blog-125",
    title: "Arts and Entertainment Compliance Guide: Platform-Wide Requirements",
    slug: "arts-and-entertainment-compliance-guide-platform-wide-requirements",
    metaTitle: "Arts and Entertainment Safety Compliance Guide",
    metaDescription: "Compliance requirements for venues, theaters, studios, and event spaces. Required safety programs applied to arts and entertainment operations including crowd and stage safety.",
  },
  {
    docId: "blog-126",
    title: "Arts and Entertainment Enforcement Intelligence: Citations, Penalties and Trends",
    slug: "arts-and-entertainment-enforcement-intelligence-citations-penalties-and-trends",
    metaTitle: "Entertainment Industry OSHA Citations and Fines",
    metaDescription: "Common OSHA citations in venues and event spaces. Fire code violations, crowd safety failures, temporary structure incidents, electrical safety, and rigging enforcement patterns.",
  },
  {
    docId: "blog-127",
    title: "Automotive Services Compliance Guide: Platform-Wide and Spray Booth Requirements",
    slug: "automotive-services-compliance-guide-platform-wide-and-spray-booth-requirements",
    metaTitle: "Auto Shop Compliance: Spray Booth Safety Guide",
    metaDescription: "Auto body shops, repair facilities, and dealership compliance requirements. IIPP, HazCom, spray booth safety standards, and inspection compliance for automotive service operations.",
  },
  {
    docId: "blog-128",
    title: "Automotive Services Enforcement Intelligence: Citations, Penalties and Trends",
    slug: "automotive-services-enforcement-intelligence-citations-penalties-and-trends",
    metaTitle: "Auto Shop OSHA Violations: Citations and Penalties",
    metaDescription: "Spray booth violations, chemical exposure citations, lift safety failures, and HazCom violations in automotive shops. Enforcement patterns and average penalty amounts for auto services.",
  },
  {
    docId: "blog-129",
    title: "Building Services Compliance Guide: Platform-Wide Requirements",
    slug: "building-services-compliance-guide-platform-wide-requirements",
    metaTitle: "Building Services Safety Compliance Requirements",
    metaDescription: "Janitorial, cleaning, and maintenance service compliance requirements. Chemical safety, HazCom, slip-and-fall prevention, and multi-site safety programs for building service operations.",
  },
  {
    docId: "blog-130",
    title: "Building Services Enforcement Intelligence: Citations, Penalties and Trends",
    slug: "building-services-enforcement-intelligence-citations-penalties-and-trends",
    metaTitle: "Janitorial OSHA Citations: Penalties and Trends",
    metaDescription: "Chemical exposure citations in janitorial services, slip-and-fall injuries, HazCom violations with cleaning chemicals, and multi-employer site citation patterns for building services.",
  },
  {
    docId: "blog-131",
    title: "Construction Compliance Guide: Platform-Wide and Vertical-Specific Requirements",
    slug: "construction-compliance-guide-platform-wide-and-vertical-specific-requirements",
    metaTitle: "Construction Safety Compliance: Cal/OSHA Guide",
    metaDescription: "Construction compliance covering fall protection, silica exposure, hearing conservation, and heat illness. Multi-employer worksite coordination and subcontractor safety oversight.",
  },
  {
    docId: "blog-132",
    title: "Construction Enforcement Intelligence: Citations, Penalties and Trends",
    slug: "construction-enforcement-intelligence-citations-penalties-and-trends",
    metaTitle: "Construction OSHA Violations: Fines and Trends",
    metaDescription: "Fall protection citations ranked number one nationally. Scaffolding violations, trenching fatalities, silica enforcement, heat illness deaths, and multi-employer citation patterns.",
  },
  {
    docId: "blog-133",
    title: "Education Compliance Guide: Platform-Wide Requirements",
    slug: "education-compliance-guide-platform-wide-requirements",
    metaTitle: "Education Safety Compliance: K-12 and Campus Guide",
    metaDescription: "K-12, higher education, and training center compliance requirements. Required safety programs applied to educational environments with unique campus safety considerations for schools.",
  },
  {
    docId: "blog-134",
    title: "Education Enforcement Intelligence: Citations, Penalties and Trends",
    slug: "education-enforcement-intelligence-citations-penalties-and-trends",
    metaTitle: "School Safety OSHA Citations: Penalties Guide",
    metaDescription: "Common OSHA citations in schools and campuses. Maintenance department violations, lab safety failures, custodial chemical exposure, and workplace violence reporting gaps in education.",
  },
  {
    docId: "blog-135",
    title: "Healthcare Compliance Guide: Platform-Wide and HIPAA Requirements",
    slug: "healthcare-compliance-guide-platform-wide-and-hipaa-requirements",
    metaTitle: "Healthcare Safety and HIPAA Compliance Guide",
    metaDescription: "Healthcare compliance covering HIPAA security risk assessments, BAA tracking, bloodborne pathogen exposure control, and aerosol transmissible disease plans for medical practices.",
  },
  {
    docId: "blog-136",
    title: "Healthcare Enforcement Intelligence: Citations, Penalties and Trends",
    slug: "healthcare-enforcement-intelligence-citations-penalties-and-trends",
    metaTitle: "Healthcare OSHA Citations: Penalties and Trends",
    metaDescription: "Bloodborne pathogen citations, workplace violence in healthcare under 8 CCR 3342, HIPAA breach penalties, ATD exposure citations, and ergonomic injury patterns in patient handling.",
  },
  {
    docId: "blog-137",
    title: "Hospitality Compliance Guide: Platform-Wide and Vertical-Specific Requirements",
    slug: "hospitality-compliance-guide-platform-wide-and-vertical-specific-requirements",
    metaTitle: "Hotel and Restaurant Safety Compliance Guide",
    metaDescription: "Hotels, restaurants, and event venue compliance. Required safety programs plus bloodborne pathogen exposure control and heat illness prevention for kitchen and outdoor operations.",
  },
  {
    docId: "blog-138",
    title: "Hospitality Enforcement Intelligence: Citations, Penalties and Trends",
    slug: "hospitality-enforcement-intelligence-citations-penalties-and-trends",
    metaTitle: "Hospitality OSHA Violations: Citations and Fines",
    metaDescription: "Kitchen safety citations, slip-and-fall injuries, chemical burns from cleaning products, heat illness in kitchens, and workplace violence enforcement in hotels and restaurants.",
  },
  {
    docId: "blog-139",
    title: "Manufacturing Compliance Guide: Platform-Wide and Vertical-Specific Requirements",
    slug: "manufacturing-compliance-guide-platform-wide-and-vertical-specific-requirements",
    metaTitle: "Manufacturing Safety Compliance: OSHA Guide",
    metaDescription: "Manufacturing compliance covering lockout-tagout, machine guarding, confined space entry, and hearing conservation programs. Required safety standards for production facilities.",
  },
  {
    docId: "blog-140",
    title: "Manufacturing Enforcement Intelligence: Citations, Penalties and Trends",
    slug: "manufacturing-enforcement-intelligence-citations-penalties-and-trends",
    metaTitle: "Manufacturing OSHA Violations: Fines and Trends",
    metaDescription: "LOTO citations ranked in the national top five. Machine guarding violations, confined space fatalities, hearing conservation failures, and indoor heat illness in factory settings.",
  },
  {
    docId: "blog-141",
    title: "Public Administration Compliance Guide: Platform-Wide Requirements",
    slug: "public-administration-compliance-guide-platform-wide-requirements",
    metaTitle: "Government Agency Safety Compliance Requirements",
    metaDescription: "Government office and municipal agency compliance requirements. Required safety programs applied to public sector workplaces with unique public-facing workplace violence risk factors.",
  },
  {
    docId: "blog-142",
    title: "Public Administration Enforcement Intelligence: Citations, Penalties and Trends",
    slug: "public-administration-enforcement-intelligence-citations-penalties-and-trends",
    metaTitle: "Government OSHA Citations: Penalties and Trends",
    metaDescription: "Government agency OSHA citations, workplace violence in public-facing offices, maintenance department hazards, and emergency preparedness deficiencies in the public administration sector.",
  },
  {
    docId: "blog-143",
    title: "Retail Trade Compliance Guide: Platform-Wide and Heat Illness Requirements",
    slug: "retail-trade-compliance-guide-platform-wide-and-heat-illness-requirements",
    metaTitle: "Retail Safety Compliance: Heat Illness and More",
    metaDescription: "Retail compliance covering heat illness for outdoor operations, loading docks, and parking lots. High workplace violence risk from robberies and customer confrontation prevention plans.",
  },
  {
    docId: "blog-144",
    title: "Retail Trade Enforcement Intelligence: Citations, Penalties and Trends",
    slug: "retail-trade-enforcement-intelligence-citations-penalties-and-trends",
    metaTitle: "Retail OSHA Violations: Citations and Penalty Data",
    metaDescription: "Workplace violence citations in retail, ergonomic injury patterns, forklift and loading dock incidents, HazCom violations, and fire safety enforcement trends in retail trade operations.",
  },
  {
    docId: "blog-145",
    title: "Transportation Compliance Guide: Platform-Wide and DOT Requirements",
    slug: "transportation-compliance-guide-platform-wide-and-dot-requirements",
    metaTitle: "Transportation Safety: OSHA and DOT Compliance",
    metaDescription: "Transportation compliance covering DOT driver qualification files, fleet safety standards, hours of service rules, and loading and unloading hazard prevention for carrier operations.",
  },
  {
    docId: "blog-146",
    title: "Transportation Enforcement Intelligence: Citations, Penalties and Trends",
    slug: "transportation-enforcement-intelligence-citations-penalties-and-trends",
    metaTitle: "Transportation OSHA Violations: Penalties Guide",
    metaDescription: "DOT violations, loading dock fatalities, fleet maintenance citations, driver qualification file deficiencies, and fatigue-related incident patterns in the transportation industry.",
  },
  {
    docId: "blog-147",
    title: "Utilities Compliance Guide: Platform-Wide Requirements",
    slug: "utilities-compliance-guide-platform-wide-requirements",
    metaTitle: "Utilities Safety Compliance: OSHA Requirements",
    metaDescription: "Electric, gas, water, and telecom infrastructure compliance requirements. Required safety programs addressing unique electrical hazards and confined space risks in utility operations.",
  },
  {
    docId: "blog-148",
    title: "Utilities Enforcement Intelligence: Citations, Penalties and Trends",
    slug: "utilities-enforcement-intelligence-citations-penalties-and-trends",
    metaTitle: "Utilities OSHA Violations: Citations and Penalties",
    metaDescription: "Electrical safety citations, confined space fatalities in manholes, excavation cave-ins during line installation, fall protection on utility poles, and arc flash incident enforcement.",
  },
  {
    docId: "blog-149",
    title: "Waste and Environmental Services Compliance Guide: Platform-Wide Requirements",
    slug: "waste-and-environmental-services-compliance-guide-platform-wide-requirements",
    metaTitle: "Waste Services Safety Compliance Requirements",
    metaDescription: "Waste collection, recycling, and environmental service compliance requirements. Safety programs addressing hazardous waste handling and biological exposure risks in waste operations.",
  },
  {
    docId: "blog-150",
    title: "Waste and Environmental Services Enforcement Intelligence: Citations, Penalties and Trends",
    slug: "waste-and-environmental-services-enforcement-intelligence-citations-penalties-and-trends",
    metaTitle: "Waste Services OSHA Citations: Penalties Guide",
    metaDescription: "Hazardous waste violations, landfill safety citations, recycling facility machinery incidents, chemical exposure, and struck-by incidents with waste collection vehicles documented.",
  },
  {
    docId: "blog-151",
    title: "Wholesale Trade Compliance Guide: Platform-Wide and Forklift Certification Requirements",
    slug: "wholesale-trade-compliance-guide-platform-wide-and-forklift-certification-requirements",
    metaTitle: "Wholesale Safety: Forklift and Dock Compliance",
    metaDescription: "Wholesale and distribution compliance covering forklift operator certification, dock safety procedures, pallet rack inspections, and chemical storage requirements for trade operations.",
  },
  {
    docId: "blog-152",
    title: "Wholesale Trade Enforcement Intelligence: Citations, Penalties and Trends",
    slug: "wholesale-trade-enforcement-intelligence-citations-penalties-and-trends",
    metaTitle: "Wholesale OSHA Violations: Citations and Penalties",
    metaDescription: "Forklift fatality data and citations, pallet rack collapse incidents, loading dock injuries, HazCom violations in chemical distribution, and indoor heat illness enforcement trends.",
  },
  {
    docId: "blog-153",
    title: "Business Support Services Compliance Guide: Platform-Wide Requirements",
    slug: "business-support-services-compliance-guide-platform-wide-requirements",
    metaTitle: "Office Safety Compliance: Business Services Guide",
    metaDescription: "Call center, BPO, and administrative service compliance requirements. Required safety programs applied to office and support environments including ergonomic risk and indoor air quality.",
  },
  {
    docId: "blog-154",
    title: "Business Support Services Enforcement Intelligence: Citations, Penalties and Trends",
    slug: "business-support-services-enforcement-intelligence-citations-penalties-and-trends",
    metaTitle: "Office OSHA Citations: Call Center Safety Trends",
    metaDescription: "Ergonomic violations in call centers, indoor air quality citations, emergency action plan deficiencies, and IIPP gaps in office environments. Enforcement trends for support services.",
  },
  {
    docId: "blog-155",
    title: "Equipment Repair Compliance Guide: Platform-Wide Requirements",
    slug: "equipment-repair-compliance-guide-platform-wide-requirements",
    metaTitle: "Equipment Repair Shop Safety Compliance Guide",
    metaDescription: "Industrial, commercial, and HVAC repair shop compliance requirements. Required safety programs covering electrical hazards, welding fumes, and machine guarding in repair operations.",
  },
  {
    docId: "blog-156",
    title: "Equipment Repair Enforcement Intelligence: Citations, Penalties and Trends",
    slug: "equipment-repair-enforcement-intelligence-citations-penalties-and-trends",
    metaTitle: "Repair Shop OSHA Violations: Citations Guide",
    metaDescription: "Electrical safety citations during servicing, LOTO violations, welding fume exposure, machine guarding gaps, and confined space incidents in equipment repair shop enforcement data.",
  },
  {
    docId: "blog-157",
    title: "Facilities Management Compliance Guide: Platform-Wide Requirements",
    slug: "facilities-management-compliance-guide-platform-wide-requirements",
    metaTitle: "Facilities Management Safety Compliance Guide",
    metaDescription: "Property maintenance and building operations compliance requirements. Required safety programs with multi-tenant coordination and contractor oversight for facilities management teams.",
  },
  {
    docId: "blog-158",
    title: "Facilities Management Enforcement Intelligence: Citations, Penalties and Trends",
    slug: "facilities-management-enforcement-intelligence-citations-penalties-and-trends",
    metaTitle: "Facilities OSHA Violations: Citations and Fines",
    metaDescription: "Fall protection on roofs, electrical panel access violations, asbestos exposure in renovation, confined space in mechanical rooms, and multi-employer citation patterns for facilities.",
  },
  {
    docId: "blog-159",
    title: "Information and Telecom Compliance Guide: Platform-Wide Requirements",
    slug: "information-and-telecom-compliance-guide-platform-wide-requirements",
    metaTitle: "Telecom and Data Center Safety Compliance Guide",
    metaDescription: "Data center, ISP, and telecom infrastructure compliance requirements. Required safety programs applied to technology operations covering electrical and confined space hazard management.",
  },
  {
    docId: "blog-160",
    title: "Information and Telecom Enforcement Intelligence: Citations, Penalties and Trends",
    slug: "information-and-telecom-enforcement-intelligence-citations-penalties-and-trends",
    metaTitle: "Telecom OSHA Citations: Cell Tower Safety Trends",
    metaDescription: "Cell tower fall protection fatalities, data center electrical hazards, trenching violations for fiber installation, and ergonomic injury claims in the information and telecom industry.",
  },
  {
    docId: "blog-161",
    title: "Laundry and Drycleaning Compliance Guide: Platform-Wide Requirements",
    slug: "laundry-and-drycleaning-compliance-guide-platform-wide-requirements",
    metaTitle: "Laundry and Drycleaning Safety Compliance Guide",
    metaDescription: "Commercial laundry and drycleaning compliance requirements. Safety programs addressing chemical exposure, indoor heat hazards, and machine guarding for laundry service operations.",
  },
  {
    docId: "blog-162",
    title: "Laundry and Drycleaning Enforcement Intelligence: Citations, Penalties and Trends",
    slug: "laundry-and-drycleaning-enforcement-intelligence-citations-penalties-and-trends",
    metaTitle: "Drycleaning OSHA Citations: PERC and Safety Fines",
    metaDescription: "PERC exposure citations, indoor heat violations, burn injuries from steam equipment, HazCom failures, and machine guarding enforcement on industrial laundry and drycleaning equipment.",
  },
  {
    docId: "blog-163",
    title: "Mining Compliance Guide: Platform-Wide Requirements",
    slug: "mining-compliance-guide-platform-wide-requirements",
    metaTitle: "Mining Safety Compliance: MSHA and OSHA Guide",
    metaDescription: "Quarry, sand and gravel, and mineral extraction compliance requirements. Required safety programs with MSHA jurisdiction considerations for surface and underground mining operations.",
  },
  {
    docId: "blog-164",
    title: "Mining Enforcement Intelligence: Citations, Penalties and Trends",
    slug: "mining-enforcement-intelligence-citations-penalties-and-trends",
    metaTitle: "Mining MSHA Citations: Violations and Penalties",
    metaDescription: "MSHA citation patterns, silica exposure enforcement, ground control failures, heavy equipment incidents, and respirable dust violations documented in mining operations nationwide.",
  },
  {
    docId: "blog-165",
    title: "Professional Services Compliance Guide: Platform-Wide Requirements",
    slug: "professional-services-compliance-guide-platform-wide-requirements",
    metaTitle: "Professional Office Safety Compliance Guide",
    metaDescription: "Law firm, accounting, consulting, and engineering office compliance requirements. Required safety programs for professional environments covering ergonomics and emergency planning.",
  },
  {
    docId: "blog-166",
    title: "Professional Services Enforcement Intelligence: Citations, Penalties and Trends",
    slug: "professional-services-enforcement-intelligence-citations-penalties-and-trends",
    metaTitle: "Office OSHA Violations: Professional Services Data",
    metaDescription: "IIPP deficiency citations in office settings, emergency action plan gaps, ergonomic injury claims, and workplace violence citations in client-facing professional service firms.",
  },
  {
    docId: "blog-167",
    title: "Real Estate Compliance Guide: Platform-Wide and Rent Control Requirements",
    slug: "real-estate-compliance-guide-platform-wide-and-rent-control-requirements",
    metaTitle: "Real Estate Safety and Rent Control Compliance",
    metaDescription: "Property management and brokerage compliance covering rent control, maintenance crew hazards, and multi-property IIPP management for real estate operations in California markets.",
  },
  {
    docId: "blog-168",
    title: "Real Estate Enforcement Intelligence: Citations, Penalties and Trends",
    slug: "real-estate-enforcement-intelligence-citations-penalties-and-trends",
    metaTitle: "Property Management OSHA Citations and Penalties",
    metaDescription: "Maintenance crew fall protection violations, asbestos and lead exposure in renovation, electrical safety in property maintenance, and workplace violence in leasing office settings.",
  },
  {
    docId: "blog-169",
    title: "Staffing and Employment Services Compliance Guide: Platform-Wide Requirements",
    slug: "staffing-and-employment-services-compliance-guide-platform-wide-requirements",
    metaTitle: "Staffing Agency Safety Compliance Requirements",
    metaDescription: "Temp agency, PEO, and staffing firm compliance requirements. Addressing joint employer liability and multi-site compliance tracking challenges for employment service operations.",
  },
  {
    docId: "blog-170",
    title: "Staffing and Employment Services Enforcement Intelligence: Citations, Penalties and Trends",
    slug: "staffing-and-employment-services-enforcement-intelligence-citations-penalties-and-trends",
    metaTitle: "Staffing Agency OSHA Citations: Joint Employer",
    metaDescription: "Joint employer citations, training documentation gaps for placed workers, OSHA 300 log complications, and temp worker fatality investigation patterns in the staffing services industry.",
  },
  {
    docId: "blog-171",
    title: "Warehouse Compliance Guide: Platform-Wide and Forklift Certification Requirements",
    slug: "warehouse-compliance-guide-platform-wide-and-forklift-certification-requirements",
    metaTitle: "Warehouse Safety: Forklift Certification Guide",
    metaDescription: "Distribution and fulfillment center compliance covering forklift operator certification, indoor heat illness prevention, dock safety procedures, and pedestrian traffic management.",
  },
  {
    docId: "blog-172",
    title: "Warehouse Enforcement Intelligence: Citations, Penalties and Trends",
    slug: "warehouse-enforcement-intelligence-citations-penalties-and-trends",
    metaTitle: "Warehouse OSHA Violations: Forklift and Dock Data",
    metaDescription: "Forklift fatalities and citations, pallet rack collapse data, indoor heat illness enforcement, ergonomic injury patterns in fulfillment, and pedestrian struck-by incident trends.",
  },
  {
    docId: "blog-173",
    title: "Personal Services Compliance Guide: Platform-Wide Requirements",
    slug: "personal-services-compliance-guide-platform-wide-requirements",
    metaTitle: "Salon and Spa Safety Compliance Requirements",
    metaDescription: "Salon, spa, fitness, and pet grooming compliance requirements. Chemical exposure prevention, ergonomic risk management, and ventilation standards for personal service businesses.",
  },
  {
    docId: "blog-174",
    title: "Personal Services Enforcement Intelligence: Citations, Penalties and Trends",
    slug: "personal-services-enforcement-intelligence-citations-penalties-and-trends",
    metaTitle: "Salon OSHA Citations: Chemical Exposure Trends",
    metaDescription: "Chemical exposure citations in salons, HazCom violations with salon and spa products, bloodborne pathogen exposure in body art studios, and ventilation deficiency enforcement data.",
  },
  {
    docId: "blog-175",
    title: "Security Services Compliance Guide: Platform-Wide Requirements",
    slug: "security-services-compliance-guide-platform-wide-requirements",
    metaTitle: "Security Guard Company Safety Compliance Guide",
    metaDescription: "Guard company and patrol service compliance for the vertical with the highest workplace violence exposure. Lone worker safety protocols and multi-site IIPP management challenges.",
  },
  {
    docId: "blog-176",
    title: "Security Services Enforcement Intelligence: Citations, Penalties and Trends",
    slug: "security-services-enforcement-intelligence-citations-penalties-and-trends",
    metaTitle: "Security OSHA Violations: Guard Company Trends",
    metaDescription: "Workplace violence citations for guard companies, IIPP deficiencies across multi-site operations, training documentation gaps, and lone worker incident patterns in security services.",
  },
  {
    docId: "blog-177",
    title: "Heat Illness Prevention in Outdoor and High-Heat Industries",
    slug: "heat-illness-prevention-in-outdoor-and-high-heat-industries",
    metaTitle: "Heat Illness Prevention for High-Heat Industries",
    metaDescription: "Cross-vertical heat illness deep dive covering industry-specific exposure patterns, acclimatization challenges, Cal/OSHA summer enforcement campaigns, and indoor versus outdoor standards.",
  },
  {
    docId: "blog-178",
    title: "Wildfire Smoke Protection for Agricultural Workers",
    slug: "wildfire-smoke-protection-for-agricultural-workers",
    metaTitle: "Wildfire Smoke Protection: Cal/OSHA Standards",
    metaDescription: "Cal/OSHA wildfire smoke standard 8 CCR 5141.1 explained. AQI monitoring thresholds, N95 provision at AQI 151 and above, written protection plan requirements, and worker training.",
  },
  {
    docId: "blog-179",
    title: "Pesticide Safety Training Requirements for Agricultural Employers",
    slug: "pesticide-safety-training-requirements-for-agricultural-employers",
    metaTitle: "Pesticide Safety Training for Farm Employers",
    metaDescription: "DPR training mandates for agricultural employers. Handler vs fieldworker training, restricted entry intervals, PPE requirements, and Worker Protection Standard compliance explained.",
  },
  {
    docId: "blog-180",
    title: "Spray Booth Safety and Inspection Compliance for Auto Body Shops",
    slug: "spray-booth-safety-and-inspection-compliance-for-auto-body-shops",
    metaTitle: "Spray Booth Safety: Auto Body Compliance Guide",
    metaDescription: "OSHA spray booth standards for auto body shops. Ventilation requirements, fire suppression systems, electrical classification, air monitoring, and respiratory protection for painters.",
  },
  {
    docId: "blog-181",
    title: "Fall Protection Plans: OSHA's Number One Cited Standard",
    slug: "fall-protection-plans-osha-s-number-one-cited-standard",
    metaTitle: "Fall Protection Plans: OSHA's Top Cited Standard",
    metaDescription: "Fall protection deep dive covering the 6-foot trigger, guardrail systems, personal fall arrest, safety nets, written plans, rescue planning, and the residential construction exception.",
  },
  {
    docId: "blog-182",
    title: "Respirable Crystalline Silica: Exposure Limits and Controls",
    slug: "respirable-crystalline-silica-exposure-limits-and-controls",
    metaTitle: "Silica Exposure Limits: OSHA Construction Standard",
    metaDescription: "OSHA silica standard for construction covering the 50 microgram PEL, Table 1 compliance options, exposure assessment methods, medical surveillance, and engineering control strategies.",
  },
  {
    docId: "blog-183",
    title: "Hearing Conservation Programs: Implementation Guide",
    slug: "hearing-conservation-programs-implementation-guide",
    metaTitle: "Hearing Conservation Program: OSHA Requirements",
    metaDescription: "OSHA hearing conservation covering the 85 dBA action level, 90 dBA PEL, noise monitoring procedures, audiometric testing, hearing protector selection, and employee training mandates.",
  },
  {
    docId: "blog-184",
    title: "HIPAA Security Risk Assessment: Step by Step",
    slug: "hipaa-security-risk-assessment-step-by-step",
    metaTitle: "HIPAA Security Risk Assessment: Step-by-Step",
    metaDescription: "Complete HIPAA Security Rule SRA walkthrough. Scope definition, threat identification, vulnerability assessment, risk determination, management plan, and OCR audit expectations.",
  },
  {
    docId: "blog-185",
    title: "Business Associate Agreements: Tracking and Compliance",
    slug: "business-associate-agreements-tracking-and-compliance",
    metaTitle: "HIPAA BAA Tracking and Compliance Management",
    metaDescription: "What triggers BAA requirements, required provisions, tracking your BAA inventory, renewal management, breach notification obligations, and vendor due diligence best practices.",
  },
  {
    docId: "blog-186",
    title: "Bloodborne Pathogens Exposure Control Plans",
    slug: "bloodborne-pathogens-exposure-control-plans",
    metaTitle: "Bloodborne Pathogens: Exposure Control Plan Guide",
    metaDescription: "OSHA BBP standard covering exposure determination, written control plans, universal precautions, engineering controls, PPE, hepatitis B vaccination, and post-exposure evaluation steps.",
  },
  {
    docId: "blog-187",
    title: "Aerosol Transmissible Diseases: ATD Plan Requirements for Healthcare",
    slug: "aerosol-transmissible-diseases-atd-plan-requirements-for-healthcare",
    metaTitle: "ATD Plan Requirements for Healthcare Employers",
    metaDescription: "Cal/OSHA ATD standard 8 CCR 5199 explained. Written ATD plan components, exposure categories, source control, engineering controls, respiratory protection, and medical surveillance.",
  },
  {
    docId: "blog-188",
    title: "Lockout Tagout (LOTO): Procedure Development Guide for Manufacturing",
    slug: "lockout-tagout-loto-procedure-development-guide-for-manufacturing",
    metaTitle: "Lockout Tagout LOTO: Manufacturing Procedures",
    metaDescription: "OSHA LOTO standard covering energy source identification, machine-specific procedures, authorized vs affected employee roles, periodic inspections, and common citation triggers.",
  },
  {
    docId: "blog-189",
    title: "Machine Guarding Assessment and Compliance for Manufacturing",
    slug: "machine-guarding-assessment-and-compliance-for-manufacturing",
    metaTitle: "Machine Guarding Compliance for Manufacturers",
    metaDescription: "OSHA machine guarding standards covering point of operation guards, nip point protection, rotating parts, guard types, machine-specific assessments, and bypass prevention measures.",
  },
  {
    docId: "blog-190",
    title: "Confined Space Entry: Permit-Required Programs",
    slug: "confined-space-entry-permit-required-programs",
    metaTitle: "Confined Space Entry: Permit-Required Programs",
    metaDescription: "OSHA permit-required confined space program covering identification, entry permits, atmospheric testing, ventilation, attendant duties, rescue planning, and contractor coordination.",
  },
  {
    docId: "blog-191",
    title: "Driver Qualification Files: DOT Compliance for Transportation Employers",
    slug: "driver-qualification-files-dot-compliance-for-transportation-employers",
    metaTitle: "DOT Driver Qualification File Requirements Guide",
    metaDescription: "FMCSA driver qualification requirements covering DQ file contents, CDL verification, medical examiner certificates, drug and alcohol testing, and common fleet audit findings.",
  },
  {
    docId: "blog-192",
    title: "Forklift Operator Certification and Training Requirements",
    slug: "forklift-operator-certification-and-training-requirements",
    metaTitle: "Forklift Certification: OSHA Training Requirements",
    metaDescription: "OSHA powered industrial truck standard covering operator training programs, classroom and practical evaluation, truck-specific training, refresher triggers, and documentation rules.",
  },
  {
    docId: "blog-193",
    title: "Rent Control Compliance for Property Managers",
    slug: "rent-control-compliance-for-property-managers",
    metaTitle: "Rent Control Compliance for Property Managers",
    metaDescription: "California Tenant Protection Act AB 1482 and local rent control ordinances. Allowable increases, just cause eviction rules, required notices, and multi-property tracking explained.",
  },
  {
    docId: "blog-194",
    title: "California Compliance Guide: Cal/OSHA, SB 553, and State-Specific Requirements",
    slug: "california-compliance-guide-cal-osha-sb-553-and-state-specific-requirements",
    metaTitle: "California Employer Compliance: Full Requirements",
    metaDescription: "The most comprehensive state safety program in the nation. Cal/OSHA structure, SB 553 WVPP mandate, heat illness prevention, IIPP requirements, and enforcement pattern analysis.",
  },
  {
    docId: "blog-195",
    title: "Connecticut Workplace Violence Prevention Law: Employer Requirements",
    slug: "connecticut-workplace-violence-prevention-law-employer-requirements",
    metaTitle: "Connecticut Workplace Violence Prevention Law",
    metaDescription: "Connecticut WVP requirements for employers covering plan elements, covered employer scope, training mandates, reporting obligations, and key differences from California SB 553 law.",
  },
  {
    docId: "blog-196",
    title: "Maryland Workplace Violence Prevention: What Employers Must Know",
    slug: "maryland-workplace-violence-prevention-what-employers-must-know",
    metaTitle: "Maryland Workplace Violence Prevention for Employers",
    metaDescription: "Maryland WVP requirements covering plan elements, covered employer categories, training mandates, incident reporting, and important differences from California SB 553 compliance law.",
  },
  {
    docId: "blog-197",
    title: "Minnesota Workplace Violence Prevention Requirements for Employers",
    slug: "minnesota-workplace-violence-prevention-requirements-for-employers",
    metaTitle: "Minnesota Workplace Violence Prevention Guide",
    metaDescription: "Minnesota WVP law covering plan requirements, employer scope, training mandates, enforcement provisions, and key differences from California SB 553 that multi-state employers must know.",
  },
  {
    docId: "blog-198",
    title: "New Jersey Workplace Violence Prevention: Employer Compliance Guide",
    slug: "new-jersey-workplace-violence-prevention-employer-compliance-guide",
    metaTitle: "New Jersey Workplace Violence Prevention Guide",
    metaDescription: "New Jersey WVP requirements covering public vs private employer scope, plan elements, training mandates, reporting obligations, and key differences from California SB 553 compliance.",
  },
  {
    docId: "blog-199",
    title: "Washington State Workplace Safety: L&I WISHA Compliance Guide",
    slug: "washington-state-workplace-safety-l-i-wisha-compliance-guide",
    metaTitle: "Washington L&I WISHA Compliance for Employers",
    metaDescription: "Washington L&I and WISHA framework for employers. How WA standards differ from federal OSHA, workplace violence prevention requirements, accident prevention programs, and enforcement.",
  },
  {
    docId: "blog-200",
    title: "Michigan MIOSHA Compliance Guide for Employers",
    slug: "michigan-miosha-compliance-guide-for-employers",
    metaTitle: "Michigan MIOSHA Compliance Guide for Employers",
    metaDescription: "MIOSHA structure and how Michigan standards differ from federal OSHA. Part 1 General Industry rules, workplace violence in healthcare provisions, and enforcement pattern analysis.",
  },
  {
    docId: "blog-201",
    title: "Oregon OSHA Compliance Guide for Employers",
    slug: "oregon-osha-compliance-guide-for-employers",
    metaTitle: "Oregon OSHA Compliance Guide for Employers",
    metaDescription: "OR-OSHA structure and how Oregon standards differ from federal OSHA. Unique heat illness and wildfire smoke requirements, consultation program details, and enforcement provisions.",
  },
  {
    docId: "blog-202",
    title: "Texas Workplace Violence Prevention: Emerging Requirements for Employers",
    slug: "texas-workplace-violence-prevention-emerging-requirements-for-employers",
    metaTitle: "Texas Workplace Violence Prevention Requirements",
    metaDescription: "Texas under federal OSHA with no state plan. Emerging WVP legislation updates, General Duty Clause obligations, healthcare WVP requirements, and what employers should prepare for.",
  },
  {
    docId: "blog-203",
    title: "Virginia Workplace Safety: VOSH Compliance and WVP Requirements",
    slug: "virginia-workplace-safety-vosh-compliance-and-wvp-requirements",
    metaTitle: "Virginia VOSH Compliance and WVP Requirements",
    metaDescription: "VOSH program details and Virginia state plan requirements. WVP legislation status, unique Virginia standards, enforcement provisions, and penalty structures for covered employers.",
  },
  {
    docId: "blog-204",
    title: "Protekon vs Safety Consultants: Managed Compliance Compared",
    slug: "protekon-vs-safety-consultants-managed-compliance-compared",
    metaTitle: "Managed Compliance vs Safety Consultants Compared",
    metaDescription: "Monthly managed compliance platform versus hourly consulting. Coverage scope, response time, documentation quality, scalability, and real cost comparison for safety-conscious employers.",
  },
  {
    docId: "blog-205",
    title: "Protekon vs CalChamber Compliance Tools: Feature Comparison",
    slug: "protekon-vs-calchamber-compliance-tools-feature-comparison",
    metaTitle: "Managed Compliance vs CalChamber Tools Compared",
    metaDescription: "Template-based compliance tools versus done-for-you managed compliance. Where CalChamber self-service stops and full-service managed compliance programs begin for California employers.",
  },
  {
    docId: "blog-206",
    title: "Protekon vs Enterprise GRC Platforms: NAVEX, SafetyCulture, EHS Insight",
    slug: "protekon-vs-enterprise-grc-platforms-navex-safetyculture-ehs-insight",
    metaTitle: "SMB Compliance vs Enterprise GRC Platforms",
    metaDescription: "Enterprise GRC platforms require dedicated EHS staff and six-figure budgets. Managed compliance delivers done-for-you programs for SMBs without safety departments at a fraction of cost.",
  },
  {
    docId: "blog-207",
    title: "Best Workplace Violence Prevention Solutions for California Employers",
    slug: "best-workplace-violence-prevention-solutions-for-california-employers",
    metaTitle: "Best WVP Solutions for California Employers 2026",
    metaDescription: "Roundup of workplace violence prevention solutions rated on SB 553 completeness. Managed compliance, safety consultants, template providers, enterprise GRC, and DIY options compared.",
  },
  {
    docId: "blog-208",
    title: "Managed Compliance vs DIY: The Real Cost Analysis for SMBs",
    slug: "managed-compliance-vs-diy-the-real-cost-analysis-for-smbs",
    metaTitle: "Managed Compliance vs DIY: True Cost for SMBs",
    metaDescription: "Total cost of DIY compliance including hidden expenses versus managed compliance subscription pricing. ROI analysis and break-even calculations by company size for informed decisions.",
  },
  {
    docId: "blog-209",
    title: "OSHA Fines and Penalties: What Your Violation Will Actually Cost",
    slug: "osha-fines-and-penalties-what-your-violation-will-actually-cost",
    metaTitle: "OSHA Fines 2026: Penalty Amounts and True Costs",
    metaDescription: "Current OSHA penalty amounts, calculation methodology, severity adjustments, repeat violation multipliers, and the indirect costs that dwarf the fine itself for unprepared employers.",
  },
  {
    docId: "blog-210",
    title: "PII in Incident Logs: The Privacy Trap Employers Miss",
    slug: "pii-in-incident-logs-the-privacy-trap-employers-miss",
    metaTitle: "PII in Incident Logs: SB 553 Privacy Compliance",
    metaDescription: "SB 553 violent incident log PII requirements explained. What must be documented versus redacted, access restrictions, digital versus paper security, and HIPAA intersection points.",
  },
  {
    docId: "blog-211",
    title: "After a Workplace Violence Incident: Your 72-Hour Checklist",
    slug: "after-a-workplace-violence-incident-your-72-hour-checklist",
    metaTitle: "Workplace Violence Incident: 72-Hour Checklist",
    metaDescription: "Hour-by-hour response checklist after a workplace violence incident. Immediate safety, Cal/OSHA reporting, incident log documentation, investigation steps, and employee support.",
  },
  {
    docId: "blog-212",
    title: "When Insurance Demands Compliance Proof You Do Not Have",
    slug: "when-insurance-demands-compliance-proof-you-do-not-have",
    metaTitle: "Insurance Compliance Demands: What Employers Need",
    metaDescription: "Insurance renewal compliance demands explained. Workers comp mod rate impact, what underwriters look for, and how to build audit-ready documentation fast before your renewal deadline.",
  },
  {
    docId: "blog-213",
    title: "Why Free WVPP Templates Fail OSHA Inspection",
    slug: "why-free-wvpp-templates-fail-osha-inspection",
    metaTitle: "Why Free WVPP Templates Fail OSHA Inspection",
    metaDescription: "Common template failures Cal/OSHA catches: generic language, missing elements, no employee involvement, no hazard assessment, no training program. What inspectors actually check.",
  },
  {
    docId: "blog-214",
    title: "WVPP Annual Review: What Changed and What Is Due",
    slug: "wvpp-annual-review-what-changed-and-what-is-due",
    metaTitle: "WVPP Annual Review: Requirements and Checklist",
    metaDescription: "Annual WVPP review requirements under SB 553 covering mid-year review triggers, the complete review checklist, and how to properly document the review process for Cal/OSHA compliance.",
  },
  {
    docId: "blog-215",
    title: "SB 553 Permanent Standard: What Is Coming Next",
    slug: "sb-553-permanent-standard-what-is-coming-next",
    metaTitle: "SB 553 Permanent Standard: What Comes Next",
    metaDescription: "Cal/OSHA Standards Board rulemaking for the SB 553 permanent standard. Expected changes, public comment timeline, and what California employers should prepare for before December 2026.",
  },
  {
    docId: "blog-216",
    title: "Compliance Training Requirements: Formats, Frequency and Documentation",
    slug: "compliance-training-requirements-formats-frequency-and-documentation",
    metaTitle: "Compliance Training: Requirements and Formats",
    metaDescription: "Training requirements across all compliance programs. Initial versus annual versus triggered training, acceptable formats, bilingual delivery standards, and documentation requirements.",
  },
  {
    docId: "blog-217",
    title: "OSHA Recordkeeping: Retention Periods and Digital Storage",
    slug: "osha-recordkeeping-retention-periods-and-digital-storage",
    metaTitle: "OSHA Records: Retention Periods and Storage Rules",
    metaDescription: "Retention periods by document type across all compliance programs. Digital versus paper records, backup procedures, and how to handle document retrieval during OSHA inspections.",
  },
  {
    docId: "blog-218",
    title: "Outsourcing Compliance: ROI Analysis for SMBs",
    slug: "outsourcing-compliance-roi-analysis-for-smbs",
    metaTitle: "Outsourcing Compliance: ROI Analysis for SMBs",
    metaDescription: "Cost-benefit analysis of outsourcing compliance for small and mid-sized businesses. Internal staff costs versus consultants versus managed compliance, and a framework to calculate ROI.",
  },
  {
    docId: "blog-219",
    title: "Employer Liability: When Compliance Gaps Become Lawsuits",
    slug: "employer-liability-when-compliance-gaps-become-lawsuits",
    metaTitle: "Employer Liability: Compliance Gaps and Lawsuits",
    metaDescription: "How compliance failures create liability beyond OSHA penalties. Negligence per se, workers comp mod rate impact, wrongful death exposure, and insurance coverage gaps that hurt employers.",
  },
  {
    docId: "blog-220",
    title: "Compliance Requirements by California Region: What Local Employers Face",
    slug: "compliance-requirements-by-california-region-what-local-employers-face",
    metaTitle: "California Regional Compliance Requirements Guide",
    metaDescription: "Regional compliance across California covering Inland Empire warehouses, LA entertainment, Bay Area tech, Central Valley agriculture, and regional Cal/OSHA district enforcement.",
  },
  {
    docId: "blog-221",
    title: "Compliance Platform Comparison: Features That Matter for SMBs",
    slug: "compliance-platform-comparison-features-that-matter-for-smbs",
    metaTitle: "Compliance Platform Comparison for Small Business",
    metaDescription: "SMB compliance platform buyer's guide. Coverage breadth, vertical specialization, managed versus self-service, enforcement intelligence, training management, and pricing transparency.",
  },
  {
    docId: "blog-222",
    title: "Is SB 553 Applicable to My Business: A Screening Guide",
    slug: "is-sb-553-applicable-to-my-business-a-screening-guide",
    metaTitle: "Does SB 553 Apply to My Business? Screening Guide",
    metaDescription: "Decision tree for SB 553 applicability. Employees in California, on-site work, public interaction, statutory exemptions, and common misconceptions about workplace violence prevention.",
  },
  {
    docId: "blog-223",
    title: "Vertical-Specific Compliance: Beyond the 8 Baseline Templates",
    slug: "vertical-specific-compliance-beyond-the-8-baseline-templates",
    metaTitle: "Vertical Compliance: Industry-Specific Programs",
    metaDescription: "How the compliance framework works: 8 platform-wide templates for all 27 verticals plus vertical-specific safety programs for 11 industries. Beyond baseline to full coverage explained.",
  },
]

// Auto-fit description to 150-160 chars
function fitDescription(desc: string): string {
  if (desc.length >= 150 && desc.length <= 160) return desc
  if (desc.length > 160) {
    // Try cutting at last period before char 161
    const sub = desc.slice(0, 160)
    const lastPeriod = sub.lastIndexOf(".")
    if (lastPeriod >= 150) return desc.slice(0, lastPeriod + 1)
    // Try cutting at last comma, replace with period
    const lastComma = sub.lastIndexOf(",")
    if (lastComma >= 149) return desc.slice(0, lastComma) + "."
    // Cut at last space, add period
    const lastSpace = sub.lastIndexOf(" ")
    if (lastSpace >= 149) return desc.slice(0, lastSpace) + "."
    return desc.slice(0, 159) + "."
  }
  // Too short — return as-is, flag below
  return desc
}

function validate(mt: string, md: string): string | null {
  if (mt.length === 0) return "metaTitle is empty"
  if (mt.length > 60) return `metaTitle is ${mt.length} chars (max 60)`
  if (md.length < 150) return `metaDescription is ${md.length} chars (min 150)`
  if (md.length > 160) return `metaDescription is ${md.length} chars (max 160)`
  return null
}

let errors = 0
let written = 0
let trimmed = 0

for (const entry of entries) {
  const original = entry.metaDescription
  entry.metaDescription = fitDescription(entry.metaDescription)
  if (entry.metaDescription !== original) trimmed++

  const err = validate(entry.metaTitle, entry.metaDescription)
  if (err) {
    console.error(`❌ ${entry.docId}: ${err}`)
    console.error(`   title (${entry.metaTitle.length}): ${entry.metaTitle}`)
    console.error(`   desc  (${entry.metaDescription.length}): ${entry.metaDescription}`)
    errors++
    continue
  }

  const safe = entry.docId.replace(/[^a-zA-Z0-9._-]/g, "_")
  const cachePath = join(CACHE_DIR, `${safe}.json`)
  const cacheEntry = {
    docId: entry.docId,
    title: entry.title,
    slug: entry.slug,
    metaTitle: entry.metaTitle,
    metaDescription: entry.metaDescription,
    tokensUsed: { input: 0, output: 0 },
    generatedAt: new Date().toISOString(),
  }
  writeFileSync(cachePath, JSON.stringify(cacheEntry, null, 2), "utf-8")
  written++
}

console.log(`\n✅ Written: ${written}/${entries.length} cache files`)
if (trimmed > 0) console.log(`✂️  Auto-trimmed: ${trimmed} descriptions`)
if (errors > 0) console.log(`❌ Errors: ${errors} (fix and re-run)`)
console.log(`\nNext: pnpm tsx scripts/sanity/generate-blog-seo.ts --apply`)
