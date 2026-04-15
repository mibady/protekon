---
id: 322
title: "Help: Managing PII Redaction in Incident Logs"
helpCategory: incidents
order: 3
excerpt: "Understand automatic PII redaction, role-based access controls, redacted exports, full-detail investigator access, and audit trails."
date: "2026-04-12"
type: help
---

# Managing PII Redaction in Incident Logs

Incident reports contain sensitive information — employee names, medical details, witness statements, and sometimes information about criminal activity. Not everyone who needs to see your incident data needs to see all of it. And some data you are legally required to protect.

Protekon's PII redaction system ensures the right people see the right level of detail, and every access is logged.

## What Gets Redacted

Protekon automatically identifies and redacts the following personally identifiable information (PII) in incident reports and logs:

**Always redacted in standard views:**
- Employee names (replaced with Employee ID or role descriptor)
- Social Security Numbers (if entered — which they should not be, but it happens)
- Home addresses
- Personal phone numbers
- Personal email addresses
- Date of birth
- Medical diagnosis details (replaced with general category like "musculoskeletal injury" instead of specific diagnosis)

**Redacted in external exports:**
- All of the above, plus:
- Witness names and contact information
- Specific location details below the site level
- Photo faces (auto-blurred in exported versions)
- Statement attributions (statements are included but not attributed to named individuals)

**Never redacted (required for OSHA logs):**
- Job title
- Date of incident
- General incident description
- Body part affected (category)
- Outcome classification (days away, restricted work, etc.)

## How Automatic Redaction Works

Protekon scans incident report text fields using pattern recognition and natural language processing to identify PII:

1. When an incident report is submitted, the system creates two versions: a **full-detail version** containing all information as entered by the reporter, and a **redacted version** where PII elements are replaced with tokens (such as [EMPLOYEE-A] or [WITNESS-1]).

2. Which version a user sees depends on their role and the access controls configured for your organization.

3. Redaction is applied at the display layer — the full-detail version is always preserved in the database for authorized access. Redaction does not destroy data.

If the automatic redaction misses something or incorrectly redacts a non-PII element, Compliance Managers and Admins can manually adjust redaction by clicking the **"Edit Redaction"** button on any incident report. They can mark additional text for redaction or unmark incorrectly flagged text. Changes to redaction settings are logged in the audit trail.

## Role-Based Access Controls

Access to incident data follows your organization's role hierarchy:

| Role | What They See |
|------|--------------|
| **Admin** | Full-detail version of all incidents. Complete access to all PII. |
| **Compliance Manager** | Full-detail version of all incidents. Complete access to all PII. |
| **Investigator** (assigned) | Full-detail version of incidents assigned to them. Redacted version of all other incidents. |
| **Supervisor** | Redacted version of incidents in their department. Cannot see incidents outside their department. |
| **Employee** | Can see and edit only their own submitted reports (full detail for their own reports). Cannot see other employees' reports. |
| **External Auditor** (if configured) | Redacted version only. No access to full-detail versions. |

To modify role permissions:

1. Navigate to **Settings > Roles and Permissions > Incident Access.**
2. Adjust which roles can access full-detail vs. redacted versions.
3. You can create custom roles with specific access levels if the default roles do not match your organizational needs.

## Full-Detail Access for Investigators

When an investigator is assigned to an incident, they automatically receive full-detail access to that specific incident:

- All PII is visible in the incident report, witness statements, and photos
- The investigator can add interview notes and findings that also contain PII
- Full-detail access is limited to the duration of the investigation — when the investigation is closed, access reverts to the redacted version (unless the investigator also holds a Compliance Manager or Admin role)

**Requesting elevated access:** If a supervisor or employee needs temporary full-detail access to an incident they are not assigned to investigate:

1. They click **"Request Full Access"** on the redacted incident report.
2. The request goes to the Compliance Manager for approval.
3. If approved, full-detail access is granted for a specified duration (default: 7 days).
4. The access grant and expiration are logged in the audit trail.

## Redacted Exports

When exporting incident data for external parties (insurance companies, attorneys, regulatory agencies), Protekon produces appropriately redacted documents:

**For insurance carriers:**
- Navigate to **Incidents > Export.**
- Select **"Insurance Export"** format.
- The export includes incident details sufficient for claims processing but redacts employee PII beyond what the carrier needs.

**For regulatory inspectors (Cal/OSHA, OSHA):**
- Select **"Regulatory Export"** format.
- This format matches OSHA 300/301 data requirements — includes job title, incident details, and outcome but redacts employee names (replaced with employee ID consistent with your OSHA 300 Log).
- Note: During an actual inspection, an inspector may request unredacted records. Protekon's export system supports generating an unredacted version for in-person inspection use.

**For legal counsel:**
- Select **"Legal Export"** format.
- Full-detail, unredacted export protected by attorney-client privilege markings.
- This export includes a header watermark: "PRIVILEGED AND CONFIDENTIAL — PREPARED AT DIRECTION OF COUNSEL"

## Audit Trail

Every access to incident data is logged in Protekon's audit trail:

- **Who** accessed the record (user name, role, timestamp)
- **What** they accessed (which incident, full-detail or redacted)
- **What action** they took (viewed, downloaded, exported, edited, redacted or unredacted)
- **From where** (IP address, device type)

To view the audit trail:

1. Navigate to **Incidents > Audit Trail** for a global view.
2. Or open any specific incident and click **"Access Log"** for that incident's history.

Audit trails are immutable — they cannot be edited or deleted, even by Admins. They are retained for the duration of your subscription plus seven years.

Protect your employees' privacy. Document your incidents thoroughly. Protekon makes both possible simultaneously.
