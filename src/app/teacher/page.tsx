import { DashboardPreview } from "@/components/dashboards/dashboard-preview";
import { requireRole } from "@/server/guard";

export default async function TeacherPage() {
  const user = await requireRole("TEACHER");
  return <DashboardPreview role="TEACHER" user={{ name: user.name, email: user.email, role: user.role, schoolName: user.school?.name }} />;
}