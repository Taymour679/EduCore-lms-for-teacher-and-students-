"use server";

import { randomBytes } from "node:crypto";
import { signOut } from "@/auth";
import { draftQuestionMessages, studyMessages } from "@/lib/ai/provider";
import { completeAi } from "@/lib/ai/provider";
import { DEV_AUTH_BYPASS } from "@/lib/dev-auth";
import { prisma } from "@/lib/db";
import type { WorkspaceRole } from "@/lib/workspace-definitions";
import { requireRole } from "@/server/guard";

export async function signOutAction() {
  await signOut({ redirectTo: DEV_AUTH_BYPASS ? "/" : "/login" });
}

export async function askStudyAssistant(subject: string, question: string) {
  const cleanSubject = subject.trim().slice(0, 60);
  const cleanQuestion = question.trim().slice(0, 400);
  if (!cleanSubject || cleanQuestion.length < 3) {
    return { ok: false as const, error: "Choose a subject and enter a question of at least three characters." };
  }

  try {
    const result = await completeAi(studyMessages(`Subject: ${cleanSubject}\nStudent question: ${cleanQuestion}`));
    return {
      ok: true as const,
      answer: result.text,
      mode: process.env.ANTHROPIC_API_KEY ? "connected" as const : "demo" as const,
    };
  } catch {
    return { ok: false as const, error: "The study assistant could not respond. Please try again." };
  }
}

export async function askTeachingAssistant(prompt: string, mode: "lesson" | "questions") {
  const cleanPrompt = prompt.trim().slice(0, 800);
  if (cleanPrompt.length < 5) return { ok: false as const, error: "Enter a topic or lesson goal first." };
  await requireRole("TEACHER");
  if (!process.env.ANTHROPIC_API_KEY) {
    const text = mode === "questions"
      ? `Practice set: ${cleanPrompt}\n\n1. Explain the main idea in your own words.\n2. Apply it to a new example and show your reasoning.\n3. Check your result and describe one common mistake to avoid.`
      : `Lesson idea: ${cleanPrompt}\n\nLearning goal: describe the key idea and apply it to a new example.\n\n1. Start with a short retrieval prompt connected to prior learning.\n2. Model one example, then let pairs try a similar task.\n3. Close with an exit question to check understanding.\n\nTeacher review: adapt examples and timing to your class.`;
    return { ok: true as const, text, mode: "demo" as const };
  }
  try {
    const request = mode === "questions"
      ? draftQuestionMessages(cleanPrompt, "Create three short, unpublished practice questions for teacher review.")
      : { system: "You are a lesson planning assistant. Suggest a concise lesson outline with a learning goal, one activity, and a check for understanding. This is an unpublished draft for teacher review.", user: cleanPrompt };
    const result = await completeAi(request);
    return { ok: true as const, text: result.text, mode: "connected" as const };
  } catch {
    return { ok: false as const, error: "The teaching helper could not respond. Please try again." };
  }
}

export async function saveWorkspaceRecord(role: WorkspaceRole, section: string, id: string | null, input: Record<string, string>) {
  const user = await requireRole(role);
  const values = Object.fromEntries(Object.entries(input).map(([key, value]) => [key, String(value).trim().slice(0, 4000)]));
  if (DEV_AUTH_BYPASS) return { ok: true as const, mode: "demo" as const };
  const schoolId = user.schoolId;
  const title = values.title ?? "";

  try {
    if (role === "TEACHER" && (section === "materials" || section === "homework" || section === "live")) {
      if (!schoolId) return { ok: false as const, error: "This account is not associated with a school." };
      const classRecord = await prisma.class.findFirst({ where: { name: values.className, teacherId: user.id, schoolId }, select: { id: true } });
      if (!classRecord) return { ok: false as const, error: "Choose a class assigned to your account." };
      if (section === "materials") {
        const data = { title, kind: values.kind ?? "Lesson notes", body: values.detail ?? "" };
        if (id) await prisma.material.updateMany({ where: { id, class: { teacherId: user.id, schoolId } }, data });
        else await prisma.material.create({ data: { ...data, classId: classRecord.id } });
      } else if (section === "homework") {
        const dueAt = new Date(`${values.dueDate}T23:59:00`);
        if (Number.isNaN(dueAt.getTime())) return { ok: false as const, error: "Enter a valid due date." };
        const data = { title, instructions: values.detail ?? "", topic: values.topic ?? values.subject ?? "General", dueAt, points: Math.max(1, Number(values.points) || 10), status: values.status ?? "DRAFT" };
        if (id) await prisma.homework.updateMany({ where: { id, class: { teacherId: user.id, schoolId } }, data });
        else await prisma.homework.create({ data: { ...data, classId: classRecord.id } });
      } else {
        const startsAt = new Date(`${values.date}T${values.time || "09:00"}`);
        const endsAt = new Date(`${values.date}T${values.endTime || "09:30"}`);
        if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt <= startsAt) return { ok: false as const, error: "Enter a valid session date and time range." };
        const data = { title, startsAt, endsAt, hostName: values.host || user.name };
        if (id) await prisma.liveSession.updateMany({ where: { id, class: { teacherId: user.id, schoolId } }, data });
        else await prisma.liveSession.create({ data: { ...data, classId: classRecord.id } });
      }
      return { ok: true as const, mode: "database" as const };
    }

    if (role === "ADMIN" && (section === "staff" || section === "students") && id) {
      if (!schoolId) return { ok: false as const, error: "This account is not associated with a school." };
      const result = section === "staff"
        ? await prisma.user.updateMany({ where: { id, schoolId, role: { in: ["TEACHER", "ADMIN"] } }, data: { name: title, role: values.role ?? "TEACHER", title: values.detail || null } })
        : await prisma.user.updateMany({ where: { id, schoolId, role: "STUDENT" }, data: { name: title, yearGroup: values.yearGroup || null } });
      if (!result.count) return { ok: false as const, error: "This record was not found in your school." };
      return { ok: true as const, mode: "database" as const };
    }

    if (role === "ADMIN" && (section === "staff" || section === "students") && !id) {
      if (!schoolId || !values.email || !title) return { ok: false as const, error: "Name and email are required." };
      await prisma.invitation.create({ data: {
        name: title,
        email: values.email.toLowerCase(),
        role: section === "staff" ? values.role ?? "TEACHER" : "STUDENT",
        schoolId,
        status: "PENDING",
        token: randomBytes(24).toString("hex"),
        subject: values.detail ?? null,
        invitedById: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      } });
      return { ok: true as const, mode: "database" as const, notice: "Invitation recorded. Email delivery is not configured." };
    }

    if (role === "ADMIN" && section === "classes") {
      if (!schoolId) return { ok: false as const, error: "This account is not associated with a school." };
      const teacher = await prisma.user.findFirst({ where: { schoolId, role: "TEACHER", name: values.teacher }, select: { id: true } });
      if (!teacher) return { ok: false as const, error: "Choose a teacher in this school." };
      const classData = { name: title, subject: values.subject ?? "General", yearGroup: values.yearGroup ?? "Unassigned", teacherId: teacher.id, room: values.room || null };
      let classId = id;
      if (id) {
        const updated = await prisma.class.updateMany({ where: { id, schoolId }, data: classData });
        if (!updated.count) return { ok: false as const, error: "Class not found in this school." };
      } else {
        const created = await prisma.class.create({ data: { ...classData, schoolId } });
        classId = created.id;
      }
      if (classId && values.studentEmails?.trim()) {
        const emails = [...new Set(values.studentEmails.split(/[\s,;]+/).map((email) => email.trim().toLowerCase()).filter(Boolean))];
        const students = await prisma.user.findMany({ where: { schoolId, role: "STUDENT", email: { in: emails } }, select: { id: true } });
        if (students.length !== emails.length) return { ok: false as const, error: "One or more student emails were not found in this school. The class was saved; correct the enrollment list and save again." };
        for (const student of students) await prisma.enrollment.upsert({ where: { classId_studentId: { classId, studentId: student.id } }, create: { classId, studentId: student.id }, update: {} });
      }
      return { ok: true as const, mode: "database" as const };
    }

    if (role === "ADMIN" && section === "support") {
      if (!schoolId) return { ok: false as const, error: "This account is not associated with a school." };
      if (id) {
        const result = await prisma.supportTicket.updateMany({ where: { id, schoolId }, data: { subject: title, category: values.category ?? "Other", message: values.detail ?? "", status: values.status ?? "OPEN" } });
        if (!result.count) return { ok: false as const, error: "Ticket not found in this school." };
      } else await prisma.supportTicket.create({ data: { userId: user.id, schoolId, subject: title, category: values.category ?? "Other", message: values.detail ?? "", status: "OPEN" } });
      return { ok: true as const, mode: "database" as const };
    }

    if (role === "OWNER" && section === "schools") {
      const data = { name: title, city: values.city ?? "", status: values.status ?? "ACTIVE" };
      if (id) {
        const result = await prisma.school.updateMany({ where: { id }, data });
        if (!result.count) return { ok: false as const, error: "School not found." };
      } else await prisma.school.create({ data });
      return { ok: true as const, mode: "database" as const };
    }

    if (role === "OWNER" && section === "subscriptions") {
      const school = values.school ? await prisma.school.findFirst({ where: { name: values.school }, select: { id: true } }) : null;
      if (values.school && !school) return { ok: false as const, error: "Choose a registered school." };
      const data = { plan: title, status: values.status ?? "ACTIVE", slots: Math.max(1, Number(values.slots) || 1), extraSlots: 0, priceEgp: Math.max(0, Number(values.price) || 0), schoolId: school?.id ?? null };
      if (id) {
        const result = await prisma.subscription.updateMany({ where: { id }, data });
        if (!result.count) return { ok: false as const, error: "Subscription not found." };
      } else await prisma.subscription.create({ data });
      return { ok: true as const, mode: "database" as const };
    }

    if (role === "OWNER" && section === "support") {
      if (id) {
        const result = await prisma.supportTicket.updateMany({ where: { id }, data: { status: values.status ?? "OPEN" } });
        if (!result.count) return { ok: false as const, error: "Ticket not found." };
      } else {
        const school = values.school ? await prisma.school.findFirst({ where: { name: values.school }, select: { id: true } }) : null;
        await prisma.supportTicket.create({ data: { userId: user.id, schoolId: school?.id ?? null, subject: title, category: values.category ?? "Other", message: values.detail ?? "", status: values.status ?? "OPEN" } });
      }
      return { ok: true as const, mode: "database" as const };
    }
    return { ok: false as const, error: "This action is not available for this workspace." };
  } catch {
    return { ok: false as const, error: "The change could not be saved. Check the form and try again." };
  }
}