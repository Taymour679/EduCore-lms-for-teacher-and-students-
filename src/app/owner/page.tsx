import { DashboardPreview } from "@/components/dashboards/dashboard-preview";
import { requireRole } from "@/server/guard";

export default async function OwnerPage() {
  const user = await requireRole("OWNER");
  return <DashboardPreview role="OWNER" user={{ name: user.name, email: user.email, role: user.role, schoolName: user.school?.name }} />;
}