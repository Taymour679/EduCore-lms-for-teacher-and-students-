"use client";

import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { BookOpenCheck, Lightbulb, Send, Sparkles } from "lucide-react";
import { askStudyAssistant } from "@/server/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Message = { id: number; role: "assistant" | "student"; text: string; subject?: string };

const subjects = ["Mathematics", "Science", "English", "History"];
const suggestions = [
  "Can you help me understand gradients?",
  "How do food chains stay balanced?",
  "What makes a strong topic sentence?",
];

export function StudentStudyWorkspace({ demoMode }: { demoMode: boolean }) {
  const [subject, setSubject] = useState(subjects[0]);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: "assistant", text: "Hi, I’m your study assistant. Tell me what you are learning, and we can break it into a manageable next step." },
  ]);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"demo" | "connected">(demoMode ? "demo" : "connected");
  const [isPending, startTransition] = useTransition();
  const transcript = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transcript.current) transcript.current.scrollTop = transcript.current.scrollHeight;
  }, [messages, isPending]);

  function sendQuestion(question: string) {
    const clean = question.trim();
    if (clean.length < 3 || isPending) return;
    setInput("");
    setError("");
    setMessages((current) => [...current, { id: Date.now(), role: "student", text: clean, subject }]);
    startTransition(async () => {
      const result = await askStudyAssistant(subject, clean);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMode(result.mode);
      setMessages((current) => [...current, { id: Date.now() + 1, role: "assistant", text: result.answer }]);
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendQuestion(input);
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div><p className="text-xs font-semibold uppercase tracking-wide text-primary">Study support</p><h2 className="mt-2 text-2xl font-semibold">AI Study</h2><p className="mt-1 text-sm text-muted">Ask for an explanation, a study plan, or a hint that helps you think it through.</p></div>
        <span className={`inline-flex w-fit items-center gap-2 rounded-control px-3 py-2 text-xs font-semibold ${mode === "demo" ? "bg-amber-50 text-amber-900" : "bg-emerald-50 text-emerald-900"}`}>
          <span className={`h-2 w-2 rounded-full ${mode === "demo" ? "bg-warning" : "bg-success"}`} />
          {mode === "demo" ? "Demo assistant · Sample responses" : "AI assistant connected"}
        </span>
      </div>

      <div className="grid items-start gap-4 2xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="min-w-0 overflow-hidden p-0">
          <div className="flex flex-col gap-3 border-b border-line px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
            <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary"><Sparkles size={19} /></span><div><h3 className="font-semibold">Study conversation</h3><p className="text-xs text-muted">Current session · {messages.filter((message) => message.role === "student").length} questions</p></div></div>
            <label className="flex items-center gap-2 text-xs font-medium text-muted">Subject<select value={subject} onChange={(event) => setSubject(event.target.value)} className="min-h-10 rounded-control border border-slate-200 bg-white px-3 text-sm text-ink">{subjects.map((item) => <option key={item}>{item}</option>)}</select></label>
          </div>

          <div ref={transcript} className="flex h-[min(56vh,620px)] min-h-[360px] flex-col gap-4 overflow-y-auto bg-[#fafbfe] p-4 md:p-6" aria-live="polite" aria-label="Study conversation">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "student" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[min(88%,680px)] rounded-card px-4 py-3 ${message.role === "student" ? "bg-primary text-white" : "border border-line bg-white text-ink"}`}>
                  <p className={`mb-1 text-[11px] font-semibold ${message.role === "student" ? "text-white/75" : "text-primary"}`}>{message.role === "student" ? `You${message.subject ? ` · ${message.subject}` : ""}` : "Study assistant"}</p>
                  <p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p>
                </div>
              </div>
            ))}
            {isPending ? <div className="flex items-center gap-2 self-start rounded-card border border-line bg-white px-4 py-3 text-sm text-muted" role="status"><span className="h-2 w-2 animate-pulse rounded-full bg-primary" />Preparing a study response…</div> : null}
          </div>

          {error ? <p role="alert" className="mx-4 mt-3 rounded-control border border-red-100 bg-red-50 px-3 py-2 text-sm text-danger md:mx-5">{error}</p> : null}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 border-t border-line bg-white p-4 md:flex-row md:items-end md:p-5">
            <label className="min-w-0 flex-1 text-xs font-medium text-muted">Your question<textarea value={input} onChange={(event) => setInput(event.target.value)} maxLength={400} rows={2} placeholder={`Ask about ${subject.toLowerCase()}…`} className="mt-1 block w-full resize-y rounded-control border border-slate-200 p-3 text-sm leading-6 text-ink" /></label>
            <Button type="submit" disabled={isPending || input.trim().length < 3} className="md:min-w-32"><Send size={16} />{isPending ? "Sending…" : "Send"}</Button>
          </form>
          <p className="px-4 pb-4 text-[11px] text-muted md:px-5">Study guidance is advisory. Check important work against your lesson materials.</p>
        </Card>

        <aside className="space-y-4">
          <Card>
            <div className="flex items-center gap-2"><Lightbulb size={18} className="text-warning" /><h3 className="font-semibold">Try asking</h3></div>
            <p className="mt-1 text-xs text-muted">Choose a prompt to start a conversation.</p>
            <div className="mt-4 space-y-2">{suggestions.map((question) => <button key={question} type="button" disabled={isPending} onClick={() => sendQuestion(question)} className="w-full rounded-control border border-line px-3 py-3 text-left text-sm leading-5 transition-colors hover:border-primary hover:bg-primary-soft disabled:opacity-50">{question}</button>)}</div>
          </Card>

          <Card className="border-[#dfe8e4] bg-[#f4f8f5] shadow-none">
            <div className="flex items-center gap-2"><BookOpenCheck size={18} className="text-success" /><h3 className="font-semibold">A useful study loop</h3></div>
            <ol className="mt-4 space-y-3 text-sm leading-5 text-muted"><li className="flex gap-3"><span className="font-semibold text-success">01</span>Explain the idea in your own words.</li><li className="flex gap-3"><span className="font-semibold text-success">02</span>Ask about the part that feels unclear.</li><li className="flex gap-3"><span className="font-semibold text-success">03</span>Try a practice question without looking.</li></ol>
          </Card>

          <Card>
            <h3 className="font-semibold">Session history</h3>
            <p className="mt-1 text-xs text-muted">Recent questions in this conversation</p>
            <div className="mt-3 space-y-2">{messages.filter((message) => message.role === "student").slice(-3).reverse().map((message) => <div key={message.id} className="rounded-control bg-slate-50 p-3"><p className="text-[11px] font-medium text-primary">{message.subject}</p><p className="mt-1 line-clamp-2 text-sm">{message.text}</p></div>)}{messages.every((message) => message.role !== "student") ? <p className="rounded-control bg-slate-50 p-3 text-sm text-muted">Your questions will appear here during this session.</p> : null}</div>
          </Card>
        </aside>
      </div>
    </div>
  );
}