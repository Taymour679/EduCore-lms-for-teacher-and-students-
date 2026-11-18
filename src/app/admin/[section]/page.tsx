import { notFound } from "next/navigation";
import { RoleWorkspace } from "@/components/dashboards/role-workspace";
import { AppShell } from "@/components/shell/app-shell";
import { adminNav } from "@/lib/nav";
import { getWorkspaceDefinition } from "@/lib/workspace-definitions";
import { loadWorkspaceDataset } from "@/server/workspace-data";
import { requireRole } from "@/server/guard";

export const dynamicParams = false;

export function generateStaticParams() {
  return adminNav.slice(1).map((item) => ({ section: item.href.split("/").at(-1)! }));
}

export default async function AdminWorkspacePage({ params, searchParams }: { params: Promise<{ section: string }>; searchParams: Promise<{ q?: string }> }) {
  const [route, query, user] = await Promise.all([params, searchParams, requireRole("ADMIN")]);
  const definition = getWorkspaceDefinition("ADMIN", route.section);
  if (!definition || !adminNav.some((item) => item.href === `/admin/${route.section}`)) notFound();
  const dataset = await loadWorkspaceDataset("ADMIN", route.section, user);
  return <AppShell user={{ name: user.name, email: user.email, role: user.role, schoolName: user.school?.name }} title={definition.title}><RoleWorkspace key={`ADMIN/${route.section}`} role="ADMIN" section={route.section} definition={definition} dataset={dataset} initialQuery={query.q ?? ""} /></AppShell>;
}