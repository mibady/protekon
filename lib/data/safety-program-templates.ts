/**
 * Safety-program template library. Pure data — no server boundary.
 *
 * Kept in `lib/data/` (not `lib/actions/`) because Next.js "use server" files
 * may only export async functions. Importing these constants from a
 * "use server" file would break the build.
 */

export type ProgramType =
  | "iipp"
  | "hazcom"
  | "wvpp"
  | "heat"
  | "respirator"
  | "fall_protection"
  | "confined_space"
  | "lockout_tagout"

export type ProgramStatus = "pending" | "approved" | "rejected" | "expired"

export type SafetyProgramTemplate = {
  title: string
  authority: string
  reviewIntervalDays: number
  description: string
}

export const SAFETY_PROGRAM_TEMPLATES: Record<ProgramType, SafetyProgramTemplate> = {
  iipp: {
    title: "Injury & Illness Prevention Program",
    authority: "Cal/OSHA §3203",
    reviewIntervalDays: 365,
    description: "Annual review + incident-triggered updates.",
  },
  hazcom: {
    title: "Hazard Communication",
    authority: "29 CFR 1910.1200",
    reviewIntervalDays: 365,
    description: "Employee training + SDS inventory.",
  },
  wvpp: {
    title: "Workplace Violence Prevention Plan",
    authority: "Cal. Lab. Code §6401.9 (SB 553)",
    reviewIntervalDays: 365,
    description: "Required July 2024; annual review.",
  },
  heat: {
    title: "Heat Illness Prevention",
    authority: "Cal/OSHA §3395",
    reviewIntervalDays: 365,
    description: "Water, rest, shade, training.",
  },
  respirator: {
    title: "Respiratory Protection Program",
    authority: "29 CFR 1910.134",
    reviewIntervalDays: 365,
    description: "Fit-testing + medical evaluations.",
  },
  fall_protection: {
    title: "Fall Protection Plan",
    authority: "29 CFR 1926.502 / Cal/OSHA §1670",
    reviewIntervalDays: 365,
    description: "Harness, anchorage, rescue.",
  },
  confined_space: {
    title: "Permit-Required Confined Space",
    authority: "29 CFR 1910.146",
    reviewIntervalDays: 365,
    description: "Permits + rescue team.",
  },
  lockout_tagout: {
    title: "Lockout/Tagout (LOTO)",
    authority: "29 CFR 1910.147",
    reviewIntervalDays: 365,
    description: "Energy control procedures + training.",
  },
}
