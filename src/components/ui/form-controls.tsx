import { cn } from "@/lib/utils";
import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

const fieldClass =
  "w-full rounded-control border border-slate-200 bg-white px-3 text-sm text-ink min-h-touch placeholder:text-slate-400";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={cn(fieldClass, className)} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <select ref={ref} className={cn(fieldClass, className)} {...props}>
      {children}
    </select>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, ...props },
  ref,
) {
  return <textarea ref={ref} className={cn(fieldClass, "min-h-28 py-2", className)} {...props} />;
});

export function Checkbox({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="inline-flex min-h-touch items-center gap-2 text-sm">
      <input type="checkbox" className="h-4 w-4 accent-primary" {...props} />
      {label}
    </label>
  );
}

export function Radio({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="inline-flex min-h-touch items-center gap-2 text-sm">
      <input type="radio" className="h-4 w-4 accent-primary" {...props} />
      {label}
    </label>
  );
}

export function Toggle({
  pressed,
  label,
  onClick,
}: {
  pressed: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={pressed}
      aria-label={label}
      onClick={onClick}
      className={cn("inline-flex min-h-touch items-center gap-2 text-sm", pressed ? "text-primary" : "text-muted")}
    >
      <span className={cn("relative h-6 w-11 rounded-full transition", pressed ? "bg-primary" : "bg-slate-300")}>
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition", pressed ? "left-5" : "left-0.5")} />
      </span>
      {label}
    </button>
  );
}

export function FormField({
  label,
  error,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  error?: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
