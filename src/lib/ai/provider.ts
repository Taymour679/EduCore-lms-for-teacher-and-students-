import { safeHint } from "@/lib/rules";

export type AiMessage = {
  system: string;
  user: string;
  correctAnswer?: string | null;
  guard?: "hint" | "none";
};

export type AiResult = {
  text: string;
  tokenCount: number;
  costEgp: number;
};

const HINT_SYSTEM =
  "You are a school study assistant. Give a short hint or explanation. Never state the final answer, the correct option, or a full response a student could submit for a grade. Do not name the software vendor or model.";

export function homeworkHelpMessages(question: string, ask: string, correctAnswer?: string | null): AiMessage {
  return {
    system: HINT_SYSTEM,
    user: `Question:\n${question}\n\nStudent asks:\n${ask}\n\nReply with a hint only.`,
    correctAnswer,
    guard: "hint",
  };
}

export function studyMessages(ask: string): AiMessage {
  return {
    system:
      "You are a school study assistant. Explain ideas, suggest practice, and stay advisory. Never claim a diagnosis. Do not name a software vendor or model.",
    user: ask,
    guard: "none",
  };
}

export function draftQuestionMessages(lessonTitle: string, lessonBody: string): AiMessage {
  return {
    system:
      "Draft two unpublished school questions as JSON: an array of objects with type (MULTIPLE_CHOICE or SHORT_ANSWER), prompt, choices (array, only for multiple choice), correctAnswer, rubric, points. Do not include a vendor or model name.",
    user: `Lesson: ${lessonTitle}\n${lessonBody}`,
    guard: "none",
  };
}

function mockText(message: AiMessage) {
  if (message.guard === "hint") {
    return "Look at what the cell part does, not its nickname. Compare what each structure makes, then write the difference in your own words. This is a hint, not the graded answer.";
  }
  if (message.system.includes("lesson planning assistant")) {
    return "Learning goal: connect the topic to a clear example.\n\nLesson outline\n1. Open with a short retrieval question from the previous lesson.\n2. Model the new idea with one worked example, then let pairs try a similar problem.\n3. Close with an exit question to check understanding.\n\nTeacher review: adapt the example and timing to your class.";
  }
  if (message.system.includes("unpublished school questions")) {
    return JSON.stringify([
      {
        type: "MULTIPLE_CHOICE",
        prompt: "Which structure packages proteins for export from the cell?",
        choices: ["Nucleus", "Golgi apparatus", "Ribosome", "Lysosome"],
        correctAnswer: "Golgi apparatus",
        rubric: "",
        points: 10,
      },
      {
        type: "SHORT_ANSWER",
        prompt: "Explain one way the cell membrane controls what enters the cell.",
        choices: [],
        correctAnswer: "",
        rubric: "Mentions selective permeability or transport.",
        points: 10,
      },
    ]);
  }
  return "Start from the lesson notes, restate the idea in one sentence, then try two practice questions. Advisory, not a diagnosis.";
}

function costFor(tokens: number) {
  return Math.round(tokens * 0.00004 * 1000) / 1000;
}

async function completeWithAnthropic(message: AiMessage): Promise<AiResult> {
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 500,
      system: message.system,
      messages: [{ role: "user", content: message.user }],
    }),
  });
  if (!response.ok) {
    throw new Error("AI_UNAVAILABLE");
  }
  const payload = (await response.json()) as {
    content?: { text?: string }[];
    usage?: { input_tokens?: number; output_tokens?: number };
  };
  const text = payload.content?.map((part) => part.text ?? "").join("\n").trim() ?? "";
  const tokenCount = (payload.usage?.input_tokens ?? 0) + (payload.usage?.output_tokens ?? 0);
  return { text, tokenCount, costEgp: costFor(tokenCount || text.length / 4) };
}

export async function completeAi(message: AiMessage): Promise<AiResult> {
  let result: AiResult;
  if (process.env.ANTHROPIC_API_KEY) {
    result = await completeWithAnthropic(message);
  } else {
    const text = mockText(message);
    const tokenCount = Math.max(1, Math.ceil((message.user.length + text.length) / 4));
    result = { text, tokenCount, costEgp: costFor(tokenCount) };
  }
  if (message.guard === "hint") {
    result = { ...result, text: safeHint(result.text, message.correctAnswer) };
  }
  return result;
}
