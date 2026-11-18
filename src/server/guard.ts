import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { School, User } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { DEV_AUTH_BYPASS } from "@/lib/dev-auth";

type Role = "STUDENT" | "TEACHER" | "ADMIN" | "OWNER";
type GuardUser = User & { school: School | null };

const mockSchool = {
  id: "mock-school",
  name: "Mock School",
  city: "Cairo",
  status: "ACTIVE",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
};

const mockUsers: Record<Role, GuardUser> = {
  STUDENT: {
    id: "mock-student",
    email: "mock.student@educore.local",
    name: "Mock Student",
    passwordHash: "",
    role: "STUDENT",
    schoolId: mockSchool.id,
    school: mockSchool,
    yearGroup: "Year 10",
    title: null,
    resetTokenHash: null,
    resetTokenExpires: null,
    createdAt: mockSchool.createdAt,
  },
  TEACHER: {
    id: "mock-teacher",
    email: "mock.teacher@educore.local",
    name: "Mock Teacher",
    passwordHash: "",
    role: "TEACHER",
    schoolId: mockSchool.id,
    school: mockSchool,
    yearGroup: null,
    title: "Teacher",
    resetTokenHash: null,
    resetTokenExpires: null,
    createdAt: mockSchool.createdAt,
  },
  ADMIN: {
    id: "mock-admin",
    email: "mock.admin@educore.local",
    name: "Mock Admin",
    passwordHash: "",
    role: "ADMIN",
    schoolId: mockSchool.id,
    school: mockSchool,
    yearGroup: null,
    title: "Administrator",
    resetTokenHash: null,
    resetTokenExpires: null,
    createdAt: mockSchool.createdAt,
  },
  OWNER: {
    id: "mock-owner",
    email: "mock.owner@educore.local",
    name: "Mock Owner",
    passwordHash: "",
    role: "OWNER",
    schoolId: null,
    school: null,
    yearGroup: null,
    title: "Owner",
    resetTokenHash: null,
    resetTokenExpires: null,
    createdAt: mockSchool.createdAt,
  },
};

export async function requireUser(role: Role = "STUDENT") {
  if (DEV_AUTH_BYPASS) return mockUsers[role];

  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { school: true },
  });
  if (!user) redirect("/login");
  if (user.role !== "OWNER" && user.school?.status === "SUSPENDED") redirect("/paused");
  return user;
}

export async function requireRole(role: Role) {
  const user = await requireUser(role);
  if (user.role !== role) redirect("/forbidden");
  return user;
}

export async function clientIp() {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "0.0.0.0";
  return headerList.get("x-real-ip") ?? "0.0.0.0";
}
