import { cn } from "@/lib/utils";

const tones = {
  neutral: "bg-slate-100 text-slate-700",
  info: "bg-blue-50 text-info",
  success: "bg-emerald-50 text-success",
  warning: "bg-amber-50 text-warning",
  danger: "bg-red-50 text-danger",
  purple: "bg-primary-soft text-primary",
};

export function StatusChip({
  tone = "neutral",
  children,
}: {
  tone?: keyof typeof tones;
  children: React.ReactNode;
}) {
  return (
    <span className={cn("inline-flex max-w-full items-center whitespace-nowrap rounded-control px-2.5 py-1 text-xs font-medium", tones[tone])}>
      {children}
    </span>
  );
}

export function Badge({ children, tone = "purple" }: { children: React.ReactNode; tone?: keyof typeof tones }) {
  return <span className={cn("inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold", tones[tone])}>{children}</span>;
}

export function SampleDataBadge() {
  return <Badge tone="neutral">Sample data</Badge>;
}

const statusTone: Record<string, keyof typeof tones> = {
  NOT_STARTED: "neutral",
  "Not started": "neutral",
  IN_PROGRESS: "info",
  SUBMITTED: "purple",
  Submitted: "purple",
  GRADED: "success",
  Graded: "success",
  OVERDUE: "danger",
  Overdue: "danger",
  "Due soon": "warning",
  PENDING: "warning",
  Pending: "warning",
  ACCEPTED: "success",
  Accepted: "success",
  EXPIRED: "danger",
  Expired: "danger",
  ACTIVE: "success",
  Active: "success",
  SUSPENDED: "danger",
  Suspended: "danger",
  OPEN: "info",
  RESOLVED: "success",
  PAID: "success",
  DUE: "warning",
  DRAFT: "neutral",
  PUBLISHED: "success",
  GENERATED: "purple",
  EDITED: "info",
  APPROVED: "success",
  DISMISSED: "neutral",
};

export function StatusFromValue({ value }: { value: string }) {
  const label = value.replaceAll("_", " ").toLowerCase().replace(/^\w/, (char) => char.toUpperCase());
  return <StatusChip tone={statusTone[value] ?? "neutral"}>{label}</StatusChip>;
}
