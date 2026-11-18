import { AppShell } from "@/components/shell/app-shell";
import { StudentHomework } from "@/components/dashboards/student-homework";
import { requireRole } from "@/server/guard";

export default async function HomeworkPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const [user, params] = await Promise.all([requireRole("STUDENT"), searchParams]);

  return (
    <AppShell
      user={{ name: user.name, email: user.email, role: user.role, schoolName: user.school?.name }}
      title="Homework"
    >
      <StudentHomework initialQuery={params.q ?? ""} />
    </AppShell>
  );
}