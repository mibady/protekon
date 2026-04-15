---
id: 321
title: "Help: Using the Investigation Workflow"
helpCategory: incidents
order: 2
excerpt: "Follow the guided investigation process — root cause analysis, 5 Whys template, corrective action planning, follow-up tracking, and closing."
date: "2026-04-12"
type: help
---

# Using the Investigation Workflow

An incident report tells you what happened. An investigation tells you why it happened and what to do about it. Most employers stop at the report. The good ones investigate. The great ones investigate, implement corrective actions, verify those actions worked, and close the loop.

Protekon's investigation workflow guides you through the entire process.

## Starting an Investigation

When an incident is reported, an investigation case is automatically created and assigned to the designated investigator (configured in your IIPP setup).

To access pending investigations:

1. Navigate to **Incidents > Investigations.**
2. Pending investigations appear at the top with a red "Needs Investigation" badge.
3. Click the investigation to open the guided workflow.

**Investigation timeline targets:**
- Investigation initiated within 24 hours of the incident report
- Root cause analysis completed within 5 business days
- Corrective actions identified within 5 business days
- Investigation report completed within 10 business days

These timelines are configurable in **Settings > Incidents > Investigation Timelines.** Protekon tracks adherence and flags overdue investigations on the dashboard.

## The Investigation Workflow

### Phase 1: Fact Gathering

Before analyzing causes, gather all available facts:

**Review the incident report:**
- Read the reporter's description carefully
- Review attached photos and documentation
- Note any inconsistencies that need clarification

**Interview witnesses:**
- Interview the affected employee (if they are able and willing)
- Interview all listed witnesses separately — group interviews contaminate recollections
- Document each interview: who was interviewed, when, what they said

Protekon provides an interview documentation template:
- Interviewee name and role
- Date, time, and location of interview
- Interviewer name
- Summary of statements (use the employee's own words where possible)
- Follow-up questions needed

**Inspect the scene:**
- Visit the incident location as soon as possible after the event
- Document physical conditions (lighting, floor condition, equipment status, signage)
- Take additional photos if conditions have changed since the initial report
- Measure or quantify relevant factors (temperature, noise levels, distances)

**Review records:**
- Check the affected employee's training records — were they trained on the relevant hazards?
- Review prior incident reports for the same area, equipment, or task
- Check inspection records — was a hazard identified but not corrected?
- Review equipment maintenance logs

Enter all findings in the **Fact Gathering** section of the investigation form. The more thorough you are here, the more accurate your root cause analysis will be.

### Phase 2: Root Cause Analysis

Protekon provides a guided 5 Whys template to identify the root cause of the incident:

**How the 5 Whys works:**

Start with the incident and ask "why" repeatedly until you reach the systemic cause — not just the surface-level explanation.

**Example:**

1. What happened? Employee slipped and fell in the break room.
2. Why? The floor was wet.
3. Why was the floor wet? The ice machine had been leaking.
4. Why was the ice machine leaking? The drain line was clogged.
5. Why was the drain line clogged? There is no scheduled maintenance for the ice machine drain.
6. **Root cause:** Lack of preventive maintenance schedule for break room equipment.

The root cause is never "the employee was not paying attention." The root cause is always a system failure — inadequate training, missing procedures, deferred maintenance, insufficient engineering controls, or management decisions that prioritized speed over safety.

Protekon's 5 Whys template guides you through each level, prompts for supporting evidence at each step, flags superficial answers (like "employee error") and prompts deeper analysis, and records the identified root cause and contributing factors.

### Phase 3: Corrective Actions

Based on your root cause analysis, identify corrective actions using the hierarchy of controls:

1. **Elimination** — Remove the hazard entirely (best)
2. **Substitution** — Replace the hazard with something less dangerous
3. **Engineering Controls** — Isolate people from the hazard (guards, barriers, ventilation)
4. **Administrative Controls** — Change procedures, training, schedules, signage
5. **PPE** — Personal protective equipment (least effective, last resort)

For each corrective action, document:

- **Description** — What specifically will be done?
- **Responsible person** — Who is assigned to implement this action?
- **Target completion date** — When must it be done?
- **Priority** — Immediate (within 24 hours), short-term (within 7 days), long-term (within 30 days)
- **Verification method** — How will you confirm the action was completed and effective?

Protekon tracks each corrective action as an independent task with status tracking, deadline alerts, and completion verification.

### Phase 4: Follow-Up Tracking

After corrective actions are implemented, verify they are working:

1. Navigate to the investigation and click **"Follow-Up."**
2. For each corrective action, confirm:
   - Was it implemented as planned?
   - Has the hazard been eliminated or reduced to an acceptable level?
   - Have similar incidents occurred since implementation?
3. Document your follow-up findings.
4. If a corrective action was ineffective, reopen it and identify additional measures.

### Phase 5: Closing the Investigation

When all corrective actions are implemented and verified:

1. Click **"Close Investigation."**
2. Write a brief closing summary documenting the incident, root cause, corrective actions taken, and verification results.
3. Select the investigation outcome: Hazard Eliminated, Hazard Reduced, Ongoing Monitoring Required, or Referred to External Authority.
4. Click **"Submit and Close."**

The closed investigation is archived in **Incidents > Closed Investigations** and linked to the original incident report, OSHA 300 Log entry, and any related IIPP or WVPP records.

## Investigation Reports

To generate a formatted investigation report for external use (insurance, legal, regulatory):

1. Navigate to the closed investigation.
2. Click **"Generate Report."**
3. Select the report format: Internal (full details) or External (redacted for PII).
4. Download as PDF.

The report includes all phases: incident summary, fact gathering results, root cause analysis, corrective actions, follow-up findings, and closing summary.

Investigate every incident. Even the small ones. Especially the small ones. Small incidents are large incidents that got lucky.
