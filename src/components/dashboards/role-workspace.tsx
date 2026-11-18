"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Activity, ArrowLeft, ArrowRight, BarChart3, Download, FilePlus2, Pencil, Search, Sparkles } from "lucide-react";
import { askTeachingAssistant, saveWorkspaceRecord } from "@/server/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge, SampleDataBadge, StatusFromValue, StatusChip } from "@/components/ui/chips";
import { Dialog, EmptyState, ErrorState, useToast } from "@/components/ui/feedback";
import { Input, Select, Textarea } from "@/components/ui/form-controls";
import type { WorkspaceDataset } from "@/server/workspace-data";
import type { WorkspaceDefinition, WorkspaceField, WorkspaceRecord, WorkspaceRole } from "@/lib/workspace-definitions";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function RoleWorkspace({
  role,
  section,
  definition,
  dataset,
  initialQuery,
}: {
  role: WorkspaceRole;
  section: string;
  definition: WorkspaceDefinition;
  dataset: WorkspaceDataset;
  initialQuery: string;
}) {
  const toast = useToast();
  const [records, setRecords] = useState(dataset.records);
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState(definition.filters?.[0] ?? `All ${pluralize(definition.entity)}`);
  const [dateFilter, setDateFilter] = useState("");
  const [selected, setSelected] = useState<WorkspaceRecord | null>(null);
  const [editing, setEditing] = useState<WorkspaceRecord | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [settings, setSettings] = useState<Record<string, boolean>>(() => Object.fromEntries(dataset.records.map((record) => [record.id, record.status === "Enabled"])));
  const [assistantPrompt, setAssistantPrompt] = useState("");
  const [assistantMode, setAssistantMode] = useState<"lesson" | "questions">("lesson");
  const [assistantResult, setAssistantResult] = useState("");
  const [assistantError, setAssistantError] = useState("");
  const [assistantStatus, setAssistantStatus] = useState(dataset.source === "demo" ? "Demo assistant · Sample responses" : "Assistant ready");
  const [storageReady, setStorageReady] = useState(dataset.source !== "demo");
  const [storageError, setStorageError] = useState(false);
  const storageKey = `educore.workspace.${role}.${section}.v1`;

  useEffect(() => {
    if (dataset.source !== "demo") return;
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as { records?: unknown; settings?: Record<string, boolean> };
        if (Array.isArray(parsed.records) && parsed.records.every(isWorkspaceRecord)) setRecords(parsed.records);
        if (parsed.settings && typeof parsed.settings === "object") setSettings(parsed.settings);
      }
    } catch {
      setStorageError(true);
    }
    setStorageReady(true);
  }, [dataset.source, storageKey]);

  useEffect(() => {
    if (!storageReady || dataset.source !== "demo") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ records, settings }));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [dataset.source, records, settings, storageKey, storageReady]);

  const filtered = useMemo(() => records.filter((record) => {
    const text = `${record.title} ${record.subtitle} ${record.status} ${Object.values(record.data).join(" ")}`.toLowerCase();
    const matchesQuery = text.includes(query.trim().toLowerCase());
    const isAll = filter.toLowerCase().startsWith("all ");
    const matchesFilter = isAll || record.status.toLowerCase() === filter.toLowerCase() || Object.values(record.data).some((value) => value.toLowerCase() === filter.toLowerCase());
    const matchesDate = !dateFilter || (record.data.date ?? record.data.created ?? record.data.issued ?? "").includes(dateFilter) || (record.data.date ?? record.data.created ?? record.data.issued ?? "").includes(dateFilter.slice(5));
    return matchesQuery && matchesFilter && matchesDate;
  }), [records, query, filter, dateFilter]);

  const metrics = dataset.source === "demo" ? definition.metrics : undefined;
  const chart = dataset.source === "demo" ? definition.chart : dataset.chart ?? databaseChart(definition, records);
  const secondaryChart = dataset.source === "demo" ? definition.secondaryChart : role === "TEACHER" && section === "analytics" ? databaseCompletionChart(records) : undefined;
  const canEdit = !definition.readOnly && (role !== "ADMIN" || ["classes", "support", "staff", "students"].includes(section));
  const canCreate = Boolean(definition.createLabel);

  function openCreate() {
    setEditing(null);
    setValues(Object.fromEntries(definition.fields.map((field) => [field.name, field.options?.[0] ?? ""])));
  }

  function openEdit(record: WorkspaceRecord) {
    setEditing(record);
    setValues(Object.fromEntries(definition.fields.map((field) => [field.name, record.data[field.name] ?? (field.name === "title" ? record.title : field.name === "status" ? record.status : "")])));
  }

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = values.title?.trim();
    if (!title) return;
    startTransition(async () => {
      const result = await saveWorkspaceRecord(role, section, editing?.id ?? null, values);
      if (!result.ok) {
        toast({ tone: "error", message: result.error });
        return;
      }
      const nextRecord: WorkspaceRecord = {
        id: editing?.id ?? `demo-${Date.now()}`,
        title,
        subtitle: summarize(values),
        status: values.status || values.kind || values.role || values.category || values.booking || (section === "homework" ? "DRAFT" : section === "live" ? "Scheduled" : editing?.status ?? "Active"),
        data: { ...values, ...(role === "ADMIN" && section === "classes" && values.studentEmails ? { students: `${values.studentEmails.split(/[\\s,;]+/).filter(Boolean).length} added` } : {}) },
      };
      if (dataset.source === "demo") {
        setRecords((current) => editing ? current.map((item) => item.id === editing.id ? nextRecord : item) : [nextRecord, ...current]);
      }
      setEditing(null);
      setValues({});
      toast({ tone: "success", message: result.notice ?? `${definition.entity} ${editing ? "updated" : "saved"}.` });
      if (result.mode === "database") window.location.reload();
    });
  }

  function exportCsv() {
    const headers = ["Name", ...definition.columns.map((column) => column.label), "Status"];
    const rows = filtered.map((record) => [record.title, ...definition.columns.map((column) => record.data[column.key] ?? ""), record.status]);
    const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${role.toLowerCase()}-${section}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function toggleSetting(record: WorkspaceRecord) {
    const enabled = !settings[record.id];
    setSettings((current) => ({ ...current, [record.id]: enabled }));
    setRecords((current) => current.map((item) => item.id === record.id ? { ...item, status: enabled ? "Enabled" : "Disabled" } : item));
    toast({ tone: "success", message: `Demo preference ${enabled ? "enabled" : "disabled"}.` });
  }

  function generateAssistant(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAssistantError("");
    setAssistantResult("");
    startTransition(async () => {
      const result = await askTeachingAssistant(assistantPrompt, assistantMode);
      if (!result.ok) {
        setAssistantError(result.error);
        return;
      }
      setAssistantResult(result.text);
      setAssistantStatus(result.mode === "demo" ? "Demo assistant · Sample responses" : "AI assistant connected");
    });
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted">
        <Link href={`/${role.toLowerCase()}`} className="inline-flex items-center gap-1 transition-colors hover:text-primary"><ArrowLeft size={13} />Overview</Link>
        <span aria-hidden="true">/</span><span className="font-medium text-ink">{definition.title}</span>
      </nav>

      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2"><p className="text-xs font-semibold uppercase tracking-wide text-primary">{roleLabel(role)} workspace</p>{dataset.source === "demo" ? <SampleDataBadge /> : dataset.source === "database" ? <Badge tone="success">Database</Badge> : <Badge tone="danger">Unavailable</Badge>}</div>
          <h2 className="mt-2 text-2xl font-semibold">{definition.title}</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">{definition.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {definition.export ? <Button variant="outline" onClick={exportCsv}><Download size={16} />Export CSV</Button> : null}
          {canCreate ? <Button onClick={openCreate}><FilePlus2 size={16} />{definition.createLabel}</Button> : null}
        </div>
      </div>

      {dataset.error ? <ErrorState title="Workspace unavailable" body={dataset.error} onRetry={() => window.location.reload()} /> : null}
      {definition.attendanceDemo && dataset.source === "demo" ? <p className="rounded-control border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">Attendance is a labeled sample metric; this project has no attendance model.</p> : null}
      {dataset.source === "demo" && !definition.settings && !definition.assistant ? <p className="text-xs text-muted">Demo workspace · Changes are saved in this browser only.</p> : null}
      {storageError ? <p role="alert" className="rounded-control border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">Demo changes are available for this view but could not be saved in this browser.</p> : null}

      {metrics ? <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">{metrics.map((metric) => <Card key={metric.label} className="min-h-28"><p className="text-xs font-medium text-muted">{metric.label}</p><p className="mt-2 text-2xl font-semibold">{metric.value}</p><p className="mt-1 text-xs text-muted">{metric.note}</p></Card>)}</div> : null}

      {chart ? <div className={`grid min-w-0 gap-4 ${secondaryChart ? "2xl:grid-cols-2" : ""}`}><Card className="min-w-0"><WorkspaceChart definition={definition} records={records} chart={chart} source={dataset.source} /></Card>{secondaryChart ? <Card className="min-w-0"><WorkspaceChart definition={definition} records={records} chart={secondaryChart} source={dataset.source} /></Card> : null}</div> : null}

      {definition.assistant ? (
        <Card>
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center"><div><div className="flex items-center gap-2"><Sparkles size={18} className="text-primary" /><h3 className="font-semibold">Lesson and practice assistant</h3></div><p className="mt-1 text-sm text-muted">Create a draft for review. Nothing is published automatically.</p></div><Badge tone={assistantStatus.startsWith("Demo") ? "warning" : "success"}>{assistantStatus}</Badge></div>
          <form onSubmit={generateAssistant} className="mt-5 grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)_auto] lg:items-end">
            <label className="text-xs font-medium text-muted">Generate<select value={assistantMode} onChange={(event) => setAssistantMode(event.target.value as "lesson" | "questions")} className="mt-1 min-h-touch w-full rounded-control border border-slate-200 bg-white px-3 text-sm text-ink"><option value="lesson">Lesson idea</option><option value="questions">Practice questions</option></select></label>
            <label className="text-xs font-medium text-muted">Topic or learning goal<textarea value={assistantPrompt} onChange={(event) => setAssistantPrompt(event.target.value)} maxLength={800} rows={2} placeholder="For example: introduce fractions to Year 8 learners…" className="mt-1 w-full resize-y rounded-control border border-slate-200 p-3 text-sm text-ink" /></label>
            <Button type="submit" disabled={isPending || assistantPrompt.trim().length < 5}><Sparkles size={16} />{isPending ? "Generating…" : "Generate draft"}</Button>
          </form>
          {assistantError ? <p role="alert" className="mt-3 text-sm text-danger">{assistantError}</p> : null}
          {assistantResult ? <div className="mt-4 rounded-control border border-line bg-slate-50 p-4"><h4 className="text-sm font-semibold">Draft for teacher review</h4><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{assistantResult}</p></div> : null}
        </Card>
      ) : null}

      {definition.settings ? <SettingsPanel records={records} settings={settings} onToggle={toggleSetting} source={dataset.source} /> : null}

      {!definition.settings && !definition.assistant ? (
        <Card className="p-0">
          <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center lg:justify-between md:p-5">
            <div className="flex gap-1 overflow-x-auto" role="tablist" aria-label={`Filter ${definition.title}`}>
              {(definition.filters ?? [`All ${pluralize(definition.entity)}`]).map((item) => <button key={item} type="button" role="tab" aria-selected={filter === item} onClick={() => setFilter(item)} className={`min-h-touch whitespace-nowrap rounded-control px-3 text-sm transition-colors ${filter === item ? "bg-primary text-white" : "text-muted hover:bg-slate-100 hover:text-ink"}`}>{item}</button>)}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              {section === "audit" ? <label className="sr-only">Filter audit activity by date<input aria-label="Filter by date" type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="min-h-touch rounded-control border border-slate-200 px-3 text-sm" /></label> : null}
              <label className="relative block w-full sm:w-72"><span className="sr-only">Search {pluralize(definition.entity)}</span><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${pluralize(definition.entity)}`} className="min-h-touch w-full rounded-control border border-slate-200 pl-9 pr-3 text-sm" /></label>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="p-4 md:p-5"><EmptyState title={dataset.error ? "Records unavailable" : `No ${pluralize(definition.entity)} found`} body={dataset.error ?? "Try a different search or filter, or create a new record if available."} action={canCreate ? <Button onClick={openCreate}><FilePlus2 size={16} />{definition.createLabel}</Button> : undefined} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead><tr className="bg-slate-50"><th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase text-muted">{section === "users" ? "User" : section === "audit" ? "Actor" : "Name"}</th>{definition.columns.map((column) => <th key={column.key} className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase text-muted">{column.label}</th>)}<th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase text-muted">Status</th><th className="px-4 py-3" /></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((record) => <tr key={record.id} className="transition-colors hover:bg-slate-50/80"><td className="px-4 py-3"><button type="button" onClick={() => setSelected(record)} className="text-left font-medium text-ink transition-colors hover:text-primary">{record.title}<span className="mt-0.5 block max-w-xs truncate text-xs font-normal text-muted">{record.subtitle}</span></button></td>{definition.columns.map((column) => <td key={column.key} className="whitespace-nowrap px-4 py-3 text-muted">{record.data[column.key] || "—"}</td>)}<td className="px-4 py-3"><StatusFromValue value={record.status} /></td><td className="px-4 py-3"><div className="flex justify-end gap-1"><Button variant="ghost" size="sm" aria-label={`View ${record.title}`} onClick={() => setSelected(record)}>View</Button>{canEdit && !record.id.startsWith("invite-") ? <Button variant="ghost" size="sm" aria-label={`Edit ${record.title}`} onClick={() => openEdit(record)}><Pencil size={14} /></Button> : null}</div></td></tr>)}
                </tbody>
              </table>
            </div>
          )}
          <div className="border-t border-line px-4 py-3 text-xs text-muted md:px-5">Showing {filtered.length} of {records.length} {records.length === 1 ? definition.entity : pluralize(definition.entity)}</div>
        </Card>
      ) : null}

      <div className="flex justify-between border-t border-line pt-4"><Link href={`/${role.toLowerCase()}`} className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-primary"><ArrowLeft size={15} />Back to overview</Link><span className="inline-flex items-center gap-1 text-xs text-muted"><Activity size={13} />{dataset.source === "database" ? "Live school data" : dataset.source === "demo" ? "Sample workspace" : "Data unavailable"}</span></div>

      <Dialog open={selected !== null} title={selected?.title ?? "Record details"} onClose={() => setSelected(null)}>
        {selected ? <div><div className="flex flex-wrap items-center gap-2"><StatusFromValue value={selected.status} /><span className="text-xs text-muted">{selected.subtitle}</span></div><dl className="mt-4 grid gap-3 sm:grid-cols-2">{Object.entries(selected.data).filter(([, value]) => value).map(([key, value]) => <div key={key} className="rounded-control bg-slate-50 p-3"><dt className="text-xs font-medium capitalize text-muted">{key.replaceAll(/([A-Z])/g, " $1")}</dt><dd className="mt-1 whitespace-pre-wrap text-sm">{value}</dd></div>)}</dl><div className="mt-4 flex justify-end"><Button variant="outline" onClick={() => setSelected(null)}>Close</Button></div></div> : null}
      </Dialog>

      <Dialog open={editing !== null || (canCreate && Object.keys(values).length > 0)} title={editing ? `Edit ${definition.entity}` : definition.createLabel ?? `Add ${definition.entity}`} onClose={() => { setEditing(null); setValues({}); }}>
        <form onSubmit={save} className="space-y-4">
          {definition.fields.map((item) => <WorkspaceFormField key={item.name} field={item} value={values[item.name] ?? ""} onChange={(value) => setValues((current) => ({ ...current, [item.name]: value }))} />)}
          <div className="flex justify-end gap-2 pt-2"><Button variant="outline" onClick={() => { setEditing(null); setValues({}); }}>Cancel</Button><Button type="submit" disabled={isPending || !values.title?.trim()}>{isPending ? "Saving…" : editing ? "Save changes" : "Create"}</Button></div>
        </form>
      </Dialog>
    </div>
  );
}

function WorkspaceFormField({ field, value, onChange }: { field: WorkspaceField; value: string; onChange: (value: string) => void }) {
  const id = `workspace-${field.name}`;
  return <div className="space-y-1.5"><label htmlFor={id} className="block text-sm font-medium">{field.label}</label>{field.type === "select" ? <Select id={id} value={value} required={field.required ?? true} onChange={(event) => onChange(event.target.value)}>{(field.options ?? []).map((option) => <option key={option} value={option}>{option}</option>)}</Select> : field.type === "textarea" ? <Textarea id={id} value={value} required={field.required ?? false} onChange={(event) => onChange(event.target.value)} rows={4} /> : <Input id={id} type={field.type ?? "text"} value={value} required={field.required ?? true} onChange={(event) => onChange(event.target.value)} min={field.type === "number" ? 1 : undefined} />}</div>;
}

function SettingsPanel({ records, settings, onToggle, source }: { records: WorkspaceRecord[]; settings: Record<string, boolean>; onToggle: (record: WorkspaceRecord) => void; source: WorkspaceDataset["source"] }) {
  return <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]"><Card><div className="flex items-center justify-between gap-3"><div><h3 className="font-semibold">Platform preferences</h3><p className="mt-1 text-xs text-muted">{source === "demo" ? "These switches are local demo preferences." : "Settings storage is not configured in the database."}</p></div><SampleDataBadge /></div><div className="mt-4 divide-y divide-slate-100">{records.map((record) => <div key={record.id} className="flex items-center justify-between gap-4 py-4"><div><p className="text-sm font-medium">{record.title}</p><p className="mt-1 text-xs text-muted">{record.data.detail}</p></div><button type="button" role="switch" aria-checked={settings[record.id]} aria-label={record.title} onClick={() => onToggle(record)} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${settings[record.id] ? "bg-primary" : "bg-slate-300"}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${settings[record.id] ? "translate-x-[22px]" : "translate-x-0.5"}`} /></button></div>)}</div></Card><Card className="bg-slate-50 shadow-none"><h3 className="font-semibold">Security posture</h3><p className="mt-2 text-sm leading-6 text-muted">Authentication policy and account permissions remain managed by the existing EduCore authentication configuration. This demo panel does not change production security controls.</p><div className="mt-4 rounded-control border border-line bg-white p-3"><p className="text-xs font-semibold">Authentication bypass</p><p className="mt-1 text-xs text-muted">Development only. Disabled outside local development.</p></div></Card></div>;
}

function WorkspaceChart({ definition, records, chart, source }: { definition: WorkspaceDefinition; records: WorkspaceRecord[]; chart: NonNullable<WorkspaceDefinition["chart"]>; source: WorkspaceDataset["source"] }) {
  const data = chart.labels.map((label, index) => ({ label, value: chart.values[index] ?? 0, comparison: chart.comparison?.[index] ?? 0 }));
  const showComparison = Boolean(chart.comparison);
  return <div><div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold">{chart.title}</h3><p className="mt-1 text-xs text-muted">{definition.title} · {records.length ? `${records.length} records` : "No records"}</p></div>{source === "demo" ? <SampleDataBadge /> : source === "database" ? <Badge tone="success">Database</Badge> : <Badge tone="danger">Unavailable</Badge>}</div><div className="h-72 min-w-0"><ResponsiveContainer width="100%" height="100%">{chart.kind === "bar" ? <BarChart data={data}><CartesianGrid stroke="#e2e8f0" vertical={false} /><XAxis dataKey="label" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Bar dataKey="value" name={chart.title} fill="#5B4BDB" radius={5} /></BarChart> : <LineChart data={data}><CartesianGrid stroke="#e2e8f0" vertical={false} /><XAxis dataKey="label" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Line type="monotone" dataKey="value" name="Current" stroke="#5B4BDB" strokeWidth={2} dot={false} />{showComparison ? <Line type="monotone" dataKey="comparison" name="Comparison" stroke="#059669" strokeWidth={2} dot={false} /> : null}</LineChart>}</ResponsiveContainer></div>{definition.attendanceDemo ? <p className="mt-3 text-xs text-amber-800">Attendance is sample-only; attendance records are not stored by this project.</p> : null}</div>;
}

function databaseChart(definition: WorkspaceDefinition, records: WorkspaceRecord[]): NonNullable<WorkspaceDefinition["chart"]> | undefined {
  const scored = records.map((record) => ({ label: record.title, value: Number.parseFloat((record.data.average ?? record.data.requests ?? record.data.amount ?? "").replace(/[^\d.-]/g, "")) })).filter((item) => Number.isFinite(item.value));
  if (!scored.length) return undefined;
  return { title: `${definition.title} by record`, kind: "bar", labels: scored.map((item) => item.label), values: scored.map((item) => item.value) };
}

function databaseCompletionChart(records: WorkspaceRecord[]): NonNullable<WorkspaceDefinition["chart"]> | undefined {
  const completion = records.map((record) => {
    const [submitted, assigned] = (record.data.completion ?? "").split("/").map((value) => Number.parseFloat(value.trim()));
    return { label: record.title, value: assigned > 0 ? Math.round(submitted / assigned * 100) : Number.NaN };
  }).filter((item) => Number.isFinite(item.value));
  if (!completion.length) return undefined;
  return { title: "Assignment completion by class", kind: "bar", labels: completion.map((item) => item.label), values: completion.map((item) => item.value) };
}

function summarize(values: Record<string, string>) {
  return Object.entries(values).filter(([key, value]) => key !== "title" && key !== "detail" && key !== "status" && value).slice(0, 3).map(([, value]) => value).join(" · ");
}

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function roleLabel(role: WorkspaceRole) {
  return role === "ADMIN" ? "School admin" : role === "OWNER" ? "Platform owner" : "Teacher";
}

function pluralize(value: string) {
  if (value === "class") return "classes";
  if (value === "homework") return "homework";
  return value.endsWith("s") ? value : `${value}s`;
}

function isWorkspaceRecord(value: unknown): value is WorkspaceRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<WorkspaceRecord>;
  return typeof record.id === "string"
    && typeof record.title === "string"
    && typeof record.subtitle === "string"
    && typeof record.status === "string"
    && Boolean(record.data)
    && typeof record.data === "object"
    && Object.values(record.data).every((item) => typeof item === "string");
}