import type { HTMLAttributes, ReactNode } from "react";

export interface PanelProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: "section" | "div" | "aside";
}

export function Panel({
  children,
  className = "",
  as: Tag = "section",
  ...rest
}: PanelProps) {
  return (
    <Tag
      className={[
        "rounded-sm border border-edge bg-panel",
        "shadow-[0_1px_0_rgba(255,255,255,0.02)_inset]",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function PanelHeader({
  title,
  meta,
  actions,
}: {
  title: string;
  meta?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-2 border-b border-edge px-3 py-2">
      <div className="flex min-w-0 items-baseline gap-2">
        <h2 className="truncate text-[0.7rem] uppercase tracking-[0.18em] text-ink-muted">
          {title}
        </h2>
        {meta ? <span className="truncate text-[0.65rem] text-ink-faint">{meta}</span> : null}
      </div>
      {actions ? <div className="flex items-center gap-1.5">{actions}</div> : null}
    </header>
  );
}
