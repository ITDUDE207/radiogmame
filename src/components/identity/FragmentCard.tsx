"use client";

import { Button } from "@/components/ui/Button";
import { themeAccentClasses, themeLabels } from "@/components/ui/tokens";
import { fragmentStanceLabel } from "@/components/identity/labels";
import type { MemoryFragment } from "@/types/game";

export interface FragmentCardProps {
  fragment: MemoryFragment;
  pinned: boolean;
  preserved: boolean;
  dismissed: boolean;
  locked: boolean;
  onPin: () => void;
  onUnpin: () => void;
  onPreserve: () => void;
  onDismiss: () => void;
  onRestore: () => void;
}

export function FragmentCard({
  fragment,
  pinned,
  preserved,
  dismissed,
  locked,
  onPin,
  onUnpin,
  onPreserve,
  onDismiss,
  onRestore,
}: FragmentCardProps) {
  const accent = themeAccentClasses[fragment.theme];

  return (
    <li
      data-testid={`fragment-card-${fragment.id}`}
      data-state={locked ? "locked" : dismissed ? "dismissed" : preserved ? "preserved" : "available"}
      className={[
        "rounded-sm border p-2.5 transition-colors",
        locked
          ? "border-edge/60 bg-shell/60 opacity-55"
          : dismissed
            ? "border-edge/60 bg-shell/40 opacity-70"
            : "border-edge bg-panel-raised",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={`rounded-sm border px-1.5 py-0.5 text-[0.55rem] tracking-[0.14em] uppercase ${accent}`}
        >
          {themeLabels[fragment.theme]}
        </span>
        <span className="text-[0.55rem] tracking-[0.14em] text-ink-faint uppercase">
          {fragmentStanceLabel(fragment.stance)}
        </span>
        {pinned ? (
          <span className="text-[0.55rem] tracking-[0.14em] text-accent uppercase">
            pinned
          </span>
        ) : null}
        {locked ? (
          <span className="text-[0.55rem] tracking-[0.14em] text-red-300/80 uppercase">
            locked out
          </span>
        ) : null}
      </div>

      <h4 className="mt-1.5 text-xs text-ink">{fragment.title}</h4>
      <p className="mt-1 text-[0.7rem] leading-relaxed text-ink-muted">
        {fragment.summary}
      </p>
      <p className="mt-1.5 text-[0.68rem] leading-relaxed text-ink-faint italic">
        {fragment.detail}
      </p>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {locked ? (
          <span className="text-[0.6rem] text-ink-faint">
            Incompatible with a fragment you preserved.
          </span>
        ) : dismissed ? (
          <Button variant="outline" onClick={onRestore}>
            Restore
          </Button>
        ) : (
          <>
            <Button
              variant={preserved ? "primary" : "outline"}
              onClick={onPreserve}
              aria-pressed={preserved}
            >
              {preserved ? "Preserved" : "Preserve"}
            </Button>
            {pinned ? (
              <Button variant="ghost" onClick={onUnpin}>
                Unpin
              </Button>
            ) : (
              <Button variant="ghost" onClick={onPin}>
                Pin
              </Button>
            )}
            <Button variant="danger" onClick={onDismiss}>
              Dismiss
            </Button>
          </>
        )}
      </div>
    </li>
  );
}
