import { ArrowUpRight, CheckCircle2, Clock3, Target } from "lucide-react";
import { TrendChart } from "@/components/ui/charts";
import { AppShell } from "@/components/shell/app-shell";
import { Card } from "@/components/ui/card";
import { SampleDataBadge, StatusChip } from "@/components/ui/chips";
import { ProgressBar } from "@/components/ui/feedback";
import { requireRole } from "@/server/guard";

const subjects = [
  { name: "Mathematics", score: 88, change: "+4 pts", tone: "success" as const },
  { name: "Science", score: 82, change: "+2 pts", tone: "success" as const },
  { name: "English", score: 79, change: "Steady", tone: "info" as const },
  { name: "History", score: 74, change: "+1 pt", tone: "success" as const },
];

const activity = [
  { title: "Linear graphs practice", detail: "Mathematics · Today", status: "In progress", tone: "info" as const },
  { title: "Reading response", detail: "English · Yesterday", status: "Submitted", tone: "success" as const },
  { title: "Ecosystems quiz", detail: "Science · Nov 14", status: "Graded · 84%", tone: "success" as const },
];

export default async function ProgressPage() {
  const user = await requireRole("STUDENT");

  return (
    <AppShell user={{ name: user.name, email: user.email, role: user.role, schoolName: user.school?.name }} title="My progress">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div><p className="text-xs font-semibold uppercase tracking-wide text-primary">My learning</p><h2 className="mt-2 text-2xl font-semibold">Progress and performance</h2><p className="mt-1 text-sm text-muted">A view of recent results, completion, and strengths by subject.</p></div>
          <SampleDataBadge />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric icon={Target} label="Overall average" value="82%" note="Across 6 assessments" tone="bg-primary-soft text-primary" />
          <Metric icon={CheckCircle2} label="Homework completed" value="18 / 22" note="82% completion rate" tone="bg-[#e2f2eb] text-[#16734e]" />
          <Metric icon={ArrowUpRight} label="This term" value="+6 pts" note="Compared with last term" tone="bg-[#e8f0ff] text-info" />
          <Metric icon={Clock3} label="Learning time" value="4.5 hrs" note="This week · 3 sessions" tone="bg-[#fff3d8] text-[#9a6500]" />
        </div>

        <div className="grid items-start gap-4 2xl:grid-cols-[1.5fr_0.85fr]">
          <Card className="min-w-0"><TrendChart data={[
            { label: "Sep", student: 73, average: 71 },
            { label: "Oct", student: 76, average: 73 },
            { label: "Nov", student: 79, average: 74 },
            { label: "Dec", student: 77, average: 75 },
            { label: "Jan", student: 82, average: 76 },
            { label: "Feb", student: 82, average: 77 },
          ]} /></Card>

          <Card>
            <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">Assignment completion</h3><p className="mt-1 text-xs text-muted">Your work this term</p></div><SampleDataBadge /></div>
            <div className="mt-6 flex items-end gap-3"><p className="text-4xl font-semibold">82<span className="text-2xl">%</span></p><p className="pb-1 text-xs text-success">18 of 22 completed</p></div>
            <div className="mt-4"><ProgressBar value={82} label="Completed" /></div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-control bg-slate-50 p-3"><p className="text-xs text-muted">On time</p><p className="mt-1 text-lg font-semibold">16</p></div>
              <div className="rounded-control bg-amber-50 p-3"><p className="text-xs text-amber-800">Late</p><p className="mt-1 text-lg font-semibold text-amber-950">2</p></div>
            </div>
          </Card>
        </div>

        <div className="grid items-start gap-4 xl:grid-cols-[1fr_1.2fr]">
          <Card>
            <div className="flex items-center justify-between gap-3"><div><h3 className="font-semibold">Performance by subject</h3><p className="mt-1 text-xs text-muted">Average score from recent assessments</p></div><SampleDataBadge /></div>
            <div className="mt-6 space-y-5">
              {subjects.map((subject) => <div key={subject.name} className="grid grid-cols-[minmax(90px,0.8fr)_2fr_auto] items-center gap-3"><span className="truncate text-sm font-medium">{subject.name}</span><ProgressBar value={subject.score} label={`${subject.score}%`} /><StatusChip tone={subject.tone}>{subject.change}</StatusChip></div>)}
            </div>
          </Card>

          <Card className="p-0">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-4 md:px-5"><div><h3 className="font-semibold">Recent academic activity</h3><p className="mt-1 text-xs text-muted">Latest updates from your classes</p></div><SampleDataBadge /></div>
            <ul className="divide-y divide-slate-100 px-4 md:px-5">{activity.map((item) => <li key={item.title} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-medium">{item.title}</p><p className="mt-1 text-xs text-muted">{item.detail}</p></div><StatusChip tone={item.tone}>{item.status}</StatusChip></li>)}</ul>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Metric({ icon: Icon, label, value, note, tone }: { icon: typeof Target; label: string; value: string; note: string; tone: string }) {
  return <Card className="flex min-h-32 items-start justify-between gap-3"><div><p className="text-sm text-muted">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p><p className="mt-1 text-xs text-muted">{note}</p></div><span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon size={19} /></span></Card>;
}