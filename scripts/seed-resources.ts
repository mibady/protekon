/**
 * Seed script: Push resource content + categories into Sanity CMS
 * Run: npx tsx scripts/seed-resources.ts
 */
import { config } from "dotenv"
config({ path: ".env.local" })

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_API_PROJECT_ID
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_API_DATASET
const TOKEN = process.env.SANITY_API_WRITE_TOKEN

if (!PROJECT_ID || !DATASET || !TOKEN) {
  console.error("Missing SANITY env vars. Check .env.local")
  process.exit(1)
}

const API = `https://${PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${DATASET}`

// Helper: convert markdown-style text into Portable Text blocks
function textToBlocks(text: string) {
  return text.split("\n\n").map((paragraph) => {
    const isH2 = paragraph.startsWith("## ")
    const isH3 = paragraph.startsWith("### ")
    const isList = paragraph.split("\n").every((l) => l.startsWith("- "))

    if (isH2) {
      return {
        _type: "block",
        _key: rkey(),
        style: "h2",
        children: [{ _type: "span", _key: rkey(), text: paragraph.replace("## ", "") }],
      }
    }
    if (isH3) {
      return {
        _type: "block",
        _key: rkey(),
        style: "h3",
        children: [{ _type: "span", _key: rkey(), text: paragraph.replace("### ", "") }],
      }
    }
    if (isList) {
      return paragraph.split("\n").map((line) => ({
        _type: "block",
        _key: rkey(),
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [{ _type: "span", _key: rkey(), text: line.replace("- ", "") }],
      }))
    }
    return {
      _type: "block",
      _key: rkey(),
      style: "normal",
      children: [{ _type: "span", _key: rkey(), text: paragraph.trim() }],
    }
  }).flat()
}

function rkey() {
  return Math.random().toString(36).slice(2, 10)
}

// ─── Categories ───

const categories = [
  { _id: "cat-compliance", _type: "resourceCategory", title: "Compliance", slug: { _type: "slug", current: "compliance" }, description: "Compliance requirements, audits, and enforcement" },
  { _id: "cat-regulations", _type: "resourceCategory", title: "Regulations", slug: { _type: "slug", current: "regulations" }, description: "Regulatory standards, updates, and deadlines" },
  { _id: "cat-industry", _type: "resourceCategory", title: "Industry", slug: { _type: "slug", current: "industry" }, description: "Industry-specific compliance guidance" },
  { _id: "cat-best-practices", _type: "resourceCategory", title: "Best Practices", slug: { _type: "slug", current: "best-practices" }, description: "Operational best practices for workplace safety" },
]

// ─── Resources ───

const resources = [
  // ── Featured: Guide ──
  {
    _id: "res-sb-553-guide",
    _type: "resource",
    title: "The Complete Guide to SB 553 Compliance",
    slug: { _type: "slug", current: "sb-553-guide" },
    resourceType: "guide",
    featured: true,
    excerpt: "Everything California employers need to know about the Workplace Violence Prevention Act. Requirements, deadlines, and implementation strategies for full SB 553 compliance.",
    categories: [{ _type: "reference", _ref: "cat-compliance", _key: rkey() }],
    industries: ["construction", "healthcare", "hospitality", "manufacturing", "retail", "real-estate", "agriculture", "transportation", "wholesale"],
    publishedAt: "2025-03-01T00:00:00Z",
    body: textToBlocks(`## What Is SB 553?

Senate Bill 553, signed into law in September 2023, is California's Workplace Violence Prevention Act. It requires nearly every employer in the state to establish, implement, and maintain a written Workplace Violence Prevention Plan (WVPP) by July 1, 2024. This is separate from your Injury and Illness Prevention Program and specifically addresses the growing concern of violence in California workplaces.

## Who Must Comply?

SB 553 applies to virtually all California employers and their employees, with limited exceptions for remote workers who do not interact with the public, healthcare facilities already covered under Cal/OSHA's existing violence prevention standard (8 CCR 3342), law enforcement agencies, and certain facilities operated by the Department of Corrections. If you have even one employee who works on-site or interacts with the public, you likely need a WVPP.

## Key Requirements

### Written Workplace Violence Prevention Plan

Your WVPP must be a standalone written document that includes the names or job titles of persons responsible for implementing the plan, procedures to involve employees in development and implementation, methods for coordinating implementation with other employers at shared worksites, procedures to accept and respond to reports of workplace violence, procedures to ensure compliance with the plan, and procedures for post-incident response and investigation.

### Violent Incident Log

Every incident, post-incident response, and workplace violence injury investigation must be recorded in a violent incident log. The log must include the date, time, and location of the incident, a detailed description of the incident, a classification of who committed the violence (Type 1 through 4), the type of violence (physical attack, threat, sexual assault, animal attack), consequences of the incident including injuries, and the names of the people involved. This log must be maintained for a minimum of five years.

### Training Requirements

Employers must provide initial training when the plan is first established, then annual training thereafter, plus additional training when a new hazard is identified or when the plan is updated. Training must cover the employer's WVPP, how to report incidents, workplace violence hazards specific to the operation, and how to avoid physical harm through de-escalation and emergency procedures.

## How to Create Your WVPP

Step 1: Assign a responsible person or team to own the plan. Step 2: Conduct a workplace violence hazard assessment of your physical environment, work practices, and history. Step 3: Draft the written plan addressing all required elements. Step 4: Develop reporting procedures that employees can access without fear of retaliation. Step 5: Create your violent incident log template. Step 6: Train all employees on the plan. Step 7: Establish a review schedule to update the plan at least annually.

## Enforcement and Penalties

Cal/OSHA began enforcing SB 553 after July 1, 2024. Violations can result in citations ranging from general violations at $18,000 per instance to willful or repeat violations at up to $180,000 per instance. Beyond fines, employers face increased scrutiny during routine inspections and potential abatement orders requiring immediate corrective action.

## Implementation Checklist

- Designate a WVPP administrator
- Complete a workplace violence hazard assessment
- Draft and finalize the written WVPP
- Create a violent incident log template
- Establish anonymous reporting procedures
- Train all current employees
- Document training completion
- Schedule annual plan review
- Schedule annual refresher training
- Post the plan where employees can access it`),
  },

  // ── Featured: Template ──
  {
    _id: "res-iipp-template",
    _type: "resource",
    title: "IIPP Template for California SMBs",
    slug: { _type: "slug", current: "iipp-template" },
    resourceType: "template",
    featured: true,
    excerpt: "A customizable Injury and Illness Prevention Program template that meets 8 CCR 3203 requirements. Ready to adapt to your business.",
    categories: [{ _type: "reference", _ref: "cat-compliance", _key: rkey() }],
    industries: ["construction", "healthcare", "hospitality", "manufacturing", "retail", "agriculture", "transportation", "wholesale"],
    publishedAt: "2025-02-25T00:00:00Z",
    body: textToBlocks(`## What Is an IIPP?

An Injury and Illness Prevention Program (IIPP) is California's cornerstone workplace safety requirement. Under Title 8, California Code of Regulations, Section 3203, every California employer must establish, implement, and maintain an effective written IIPP. It is the single most-cited regulation in Cal/OSHA history, and the number one reason businesses receive citations during inspections.

## The 8 Required Elements

Your IIPP must include all eight elements mandated by 8 CCR 3203. Missing any one of them makes your program deficient and subject to citation.

### 1. Management Commitment and Assignment of Responsibilities

Name the person or persons with authority and responsibility for implementing the program. This must be someone with the power to allocate resources and enforce compliance. A name and title, not just a generic role.

### 2. Safety Communication System

Establish a two-way communication system so employees can report hazards without fear of reprisal and management can share safety information. This can include safety meetings, newsletters, bulletin boards, anonymous reporting hotlines, or digital platforms.

### 3. System for Identifying Workplace Hazards

Document how you will identify hazards. This includes scheduled periodic inspections, inspections when new substances or processes are introduced, and inspections when new hazards are brought to your attention.

### 4. Hazard Correction Procedures

When a hazard is identified, you must have a documented process for correcting it in a timely manner. If the hazard is imminent, it must be addressed immediately. If correction takes time, interim protective measures must be implemented.

### 5. Accident and Exposure Investigation Procedures

Every workplace incident, injury, illness, or close call must be investigated to identify root causes and prevent recurrence. Document your investigation process.

### 6. Employee Training

All employees must be trained when the IIPP is first established, when new employees are hired, when new hazards are introduced, and when supervisors need instruction on safety leadership. Training must be documented with date, topic, trainer, and attendees.

### 7. Recordkeeping

Maintain records of hazard inspections, training sessions, and corrective actions. For employers with fewer than 10 employees, some recordkeeping alternatives exist, but documentation of training and inspections is still required.

### 8. Compliance Assurance

You must have a system to ensure employees comply with safe work practices. This includes recognition programs for safe behavior and disciplinary procedures for violations. The emphasis should be on positive reinforcement, but a clear escalation path must exist.

## Common IIPP Mistakes

- Having a generic template that is not customized to your actual workplace
- Failing to update the IIPP when operations change
- Missing training documentation
- No evidence of periodic inspections
- Listing a responsible person who has left the company
- No system for employees to report hazards anonymously`),
  },

  // ── Featured: Webinar ──
  {
    _id: "res-inspection-webinar",
    _type: "resource",
    title: "Cal/OSHA Inspection: What to Expect",
    slug: { _type: "slug", current: "inspection-webinar" },
    resourceType: "webinar",
    featured: true,
    excerpt: "A recorded webinar walking through the Cal/OSHA inspection process. Opening conference, walkaround, closing conference, and follow-up.",
    categories: [{ _type: "reference", _ref: "cat-compliance", _key: rkey() }],
    industries: ["construction", "healthcare", "hospitality", "manufacturing", "retail", "agriculture", "transportation", "wholesale"],
    publishedAt: "2025-02-20T00:00:00Z",
    body: textToBlocks(`## What Triggers a Cal/OSHA Inspection?

Cal/OSHA inspections can be triggered by several events. Employee complaints are the most common trigger. A worker files a confidential complaint alleging unsafe conditions, and Cal/OSHA is obligated to investigate. Referrals from other agencies, media reports, or observations by Cal/OSHA compliance officers during drive-bys can also trigger inspections. Programmed inspections target high-hazard industries on a rotating schedule. Finally, any serious injury, hospitalization, or fatality that must be reported to Cal/OSHA within 8 hours will trigger an immediate investigation.

## The Opening Conference

When a Cal/OSHA compliance officer arrives, they will present credentials and explain the purpose of the inspection. You have the right to verify their identity by calling the local Cal/OSHA district office. The officer will outline the scope of the inspection, request relevant documents, and ask to speak with a management representative and an employee representative. You do not have the right to refuse the inspection, though you can request a warrant. This rarely works in your favor and signals non-cooperation.

## The Walkaround

The compliance officer will conduct a physical inspection of your workplace, typically accompanied by both a management and employee representative. During the walkaround, the officer will observe work practices and conditions, take photographs and measurements, review safety equipment and signage, interview employees privately, and note potential violations. Employees have the right to speak privately with the officer, and you cannot retaliate against them for doing so.

## Document Requests

Expect the officer to request your IIPP, your SB 553 WVPP if applicable, OSHA 300 logs for the past five years, training records, safety inspection records, hazard communication program, specific written programs related to the inspection scope, and incident investigation reports.

## The Closing Conference

After the walkaround, the compliance officer will hold a closing conference to discuss preliminary findings and potential violations observed. This is your opportunity to provide additional context, correct misunderstandings, and demonstrate good faith. The officer may identify apparent violations but will not issue formal citations at this point.

## After the Inspection

Formal citations and proposed penalties are issued by mail, typically within six months. You have 15 working days from receipt to contest any citation. Options include informal conference with the area director, formal appeal to the Occupational Safety and Health Appeals Board, and settlement negotiations.

## How to Prepare Before an Inspection

- Keep your IIPP current and accessible
- Maintain organized training records
- Conduct and document regular self-inspections
- Ensure all required postings are displayed
- Designate an inspection coordinator
- Train supervisors on inspection protocols
- Have your OSHA 300 logs ready and accurate
- Review your SB 553 WVPP compliance`),
  },

  // ── Article: Top Violations ──
  {
    _id: "res-top-violations-2024",
    _type: "resource",
    title: "Top 10 Cal/OSHA Violations in 2024",
    slug: { _type: "slug", current: "top-violations-2024" },
    resourceType: "article",
    excerpt: "The most frequently cited Cal/OSHA violations of 2024, with average penalties and prevention strategies for each.",
    categories: [{ _type: "reference", _ref: "cat-compliance", _key: rkey() }],
    industries: ["construction", "healthcare", "hospitality", "manufacturing", "retail", "agriculture", "transportation", "wholesale"],
    publishedAt: "2025-03-15T00:00:00Z",
    body: textToBlocks(`## The Most Costly Compliance Failures

Every year, Cal/OSHA publishes data on the most frequently cited violations across California workplaces. For 2024, the pattern is clear: the same preventable failures keep showing up. Here are the top 10 and what they cost employers.

## 1. Injury and Illness Prevention Program (8 CCR 3203)

For the twentieth consecutive year, IIPP deficiencies top the list. The most common failures are missing written programs, outdated responsible person assignments, no evidence of periodic inspections, and inadequate training documentation. Average penalty: $12,500 per violation.

## 2. Fall Protection — General Requirements (8 CCR 1669)

Falls remain the leading cause of death in construction. Citations arise from unprotected edges at heights of six feet or more, missing guardrails, and inadequate fall arrest systems. Average penalty: $14,200 per violation.

## 3. Hazard Communication (8 CCR 5194)

Employers must maintain a written hazard communication program, safety data sheets for all hazardous chemicals, and proper container labeling. Missing SDSs and untrained employees are the most common citation triggers.

## 4. Lockout/Tagout — Control of Hazardous Energy (8 CCR 3314)

Failure to implement energy isolation procedures during machine maintenance and servicing. This is frequently cited with serious classification due to the severity of potential injuries.

## 5. Electrical Safety (8 CCR 2299-2599)

Exposed wiring, missing covers on electrical panels, improper use of extension cords, and lack of GFCI protection in wet environments.

## 6. Heat Illness Prevention (8 CCR 3395)

California's heat illness prevention standard is heavily enforced in outdoor industries. Citations for inadequate water supply, no shade structures, missing acclimatization procedures for new workers, and no written heat illness prevention plan.

## 7. Scaffolding (8 CCR 1635-1660)

Improperly constructed scaffolds, missing guardrails, no access ladders, and scaffold use by untrained workers. Predominantly a construction-industry citation.

## 8. Respiratory Protection (8 CCR 5144)

Employers who require respirator use must have a written respiratory protection program, provide medical evaluations, conduct fit testing, and train employees. Using dust masks without a program is a citation.

## 9. Machine Guarding (8 CCR 4000-4002)

Unguarded points of operation, ingoing nip points, and rotating parts. Common in manufacturing, food processing, and agricultural operations.

## 10. Recordkeeping — OSHA 300 Logs (8 CCR 14300)

Failure to maintain accurate injury and illness logs, failure to post the annual summary (300A) in February, and failure to report severe injuries within the required timeframe.

## Prevention Strategy

The pattern across all ten violations is the same: documented programs, regular training, consistent inspections, and proper recordkeeping. Employers who maintain an active compliance management system rarely appear on this list.`),
  },

  // ── Article: SB 553 Deadline ──
  {
    _id: "res-sb-553-deadline",
    _type: "resource",
    title: "Understanding the SB 553 July 1 Deadline",
    slug: { _type: "slug", current: "sb-553-deadline" },
    resourceType: "article",
    excerpt: "What the SB 553 deadline means for your business, what was required by July 1, and what Cal/OSHA is enforcing now.",
    categories: [{ _type: "reference", _ref: "cat-regulations", _key: rkey() }],
    industries: ["construction", "healthcare", "hospitality", "manufacturing", "retail", "real-estate", "agriculture", "transportation", "wholesale"],
    publishedAt: "2025-03-10T00:00:00Z",
    body: textToBlocks(`## The Deadline Has Passed

July 1, 2024 was the compliance date for California's Workplace Violence Prevention Act, SB 553. By that date, employers were required to have a written Workplace Violence Prevention Plan, a violent incident log system in place, and initial employee training completed. If you missed the deadline, you are currently operating out of compliance.

## What Cal/OSHA Is Doing Now

Cal/OSHA has incorporated SB 553 compliance into routine inspections. When a compliance officer visits your workplace for any reason, they are now checking for a current WVPP alongside your IIPP. Complaint-driven inspections specifically citing workplace violence concerns have increased significantly since the deadline.

## What You Still Need to Do

If you have not yet complied, the steps remain the same. Develop your written WVPP covering all required elements. Establish your violent incident log. Train all employees on the plan and their rights under it. Document everything. The fact that the deadline has passed does not change the requirements — it only increases your exposure to citations.

## Penalties for Non-Compliance

General violations carry penalties of up to $18,000 per instance. If Cal/OSHA determines that your failure to implement a WVPP is willful or that you were aware of the requirement and chose not to act, penalties can reach $180,000 per violation. Repeat violations within a five-year period carry enhanced penalties.

## The Bottom Line

SB 553 is not going away. Cal/OSHA is actively enforcing it. The cost of compliance is a fraction of a single citation. If you have not yet implemented your Workplace Violence Prevention Plan, the time to act is now — not after you receive a citation.`),
  },

  // ── Article: CSLB Requirements ──
  {
    _id: "res-cslb-requirements",
    _type: "resource",
    title: "Construction Safety: New CSLB Requirements",
    slug: { _type: "slug", current: "cslb-requirements" },
    resourceType: "article",
    excerpt: "New CSLB safety requirements for California construction companies, including license mandates and subcontractor oversight.",
    categories: [{ _type: "reference", _ref: "cat-industry", _key: rkey() }],
    industries: ["construction"],
    publishedAt: "2025-03-05T00:00:00Z",
    body: textToBlocks(`## CSLB and Workplace Safety

The Contractors State License Board (CSLB) is California's licensing authority for the construction industry. Beyond licensing, the CSLB has increasingly incorporated workplace safety into its enforcement actions. Licensed contractors are expected to maintain safe jobsites, and safety violations can now impact your license status.

## Workers' Compensation Requirements

Every licensed contractor must maintain active workers' compensation insurance or a valid certificate of self-insurance. The CSLB actively cross-references its licensee database with workers' compensation carrier records. Lapses in coverage trigger automatic license suspension and can result in stop-work orders at active jobsites.

## Safety Training Mandates

California requires all construction workers to receive initial safety orientation training before beginning work on a jobsite. The OSHA 10-hour Construction Safety course has become the de facto standard, with many general contractors requiring it as a condition of site access. Supervisors on multi-employer sites are increasingly required to hold OSHA 30-hour certifications.

## Subcontractor Oversight

General contractors bear responsibility for jobsite safety conditions affecting all workers on site, including those employed by subcontractors. CSLB and Cal/OSHA coordinate enforcement actions against general contractors who fail to ensure subcontractor compliance. This means verifying that your subcontractors maintain active workers' compensation coverage, have written IIPPs, comply with applicable Cal/OSHA standards, and provide trained and qualified workers.

## Penalties and License Actions

CSLB disciplinary actions for safety-related violations include monetary penalties up to $30,000 per violation, license suspension or revocation, mandatory safety education courses, and probation with conditions including regular safety audits. Cal/OSHA citations are reported to the CSLB and become part of your contractor license record, visible to the public.

## Compliance Recommendations

- Maintain a current, site-specific IIPP for every active project
- Verify subcontractor insurance and safety programs before work begins
- Require OSHA 10-hour cards from all workers
- Conduct documented weekly toolbox talks
- Perform and record regular jobsite safety inspections
- Respond promptly to any Cal/OSHA communication`),
  },

  // ── Article: Safety Meetings ──
  {
    _id: "res-safety-meetings",
    _type: "resource",
    title: "How to Conduct an Effective Safety Meeting",
    slug: { _type: "slug", current: "safety-meetings" },
    resourceType: "article",
    excerpt: "A practical guide to running productive safety meetings that satisfy Cal/OSHA requirements and actually engage employees.",
    categories: [{ _type: "reference", _ref: "cat-best-practices", _key: rkey() }],
    industries: ["construction", "healthcare", "hospitality", "manufacturing", "retail", "agriculture", "transportation", "wholesale"],
    publishedAt: "2025-02-28T00:00:00Z",
    body: textToBlocks(`## Why Safety Meetings Matter

Safety meetings are not just a regulatory checkbox. They are your primary tool for two-way safety communication, which is a required element of your IIPP under 8 CCR 3203. When done well, they reduce incidents, improve hazard reporting, and demonstrate management commitment to safety. When done poorly, they waste time and breed cynicism.

## Frequency and Duration

Cal/OSHA does not prescribe a specific frequency for safety meetings, but the standard of practice across industries is weekly for high-hazard environments like construction and manufacturing, and monthly for lower-hazard office and retail settings. Keep meetings between 10 and 20 minutes. Longer meetings lose attention. Shorter meetings feel performative.

## Choosing Effective Topics

Rotate topics based on seasonal hazards, recent incidents or near-misses, upcoming work changes, new equipment or chemicals, and regulatory updates. The best topic for any given meeting is the one most relevant to what your employees are actually doing that week. Heat illness prevention in July. Slip and fall prevention in the rainy season. Specific hazards tied to current projects.

## Running the Meeting

Start with a brief review of any incidents or near-misses since the last meeting. Present the day's topic with real examples relevant to your workplace. Ask employees to share their observations and concerns. Close with specific action items and who is responsible for them. The most important thing you can do is listen. Employees who feel heard report more hazards.

## Documentation Requirements

Every safety meeting must be documented with the date, time, and location, the topic covered, the name of the person who conducted the meeting, and the names or signatures of all attendees. Keep these records for at least three years. Cal/OSHA inspectors will ask for them.

## Common Mistakes

- Reading directly from a pre-printed safety topic sheet with no customization
- Holding meetings at times when key employees are absent
- Never following up on concerns raised in previous meetings
- Failing to document meetings even when they happen
- Making meetings punitive rather than collaborative
- Skipping meetings when the workload is heavy, which is precisely when safety attention matters most`),
  },

  // ── Article: OSHA 300 ──
  {
    _id: "res-osha-300-logging",
    _type: "resource",
    title: "Incident Logging: OSHA 300 Requirements",
    slug: { _type: "slug", current: "osha-300-logging" },
    resourceType: "article",
    excerpt: "Complete guide to OSHA 300, 300A, and 301 recordkeeping requirements for California employers.",
    categories: [{ _type: "reference", _ref: "cat-compliance", _key: rkey() }],
    industries: ["construction", "healthcare", "hospitality", "manufacturing", "retail", "agriculture", "transportation", "wholesale"],
    publishedAt: "2025-02-20T00:00:00Z",
    body: textToBlocks(`## The Three Forms

Federal OSHA and Cal/OSHA require employers with 11 or more employees to maintain three injury and illness recordkeeping forms. The OSHA 300 Log is a running log of all recordable injuries and illnesses throughout the year. The OSHA 300A Summary is an annual summary of the 300 Log that must be posted in the workplace. The OSHA 301 Incident Report provides detailed information about each individual incident.

## What Must Be Recorded

An injury or illness is recordable if it results in death, days away from work, restricted work activity or job transfer, medical treatment beyond first aid, loss of consciousness, or a significant injury or illness diagnosed by a physician. First aid cases are not recordable. The distinction between first aid and medical treatment is critical and frequently misunderstood. First aid includes wound cleaning, bandaging, non-prescription medications, tetanus shots, and similar minor treatments.

## Timeline Requirements

Injuries and illnesses must be recorded on the OSHA 300 Log within seven calendar days of learning about them. The annual 300A Summary must be posted in a conspicuous location in the workplace from February 1 through April 30 of the following year. It must be signed and certified by a company executive.

## Electronic Submission

Establishments with 250 or more employees must electronically submit their 300 and 301 data annually through OSHA's Injury Tracking Application. Establishments with 20-249 employees in designated high-hazard industries must submit their 300A data. Submission deadlines are typically March 2 of the following year.

## Cal/OSHA-Specific Requirements

California adds requirements beyond federal OSHA. Employers must report any serious injury, illness, or death to Cal/OSHA within 8 hours. The definition of serious injury in California is broader than the federal definition and includes any injury requiring hospitalization for more than 24 hours for purposes other than observation. Records must be maintained for a minimum of five years.

## Common Errors

- Recording first aid cases that are not recordable
- Failing to record injuries because the employee did not miss work
- Not posting the 300A Summary or posting it late
- Having the summary signed by someone without authority
- Maintaining logs at a corporate office instead of the establishment where the injury occurred
- Failing to update entries when circumstances change, such as when an employee who returned to work later requires surgery`),
  },

  // ── Article: Heat Illness ──
  {
    _id: "res-heat-illness",
    _type: "resource",
    title: "Heat Illness Prevention: California Rules",
    slug: { _type: "slug", current: "heat-illness" },
    resourceType: "article",
    excerpt: "California's heat illness prevention standard explained: temperature triggers, water and shade requirements, and the new indoor heat rules.",
    categories: [{ _type: "reference", _ref: "cat-regulations", _key: rkey() }],
    industries: ["construction", "agriculture", "manufacturing", "transportation"],
    publishedAt: "2025-02-15T00:00:00Z",
    body: textToBlocks(`## California's Heat Standard

California was the first state to adopt a comprehensive outdoor heat illness prevention standard. Title 8, Section 3395 of the California Code of Regulations applies to all outdoor workplaces when temperatures reach 80 degrees Fahrenheit or higher. The standard has been in effect since 2006 and has been strengthened multiple times.

## Core Requirements

### Water

Employers must provide fresh, pure, suitably cool drinking water at no cost to employees. It must be located as close as practicable to the work area. The standard requires a minimum of one quart per employee per hour for the entire shift. Water must be available before employees begin work and replenished throughout the day.

### Shade

When temperatures exceed 80°F, shade structures must be available and large enough to accommodate the number of employees on rest breaks. Shade must be open to air or have ventilation. Employees must be allowed and encouraged to take preventive cool-down rest breaks in the shade for at least five minutes when they feel the need to cool down.

### Rest

Employees taking a preventive cool-down rest break must be monitored and asked if they are experiencing symptoms of heat illness. If symptoms are present, appropriate first aid must be provided immediately. No employee should be ordered back to work until symptoms have abated.

## High-Heat Procedures (95°F and Above)

When temperatures reach 95°F, additional requirements activate. Employers must ensure effective communication by voice, observation, or electronic means so employees can contact a supervisor. A pre-shift meeting must address high-heat procedures, water and shade locations, and emergency response. Employees must be observed for signs of heat illness through a mandatory buddy system or regular supervisory check-ins.

## Acclimatization

New employees and employees returning from an absence of 14 or more days must be closely monitored for the first 14 days of work. The body requires time to adjust to working in heat. During this acclimatization period, supervisors must exercise additional vigilance and allow more frequent rest breaks.

## Indoor Heat (SB 1167)

Senate Bill 1167 directed Cal/OSHA to develop indoor heat illness prevention standards. The indoor standard applies when indoor temperatures reach 82°F in workplaces where employees perform physical labor. Requirements mirror the outdoor standard: water, cool-down areas, acclimatization, and emergency response procedures. Affected industries include warehousing, manufacturing, commercial kitchens, and laundry facilities.

## Enforcement

Heat illness citations are frequently classified as serious violations, carrying penalties of up to $25,000 per instance. In cases involving employee death, criminal prosecution of the employer is possible. Cal/OSHA conducts targeted heat enforcement campaigns during summer months, particularly in agriculture and construction.`),
  },
]

// ─── Push to Sanity ───

async function seed() {
  const mutations = [
    // Upsert categories
    ...categories.map((doc) => ({ createOrReplace: doc })),
    // Upsert resources
    ...resources.map((doc) => ({ createOrReplace: doc })),
  ]

  console.log(`Pushing ${categories.length} categories + ${resources.length} resources to Sanity...`)

  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ mutations }),
  })

  const data = await res.json()

  if (!res.ok) {
    console.error("Sanity API error:", JSON.stringify(data, null, 2))
    process.exit(1)
  }

  console.log(`✅ Successfully seeded ${data.results?.length || 0} documents`)
  console.log("   Categories:", categories.map((c) => c.slug.current).join(", "))
  console.log("   Resources:", resources.map((r) => r.slug.current).join(", "))
}

seed().catch((err) => {
  console.error("Fatal:", err)
  process.exit(1)
})
