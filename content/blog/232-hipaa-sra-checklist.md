---
id: 232
title: "HIPAA Security Risk Assessment Checklist"
resourceType: checklist
regulatoryDomain: hipaa
industries: ["healthcare"]
contentTier: checklist-article
excerpt: "SRA checklist: ePHI inventory, threat identification, vulnerability assessment, current security measures, risk determination, risk management actions."
---

# HIPAA Security Risk Assessment Checklist

The Security Risk Assessment is the single most important thing you will do for HIPAA compliance. I'm not being hyperbolic. HHS has said so explicitly, repeatedly, and loudly — and then backed it up with enforcement actions against organizations of every size.

The SRA is not a checklist you check off and file away. It's an analysis. It requires thinking. But it also requires structure, which is what this checklist provides. Use it as your framework, not as your entire assessment.

If you haven't done an SRA in the past 12 months, you are in violation of the HIPAA Security Rule right now. Not "at risk of violation." In violation. So let's fix that.

---

## Phase 1: ePHI Inventory

You can't protect what you don't know exists. Identify every location where electronic Protected Health Information is created, received, maintained, or transmitted.

### Systems and Applications

- [ ] **Electronic Health Record (EHR) system.** Vendor name, hosting location (cloud vs. on-premise), version.
- [ ] **Practice management system.** If separate from EHR.
- [ ] **Billing and claims software.** Including clearinghouse connections.
- [ ] **Patient portal.** Vendor and hosting details.
- [ ] **Email system.** Do any emails contain ePHI? (If yes, is it encrypted?)
- [ ] **Fax system.** Electronic fax services that store or transmit ePHI.
- [ ] **Voicemail system.** If voicemails contain patient information.
- [ ] **Scheduling system.** If it contains patient health information.
- [ ] **Laboratory interfaces.** Electronic lab order and result systems.
- [ ] **Imaging systems.** PACS, radiology information systems.
- [ ] **Cloud storage.** Dropbox, Google Drive, OneDrive, iCloud — any cloud service where ePHI might reside.
- [ ] **Backup systems.** Where are backups stored? On-site? Off-site? Cloud?
- [ ] **Telehealth platform.** If you provide virtual visits.

### Devices

- [ ] **Desktop computers.** Number, locations, who has access.
- [ ] **Laptops.** Number, who uses them, where they travel, encrypted?
- [ ] **Tablets.** Used for patient intake, charting, or communication?
- [ ] **Smartphones.** Staff phones used for any practice communication involving ePHI?
- [ ] **USB drives / external storage.** Any portable media containing ePHI?
- [ ] **Copiers/printers/scanners.** Modern multi-function devices have hard drives that store document images.
- [ ] **Medical devices.** Any devices that store or transmit patient data electronically?
- [ ] **Servers.** On-premise servers, location, physical security.

### Data Flows

- [ ] **Map how ePHI moves through your organization.** From patient intake to billing to storage to disposal. Document every handoff point.
- [ ] **Identify all external transmission points.** Claims submission, lab orders, referrals, patient portal messages, email, fax.
- [ ] **Identify all third-party access points.** IT vendors with remote access, billing companies, clearinghouses, cloud providers.

---

## Phase 2: Threat Identification

For each ePHI location identified in Phase 1, identify realistic threats. Not every theoretical threat — realistic ones based on your environment.

### Natural Threats

- [ ] **Fire.** Risk level for your facility. Sprinkler system? Offsite backup?
- [ ] **Flood.** Is the facility in a flood zone? Are servers/equipment on ground floor?
- [ ] **Power outage.** Frequency in your area. UPS/generator available?
- [ ] **Extreme weather.** Earthquakes, hurricanes, tornadoes — regionally appropriate.

### Human Threats — External

- [ ] **Hackers/cybercriminals.** Ransomware, data theft, phishing. This is the #1 threat to healthcare organizations by volume.
- [ ] **Social engineering.** Phone calls, emails, or in-person attempts to obtain credentials or access.
- [ ] **Physical intrusion.** Unauthorized individuals accessing areas with ePHI.
- [ ] **Vendor/contractor risk.** Third parties with access to your systems or data.

### Human Threats — Internal

- [ ] **Unauthorized access by employees.** Snooping in records without a job-related need (this is more common than external breaches in small practices).
- [ ] **Disgruntled or departing employees.** Data theft or sabotage.
- [ ] **Accidental disclosure.** Mis-sent faxes, wrong-patient emails, unattended screens.
- [ ] **Lost or stolen devices.** Laptops, phones, USB drives left in cars or public places.

### Environmental/Technical Threats

- [ ] **Hardware failure.** Server crash, hard drive failure, network equipment failure.
- [ ] **Software malfunction.** Application errors, data corruption, failed updates.
- [ ] **Malware.** Viruses, ransomware, spyware — not from targeted attacks, but from routine exposure.
- [ ] **Network failure.** Internet outage, internal network failure.

---

## Phase 3: Vulnerability Assessment

For each threat identified, what vulnerabilities exist that the threat could exploit?

### Administrative Vulnerabilities

- [ ] **No or outdated security policies.** Written policies covering all Security Rule requirements?
- [ ] **Insufficient training.** Staff not trained on security awareness, phishing, password management?
- [ ] **No access management process.** Accounts not disabled when staff leave? No periodic access review?
- [ ] **No incident response plan.** What happens when a breach or security event occurs?
- [ ] **No BAA management.** Business associates without signed agreements? No verification of BA security?
- [ ] **No SRA history.** This is the first SRA? Previous SRA not updated?

### Physical Vulnerabilities

- [ ] **Unsecured server/equipment room.** Anyone can walk in?
- [ ] **Workstations visible to public.** Patients or visitors can see screens?
- [ ] **No visitor access controls.** Unrestricted access to areas with ePHI?
- [ ] **Portable devices unsecured.** Laptops left out, no cable locks, no locked storage?
- [ ] **Paper records unsecured.** (Crossover risk — paper PHI and ePHI often coexist.)
- [ ] **No disposal procedures.** Old equipment or media disposed of without wiping/destroying?

### Technical Vulnerabilities

- [ ] **Weak or shared passwords.** Users sharing credentials? No complexity requirements? No MFA?
- [ ] **No encryption.** Data at rest and in transit unencrypted?
- [ ] **Unpatched software.** Operating systems, applications, or firmware not current?
- [ ] **No antivirus/anti-malware.** Or outdated definitions?
- [ ] **No firewall.** Or misconfigured firewall?
- [ ] **No audit logging.** Or logs not reviewed?
- [ ] **No automatic logoff.** Workstations stay logged in when unattended?
- [ ] **No backup or untested backup.** Backups not running? Never tested a restore?
- [ ] **Unsecured wireless network.** Open WiFi? No network segmentation? Guest and clinical on same network?
- [ ] **No intrusion detection.** No monitoring for unauthorized access attempts?

---

## Phase 4: Current Security Measures

Document what safeguards you already have in place. This isn't about what you plan to do — it's about what's actually implemented right now.

- [ ] **Access controls.** Unique user IDs, role-based access, automatic logoff — what's in place?
- [ ] **Encryption.** What's encrypted? Laptops? Email? Backups? Database? Be specific.
- [ ] **Physical security.** Locked doors, badge access, camera systems, visitor sign-in — document it.
- [ ] **Network security.** Firewalls, VPN, network segmentation, intrusion detection — what's active?
- [ ] **Endpoint protection.** Antivirus, anti-malware, endpoint detection — on which devices?
- [ ] **Backup and recovery.** Automated backups, tested restores, offsite/cloud backup — details.
- [ ] **Training program.** When was the last security training? Who attended? What was covered?
- [ ] **Policies and procedures.** Which security policies exist in writing? When were they last updated?
- [ ] **Audit and monitoring.** What logs are enabled? How often are they reviewed? By whom?
- [ ] **Incident response.** Is there a written plan? Has it been tested?

---

## Phase 5: Risk Determination

For each threat-vulnerability pair, determine the risk level.

### Risk Matrix

For each identified risk:

- [ ] **Assess likelihood.** Low (unlikely to occur), Medium (could occur), High (probably will occur)
- [ ] **Assess impact.** Low (minor inconvenience), Medium (significant harm to patients or operations), High (severe harm, large-scale breach, regulatory action)
- [ ] **Calculate risk level.** Likelihood x Impact = Risk Level

| | Low Impact | Medium Impact | High Impact |
|---|---|---|---|
| **High Likelihood** | Medium | High | Critical |
| **Medium Likelihood** | Low | Medium | High |
| **Low Likelihood** | Low | Low | Medium |

- [ ] **Document each risk** with its rating and the rationale for the assessment.

---

## Phase 6: Risk Management Plan

For every risk rated Medium or above, determine your response.

- [ ] **Risk mitigation.** Implement safeguards to reduce the risk. Document: what will be done, who is responsible, target completion date, expected risk reduction.
- [ ] **Risk acceptance.** If you decide to accept a risk, document: the risk, why mitigation is not feasible or cost-effective, who made the decision, the date.
- [ ] **Risk transfer.** Insurance, outsourcing to a qualified vendor — document the mechanism and remaining residual risk.
- [ ] **Priority ranking.** Address Critical risks first, then High, then Medium. Low risks should be monitored.
- [ ] **Implementation timeline.** Specific dates for each mitigation action. Not "Q3" — a specific date with a specific person responsible.

---

## Phase 7: Documentation and Retention

- [ ] **Compile the complete SRA document.** All phases, findings, risk ratings, and the management plan.
- [ ] **Date and sign the assessment.** Who conducted it, when, and who approved the findings.
- [ ] **Retain for six years minimum.** Per HIPAA documentation requirements.
- [ ] **Schedule the next SRA.** No more than 12 months from the completion date of this one.
- [ ] **Track mitigation progress.** Review the management plan quarterly to verify actions are being completed on schedule.

---

The SRA is not paperwork. It's the foundation of your entire HIPAA security program. Every safeguard decision, every policy, every training topic should flow from what you discover in this assessment.

Do it thoroughly. Do it honestly. And do it at least once a year.

Because the breach you prevent is the one that never makes the news.
