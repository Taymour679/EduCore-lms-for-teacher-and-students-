"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

export function Tabs({
  tabs,
}: {
  tabs: { id: string; label: string; content: React.ReactNode }[];
}) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  return (
    <div>
      <div role="tablist" className="flex gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            className={cn("min-h-touch whitespace-nowrap rounded-control px-3 text-sm", active === tab.id ? "bg-primary text-white" : "bg-white text-ink")}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4" role="tabpanel">
        {tabs.find((tab) => tab.id === active)?.content}
      </div>
    </div>
  );
}
