import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid school email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const forgotSchema = z.object({
  email: z.string().trim().email("Enter a valid school email."),
});

export const resetSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const ticketSchema = z.object({
  subject: z.string().trim().min(3, "Add a subject.").max(120),
  category: z.enum(["Access", "Homework", "Billing", "Other"]),
  message: z.string().trim().min(10, "Add a short message.").max(2000),
});

export const quoteSchema = z.object({
  schoolName: z.string().trim().min(2).max(120),
  students: z.coerce.number().int().positive().max(100000),
  message: z.string().trim().min(10).max(2000),
});

export const homeworkHelpSchema = z.object({
  homeworkId: z.string().min(1),
  questionId: z.string().min(1),
  prompt: z.string().trim().min(3, "Ask a question.").max(1000),
});

export const studySchema = z.object({
  prompt: z.string().trim().min(3).max(1000),
  classId: z.string().min(1).optional(),
});

export const answerSchema = z.object({
  homeworkId: z.string().min(1),
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      value: z.string().max(5000),
    }),
  ),
});

export const questionDraftSchema = z.object({
  type: z.enum(["MULTIPLE_CHOICE", "SHORT_ANSWER"]),
  prompt: z.string().trim().min(5).max(2000),
  choices: z.array(z.string().trim().min(1)).max(6).optional(),
  correctAnswer: z.string().trim().max(2000).optional(),
  rubric: z.string().trim().max(2000).optional(),
  points: z.coerce.number().int().positive().max(100),
});

export const homeworkDraftSchema = z.object({
  id: z.string().optional(),
  classId: z.string().min(1, "Choose a class."),
  title: z.string().trim().min(3, "Add a title.").max(160),
  instructions: z.string().trim().min(3, "Add instructions.").max(4000),
  topic: z.string().trim().min(2).max(160),
  dueAt: z.string().min(1, "Choose a due date."),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  questions: z.array(questionDraftSchema).min(1, "Add at least one question."),
});

export const inviteSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  role: z.enum(["TEACHER", "ADMIN"]),
  subject: z.string().trim().max(80).optional(),
});

export const suspendSchema = z.object({
  schoolId: z.string().min(1),
  reason: z.string().trim().min(3, "A reason is required.").max(500),
  next: z.enum(["SUSPENDED", "ACTIVE"]),
});

export const insightEditSchema = z.object({
  id: z.string().min(1),
  output: z.string().trim().min(3).max(8000),
});

export const slotChangeSchema = z.object({
  studentId: z.string().min(1),
});

export const draftFromLessonSchema = z.object({
  materialId: z.string().min(1),
  classId: z.string().min(1),
});

export const auditFilterSchema = z.object({
  actor: z.string().trim().optional(),
  action: z.string().trim().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
});
