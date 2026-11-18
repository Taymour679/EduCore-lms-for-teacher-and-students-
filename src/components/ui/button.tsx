import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "md" | "sm";
};

const variants = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  secondary: "bg-primary-soft text-primary hover:bg-[#e2e4ff]",
  outline: "border border-slate-200 bg-white text-ink hover:bg-slate-50",
  ghost: "text-ink hover:bg-slate-100",
  danger: "bg-danger text-white hover:bg-red-700",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "primary", size = "md", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-control px-4 font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        size === "md" ? "min-h-touch text-sm" : "min-h-9 px-3 text-xs",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
});
