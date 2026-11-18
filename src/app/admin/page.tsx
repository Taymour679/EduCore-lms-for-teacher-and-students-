import { DashboardPreview } from "@/components/dashboards/dashboard-preview";
import { requireRole } from "@/server/guard";

export default async function AdminPage() {
  const user = await requireRole("ADMIN");
  return <DashboardPreview role="ADMIN" user={{ name: user.name, email: user.email, role: user.role, schoolName: user.school?.name }} />;
}