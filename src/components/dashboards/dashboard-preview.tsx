import Link from "next/link";
import { ArrowRight, BookOpenCheck, ChartNoAxesCombined, ClipboardCheck, GraduationCap, Users, WalletCards } from "lucide-react";
import { AppShell, type ShellUser } from "@/components/shell/app-shell";
import { Card } from "@/components/ui/card";
import { SampleDataBadge, StatusChip } from "@/components/ui/chips";

type Role = "STUDENT" | "TEACHER" | "ADMIN" | "OWNER";

const dashboards = {
  STUDENT: {
    title: "Student overview",
    heading: "Your learning, in focus",
    subtitle: "A steady view of what is going well and what to work on next.",
    action: "Open homework",
    actionHref: "/student/homework",
    asideHref: "/student/ai-study",
    stats: [
      { label: "Active classes", value: "4", detail: "Across 3 subjects", icon: BookOpenCheck, tone: "bg-primary-soft text-primary" },
      { label: "Due this week", value: "2", detail: "One due Thursday", icon: ClipboardCheck, tone: "bg-[#fff3d8] text-[#9a6500]" },
      { label: "Recent average", value: "82%", detail: "Across 6 assessments", icon: ChartNoAxesCombined, tone: "bg-[#e2f2eb] text-[#16734e]" },
    ],
    section: "Your week",
    rows: [
      { title: "Linear graphs practice", detail: "Mathematics · 12 min", status: "In progress", tone: "info" as const },
      { title: "Ecosystems review", detail: "Science · Due Thursday", status: "Due soon", tone: "warning" as const },
      { title: "Reading response", detail: "English · Completed yesterday", status: "Complete", tone: "success" as const },
    ],
    asideTitle: "Suggested next step",
    asideText: "Spend a few minutes revisiting linear graphs, then check your understanding with a short practice set.",
    asideLabel: "Mathematics · Topic review",
  },
  TEACHER: {
    title: "Teacher overview",
    heading: "Your classes, at a glance",
    subtitle: "Keep teaching plans, learner activity, and feedback moving together.",
    action: "Review submissions",
    actionHref: "#workspace",
    asideHref: "#workspace",
    stats: [
      { label: "Teaching groups", value: "5", detail: "Across 3 year groups", icon: BookOpenCheck, tone: "bg-primary-soft text-primary" },
      { label: "Learners", value: "126", detail: "Across your classes", icon: Users, tone: "bg-[#e2f2eb] text-[#16734e]" },
      { label: "To review", value: "18", detail: "Submissions awaiting feedback", icon: ClipboardCheck, tone: "bg-[#fff3d8] text-[#9a6500]" },
    ],
    section: "Teaching queue",
    rows: [
      { title: "Year 9 · Linear graphs", detail: "12 submissions · Updated 18 min ago", status: "Ready to review", tone: "info" as const },
      { title: "Year 10 · Ecosystems", detail: "Homework draft · 8 questions", status: "Draft", tone: "neutral" as const },
      { title: "Year 8 · Forces", detail: "Live session · Today at 14:30", status: "Scheduled", tone: "success" as const },
    ],
    asideTitle: "Class pulse",
    asideText: "Most learners in Year 9 are on track. A small group may benefit from another example before the next assessment.",
    asideLabel: "Year 9 Mathematics · Sample insight",
  },
  ADMIN: {
    title: "School overview",
    heading: "Your school, in view",
    subtitle: "A practical overview of school activity, people, and capacity.",
    action: "View school activity",
    actionHref: "#workspace",
    asideHref: "#workspace",
    stats: [
      { label: "Learners", value: "612", detail: "Across 24 classes", icon: GraduationCap, tone: "bg-primary-soft text-primary" },
      { label: "Staff members", value: "34", detail: "29 active this week", icon: Users, tone: "bg-[#e2f2eb] text-[#16734e]" },
      { label: "Capacity used", value: "86%", detail: "42 places available", icon: ChartNoAxesCombined, tone: "bg-[#fff3d8] text-[#9a6500]" },
    ],
    section: "School activity",
    rows: [
      { title: "Year 9 Mathematics", detail: "4 classes · 102 learners", status: "Active", tone: "success" as const },
      { title: "Staff invitation", detail: "One invitation awaiting response", status: "Pending", tone: "warning" as const },
      { title: "Term progress report", detail: "Updated this morning", status: "Ready", tone: "info" as const },
    ],
    asideTitle: "School plan",
    asideText: "Your current plan has room for 42 more learners. Review staff and enrollment activity from the school workspace.",
    asideLabel: "Mock School · Sample overview",
  },
  OWNER: {
    title: "Network overview",
    heading: "EduCore network overview",
    subtitle: "A high-level view of schools, adoption, and platform activity.",
    action: "Review network activity",
    actionHref: "#workspace",
    asideHref: "#workspace",
    stats: [
      { label: "Schools", value: "18", detail: "16 active this month", icon: GraduationCap, tone: "bg-primary-soft text-primary" },
      { label: "Learners", value: "8,420", detail: "Across the network", icon: Users, tone: "bg-[#e2f2eb] text-[#16734e]" },
      { label: "Monthly revenue", value: "EGP 248k", detail: "Across active plans", icon: WalletCards, tone: "bg-[#fff3d8] text-[#9a6500]" },
    ],
    section: "Network activity",
    rows: [
      { title: "New school onboarding", detail: "Alexandria Learning Academy", status: "In progress", tone: "info" as const },
      { title: "Renewal review", detail: "3 subscriptions renew this month", status: "Upcoming", tone: "warning" as const },
      { title: "Support queue", detail: "4 open requests · 1 high priority", status: "Active", tone: "success" as const },
    ],
    asideTitle: "Platform pulse",
    asideText: "School activity is steady this week. Review onboarding and renewal timelines to keep the network moving smoothly.",
    asideLabel: "EduCore platform · Sample overview",
  },
} as const;

export function DashboardPreview({ role, user }: { role: Role; user: ShellUser }) {
  const dashboard = dashboards[role];

  return (
    <AppShell user={user} title={dashboard.title} notices={[]}>
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-xs font-medium text-muted">Welcome, {user.name}</p><h2 className="mt-1 text-xl font-semibold">{dashboard.heading}</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-muted">{dashboard.subtitle}</p></div>
          <Link href={dashboard.actionHref} className="inline-flex min-h-touch items-center justify-center gap-2 rounded-control bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary-hover">{dashboard.action}<ArrowRight size={16} /></Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {dashboard.stats.map(({ label, value, detail, icon: Icon, tone }) => (
            <Card key={label} className="flex min-h-32 items-start justify-between gap-4">
              <div><p className="text-sm text-muted">{label}</p><p className="mt-2 text-2xl font-semibold tracking-normal">{value}</p><p className="mt-1 text-xs text-muted">{detail}</p></div>
              <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon size={19} /></span>
            </Card>
          ))}
        </div>

        <div id="workspace" className="grid items-start gap-4 xl:grid-cols-[1.5fr_0.8fr]">
          <Card className="p-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-4 md:px-5"><div><h2 className="font-semibold">{dashboard.section}</h2><p className="mt-1 text-xs text-muted">A sample workspace for the {role.toLowerCase()} role</p></div><SampleDataBadge /></div>
            <ul className="divide-y divide-slate-100 px-4 md:px-5">
              {dashboard.rows.map((row) => (
                <li key={row.title} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div><p className="text-sm font-medium">{row.title}</p><p className="mt-1 text-xs text-muted">{row.detail}</p></div>
                  <StatusChip tone={row.tone}>{row.status}</StatusChip>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="border-[#dfe8e4] bg-[#f4f8f5] shadow-none">
            <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">{dashboard.asideTitle}</p><span className="h-2 w-2 rounded-full bg-success" /></div>
            <p className="mt-1 text-xs text-muted">{dashboard.asideLabel}</p>
            <p className="mt-5 text-sm leading-6 text-ink">{dashboard.asideText}</p>
            <Link href={dashboard.asideHref} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">{role === "STUDENT" ? "Open AI Study" : "Open workspace"} <ArrowRight size={15} /></Link>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}