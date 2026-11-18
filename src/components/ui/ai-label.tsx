"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/chips";

export type EvidenceItem = {
  id: string;
  label: string;
  detail: string;
};

export function AiLabel({
  children,
  evidence,
  advisory = true,
}: {
  children?: React.ReactNode;
  evidence: EvidenceItem[];
  advisory?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>AI-generated · advisory</Badge>
        <button type="button" className="min-h-touch text-sm font-medium text-info underline-offset-2 hover:underline" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
          Evidence
        </button>
      </div>
      {open ? (
        <ul className="space-y-1 rounded-control bg-slate-50 p-3 text-sm">
          {evidence.length === 0 ? <li>No stored scores are attached.</li> : evidence.map((item) => (
            <li key={item.id}>
              <span className="font-medium">{item.label}</span>
              <span className="text-muted"> · {item.detail}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {children}
      {advisory ? <p className="text-xs text-muted">Advisory, not a diagnosis.</p> : null}
    </div>
  );
}
