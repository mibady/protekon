---
id: 184
title: "HIPAA Security Risk Assessment: Step by Step"
regulatoryDomain: hipaa
industries: ["healthcare"]
keywordCluster: privacy-trap
contentTier: how-to
excerpt: "HIPAA Security Rule SRA requirements: scope, threat identification, vulnerability assessment, risk determination, risk management plan, and OCR audit expectations."
---

# HIPAA Security Risk Assessment: Step by Step

I'm going to tell you the single most important fact about HIPAA enforcement, and I want you to burn it into your brain.

The number one finding in every Office for Civil Rights (OCR) audit and enforcement action — the most common deficiency, the most frequently cited violation, the thing that turns a manageable breach into a seven-figure settlement — is the absence of a comprehensive, current Security Risk Assessment.

Not the absence of encryption. Not a missing firewall. Not an untrained employee.

The SRA. Or rather, the lack of one.

In case after case, OCR investigators ask for the organization's risk assessment, and the organization either can't produce one, produces something woefully inadequate, or produces a document so old it might as well be written on parchment. And in every one of those cases, the penalty multiplier goes up. Dramatically.

Because here's what OCR is really asking when they ask for your SRA: "Do you actually know where your risks are?" If the answer is no, everything else you've done is theater.

## What the Law Actually Requires

The Security Rule — 45 CFR 164.308(a)(1)(ii)(A) — requires covered entities and business associates to "conduct an accurate and thorough assessment of the potential risks and vulnerabilities to the confidentiality, integrity, and availability of electronic protected health information held by the covered entity or business associate."

Read that again. Every word matters.

**Accurate** — not guesswork, not assumptions. Actual analysis based on your actual environment.

**Thorough** — not a spot check of your EHR system while ignoring the ePHI on laptops, in email, on mobile devices, in cloud storage, on portable drives, and in every other corner of your operation where electronic health information lives.

**Potential risks and vulnerabilities** — not just the threats you've experienced, but the ones you could experience. Forward-looking, not backward-looking.

**All ePHI** — not just the obvious stuff. Everything electronic that contains, processes, stores, or transmits protected health information.

This isn't a suggestion. It's a legal requirement. And it's the foundation upon which your entire HIPAA compliance program either stands or collapses.

## The 8-Step SRA Process

I'm going to walk you through the process that actually satisfies OCR. This is based on the NIST SP 800-30 framework, which is the methodology OCR itself recommends.

### Step 1: Define the Scope

Before you assess anything, you need to know what you're assessing. The scope of your SRA must include every system, application, and location where ePHI is created, received, maintained, or transmitted.

That means:
- Your EHR/EMR system
- Practice management software
- Email (including personal email used for work)
- Mobile devices (phones, tablets, laptops)
- Cloud services (storage, backup, telehealth platforms)
- Medical devices that store patient data
- Paper records that have been digitized
- Voicemail systems with patient messages
- Fax servers (yes, really)
- Any workstation that accesses ePHI

If it touches ePHI, it's in scope. Miss something, and you've got a gap that OCR will find before you do.

### Step 2: Asset Inventory

Now list every asset within that scope. Hardware, software, data stores, network components. Where does ePHI live? Where does it travel? Who has access?

This is the step that separates real risk assessments from fake ones. Most organizations dramatically undercount their ePHI touchpoints. They know about the EHR. They forget about the billing system. They forget about the scanned documents on the shared drive. They forget about the practice manager who exports patient lists to Excel spreadsheets on her personal laptop.

Be exhaustive. Be honest. The inventory is only useful if it's complete.

### Step 3: Identify Threats

For each asset, identify the threats — the potential events or actions that could compromise ePHI. Threats fall into categories:

**Natural threats:** Floods, earthquakes, power outages, fires.

**Human threats (intentional):** Hackers, ransomware, disgruntled employees, social engineering, theft.

**Human threats (unintentional):** Accidental disclosure, misdirected emails, lost devices, improper disposal.

**Environmental threats:** HVAC failures, water damage, electrical surges.

Don't just list generic threats. Think about what's realistic for YOUR organization in YOUR location with YOUR staff.

### Step 4: Identify Vulnerabilities

Vulnerabilities are the weaknesses that threats could exploit. For each threat-asset combination, ask: what's the weakness?

- No encryption on laptops → vulnerable to theft/loss
- No access controls on shared drives → vulnerable to unauthorized access
- No backup system → vulnerable to ransomware
- Untrained staff → vulnerable to phishing
- No BAA with cloud vendor → vulnerable to third-party breach
- Default passwords on medical devices → vulnerable to network intrusion

This is where you get specific. Generic vulnerability lists are worthless. Your vulnerabilities are specific to your environment.

### Step 5: Assess Current Controls

What safeguards do you already have in place? For each vulnerability, document what you're currently doing about it. Technical controls (encryption, firewalls, access controls), administrative controls (policies, training, procedures), and physical controls (locks, cameras, badge access).

Be honest about whether controls are actually implemented and functioning — not just whether a policy exists on paper.

### Step 6: Determine Likelihood

For each threat-vulnerability pair, assess the likelihood that the threat will successfully exploit the vulnerability given your current controls. Use a consistent scale — High, Medium, Low — and document your reasoning.

A ransomware attack against an unpatched system with no email filtering? High likelihood. A natural disaster destroying your redundant, geographically dispersed backups? Low likelihood.

### Step 7: Determine Impact

If the threat materializes, what's the impact? Consider:
- How many patient records are affected?
- What type of information is compromised?
- What's the operational impact?
- What's the regulatory exposure?
- What's the reputational damage?

Again, use a consistent scale and document your reasoning.

### Step 8: Determine Risk Level

Risk = Likelihood x Impact. Map each threat-vulnerability pair to a risk level. This gives you your prioritized risk register — the master document that tells you where you're most exposed and where to focus your resources.

High likelihood + high impact = critical risk. Address immediately.
High likelihood + low impact = moderate risk. Address soon.
Low likelihood + high impact = moderate risk. Address soon.
Low likelihood + low impact = low risk. Monitor and accept.

## The Risk Management Plan: Where Assessment Becomes Action

The SRA is not the finish line. It's the starting line.

Every risk you've identified needs a response: mitigate, accept, transfer, or avoid. And for risks you're mitigating, you need a remediation plan with specific actions, responsible parties, and deadlines.

This is the document OCR wants to see right after the SRA. They want to know that you didn't just identify your risks — you did something about them. A risk assessment without a management plan is an admission that you know where your vulnerabilities are and chose to do nothing.

That's worse than not knowing.

Set realistic timelines. Not everything can be fixed this quarter. But everything should have a target date and an owner. And you should be tracking progress against those targets.

## Documentation: Your Courtroom Defense

Every step of this process must be documented. The scope definition, the asset inventory, the threat analysis, the vulnerability assessment, the risk determinations, the management plan, the remediation progress.

OCR doesn't just want to see that you did an SRA. They want to see HOW you did it. What methodology did you use? Who participated? What did you find? What did you do about it?

Your documentation is your defense. In a breach investigation, in an audit, in litigation — your SRA documentation either proves you took reasonable steps to protect ePHI, or it proves you didn't.

## The HHS SRA Tool

HHS offers a free Security Risk Assessment Tool designed for small and medium practices. It walks you through the process step by step, generates documentation, and produces a risk report.

Is it perfect? No. Is it sufficient for a small practice? Absolutely. And it's infinitely better than nothing, which is what most small practices have.

Larger organizations should use NIST SP 800-30 directly or engage a qualified security firm. The complexity of your environment should dictate the sophistication of your methodology.

## Frequency: Not a One-Time Event

Your SRA must be conducted annually at minimum. But annual isn't always enough. You must also reassess after:

- A security incident or breach
- Significant changes to your environment (new EHR, new location, new cloud service)
- Changes in organizational structure (merger, acquisition, new department)
- New or updated regulations
- Changes in threat landscape (new attack vectors, industry-specific threats)

The SRA is a living process, not a document you pull out once a year, dust off, and put back on the shelf.

## What OCR Actually Looks For

When OCR comes calling — through a complaint investigation, a breach report, or a random audit — here's what they evaluate:

1. **Does an SRA exist?** (You'd be shocked how often the answer is no.)
2. **Is it current?** (Last updated in 2019? That's a problem.)
3. **Is it comprehensive?** (Did you assess all ePHI, or just the EHR?)
4. **Does it use a recognized methodology?** (NIST, HITRUST, or equivalent)
5. **Is there a corresponding risk management plan?**
6. **Is there evidence of remediation progress?**
7. **Was it conducted or reviewed by qualified individuals?**

Fail on any of these, and the conversation shifts from "let's review your compliance" to "let's discuss penalties."

## The Cost of Getting It Wrong

Anthem: $16 million settlement. Premera: $6.85 million. Banner Health: $1.25 million. In every single case, SRA deficiencies were a central finding.

You cannot afford to get this wrong. Not because the fines are large — though they are — but because the SRA is the foundation. Without it, nothing else in your HIPAA program is defensible.

Do the assessment. Do it right. Do it now. And do it again next year.

There is no shortcut. There is no workaround. There is only the work.
