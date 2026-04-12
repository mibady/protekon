# Protekon Database Architecture Brief
## For Claude Code Agent — April 2026

---

## Overview

Protekon operates two Supabase databases. They serve different purposes and must never be confused.

**Scraper DB** (`vizmtkfpxxjzlpzibate`) — Market intelligence and data science. Contains 431K OSHA violation records, 115K employer profiles, enforcement analytics, anomaly detection, and content marketing intelligence. This is the data engine. Internal use only — clients never see this database.

**App DB** (`yfkledwhwsembikpjynu`) — The Protekon product. Contains client records, compliance documents, incident logs, training records, partner channel, and 4 client-facing intelligence tables that receive piped data from the scraper DB. This is what clients interact with.

---

## Critical Rules

1. **Every `execute_sql` call requires explicit `project_id`** — no default context persists between calls.
2. **Cal/OSHA vs OSHA**: California-specific enforcement data must always be called "Cal/OSHA." Federal data is "Federal OSHA." Exception: OSHA Form 300/300A/301 remains "OSHA" as a federal form.
3. **Protekon is the actor**: In all content and copy, Protekon does the work — not "AI" or "automation."
4. **No catch-all industries**: Every business has a real industry name. Never classify anything as "Other Services," "Admin/Waste Services," or "Other."
5. **Two audiences**: Scraper DB serves internal sales/marketing. App DB serves clients and partners. Never expose scraper data directly to clients.

---

## Scraper DB (`vizmtkfpxxjzlpzibate`)

### Self-Discovery Queries
```sql
-- Read this first to understand the full schema
SELECT * FROM protekon_data_dictionary ORDER BY layer, table_name;

-- See what data science has been applied and what it found
SELECT * FROM protekon_pipeline_status ORDER BY layer_number;

-- Check pipeline health
SELECT metric_name, metric_value, metric_unit, category 
FROM protekon_pipeline_metrics ORDER BY category;
```

### 13 Tables — 9 Data Science Layers Applied

#### Layer 1+2: Core Violation Data

**`protekon_osha_violations`** — 431,411 rows
The foundation. Every row is one OSHA citation item from one inspection. Covers all 56 US states/territories, 39 named industries, Jan 2020 – Mar 2026.

| Column | Type | Description |
|--------|------|-------------|
| `activity_nr` | text | Inspection ID — groups violations by inspection |
| `employer_name` | text | Cited employer |
| `city`, `state`, `zip` | text | Location |
| `naics_code` | text | 6-digit NAICS (industry classification) |
| `industry` | text | 39 canonical industry names (no catch-alls) |
| `inspection_date` | date | When inspection occurred (backfilled from `open_date` for federal rows) |
| `violation_type` | text | 5 canonical: `serious`, `other`, `repeat`, `willful`, `unclassified` |
| `is_serious`, `is_willful`, `is_repeat` | boolean | Synced with `violation_type` |
| `standard_cited` | text | Regulatory standard code (13,772 unique) |
| `penalty_amount` | numeric | Final penalty in USD |
| `hazcat` | text | **74 hazard categories** mapped from `standard_cited` (Layer 2) |
| `risk_score` | integer | **5–90 composite** (severity + penalty + recency + emphasis) (Layer 2) |
| `violation_desc` | text | Human-readable description (Layer 2) |
| `data_source` | text | `Cal/OSHA` or `Federal OSHA` |
| `jurisdiction` | text | `state` or `federal` |
| `emphasis_flag`, `nep_flag`, `lep_flag` | boolean | Enforcement emphasis programs |

Key stats: $1.04B total penalties. 243K serious (56%), 14.7K repeat, 1,935 willful. 137K inspections across 116K employers.

Two data sources: Cal/OSHA scraper (73,960 rows, California only) and DOL bulk CSV (357,451 rows, all states). Federal rows use `open_date` for inspection dates — this was backfilled to `inspection_date` in Layer 1.

#### Layer 1: Aggregate Tables

**`protekon_industry_benchmarks`** — 39 rows (national only, per industry)
Pre-computed benchmarks per industry. Violations, penalties, severity counts, inspection rates, top 5 cited standards, year-over-year trends.

Unique constraint: `(naics_title, state_code, period_year)`.

**`protekon_content_stats`** — 3 rows
Pre-computed headline numbers: `headlines` (national totals), `ca_headlines` (California), `penalty_buckets` (distribution).

**`protekon_enforcement_stories`** — 3,347 rows
High-penalty enforcement cases with auto-generated `headline` and `story_angle`. 984 flagged `is_notable`. `content_status` tracks publishing pipeline (`pending`/`drafted`/`published`). Avg penalty: $72K.

#### Layer 3: Employer Intelligence

**`protekon_employer_profiles`** — 115,313 rows
One row per employer. 6-component risk scoring.

| Column | Type | Description |
|--------|------|-------------|
| `risk_score` | integer | 0–87 composite (severity + penalty + recency + frequency + escalation + targeting) |
| `risk_tier` | text | `critical` (408), `high` (2,563), `medium` (12,472), `low` (99,870) |
| `risk_factors` | jsonb | 15 features including `inspection_count`, `hazcat_diversity`, `serious_ratio`, `critical_ratio`, `days_since_last`, `avg_violation_risk`, `emphasis_count`, `inspection_likelihood`, `penalty_escalation_risk` |
| `lead_status` | text | Sales pipeline status |
| `phone`, `email`, `website` | text | **ALL NULL — 0% enriched. Blocking item for sales.** |

#### Layer 4: Time-Series & Anomaly Detection

**`protekon_enforcement_baselines`** — 19,086 rows
Monthly time series: one row per `state x industry x month`. Contains violation counts, penalty totals, and rolling 12-month z-scores.

Key columns: `z_score_violations`, `z_score_penalties`, `z_score_severity`, `is_spike`, `is_drop`, `spike_type` (`multi`, `volume_penalty`, `penalty`, `volume`, `severity`).

**`protekon_anomaly_events`** — 2,029 rows
Content-triggering events with auto-generated `headline`. Types: `spike`, `drop`, `seasonal_peak`. `content_status` tracks publishing.

Key finding: California enforcement dropped dramatically in late 2025 across all industries.

#### Layer 5: Similarity & Ranking

**`protekon_employer_vectors`** — 106,797 rows
8-dimensional normalized feature vectors (0–1 scale) for employer similarity.

Features: `f_violation_freq`, `f_severity_mix`, `f_penalty_intensity`, `f_recency`, `f_diversity`, `f_escalation`, `f_emphasis`, `f_size`.

8 behavioral `risk_cluster` values: `serial_offender` (1,943), `single_catastrophic` (1,339), `systemic_failure` (37), `active_risk` (26), `enforcement_target` (415), `volume_minor` (284), `moderate_risk` (80,972), `low_baseline` (21,781).

**`protekon_content_scores`** — 249 rows
Brief x industry relevance scores. Maps 7 content topic groups to 39 industries. Columns: `brief_id`, `industry`, `relevance_score`, `hazcat_match[]`, `penalty_weight`, `employer_reach`.

**`protekon_employer_dupes`** — 1,774 rows
Duplicate employer pairs. `match_type`: `fuzzy_name` (578, same city variant suffixes) or `cross_state_national` (1,196, national chains). `resolved` boolean tracks cleanup status.

#### Layer 6: Statistical Validation

**`protekon_stat_validations`** — 47 rows
95% confidence intervals for every quantitative content claim. Check `is_statistically_valid` before publishing any number.

```sql
-- Find CA claims that should NOT be published
SELECT * FROM protekon_stat_validations 
WHERE claim_id LIKE 'ca_%' AND NOT is_statistically_valid;
```

#### Layer 7: Pipeline Health

**`protekon_pipeline_metrics`** — 16 rows
4 categories: `data_freshness`, `coverage`, `quality`, `pipeline_health`.

#### Meta Tables

**`protekon_data_dictionary`** — 12 rows. Schema documentation.
**`protekon_pipeline_status`** — 9 rows. Layer-by-layer audit trail.

---

## App DB (`yfkledwhwsembikpjynu`)

### 33 Tables in 5 Groups

#### Group 1: Core Platform (all verticals)

| Table | Cols | Rows | Purpose |
|-------|------|------|---------|
| `clients` | 13 | 0 | Central entity. `vertical`, `plan`, `compliance_score`, `risk_level`, `stripe_customer_id` |
| `documents` | 11 | 10 | Generated compliance docs (WVPP, IIPP) |
| `incidents` | 10 | 7 | Workplace violence incident log |
| `audits` | 8 | 3 | Compliance audit results |
| `audit_log` | 6 | 11 | System activity tracking |
| `training_records` | 7 | 10 | Employee training completion |
| `scheduled_deliveries` | 8 | 3 | Recurring compliance deliverables |
| `regulatory_updates` | 18 | 0 | Regulation change feed |
| `poster_compliance` | 9 | 0 | Poster compliance per location |

#### Group 2: Vertical-Specific Tables (per-client data)

| Table | Vertical | Key Columns |
|-------|----------|-------------|
| `agriculture_crews` | Agriculture | crew_name, heat_plan_status, water_station, shade_available |
| `baa_agreements` | Healthcare | vendor_name, phi_types, baa_status, expiration_date |
| `construction_subs` | Construction | license_number, license_status, insurance_status, insurance_expiry |
| `hospitality_inspections` | Hospitality | inspection_type, score, violations, next_inspection |
| `manufacturing_equipment` | Manufacturing | equipment_type, loto_status, last_inspection, next_inspection |
| `municipal_ordinances` | Real Estate | jurisdiction, ordinance_number, effective_date |
| `phi_assets` | Healthcare | system_name, phi_content_types, encrypted_at_rest |
| `property_portfolio` | Real Estate | address, units, property_type, compliance_status |
| `retail_locations` | Retail | store_name, fire_inspection_status, ada_status |
| `transportation_fleet` | Transportation | vehicle_id, cdl_status, cdl_expiry, last_dot_inspection |
| `wholesale_zones` | Warehouse | zone_type, forklift_certified_operators, hazmat_present |

All empty. Populated during client onboarding, not from scraper data.

#### Group 3: Client-Facing Intelligence (piped from scraper DB)

| Table | Cols | Purpose | Source in Scraper DB |
|-------|------|---------|---------------------|
| `industry_enforcement_stats` | 16 | "Avg fines in your industry" per vertical | `protekon_industry_benchmarks` |
| `enforcement_alerts` | 14 | "Enforcement spiked in your area" | `protekon_anomaly_events` |
| `nearby_enforcement_actions` | 16 | "3 employers near you cited for X" | `protekon_osha_violations` |
| `compliance_calendar` | 13 | Seasonal peaks + regulatory deadlines | `protekon_anomaly_events` + regulatory |

All empty — awaiting first sync pipeline.

#### Group 4: Sales & Lead Gen

| Table | Cols | Rows | Purpose |
|-------|------|------|---------|
| `compliance_score_leads` | 34 | 0 | Compliance calculator leads with score, drip tracking, UTM |
| `contact_submissions` | 8 | 0 | Contact form entries |
| `intake_submissions` | 9 | 0 | Onboarding intake |
| `sample_report_leads` | 5 | 57 | Sample report downloads (only real lead data) |

#### Group 5: Partner Channel

| Table | Cols | Rows | Purpose |
|-------|------|------|---------|
| `partner_applications` | 29 | 0 | Partner signup applications |
| `partner_profiles` | 10 | 0 | Accepted partner accounts |
| `partner_clients` | 6 | 0 | Partner-to-client relationships |
| `partner_assessments` | 13 | 0 | Partner-run compliance assessments |

#### Group 6: Verticals Reference

**`verticals`** — 27 rows
Canonical reference for all marketable verticals. Each row has: `slug`, `display_name`, `tier`, `naics_prefixes[]`, `national_violations`, `national_penalties_usd`, `national_employers`, `ca_employers`, `hazcat_count`, `serious_pct`.

```sql
-- Get all verticals ordered by tier and size
SELECT slug, display_name, tier, national_violations, national_employers, ca_employers
FROM verticals ORDER BY tier, national_violations DESC;
```

---

## 27 Marketable Verticals

### Tier 1 (15 verticals — 5,000+ violations, 1,000+ employers)

| Slug | Name | NAICS | Violations | $M Penalties | Employers | CA Emp |
|------|------|-------|------------|-------------|-----------|--------|
| construction | Construction | 23 | 169,021 | 469.5 | 50,455 | 6,126 |
| manufacturing | Manufacturing | 31-33 | 99,915 | 271.7 | 22,681 | 3,459 |
| retail | Retail Trade | 44-45 | 18,257 | 37.7 | 5,461 | 1,126 |
| public_admin | Public Administration | 92 | 15,032 | 15.8 | 3,492 | 576 |
| wholesale | Wholesale Trade | 42 | 14,697 | 37.4 | 4,193 | 842 |
| hospitality | Hospitality | 72 | 13,530 | 18.6 | 3,784 | 1,420 |
| automotive | Automotive Services | 8111 | 12,418 | 13.1 | 2,786 | 797 |
| healthcare | Healthcare | 62 | 11,955 | 17.7 | 3,612 | 847 |
| transportation | Transportation | 48 | 11,885 | 35.2 | 3,648 | 568 |
| agriculture | Agriculture | 11 | 11,745 | 22.7 | 3,612 | 1,743 |
| building_services | Building Services | 5617 | 8,456 | 17.4 | 2,601 | 769 |
| utilities | Utilities | 22 | 6,318 | 12.1 | 1,469 | 222 |
| education | Education | 61 | 5,652 | 6.2 | 1,362 | 252 |
| waste_environmental | Waste & Environmental | 5621-29 | 5,400 | 11.7 | 1,368 | 296 |
| arts_entertainment | Arts/Entertainment | 71 | 5,309 | 7.8 | 1,204 | 303 |

### Tier 2 (10 verticals — 1,000–5,000 violations)

| Slug | Name | NAICS | Violations | $M Penalties | Employers | CA Emp |
|------|------|-------|------------|-------------|-----------|--------|
| real_estate | Real Estate | 53 | 3,537 | 7.8 | 1,055 | 234 |
| professional_services | Professional Services | 54 | 3,296 | 6.3 | 1,195 | 366 |
| mining | Mining | 21 | 2,246 | 6.9 | 701 | 273 |
| facilities_mgmt | Facilities Management | 5612 | 1,879 | 4.6 | 279 | 49 |
| warehouse | Warehouse | 49 | 1,661 | 3.5 | 469 | 446 |
| staffing | Staffing & Employment | 5613 | 1,375 | 4.7 | 575 | 370 |
| equipment_repair | Equipment Repair | 8112-13 | 1,247 | 2.8 | 372 | 67 |
| business_support | Business Support Services | 5611,14,19 | 1,231 | 4.2 | 423 | 82 |
| information | Information/Telecom | 51 | 1,171 | 2.8 | 410 | 131 |
| laundry | Laundry & Drycleaning | 8123 | 1,008 | 2.4 | 226 | 69 |

### Tier 3 (2 verticals — 500–1,000 violations)

| Slug | Name | NAICS | Violations | Employers | CA Emp |
|------|------|-------|------------|-----------|--------|
| personal_services | Personal Services | 8129 | 722 | 167 | 1 |
| security | Security Services | 5616 | 666 | 239 | 131 |

### Sub-threshold (not marketed, but tracked with real names in data)

Death Care Services, Personal Care (Salons/Spas), Personal Goods Repair, Religious Organizations, Civic Organizations, Social Advocacy Organizations, Membership Organizations, Grantmaking Services, Finance/Insurance, Management, Private Households, Unclassified.

---

## Data Flow: Scraper -> App

```
SCRAPER DB                          APP DB
(internal only)                     (client-facing)

protekon_industry_benchmarks  -->   industry_enforcement_stats
  (39 industries, penalties,          (per vertical, avg fine,
   severity, top standards)            top violations, trends)

protekon_anomaly_events       -->   enforcement_alerts  
  (2,029 spikes/drops)               (filtered, rewritten for
                                       client-relevant framing)

protekon_osha_violations      -->   nearby_enforcement_actions
  (431K, filtered by state/           (anonymized public record,
   city/industry)                      per client location)

protekon_anomaly_events       -->   compliance_calendar
  (seasonal_peak type)                (seasonal deadlines +
                                       regulatory dates)
```

The sync pipeline has not been built yet. The 4 app DB intelligence tables are empty.

---

## Data Science Layers Applied (9 total)

| # | Name | What It Did |
|---|------|-------------|
| 1 | Normalize & Backfill | 13->5 violation types, 43->39 industries, 355K dates backfilled |
| 2 | Feature Engineering | hazcat (74 categories), risk_score (5-90), violation_desc on 431K rows |
| 3 | Predictive Scoring | 6-component employer risk model, inspection_likelihood, escalation_risk |
| 4 | Anomaly Detection | 19K monthly baselines, z-scores, 2,029 content-triggering events |
| 5 | Similarity & Ranking | 107K feature vectors, 8 clusters, content scores, 1,774 dupes |
| 6 | Statistical Validation | 95% CIs on 47 content claims, publishability flags |
| 7 | Metrics & Monitoring | 16 pipeline health metrics across 4 categories |
| 8 | Vertical Expansion | 10->20->27 verticals, verticals reference table, 4 client-facing tables |
| 9 | Micro-Category Reclassification | Eliminated all catch-alls, 39 named industries, zero "Other" |

---

## Key Data Findings

1. **Automotive Services is 3.4x bigger than originally measured** (12,418 vs 3,657 violations) — federal data had misclassified auto repair as "Other Services."

2. **Building Services was invisible** — 8,456 violations and 2,601 employers (janitorial, landscaping, pest control) were buried in "Admin/Waste Services." Bigger than Healthcare.

3. **CA Retail Trade has 17.7% elevated-risk employers** — highest concentration in California, ahead of Construction at 4.9%.

4. **California enforcement dropped dramatically in late 2025** — Construction went from 249/month to 26. Content opportunity.

5. **Fall Protection ($158M) and Machine Guarding/LOTO ($104M)** together account for 25% of all penalties nationally.

6. **Utilities has a 69.9% serious violation rate** — highest of any industry.

7. **Employer enrichment is at 0%** — 115K profiles have risk scores but no phone/email/website. This is the blocking item for sales outreach.

---

## Blocking Items & Next Steps

1. **Build sync pipeline**: Scraper DB -> App DB for the 4 client-facing intelligence tables. This is an Inngest function or cron job.

2. **Employer enrichment**: Populate phone/email/website on the 115K employer profiles. Required for sales outreach.

3. **Content production**: 3,347 enforcement stories + 2,029 anomaly events = 5,376 content triggers sitting in `pending` status.

4. **Stat validations need refresh**: The 47 validations were computed before the micro-category reclassification. Some CIs may have shifted.

5. **Duplicate resolution**: 1,774 employer dupe pairs identified but not merged (`resolved = false`).

6. **Vertical-specific tables**: Only 8 of 27 verticals have dedicated app DB tables. The other 19 run on core platform tables only. Determine if new verticals (Building Services, Waste & Environmental, etc.) need their own tables.
