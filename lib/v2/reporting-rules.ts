/**
 * Reporting Rules — OSHA and State-Plan Jurisdiction Map
 *
 * Pure-data module that maps US state codes to their occupational
 * safety reporting authority (federal OSHA or state plan). Powers
 * jurisdiction-aware ReportingBanner component.
 *
 * Scope: Private-sector employer reporting obligations only.
 *   - Federal OSHA baseline: 29 CFR 1904.39
 *     - 8h fatality, 24h hospitalization, 24h amputation, 24h eye loss
 *   - State plans that cover private sector follow same clock or shorter.
 *   - Some state plans (CT, IL, ME, NJ, NY, VI*) only cover state/local
 *     government employees; private sector employers in those states
 *     report to Federal OSHA. VI is a full-coverage state plan.
 *
 * ZERO I/O. ZERO dependencies. ZERO network calls.
 *
 * Citations: Where a specific subsection number could not be verified
 * against the current version of the state regulatory code, a
 * `TODO verify citation` comment is attached so the legal reference can
 * be reviewed before production use.
 */

/**
 * A reporting jurisdiction definition. Describes where a private-sector
 * employer in a given state must report serious incidents, on what clock,
 * and via which form/phone line.
 */
export type Jurisdiction = {
  /** 2-letter US state/territory code (uppercase), or "FEDERAL" for federal fallback. */
  stateCode: string;
  /** Name of the authority that receives reports (e.g. "Cal/OSHA"). */
  authority: string;
  /** Regulatory citation establishing the reporting rule. */
  citation: string;
  /** Hours after a fatality within which it must be reported. */
  fatalityClockHours: number;
  /** Hours after an in-patient hospitalization within which it must be reported. */
  hospitalizationClockHours: number;
  /** Hours after an amputation within which it must be reported. */
  amputationClockHours: number;
  /** Hours after a loss-of-eye injury within which it must be reported. */
  eyeLossClockHours: number;
  /** Form used to submit the written/follow-up report. */
  reportingForm: string;
  /** Telephone number for the reporting hotline. */
  phone: string;
  /** Optional URL for online reporting. */
  onlinePortal?: string;
  /** True for OSHA-approved state plans, false for federal OSHA coverage. */
  isStatePlan: boolean;
};

/**
 * Federal OSHA fallback. Used for any state without an approved state
 * plan covering private sector employers. 29 CFR 1904.39 is the
 * controlling regulation.
 */
export const FEDERAL_OSHA: Jurisdiction = Object.freeze({
  stateCode: "FEDERAL",
  authority: "Federal OSHA",
  citation: "29 CFR 1904.39",
  fatalityClockHours: 8,
  hospitalizationClockHours: 24,
  amputationClockHours: 24,
  eyeLossClockHours: 24,
  reportingForm: "OSHA 301 + phone report",
  phone: "1-800-321-6742",
  onlinePortal: "https://www.osha.gov/report",
  isStatePlan: false,
}) as Jurisdiction;

/**
 * Map of 2-letter state/territory code → Jurisdiction.
 * Only states with OSHA-approved state plans covering private-sector
 * employers are included. All other state codes fall back to FEDERAL_OSHA
 * via `jurisdictionFor()`.
 */
export const JURISDICTIONS: Readonly<Record<string, Jurisdiction>> = Object.freeze({
  /** Alaska — AKOSH, Division of Labor Standards & Safety. */
  AK: Object.freeze({
    stateCode: "AK",
    authority: "Alaska Occupational Safety & Health (AKOSH)",
    citation: "8 AAC 61.010", // TODO verify citation
    fatalityClockHours: 8,
    hospitalizationClockHours: 24,
    amputationClockHours: 24,
    eyeLossClockHours: 24,
    reportingForm: "AKOSH Incident Report",
    phone: "1-907-269-4940",
    onlinePortal: "https://labor.alaska.gov/lss/oshhome.htm",
    isStatePlan: true,
  }) as Jurisdiction,

  /** Arizona — Arizona Division of Occupational Safety & Health (ADOSH). */
  AZ: Object.freeze({
    stateCode: "AZ",
    authority: "Arizona Division of Occupational Safety & Health (ADOSH)",
    citation: "A.A.C. R20-5-629", // TODO verify citation
    fatalityClockHours: 8,
    hospitalizationClockHours: 24,
    amputationClockHours: 24,
    eyeLossClockHours: 24,
    reportingForm: "ADOSH Incident Report",
    phone: "1-855-268-5251",
    onlinePortal: "https://www.azica.gov/divisions/adosh",
    isStatePlan: true,
  }) as Jurisdiction,

  /** California — Cal/OSHA (DIR, Division of Occupational Safety & Health). */
  CA: Object.freeze({
    stateCode: "CA",
    authority: "Cal/OSHA",
    citation: "Cal. Code Regs. tit. 8 §342",
    fatalityClockHours: 8,
    hospitalizationClockHours: 8,
    amputationClockHours: 8,
    eyeLossClockHours: 8,
    reportingForm: "DIR Form 36 (Employer's Report of Occupational Injury or Illness)",
    phone: "1-800-963-9424",
    onlinePortal: "https://www.dir.ca.gov/dosh/DoshReg/",
    isStatePlan: true,
  }) as Jurisdiction,

  /** Hawaii — Hawaii Occupational Safety & Health Division (HIOSH). */
  HI: Object.freeze({
    stateCode: "HI",
    authority: "Hawaii Occupational Safety & Health (HIOSH)",
    citation: "HAR §12-52.1", // TODO verify citation
    fatalityClockHours: 8,
    hospitalizationClockHours: 24,
    amputationClockHours: 24,
    eyeLossClockHours: 24,
    reportingForm: "HIOSH Incident Report",
    phone: "1-808-586-9100",
    onlinePortal: "https://labor.hawaii.gov/hiosh/",
    isStatePlan: true,
  }) as Jurisdiction,

  /** Indiana — IOSHA, Indiana Department of Labor. */
  IN: Object.freeze({
    stateCode: "IN",
    authority: "Indiana Occupational Safety & Health Administration (IOSHA)",
    citation: "IC 22-8-1.1-35.2", // TODO verify citation
    fatalityClockHours: 8,
    hospitalizationClockHours: 24,
    amputationClockHours: 24,
    eyeLossClockHours: 24,
    reportingForm: "IOSHA Accident Report",
    phone: "1-317-232-2693",
    onlinePortal: "https://www.in.gov/dol/iosha/",
    isStatePlan: true,
  }) as Jurisdiction,

  /** Iowa — Iowa OSHA, Division of Labor. */
  IA: Object.freeze({
    stateCode: "IA",
    authority: "Iowa OSHA",
    citation: "Iowa Admin. Code r. 875-3.9", // TODO verify citation
    fatalityClockHours: 8,
    hospitalizationClockHours: 24,
    amputationClockHours: 24,
    eyeLossClockHours: 24,
    reportingForm: "Iowa OSHA Incident Report",
    phone: "1-877-242-6742",
    onlinePortal: "https://www.iowadivisionoflabor.gov/iowa-osha",
    isStatePlan: true,
  }) as Jurisdiction,

  /** Kentucky — Kentucky Labor Cabinet, OSH Program. */
  KY: Object.freeze({
    stateCode: "KY",
    authority: "Kentucky Occupational Safety & Health Program (KY OSH)",
    citation: "803 KAR 2:180", // TODO verify citation
    fatalityClockHours: 8,
    hospitalizationClockHours: 24,
    amputationClockHours: 24,
    eyeLossClockHours: 24,
    reportingForm: "KY OSH Incident Report",
    phone: "1-502-564-3070",
    onlinePortal: "https://www.labor.ky.gov/standards/Pages/Occupational-Safety-and-Health.aspx",
    isStatePlan: true,
  }) as Jurisdiction,

  /** Maryland — Maryland Occupational Safety & Health (MOSH). */
  MD: Object.freeze({
    stateCode: "MD",
    authority: "Maryland Occupational Safety & Health (MOSH)",
    citation: "COMAR 09.12.32", // TODO verify citation
    fatalityClockHours: 8,
    hospitalizationClockHours: 24,
    amputationClockHours: 24,
    eyeLossClockHours: 24,
    reportingForm: "MOSH Incident Report",
    phone: "1-410-527-4499",
    onlinePortal: "https://www.dllr.state.md.us/labor/mosh/",
    isStatePlan: true,
  }) as Jurisdiction,

  /** Michigan — MIOSHA, Department of Labor & Economic Opportunity. */
  MI: Object.freeze({
    stateCode: "MI",
    authority: "Michigan Occupational Safety & Health Administration (MIOSHA)",
    citation: "MIOSHA Part 11, R 408.22111", // TODO verify citation
    fatalityClockHours: 8,
    hospitalizationClockHours: 24,
    amputationClockHours: 24,
    eyeLossClockHours: 24,
    reportingForm: "MIOSHA Accident Report",
    phone: "1-517-322-1814",
    onlinePortal: "https://www.michigan.gov/leo/bureaus-agencies/miosha",
    isStatePlan: true,
  }) as Jurisdiction,

  /** Minnesota — Minnesota OSHA, Department of Labor & Industry. */
  MN: Object.freeze({
    stateCode: "MN",
    authority: "Minnesota OSHA (MNOSHA)",
    citation: "Minn. R. 5205.0010", // TODO verify citation
    fatalityClockHours: 8,
    hospitalizationClockHours: 24,
    amputationClockHours: 24,
    eyeLossClockHours: 24,
    reportingForm: "MNOSHA Incident Report",
    phone: "1-651-284-5050",
    onlinePortal: "https://www.dli.mn.gov/business/workplace-safety-and-health",
    isStatePlan: true,
  }) as Jurisdiction,

  /** Nevada — Nevada OSHA, Division of Industrial Relations. */
  NV: Object.freeze({
    stateCode: "NV",
    authority: "Nevada OSHA",
    citation: "NAC 618.538", // TODO verify citation
    fatalityClockHours: 8,
    hospitalizationClockHours: 24,
    amputationClockHours: 24,
    eyeLossClockHours: 24,
    reportingForm: "Nevada OSHA Incident Report",
    phone: "1-702-486-9020",
    onlinePortal: "https://dir.nv.gov/OSHA/Home/",
    isStatePlan: true,
  }) as Jurisdiction,

  /** New Mexico — OHSB, New Mexico Environment Department. */
  NM: Object.freeze({
    stateCode: "NM",
    authority: "New Mexico Occupational Health & Safety Bureau (OHSB)",
    citation: "11.5.1.16 NMAC", // TODO verify citation
    fatalityClockHours: 8,
    hospitalizationClockHours: 24,
    amputationClockHours: 24,
    eyeLossClockHours: 24,
    reportingForm: "OHSB Incident Report",
    phone: "1-505-476-8700",
    onlinePortal: "https://www.env.nm.gov/occupational_health_safety/",
    isStatePlan: true,
  }) as Jurisdiction,

  /** North Carolina — NC OSH Division, Department of Labor. */
  NC: Object.freeze({
    stateCode: "NC",
    authority: "North Carolina Occupational Safety & Health (NC OSH)",
    citation: "13 NCAC 07A .0300",
    fatalityClockHours: 8,
    hospitalizationClockHours: 24,
    amputationClockHours: 24,
    eyeLossClockHours: 24,
    reportingForm: "NC OSH Incident Report",
    phone: "1-800-625-2267",
    onlinePortal: "https://www.labor.nc.gov/safety-and-health",
    isStatePlan: true,
  }) as Jurisdiction,

  /** Oregon — Oregon OSHA, Department of Consumer & Business Services. */
  OR: Object.freeze({
    stateCode: "OR",
    authority: "Oregon OSHA",
    citation: "OAR 437-001-0704",
    fatalityClockHours: 8,
    hospitalizationClockHours: 24,
    amputationClockHours: 24,
    eyeLossClockHours: 24,
    reportingForm: "Oregon OSHA Accident Report (Form 3283)",
    phone: "1-800-922-2689",
    onlinePortal: "https://osha.oregon.gov/Pages/index.aspx",
    isStatePlan: true,
  }) as Jurisdiction,

  /** South Carolina — SC OSHA, Department of Labor, Licensing & Regulation. */
  SC: Object.freeze({
    stateCode: "SC",
    authority: "South Carolina OSHA (SC OSHA)",
    citation: "S.C. Code Ann. Regs. 71-7000", // TODO verify citation
    fatalityClockHours: 8,
    hospitalizationClockHours: 24,
    amputationClockHours: 24,
    eyeLossClockHours: 24,
    reportingForm: "SC OSHA Incident Report",
    phone: "1-803-896-7665",
    onlinePortal: "https://www.llr.sc.gov/osha/",
    isStatePlan: true,
  }) as Jurisdiction,

  /** Tennessee — TOSHA, Department of Labor & Workforce Development. */
  TN: Object.freeze({
    stateCode: "TN",
    authority: "Tennessee OSHA (TOSHA)",
    citation: "Tenn. Comp. R. & Regs. 0800-01-03", // TODO verify citation
    fatalityClockHours: 8,
    hospitalizationClockHours: 24,
    amputationClockHours: 24,
    eyeLossClockHours: 24,
    reportingForm: "TOSHA Incident Report",
    phone: "1-800-249-8510",
    onlinePortal: "https://www.tn.gov/workforce/employees/safety-health.html",
    isStatePlan: true,
  }) as Jurisdiction,

  /** Utah — Utah OSHA (UOSH), Labor Commission. */
  UT: Object.freeze({
    stateCode: "UT",
    authority: "Utah Occupational Safety & Health (UOSH)",
    citation: "Utah Admin. Code R614-1-6", // TODO verify citation
    fatalityClockHours: 8,
    hospitalizationClockHours: 24,
    amputationClockHours: 24,
    eyeLossClockHours: 24,
    reportingForm: "UOSH Incident Report",
    phone: "1-801-530-6901",
    onlinePortal: "https://laborcommission.utah.gov/divisions/uosh/",
    isStatePlan: true,
  }) as Jurisdiction,

  /** Vermont — VOSHA, Department of Labor. */
  VT: Object.freeze({
    stateCode: "VT",
    authority: "Vermont Occupational Safety & Health Administration (VOSHA)",
    citation: "Vermont Occupational Safety and Health Code §1904.39", // TODO verify citation
    fatalityClockHours: 8,
    hospitalizationClockHours: 24,
    amputationClockHours: 24,
    eyeLossClockHours: 24,
    reportingForm: "VOSHA Incident Report",
    phone: "1-802-828-2765",
    onlinePortal: "https://labor.vermont.gov/vosha",
    isStatePlan: true,
  }) as Jurisdiction,

  /** Virginia — VOSH, Department of Labor & Industry. */
  VA: Object.freeze({
    stateCode: "VA",
    authority: "Virginia Occupational Safety & Health (VOSH)",
    citation: "16 VAC 25-60-40", // TODO verify citation
    fatalityClockHours: 8,
    hospitalizationClockHours: 24,
    amputationClockHours: 24,
    eyeLossClockHours: 24,
    reportingForm: "VOSH Incident Report",
    phone: "1-804-371-2327",
    onlinePortal: "https://www.doli.virginia.gov/vosh-programs/",
    isStatePlan: true,
  }) as Jurisdiction,

  /** Washington — DOSH, Department of Labor & Industries. */
  WA: Object.freeze({
    stateCode: "WA",
    authority: "Washington Division of Occupational Safety & Health (DOSH)",
    citation: "WAC 296-27-031",
    fatalityClockHours: 8,
    hospitalizationClockHours: 24,
    amputationClockHours: 24,
    eyeLossClockHours: 24,
    reportingForm: "DOSH Incident Report",
    phone: "1-800-423-7233",
    onlinePortal: "https://lni.wa.gov/safety-health/",
    isStatePlan: true,
  }) as Jurisdiction,

  /** Wyoming — Wyoming OSHA, Department of Workforce Services. */
  WY: Object.freeze({
    stateCode: "WY",
    authority: "Wyoming OSHA",
    citation: "Wyo. Stat. Ann. §27-11-105", // TODO verify citation
    fatalityClockHours: 8,
    hospitalizationClockHours: 24,
    amputationClockHours: 24,
    eyeLossClockHours: 24,
    reportingForm: "Wyoming OSHA Incident Report",
    phone: "1-307-777-7786",
    onlinePortal: "https://dws.wyo.gov/dws-division/labor-standards-osha/",
    isStatePlan: true,
  }) as Jurisdiction,

  /** Puerto Rico — PR OSHA, Department of Labor & Human Resources. */
  PR: Object.freeze({
    stateCode: "PR",
    authority: "Puerto Rico OSHA (PR OSHA)",
    citation: "29 L.P.R.A. §361k", // TODO verify citation
    fatalityClockHours: 8,
    hospitalizationClockHours: 24,
    amputationClockHours: 24,
    eyeLossClockHours: 24,
    reportingForm: "PR OSHA Incident Report",
    phone: "1-787-754-2171",
    onlinePortal: "https://www.trabajo.pr.gov/prosha/",
    isStatePlan: true,
  }) as Jurisdiction,

  /** US Virgin Islands — VIDOSH, Department of Labor. */
  VI: Object.freeze({
    stateCode: "VI",
    authority: "Virgin Islands Division of Occupational Safety & Health (VIDOSH)",
    citation: "V.I. Code Ann. tit. 24 §31", // TODO verify citation
    fatalityClockHours: 8,
    hospitalizationClockHours: 24,
    amputationClockHours: 24,
    eyeLossClockHours: 24,
    reportingForm: "VIDOSH Incident Report",
    phone: "1-340-772-1315",
    onlinePortal: "https://www.vidol.gov/divisions/occupational-safety-health/",
    isStatePlan: true,
  }) as Jurisdiction,
});

/**
 * Returns the reporting jurisdiction for the given US state/territory code.
 *
 * Input is normalized (uppercased + trimmed). If the code has no approved
 * state plan covering private-sector employers, returns FEDERAL_OSHA.
 *
 * @example
 *   jurisdictionFor("ca");      // Cal/OSHA entry
 *   jurisdictionFor(" WA ");    // Washington DOSH entry
 *   jurisdictionFor("TX");      // FEDERAL_OSHA fallback
 *   jurisdictionFor("");        // FEDERAL_OSHA fallback
 *   jurisdictionFor("XX");      // FEDERAL_OSHA fallback
 */
export function jurisdictionFor(stateCode: string): Jurisdiction {
  if (typeof stateCode !== "string") {
    return FEDERAL_OSHA;
  }
  const normalized = stateCode.trim().toUpperCase();
  if (normalized.length === 0) {
    return FEDERAL_OSHA;
  }
  return JURISDICTIONS[normalized] ?? FEDERAL_OSHA;
}
