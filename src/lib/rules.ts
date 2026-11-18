import { EVIDENCE_MIN, HOMEWORK_HELP_LIMIT } from "@/lib/plans";

export function canRequestHomeworkHelp(used: number) {
  return used < HOMEWORK_HELP_LIMIT;
}

export function remainingHomeworkHelp(used: number) {
  return Math.max(0, HOMEWORK_HELP_LIMIT - used);
}

export function slotCapacity(slots: number, extraSlots: number) {
  return slots + extraSlots;
}

export function canEnrolStudent(used: number, capacity: number) {
  return used < capacity;
}

export function evidenceState(scoreCount: number) {
  return scoreCount < EVIDENCE_MIN ? "NOT_ENOUGH" : "READY";
}

export function studentCanSeeInsight(status: string) {
  return status === "APPROVED";
}

const UNSAFE_HINT = [/the (correct |final )?answer is/i, /option\s+[A-D]\b/i, /correct choice is/i];

export function hintLeaksAnswer(text: string, correctAnswer?: string | null) {
  if (UNSAFE_HINT.some((pattern) => pattern.test(text))) return true;
  const answer = correctAnswer?.trim();
  if (!answer || answer.length < 3) return false;
  return text.toLowerCase().includes(answer.toLowerCase());
}

export function safeHint(text: string, correctAnswer?: string | null) {
  if (!hintLeaksAnswer(text, correctAnswer)) return text.trim();
  return "Look back at the lesson notes and name the function in your own words. This hint will not give the graded answer.";
}

export function homeworkStatus(input: { status: string; dueAt: Date; now?: Date }) {
  const now = input.now ?? new Date();
  if (input.status === "GRADED" || input.status === "SUBMITTED") return input.status;
  if (input.dueAt.getTime() < now.getTime()) return "OVERDUE";
  if (input.status === "IN_PROGRESS") return "IN_PROGRESS";
  return "NOT_STARTED";
}

export function roleHome(role: string) {
  switch (role) {
    case "STUDENT":
      return "/student";
    case "TEACHER":
      return "/teacher";
    case "ADMIN":
      return "/admin";
    case "OWNER":
      return "/owner";
    default:
      return "/login";
  }
}

export function canAccessPath(role: string, pathname: string) {
  if (pathname.startsWith("/student")) return role === "STUDENT";
  if (pathname.startsWith("/teacher")) return role === "TEACHER";
  if (pathname.startsWith("/admin")) return role === "ADMIN";
  if (pathname.startsWith("/owner")) return role === "OWNER";
  return true;
}

export type ScorePoint = {
  id: string;
  topic: string;
  points: number;
  maxPoints: number;
  label: string;
  heldAt: string;
};

export type InsightSection = {
  key: "strengths" | "review" | "practice" | "limitations";
  title: string;
  body: string;
  scoreIds: string[];
};

export function buildInsight(scores: ScorePoint[]) {
  const evidenceScoreIds = scores.map((score) => score.id);
  if (evidenceState(scores.length) === "NOT_ENOUGH") {
    return {
      enough: false as const,
      message: "Not enough evidence yet",
      sections: [] as InsightSection[],
      evidenceScoreIds,
    };
  }

  const byTopic = new Map<string, ScorePoint[]>();
  for (const score of scores) {
    const list = byTopic.get(score.topic) ?? [];
    list.push(score);
    byTopic.set(score.topic, list);
  }

  const topicAvg = [...byTopic.entries()].map(([topic, list]) => {
    const pct = list.reduce((sum, item) => sum + (item.points / item.maxPoints) * 100, 0) / list.length;
    return { topic, pct, list };
  });

  const strong = topicAvg.filter((item) => item.list.length >= EVIDENCE_MIN && item.pct >= 80);
  const weak = topicAvg.filter((item) => item.list.length >= EVIDENCE_MIN && item.pct < 70);
  const thin = topicAvg.filter((item) => item.list.length < EVIDENCE_MIN);

  const sections: InsightSection[] = [
    {
      key: "strengths",
      title: "Strengths",
      body: strong.length
        ? `Stronger recent results in ${strong.map((item) => item.topic).join(", ")}.`
        : "No topic has three or more scores at 80% or above yet.",
      scoreIds: strong.flatMap((item) => item.list.map((score) => score.id)),
    },
    {
      key: "review",
      title: "Topics to review",
      body: weak.length
        ? `Scores are lower in ${weak.map((item) => `${item.topic} (${Math.round(item.pct)}%)`).join(", ")}.`
        : "No topic with enough evidence is below 70% right now.",
      scoreIds: weak.flatMap((item) => item.list.map((score) => score.id)),
    },
    {
      key: "practice",
      title: "Recommended practice",
      body: weak.length
        ? `Short practice on ${weak[0].topic} using the class materials. Advisory, not a diagnosis.`
        : "Keep the current practice set. Advisory, not a diagnosis.",
      scoreIds: (weak[0]?.list ?? strong[0]?.list ?? []).map((score) => score.id),
    },
    {
      key: "limitations",
      title: "Data limitations",
      body: thin.length
        ? `${thin.map((item) => item.topic).join(", ")} ${thin.length === 1 ? "has" : "have"} fewer than ${EVIDENCE_MIN} scored assessments.`
        : "Each listed topic has at least three scored assessments.",
      scoreIds: thin.flatMap((item) => item.list.map((score) => score.id)),
    },
  ];

  return { enough: true as const, message: null, sections, evidenceScoreIds };
}

export function topicMastery(scores: ScorePoint[]) {
  const byTopic = new Map<string, ScorePoint[]>();
  for (const score of scores) {
    const list = byTopic.get(score.topic) ?? [];
    list.push(score);
    byTopic.set(score.topic, list);
  }
  return [...byTopic.entries()].map(([topic, list]) => {
    const pct = Math.round(list.reduce((sum, item) => sum + (item.points / item.maxPoints) * 100, 0) / list.length);
    return {
      topic,
      pct,
      count: list.length,
      state: evidenceState(list.length),
      scores: list,
    };
  });
}
