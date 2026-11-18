import { AppShell } from "@/components/shell/app-shell";
import { StudentStudyWorkspace } from "@/components/dashboards/student-study";
import { requireRole } from "@/server/guard";

export default async function AiStudyPage() {
  const user = await requireRole("STUDENT");
  return (
    <AppShell
      user={{ name: user.name, email: user.email, role: user.role, schoolName: user.school?.name }}
      title="AI Study"
    >
      <StudentStudyWorkspace demoMode={!process.env.ANTHROPIC_API_KEY} />
    </AppShell>
  );
}