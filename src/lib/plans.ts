export const EXTRA_SLOT_EGP = 25;
export const HOMEWORK_HELP_LIMIT = 2;
export const EVIDENCE_MIN = 3;

export const PLANS = {
  TEACHER_STARTER: {
    label: "Teacher Starter",
    priceEgp: 250,
    slots: 10,
    aiTeacher: false,
    audience: "teacher" as const,
    blurb: "10 student slots",
  },
  TEACHER_PRO: {
    label: "Teacher Pro",
    priceEgp: 500,
    slots: 20,
    aiTeacher: true,
    audience: "teacher" as const,
    blurb: "20 student slots and AI teacher tools",
  },
  SCHOOL_SMALL: {
    label: "Small school",
    priceEgp: 2000,
    slots: 200,
    aiTeacher: true,
    audience: "school" as const,
    blurb: "Up to 200 students",
  },
  SCHOOL_MEDIUM: {
    label: "Medium school",
    priceEgp: 4000,
    slots: 800,
    aiTeacher: true,
    audience: "school" as const,
    blurb: "Up to 800 students",
  },
  SCHOOL_LARGE: {
    label: "Large school",
    priceEgp: null,
    slots: null,
    aiTeacher: true,
    audience: "school" as const,
    blurb: "Custom quote",
  },
} as const;

export type PlanId = keyof typeof PLANS;

export function isPlanId(value: string): value is PlanId {
  return value in PLANS;
}

export function planAllowsAiTeacher(plan: string) {
  if (!isPlanId(plan)) return false;
  return PLANS[plan].aiTeacher;
}
