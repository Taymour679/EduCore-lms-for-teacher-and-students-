import { notFound } from "next/navigation";
import { RoleWorkspace } from "@/components/dashboards/role-workspace";
import { AppShell } from "@/components/shell/app-shell";
import { ownerNav } from "@/lib/nav";
import { getWorkspaceDefinition } from "@/lib/workspace-definitions";
import { loadWorkspaceDataset } from "@/server/workspace-data";
import { requireRole } from "@/server/guard";

export const dynamicParams = false;

export function generateStaticParams() {
  return ownerNav.slice(1).map((item) => ({ section: item.href.split("/").at(-1)! }));
}

export default async function OwnerWorkspacePage({ params, searchParams }: { params: Promise<{ section: string }>; searchParams: Promise<{ q?: string }> }) {
  const [route, query, user] = await Promise.all([params, searchParams, requireRole("OWNER")]);
  const definition = getWorkspaceDefinition("OWNER", route.section);
  if (!definition || !ownerNav.some((item) => item.href === `/owner/${route.section}`)) notFound();
  const dataset = await loadWorkspaceDataset("OWNER", route.section, user);
  return <AppShell user={{ name: user.name, email: user.email, role: user.role, schoolName: user.school?.name }} title={definition.title}><RoleWorkspace key={`OWNER/${route.section}`} role="OWNER" section={route.section} definition={definition} dataset={dataset} initialQuery={query.q ?? ""} /></AppShell>;
}