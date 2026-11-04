"use client";

import { Button } from "@/components/ui/Button";

export interface GameHeaderProps {
  chapter: string;
  discoveredCount: number;
  totalFragments: number;
  unresolvedCount: number;
  currentView: string;
  onOpenBoard: () => void;
  onOpenArchive: () => void;
  onReset: () => void;
}

export function GameHeader({
  chapter,
  discoveredCount,
  totalFragments,
  unresolvedCount,
  currentView,
  onOpenBoard,
  onOpenArchive,
  onReset,
}: GameHeaderProps) {
  return (
    <header
      data-testid="game-header"
      className="sticky top-0 z-20 border-b border-edge bg-shell/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2 md:px-5">
        <div className="flex min-w-0 flex-1 items-baseline gap-3">
          <h1 className="truncate text-sm font-semibold tracking-[0.14em] text-ink uppercase">
            Error 404: Self Not Found
          </h1>
          <span className="hidden truncate text-[0.65rem] tracking-[0.14em] text-ink-faint uppercase sm:inline">
            {chapter}
          </span>
        </div>

        <dl className="flex items-center gap-3 text-[0.65rem] tracking-wide text-ink-muted">
          <div className="flex items-baseline gap-1">
            <dt className="text-ink-faint uppercase">Fragments</dt>
            <dd data-testid="header-fragment-count" className="text-ink">
              {discoveredCount}/{totalFragments}
            </dd>
          </div>
          <div className="flex items-baseline gap-1">
            <dt className="text-ink-faint uppercase">Open conflicts</dt>
            <dd data-testid="header-unresolved-count" className="text-ink">
              {unresolvedCount}
            </dd>
          </div>
        </dl>

        <nav className="flex items-center gap-1.5">
          <Button
            variant={currentView === "archive" ? "primary" : "outline"}
            onClick={onOpenArchive}
            aria-current={currentView === "archive" ? "page" : undefined}
          >
            Archive
          </Button>
          <Button
            variant={currentView === "board" ? "primary" : "outline"}
            onClick={onOpenBoard}
            aria-current={currentView === "board" ? "page" : undefined}
          >
            Identity Board
          </Button>
          <Button variant="danger" onClick={onReset} aria-label="Reset game">
            Reset
          </Button>
        </nav>
      </div>
    </header>
  );
}
