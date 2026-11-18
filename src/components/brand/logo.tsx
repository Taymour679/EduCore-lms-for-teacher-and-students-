import { cn } from "@/lib/utils";

export function Logo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#5B4BDB" />
        <path d="M9 22.5V9.5h7.2a4.2 4.2 0 0 1 0 8.4H12.2" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="22.5" cy="22" r="2" fill="white" />
      </svg>
      {compact ? null : <span className={cn("text-base font-semibold tracking-tight", light ? "text-white" : "text-ink")}>EduCore</span>}
    </span>
  );
}
