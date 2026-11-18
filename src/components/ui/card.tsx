import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("rounded-card border border-line bg-white p-4 shadow-card md:p-5", className)}>{children}</section>;
}
