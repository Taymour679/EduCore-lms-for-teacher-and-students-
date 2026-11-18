import "server-only";
import { prisma } from "@/lib/db";
import { DEV_AUTH_BYPASS } from "@/lib/dev-auth";
import { getWorkspaceDefinition, type WorkspaceDefinition, type WorkspaceRecord, type WorkspaceRole } from "@/lib/workspace-definitions";
import type { User } from "@prisma/client";

export type WorkspaceDataset = {
  records: WorkspaceRecord[];
  source: "demo" | "database" | "unavailable";
  error?: string;
  chart?: WorkspaceDefinition["chart"];
};

type WorkspaceUser = Pick<User, "id" | "schoolId">;

const asRecord = (id: string, title: string, subtitle: string, status: string, data: Record<string, string> = {}): WorkspaceRecord => ({ id, title, subtitle, status, data });
const text = (value: string | number | null | undefined) => value == null ? "—" : String(value);
const date = (value: Date | null | undefined) => value ? value.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" }) : "—";

export async function loadWorkspaceDataset(role: WorkspaceRole, section: string, user: WorkspaceUser): Promise<WorkspaceDataset> {
  const definition = getWorkspaceDefinition(role, section);
  if (!definition) return { records: [], source: "unavailable", error: "This workspace is not configured." };
  if (DEV_AUTH_BYPASS) return { records: definition.records, source: "demo" };
  if ((role === "TEACHER" || role === "ADMIN") && !user.schoolId) return { records: [], source: "database", error: "This account is not associated with a school." };

  try {
    const records = await queryWorkspace(role, section, user);
    if (records === null) return { records: definition.records, source: "demo" };
    const chart = role === "OWNER" && (section === "revenue" || section === "ai-usage") ? await loadOwnerTrend(section) : undefined;
    return { records, source: "database", chart };
  } catch {
    return { records: [], source: "unavailable", error: "Workspace data could not be loaded. Please try again." };
  }
}

async function loadOwnerTrend(section: "revenue" | "ai-usage"): Promise<WorkspaceDefinition["chart"]> {
  const months = Array.from({ length: 6 }, (_, index) => {
    const value = new Date();
    value.setDate(1);
    value.setMonth(value.getMonth() - 5 + index);
    return value;
  });
  const keys = months.map((month) => `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`);
  const totals = new Map(keys.map((key) => [key, 0]));
  if (section === "revenue") {
    const rows = await prisma.invoice.findMany({ select: { issuedAt: true, amountEgp: true } });
    for (const row of rows) {
      const key = `${row.issuedAt.getFullYear()}-${String(row.issuedAt.getMonth() + 1).padStart(2, "0")}`;
      if (totals.has(key)) totals.set(key, (totals.get(key) ?? 0) + row.amountEgp);
    }
  } else {
    const rows = await prisma.aiInteraction.findMany({ select: { createdAt: true } });
    for (const row of rows) {
      const key = `${row.createdAt.getFullYear()}-${String(row.createdAt.getMonth() + 1).padStart(2, "0")}`;
      if (totals.has(key)) totals.set(key, (totals.get(key) ?? 0) + 1);
    }
  }
  if (![...totals.values()].some((value) => value > 0)) return undefined;
  return {
    title: section === "revenue" ? "Invoice revenue by month (EGP)" : "AI requests by month",
    kind: section === "revenue" ? "bar" : "trend",
    labels: months.map((month) => month.toLocaleDateString("en", { month: "short" })),
    values: keys.map((key) => totals.get(key) ?? 0),
  };
}

async function queryWorkspace(role: WorkspaceRole, section: string, user: WorkspaceUser): Promise<WorkspaceRecord[] | null> {
  if (role === "TEACHER") {
    const schoolId = user.schoolId!;
    if (section === "classes") {
      const rows = await prisma.class.findMany({ where: { teacherId: user.id, schoolId }, include: { _count: { select: { enrollments: true } } }, orderBy: { name: "asc" } });
      return rows.map((row) => asRecord(row.id, row.name, `${row.yearGroup} · ${row.room ?? "Room not set"}`, "Active", { subject: row.subject, yearGroup: row.yearGroup, students: String(row._count.enrollments), room: row.room ?? "—" }));
    }
    if (section === "students") {
      const rows = await prisma.enrollment.findMany({ where: { class: { teacherId: user.id, schoolId } }, include: { class: true, student: { select: { id: true, name: true, email: true, yearGroup: true, scores: { where: { topic: { class: { teacherId: user.id, schoolId } } }, select: { id: true, points: true, maxPoints: true } } } } } });
      const byStudent = new Map<string, { name: string; email: string; year: string; classes: Set<string>; scores: Map<string, { points: number; maxPoints: number }> }>();
      for (const row of rows) {
        const existing = byStudent.get(row.studentId) ?? { name: row.student.name, email: row.student.email, year: row.student.yearGroup ?? "—", classes: new Set<string>(), scores: new Map<string, { points: number; maxPoints: number }>() };
        existing.classes.add(row.class.name);
        for (const score of row.student.scores) existing.scores.set(score.id, score);
        byStudent.set(row.studentId, existing);
      }
      return [...byStudent.entries()].map(([id, row]) => { const points = [...row.scores.values()].reduce((sum, score) => sum + score.points, 0); const maximum = [...row.scores.values()].reduce((sum, score) => sum + score.maxPoints, 0); const average = maximum ? Math.round(points / maximum * 100) : null; return asRecord(id, row.name, `${row.year} · ${row.classes.size} classes`, average !== null && average < 70 ? "Needs review" : "On track", { email: row.email, yearGroup: row.year, classes: [...row.classes].join(", "), average: average === null ? "No scores" : `${average}%` }); });
    }
    if (section === "materials") {
      const rows = await prisma.material.findMany({ where: { class: { teacherId: user.id, schoolId } }, include: { class: { select: { name: true, subject: true } } }, orderBy: { createdAt: "desc" } });
      return rows.map((row) => asRecord(row.id, row.title, `${row.class.subject} · ${row.class.name}`, row.kind, { kind: row.kind, className: row.class.name, updated: date(row.createdAt), detail: row.body }));
    }
    if (section === "homework") {
      const rows = await prisma.homework.findMany({ where: { class: { teacherId: user.id, schoolId } }, include: { class: true, _count: { select: { submissions: true } } }, orderBy: { dueAt: "asc" } });
      return rows.map((row) => asRecord(row.id, row.title, `${row.class.name} · Due ${date(row.dueAt)}`, row.status, { subject: row.class.subject, className: row.class.name, dueDate: row.dueAt.toISOString().slice(0, 10), dueLabel: date(row.dueAt), submissions: String(row._count.submissions), topic: row.topic, points: String(row.points), detail: row.instructions }));
    }
    if (section === "live") {
      const rows = await prisma.liveSession.findMany({ where: { class: { teacherId: user.id, schoolId } }, include: { class: true }, orderBy: { startsAt: "asc" } });
      return rows.map((row) => asRecord(row.id, row.title, `${row.class.name} · ${date(row.startsAt)}`, row.endsAt < new Date() ? "Completed" : "Scheduled", { className: row.class.name, date: row.startsAt.toISOString().slice(0, 10), dateLabel: date(row.startsAt), time: row.startsAt.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }), endTime: row.endsAt.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }), host: row.hostName, detail: `Ends ${date(row.endsAt)}` }));
    }
    if (section === "analytics") {
      const rows = await prisma.class.findMany({ where: { teacherId: user.id, schoolId }, include: { enrollments: true, homework: { include: { _count: { select: { submissions: true } } } }, assessments: { include: { scores: true } } } });
      return rows.map((row) => {
        const scores = row.assessments.flatMap((assessment) => assessment.scores);
        const points = scores.reduce((sum, score) => sum + score.points, 0);
        const max = scores.reduce((sum, score) => sum + score.maxPoints, 0);
        const totalHomework = row.homework.length;
        return asRecord(row.id, row.name, "Class performance", "Active", { students: String(row.enrollments.length), average: max ? `${Math.round(points / max * 100)}%` : "No scores", completion: totalHomework ? `${row.homework.filter((item) => item._count.submissions > 0).length} / ${totalHomework}` : "No assignments", change: "—" });
      });
    }
    if (section === "ai-helper") {
      const rows = await prisma.aiInteraction.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 100 });
      return rows.map((row) => asRecord(row.id, row.input.slice(0, 80), row.type, row.status, { type: row.type, className: row.classId ?? "—", updated: date(row.createdAt), detail: row.output }));
    }
    return null;
  }

  if (role === "ADMIN") {
    const schoolId = user.schoolId!;
    if (section === "staff") {
      const [rows, invitations] = await Promise.all([
        prisma.user.findMany({ where: { schoolId, role: { in: ["TEACHER", "ADMIN"] } }, select: { id: true, name: true, email: true, role: true, title: true, taughtClasses: { where: { schoolId }, select: { id: true } } }, orderBy: { name: "asc" } }),
        prisma.invitation.findMany({ where: { schoolId, role: { in: ["TEACHER", "ADMIN"] } }, orderBy: { sentAt: "desc" } }),
      ]);
      return [...rows.map((row) => asRecord(row.id, row.name, row.title ?? row.role, "Active", { email: row.email, role: row.role, classes: String(row.taughtClasses.length), detail: row.title ?? "" })), ...invitations.map((row) => asRecord(`invite-${row.id}`, row.name, `Invitation · ${row.email}`, row.status, { email: row.email, role: row.role, classes: "—", detail: row.subject ?? "" }))];
    }
    if (section === "students") {
      const [rows, invitations] = await Promise.all([
        prisma.user.findMany({ where: { schoolId, role: "STUDENT" }, select: { id: true, name: true, email: true, yearGroup: true, enrollments: { where: { class: { schoolId } }, select: { class: { select: { name: true } } } }, scores: { where: { topic: { class: { schoolId } } }, select: { points: true, maxPoints: true } } }, orderBy: { name: "asc" } }),
        prisma.invitation.findMany({ where: { schoolId, role: "STUDENT" }, orderBy: { sentAt: "desc" } }),
      ]);
      return [...rows.map((row) => { const points = row.scores.reduce((sum, score) => sum + score.points, 0); const max = row.scores.reduce((sum, score) => sum + score.maxPoints, 0); return asRecord(row.id, row.name, `${row.yearGroup ?? "Year not set"} · ${row.enrollments.length} classes`, "Active", { email: row.email, yearGroup: row.yearGroup ?? "—", classes: row.enrollments.map((entry) => entry.class.name).join(", ") || "Not enrolled", average: max ? `${Math.round(points / max * 100)}%` : "No scores" }); }), ...invitations.map((row) => asRecord(`invite-${row.id}`, row.name, `Invitation · ${row.email}`, row.status, { email: row.email, yearGroup: "—", classes: "—", average: "—" }))];
    }
    if (section === "classes") {
      const rows = await prisma.class.findMany({ where: { schoolId }, include: { teacher: { select: { name: true } }, _count: { select: { enrollments: true } } }, orderBy: { name: "asc" } });
      return rows.map((row) => asRecord(row.id, row.name, `${row.subject} · ${row.yearGroup}`, "Active", { subject: row.subject, yearGroup: row.yearGroup, teacher: row.teacher.name, students: String(row._count.enrollments), room: row.room ?? "—" }));
    }
    if (section === "reports") {
      const rows = await prisma.assessment.findMany({ where: { class: { schoolId } }, include: { class: true, scores: true }, orderBy: { heldAt: "desc" }, take: 100 });
      return rows.map((row) => { const points = row.scores.reduce((sum, score) => sum + score.points, 0); const max = row.scores.reduce((sum, score) => sum + score.maxPoints, 0); return asRecord(row.id, row.title, `${row.class.subject} · ${date(row.heldAt)}`, row.kind, { subject: row.class.subject, classes: row.class.name, average: max ? `${Math.round(points / max * 100)}%` : "No scores", completion: String(row.scores.length), attendance: "Not tracked" }); });
    }
    if (section === "subscription") {
      const [subscriptions, invoices] = await Promise.all([prisma.subscription.findMany({ where: { schoolId }, orderBy: { createdAt: "desc" } }), prisma.invoice.findMany({ where: { schoolId }, orderBy: { issuedAt: "desc" } })]);
      return [...subscriptions.map((row) => asRecord(row.id, row.plan, `Subscription · ${row.status}`, row.status, { plan: row.plan, slots: String(row.slots + row.extraSlots), price: `EGP ${row.priceEgp}`, renewal: `Created ${date(row.createdAt)}` })), ...invoices.map((row) => asRecord(row.id, row.label, `Invoice · ${date(row.issuedAt)}`, row.status, { plan: row.label, slots: "—", price: `EGP ${row.amountEgp}`, renewal: `Issued ${date(row.issuedAt)}` }))];
    }
    if (section === "support") {
      const rows = await prisma.supportTicket.findMany({ where: { schoolId }, orderBy: { createdAt: "desc" }, take: 100 });
      return rows.map((row) => asRecord(row.id, row.subject, `${row.category} · ${date(row.createdAt)}`, row.status, { category: row.category, created: date(row.createdAt), owner: "Support team", detail: row.message }));
    }
    return null;
  }

  if (section === "schools") {
    const rows = await prisma.school.findMany({ include: { _count: { select: { users: { where: { role: "STUDENT" } } } }, subscriptions: { where: { status: "ACTIVE" }, select: { plan: true } } }, orderBy: { name: "asc" } });
    return rows.map((row) => asRecord(row.id, row.name, `${row.city} · ${row.status}`, row.status, { city: row.city, students: String(row._count.users), plan: row.subscriptions[0]?.plan ?? "No active plan", created: date(row.createdAt) }));
  }
  if (section === "users") {
    const rows = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true, school: { select: { name: true, status: true } } }, orderBy: { createdAt: "desc" }, take: 500 });
    return rows.map((row) => asRecord(row.id, row.name, `${row.role} · ${row.school?.name ?? "Platform"}`, "Not tracked", { email: row.email, role: row.role, school: row.school?.name ?? "Platform", created: date(row.createdAt) }));
  }
  if (section === "subscriptions") {
    const rows = await prisma.subscription.findMany({ include: { school: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 500 });
    return rows.map((row) => asRecord(row.id, row.plan, row.school?.name ?? "Platform subscription", row.status, { plan: row.plan, school: row.school?.name ?? "Platform", slots: String(row.slots + row.extraSlots), price: String(row.priceEgp), renewal: "—" }));
  }
  if (section === "revenue") {
    const rows = await prisma.invoice.findMany({ include: { school: { select: { name: true } } }, orderBy: { issuedAt: "desc" }, take: 500 });
    return rows.map((row) => asRecord(row.id, row.school?.name ?? row.label, `Invoice · ${date(row.issuedAt)}`, row.status, { school: row.school?.name ?? "Platform", issued: date(row.issuedAt), amount: `EGP ${row.amountEgp}`, invoiceStatus: row.status }));
  }
  if (section === "ai-usage") {
    const rows = await prisma.aiInteraction.findMany({ include: { user: { select: { school: { select: { name: true } } } } }, orderBy: { createdAt: "desc" }, take: 500 });
    const grouped = new Map<string, { count: number; tokens: number; cost: number }>();
    for (const row of rows) { const key = row.user.school?.name ?? "Platform"; const data = grouped.get(key) ?? { count: 0, tokens: 0, cost: 0 }; data.count += 1; data.tokens += row.tokenCount; data.cost += row.costEgp; grouped.set(key, data); }
    return [...grouped.entries()].map(([school, data], index) => asRecord(`usage-${index}`, school, "Recorded AI usage", "Active", { school, requests: String(data.count), tokens: String(data.tokens), cost: `EGP ${data.cost.toFixed(2)}` }));
  }
  if (section === "support") {
    const rows = await prisma.supportTicket.findMany({ include: { school: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 500 });
    return rows.map((row) => asRecord(row.id, row.subject, row.school?.name ?? "Platform", row.status, { school: row.school?.name ?? "Platform", category: row.category, created: date(row.createdAt), owner: "Support team", detail: row.message }));
  }
  if (section === "audit") {
    const rows = await prisma.auditLog.findMany({ include: { actor: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" }, take: 1000 });
    return rows.map((row) => asRecord(row.id, row.actor?.name ?? "System", `${row.action} · ${row.targetType}`, row.targetType, { actor: row.actor?.email ?? "System", action: row.action, target: `${row.targetType} · ${row.targetId}`, date: row.createdAt.toISOString().slice(0, 10), dateLabel: date(row.createdAt), detail: row.metadata }));
  }
  return null;
}
