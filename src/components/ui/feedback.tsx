"use client";

import { cn } from "@/lib/utils";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-control bg-slate-200", className)} />;
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-card border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", body, onRetry }: { title?: string; body?: string; onRetry?: () => void }) {
  return (
    <div className="rounded-card border border-red-100 bg-white px-6 py-10 text-center" role="alert">
      <h3 className="text-base font-semibold text-danger">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{body ?? "This view could not be loaded."}</p>
      {onRetry ? (
        <Button className="mt-4" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div>
      {label ? <div className="mb-1 flex justify-between text-xs text-muted"><span>{label}</span><span>{clamped}%</span></div> : null}
      <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? "Progress"}>
        <div className="h-full rounded-full bg-primary" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

export function Pagination({ page, pages, hrefFor }: { page: number; pages: number; hrefFor: (page: number) => string }) {
  if (pages <= 1) return null;
  return (
    <nav className="flex items-center gap-2" aria-label="Pagination">
      {Array.from({ length: pages }, (_, index) => index + 1).map((item) => (
        <a
          key={item}
          href={hrefFor(item)}
          aria-current={item === page ? "page" : undefined}
          className={cn("inline-flex min-h-touch min-w-11 items-center justify-center rounded-control text-sm", item === page ? "bg-primary text-white" : "bg-white text-ink")}
        >
          {item}
        </a>
      ))}
    </nav>
  );
}

type ToastItem = { id: number; tone: "success" | "warning" | "error"; message: string };
const ToastContext = createContext<(toast: Omit<ToastItem, "id">) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback((toast: Omit<ToastItem, "id">) => {
    const id = Date.now() + Math.random();
    setItems((current) => [...current, { ...toast, id }]);
    window.setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), 4000);
  }, []);
  const value = useMemo(() => push, [push]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-20 right-4 z-50 flex w-[min(100%-2rem,360px)] flex-col gap-2 md:bottom-4" aria-live="polite">
        {items.map((item) => (
          <div
            key={item.id}
            role="status"
            className={cn(
              "rounded-control border px-4 py-3 text-sm shadow-card",
              item.tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-900",
              item.tone === "warning" && "border-amber-200 bg-amber-50 text-amber-950",
              item.tone === "error" && "border-red-200 bg-red-50 text-red-900",
            )}
          >
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useFocusTrap(active: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!active) return;
    const root = ref.current;
    if (!root) return;
    const previous = document.activeElement as HTMLElement | null;
    const selector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const items = () => Array.from(root.querySelectorAll<HTMLElement>(selector));
    items()[0]?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const list = items();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [active, onClose]);
  return ref;
}

export function Dialog({
  open,
  title,
  children,
  onClose,
  labelledBy = "dialog-title",
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  labelledBy?: string;
}) {
  const ref = useFocusTrap(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={labelledBy} className="w-full max-w-lg rounded-card bg-white p-5 shadow-card">
        <h2 id={labelledBy} className="text-lg font-semibold">
          {title}
        </h2>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  danger,
  onConfirm,
  onClose,
  requireReason,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
  requireReason?: boolean;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  return (
    <Dialog open={open} title={title} onClose={onClose}>
      <p className="text-sm text-muted">{body}</p>
      {requireReason ? (
        <label className="mt-3 block text-sm font-medium">
          Reason
          <textarea className="mt-1 min-h-24 w-full rounded-control border border-slate-200 p-2 text-sm" value={reason} onChange={(event) => setReason(event.target.value)} />
        </label>
      ) : null}
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant={danger ? "danger" : "primary"}
          onClick={() => {
            if (requireReason && reason.trim().length < 3) {
              setError("A reason is required.");
              return;
            }
            onConfirm(reason.trim());
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}

export function Drawer({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useFocusTrap(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-ink/40">
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} className="flex h-full w-[min(100%,320px)] flex-col bg-sidebar p-4 text-white">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">{title}</h2>
          <button type="button" className="min-h-touch min-w-11 rounded-control px-2" onClick={onClose} aria-label="Close menu">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
