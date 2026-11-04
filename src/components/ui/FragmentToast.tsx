"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";

/**
 * Shown briefly when a fragment is recovered. It is a live region so screen
 * readers announce the discovery, and it never blocks the archive.
 */
export function FragmentToast({
  title,
  themeLabel,
  detail,
  onDismiss,
}: {
  title: string;
  themeLabel: string;
  detail: string;
  onDismiss: () => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    ref.current?.focus();
  }, [title]);

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="status"
      aria-live="polite"
      data-testid="fragment-toast"
      className="fixed right-3 bottom-3 z-30 w-[min(24rem,calc(100vw-1.5rem))] rounded-sm border border-accent/40 bg-panel-raised p-3 shadow-lg md:right-5 md:bottom-5"
    >
      <p className="text-[0.6rem] tracking-[0.2em] text-accent uppercase">
        Memory fragment recovered
      </p>
      <p className="mt-1 text-sm text-ink">{title}</p>
      <p className="mt-0.5 text-[0.65rem] tracking-wide text-ink-faint uppercase">
        {themeLabel}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-ink-muted">{detail}</p>
      <div className="mt-3 flex justify-end">
        <Button variant="ghost" onClick={onDismiss}>
          File it
        </Button>
      </div>
    </div>
  );
}
