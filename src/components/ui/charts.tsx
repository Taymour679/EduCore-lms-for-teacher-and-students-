"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SampleDataBadge } from "@/components/ui/chips";

export function TrendChart({ data }: { data: { label: string; student: number; average: number }[] }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium">Score trend</p>
        <SampleDataBadge />
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="student" name="Student" stroke="#5B4BDB" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="average" name="Class average" stroke="#94a3b8" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function UsageChart({ data }: { data: { label: string; tokens: number; requests: number; cost: number }[] }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium">Token volume</p>
        <SampleDataBadge />
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="tokens" name="Tokens" fill="#5B4BDB" radius={6} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function Heatmap({
  rows,
}: {
  rows: { name: string; cells: { topic: string; pct: number | null }[] }[];
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium">Topic mastery</p>
        <SampleDataBadge />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr>
              <th className="px-2 py-2 text-left text-xs text-muted">Student</th>
              {rows[0]?.cells.map((cell) => (
                <th key={cell.topic} className="px-2 py-2 text-left text-xs text-muted">
                  {cell.topic}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td className="px-2 py-2 font-medium">{row.name}</td>
                {row.cells.map((cell) => (
                  <td key={cell.topic} className="px-2 py-2">
                    <span
                      className="inline-flex min-w-12 justify-center rounded-control px-2 py-1 text-xs font-medium"
                      style={{ background: heat(cell.pct) }}
                    >
                      {cell.pct == null ? "—" : `${cell.pct}%`}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function heat(pct: number | null) {
  if (pct == null) return "#f1f5f9";
  if (pct >= 85) return "#d1fae5";
  if (pct >= 70) return "#fef3c7";
  return "#fee2e2";
}
