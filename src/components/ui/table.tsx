import { cn } from "@/lib/utils";

export function TableWrap({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("overflow-x-auto", className)}>{children}</div>;
}

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <TableWrap>
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">{children}</table>
    </TableWrap>
  );
}

export function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={cn("whitespace-nowrap border-b border-slate-100 px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted", className)}>{children}</th>;
}

export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("border-b border-slate-50 px-3 py-3 align-middle text-ink", className)}>{children}</td>;
}
