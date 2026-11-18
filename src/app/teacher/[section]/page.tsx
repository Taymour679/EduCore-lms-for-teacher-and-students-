import { notFound } from "next/navigation";
import { RoleWorkspace } from "@/components/dashboards/role-workspace";
import { AppShell } from "@/components/shell/app-shell";
import { getWorkspaceDefinition } from "@/lib/workspace-definitions";
import { teacherNav } from "@/lib/nav";
import { loadWorkspaceDataset } from "@/server/workspace-data";
import { requireRole } from "@/server/guard";

export const dynamicParams = false;

export function generateStaticParams() {
  return teacherNav.slice(1).map((item) => ({ section: item.href.split("/").at(-1)! }));
}

export default async function TeacherWorkspacePage({ params, searchParams }: { params: Promise<{ section: string }>; searchParams: Promise<{ q?: string }> }) {
  const [route, query, user] = await Promise.all([params, searchParams, requireRole("TEACHER")]);
  const definition = getWorkspaceDefinition("TEACHER", route.section);
  if (!definition || !teacherNav.some((item) => item.href === `/teacher/${route.section}`)) notFound();
  const dataset = await loadWorkspaceDataset("TEACHER", route.section, user);
  return <AppShell user={{ name: user.name, email: user.email, role: user.role, schoolName: user.school?.name }} title={definition.title}><RoleWorkspace key={`TEACHER/${route.section}`} role="TEACHER" section={route.section} definition={definition} dataset={dataset} initialQuery={query.q ?? ""} /></AppShell>;
}