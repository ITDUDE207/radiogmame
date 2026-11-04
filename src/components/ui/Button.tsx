import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "outline" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent/15 text-accent border-accent/40 hover:bg-accent/25 hover:border-accent/60",
  ghost:
    "bg-transparent text-ink-muted border-transparent hover:text-ink hover:bg-white/5",
  outline:
    "bg-transparent text-ink border-edge-strong hover:border-accent/60 hover:text-accent",
  danger:
    "bg-transparent text-ink-muted border-edge-strong hover:text-red-300 hover:border-red-400/50",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({
  variant = "outline",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-sm border px-3 py-1.5",
        "text-xs tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        variants[variant],
        className,
      ].join(" ")}
      {...props}
    />
  );
}
