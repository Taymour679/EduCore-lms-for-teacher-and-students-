"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpenCheck, CalendarDays, Check, Clock3, Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SampleDataBadge, StatusChip } from "@/components/ui/chips";
import { Dialog, EmptyState, useToast } from "@/components/ui/feedback";

type AssignmentStatus = "ASSIGNED" | "IN_PROGRESS" | "COMPLETED";
type Filter = "ALL" | "PENDING" | "COMPLETED" | "OVERDUE";

type Assignment = {
  id: string;
  subject: string;
  title: string;
  teacher: string;
  dueDate: string;
  estimate: number;
  instructions: string;
  status: AssignmentStatus;
  response: string;
};

const STORAGE_KEY = "educore.student.homework.v1";

const starterAssignments: Assignment[] = [
  {
    id: "linear-graphs",
    subject: "Mathematics",
    title: "Linear graphs practice",
    teacher: "Ms. Morgan",
    dueDate: "2026-11-22",
    estimate: 20,
    instructions: "Plot the three lines from the lesson notes. For each graph, describe its gradient and where it crosses the y-axis.",
    status: "IN_PROGRESS",
    response: "",
  },
  {
    id: "ecosystems",
    subject: "Science",
    title: "Ecosystems review",
    teacher: "Mr. Ahmed",
    dueDate: "2026-11-20",
    estimate: 25,
    instructions: "Choose one local ecosystem. Describe a food chain and explain how a change to one population can affect the others.",
    status: "ASSIGNED",
    response: "",
  },
  {
    id: "reading-response",
    subject: "English",
    title: "Reading response: point of view",
    teacher: "Ms. Patel",
    dueDate: "2026-11-16",
    estimate: 15,
    instructions: "Write a short response explaining how the narrator shapes the reader's view of the main character.",
    status: "ASSIGNED",
    response: "",
  },
  {
    id: "fractions-review",
    subject: "Mathematics",
    title: "Fractions and ratios review",
    teacher: "Ms. Morgan",
    dueDate: "2026-11-15",
    estimate: 15,
    instructions: "Complete the practice set and include one sentence describing the strategy you used.",
    status: "COMPLETED",
    response: "I compared equivalent fractions before simplifying each ratio.",
  },
];

const filters: { id: Filter; label: string }[] = [
  { id: "ALL", label: "All work" },
  { id: "PENDING", label: "Pending" },
  { id: "COMPLETED", label: "Completed" },
  { id: "OVERDUE", label: "Overdue" },
];

export function StudentHomework({ initialQuery }: { initialQuery: string }) {
  const toast = useToast();
  const [assignments, setAssignments] = useState(starterAssignments);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [query, setQuery] = useState(initialQuery);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Assignment[];
        if (Array.isArray(parsed) && parsed.every(isAssignment)) setAssignments(parsed);
      }
    } catch {
      setStorageError(true);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [assignments, ready]);

  const today = new Date().toISOString().slice(0, 10);
  const filteredAssignments = useMemo(() => assignments.filter((assignment) => {
    const overdue = assignment.status !== "COMPLETED" && assignment.dueDate < today;
    const matchesFilter = filter === "ALL"
      || (filter === "PENDING" && assignment.status !== "COMPLETED" && !overdue)
      || (filter === "COMPLETED" && assignment.status === "COMPLETED")
      || (filter === "OVERDUE" && overdue);
    const searchText = `${assignment.subject} ${assignment.title} ${assignment.teacher}`.toLowerCase();
    return matchesFilter && searchText.includes(query.trim().toLowerCase());
  }), [assignments, filter, query, today]);

  const selected = assignments.find((assignment) => assignment.id === selectedId) ?? null;
  const pendingCount = assignments.filter((assignment) => assignment.status !== "COMPLETED" && assignment.dueDate >= today).length;
  const overdueCount = assignments.filter((assignment) => assignment.status !== "COMPLETED" && assignment.dueDate < today).length;
  const completedCount = assignments.filter((assignment) => assignment.status === "COMPLETED").length;

  function updateAssignment(id: string, update: Partial<Assignment>) {
    setAssignments((current) => current.map((assignment) => assignment.id === id ? { ...assignment, ...update } : assignment));
  }

  function markComplete(assignment: Assignment) {
    updateAssignment(assignment.id, { status: "COMPLETED" });
    toast({ tone: "success", message: `${assignment.title} marked complete.` });
  }

  function submitWork() {
    if (!selected || draft.trim().length < 3) return;
    updateAssignment(selected.id, { status: "COMPLETED", response: draft.trim() });
    setSelectedId(null);
    toast({ tone: "success", message: "Your work was submitted." });
  }

  if (!ready) {
    return <div className="mx-auto max-w-[1600px] py-10 text-sm text-muted" role="status">Loading your assignments…</div>;
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <div className="flex items-center gap-2"><p className="text-xs font-semibold uppercase tracking-wide text-primary">My learning</p><SampleDataBadge /></div>
          <h2 className="mt-2 text-2xl font-semibold">Homework</h2>
          <p className="mt-1 text-sm text-muted">Keep track of what is due and submit your work when you are ready.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:min-w-[420px]">
          <Summary label="Pending" value={pendingCount} tone="text-primary" />
          <Summary label="Overdue" value={overdueCount} tone="text-danger" />
          <Summary label="Completed" value={completedCount} tone="text-success" />
        </div>
      </div>

      {storageError ? <p role="alert" className="rounded-control border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Progress is available for this session, but could not be saved in this browser.</p> : null}

      <Card className="p-0">
        <div className="flex flex-col gap-3 border-b border-line p-4 xl:flex-row xl:items-center xl:justify-between md:p-5">
          <div className="flex gap-1 overflow-x-auto" role="tablist" aria-label="Filter homework">
            {filters.map((item) => (
              <button key={item.id} type="button" role="tab" aria-selected={filter === item.id} onClick={() => setFilter(item.id)} className={`min-h-touch whitespace-nowrap rounded-control px-3 text-sm transition-colors ${filter === item.id ? "bg-primary text-white" : "text-muted hover:bg-slate-100 hover:text-ink"}`}>
                {item.label}{item.id === "OVERDUE" && overdueCount > 0 ? ` (${overdueCount})` : ""}
              </button>
            ))}
          </div>
          <label className="relative block w-full xl:max-w-sm">
            <span className="sr-only">Search assignments</span>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search subject or assignment" className="min-h-touch w-full rounded-control border border-slate-200 pl-9 pr-3 text-sm" />
          </label>
        </div>

        {filteredAssignments.length === 0 ? (
          <div className="p-4 md:p-5"><EmptyState title="No assignments here" body="Try another filter or search term to find your homework." /></div>
        ) : (
          <div className="grid gap-3 p-4 md:grid-cols-2 md:p-5 2xl:grid-cols-3">
            {filteredAssignments.map((assignment) => {
              const overdue = assignment.status !== "COMPLETED" && assignment.dueDate < today;
              return (
                <article key={assignment.id} className="flex min-h-[250px] flex-col rounded-card border border-line bg-white p-4 transition-shadow hover:shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary"><BookOpenCheck size={19} /></span>
                      <div className="min-w-0"><p className="text-xs font-medium text-muted">{assignment.subject}</p><h3 className="mt-1 font-semibold">{assignment.title}</h3></div>
                    </div>
                    <StatusChip tone={assignment.status === "COMPLETED" ? "success" : overdue ? "danger" : assignment.status === "IN_PROGRESS" ? "info" : "warning"}>
                      {assignment.status === "COMPLETED" ? "Completed" : overdue ? "Overdue" : assignment.status === "IN_PROGRESS" ? "In progress" : "Pending"}
                    </StatusChip>
                  </div>
                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted">{assignment.instructions}</p>
                  <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4 text-xs text-muted">
                    <span className={`inline-flex items-center gap-1.5 ${overdue ? "font-medium text-danger" : ""}`}><CalendarDays size={14} />Due {formatDate(assignment.dueDate)}</span>
                    <span className="inline-flex items-center gap-1.5"><Clock3 size={14} />{assignment.estimate} min</span>
                    <span>{assignment.teacher}</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => { setSelectedId(assignment.id); setDraft(assignment.response); }}>View details</Button>
                    {assignment.status !== "COMPLETED" ? <Button className="flex-1" onClick={() => markComplete(assignment)}><Check size={16} />Mark complete</Button> : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Card>

      <Dialog open={selected !== null} title={selected?.title ?? "Assignment details"} onClose={() => setSelectedId(null)}>
        {selected ? (
          <div>
            <div className="flex flex-wrap items-center gap-2"><StatusChip tone={selected.status === "COMPLETED" ? "success" : selected.dueDate < today ? "danger" : "info"}>{selected.status === "COMPLETED" ? "Completed" : selected.dueDate < today ? "Overdue" : "Assigned"}</StatusChip><span className="text-xs text-muted">{selected.subject} · Due {formatDate(selected.dueDate)}</span></div>
            <p className="mt-4 text-sm leading-6">{selected.instructions}</p>
            {selected.status === "COMPLETED" ? (
              <div className="mt-4 rounded-control bg-slate-50 p-3"><p className="text-xs font-semibold text-muted">Submitted response</p><p className="mt-2 text-sm leading-6">{selected.response || "Marked complete without a written response."}</p></div>
            ) : (
              <label className="mt-4 block text-sm font-medium">Your response<textarea value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={2000} rows={5} placeholder="Write your response here…" className="mt-2 w-full resize-y rounded-control border border-slate-200 p-3 text-sm leading-6" /></label>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedId(null)}>Close</Button>
              {selected.status !== "COMPLETED" ? <Button onClick={submitWork} disabled={draft.trim().length < 3}><Send size={15} />Submit work</Button> : null}
            </div>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}

function Summary({ label, value, tone }: { label: string; value: number; tone: string }) {
  return <div className="rounded-control border border-line bg-white px-3 py-2"><p className="text-xs text-muted">{label}</p><p className={`mt-1 text-xl font-semibold ${tone}`}>{value}</p></div>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(`${value}T12:00:00`));
}

function isAssignment(value: unknown): value is Assignment {
  if (!value || typeof value !== "object") return false;
  const assignment = value as Partial<Assignment>;
  return typeof assignment.id === "string"
    && typeof assignment.title === "string"
    && typeof assignment.dueDate === "string"
    && (assignment.status === "ASSIGNED" || assignment.status === "IN_PROGRESS" || assignment.status === "COMPLETED")
    && typeof assignment.response === "string";
}