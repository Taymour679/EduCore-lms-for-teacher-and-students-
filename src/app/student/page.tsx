import { DashboardPreview } from "@/components/dashboards/dashboard-preview";
import { requireRole } from "@/server/guard";

export default async function StudentPage() {
  const user = await requireRole("STUDENT");
  return <DashboardPreview role="STUDENT" user={{ name: user.name, email: user.email, role: user.role, schoolName: user.school?.name }} />;
}