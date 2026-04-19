/**
 * Training topics with regulatory authority + re-certification cadence.
 * TODO(wave-6): move to backend table `training_topics` + wire from DB
 * so partners can edit/extend without a deploy. For Wave 5 this is the
 * static source of truth used by the NewTrainingModal and the table's
 * authority column derivation.
 */
export type TrainingTopic = {
  topic: string
  auth: string
  years: number
}

export const TRAINING_TOPICS: ReadonlyArray<TrainingTopic> = [
  { topic: "IIPP Orientation", auth: "8 CCR §3203", years: 1 },
  { topic: "Fall Protection", auth: "29 CFR 1926.503", years: 1 },
  { topic: "Scaffolding Safety", auth: "29 CFR 1926.454", years: 1 },
  { topic: "Silica Exposure", auth: "29 CFR 1926.1153", years: 1 },
  { topic: "Heat Illness Prevention", auth: "8 CCR §3395", years: 1 },
  { topic: "Lockout / Tagout", auth: "29 CFR 1910.147", years: 1 },
  { topic: "Confined Space Entry", auth: "29 CFR 1910.146", years: 1 },
  { topic: "Respirator Fit Test", auth: "29 CFR 1910.134", years: 1 },
  { topic: "First Aid / CPR", auth: "29 CFR 1910.151", years: 2 },
  { topic: "Forklift / PIT", auth: "29 CFR 1910.178(l)", years: 3 },
  { topic: "Hazard Communication", auth: "29 CFR 1910.1200", years: 1 },
  { topic: "Workplace Violence Prevention", auth: "SB 553 / 8 CCR §3343", years: 1 },
] as const

export function getTopicMeta(topic: string | null | undefined): TrainingTopic {
  return (
    TRAINING_TOPICS.find((t) => t.topic === topic) ?? TRAINING_TOPICS[0]
  )
}
