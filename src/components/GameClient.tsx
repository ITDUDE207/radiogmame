"use client";

import { useEffect, useMemo } from "react";
import { fragments, fragmentsById } from "@/content/fragments";
import { contradictions } from "@/content/fragments";
import { computeIdentityProfile } from "@/lib/ending";
import { getUnresolvedContradictions } from "@/lib/contradiction";
import { useGameStore } from "@/state/game-store";
import { GameHeader } from "@/components/ui/GameHeader";
import { IntroScreen } from "@/components/ui/IntroScreen";
import { FragmentToast } from "@/components/ui/FragmentToast";
import { ArchiveView } from "@/components/archive/ArchiveView";
import { IdentityBoard } from "@/components/identity/IdentityBoard";
import { EndingSequence } from "@/components/endings/EndingSequence";
import { themeLabels } from "@/components/ui/tokens";

export function GameClient() {
  const view = useGameStore((s) => s.view);
  const chapter = useGameStore((s) => s.currentChapter);
  const discoveredFragmentIds = useGameStore((s) => s.discoveredFragmentIds);
  const lastRevealedFragmentId = useGameStore((s) => s.lastRevealedFragmentId);
  const selectedArtifactId = useGameStore((s) => s.selectedArtifactId);
  const store = useGameStore((s) => s);

  const startGame = useGameStore((s) => s.startGame);
  const setView = useGameStore((s) => s.setView);
  const resetGame = useGameStore((s) => s.resetGame);
  const closeArtifact = useGameStore((s) => s.closeArtifact);
  const clearRevealedFragment = useGameStore((s) => s.clearRevealedFragment);

  const unresolvedCount = useMemo(
    () => getUnresolvedContradictions(store).length,
    [store],
  );

  // Keyboard shortcuts for moving between the major views.
  useEffect(() => {
    if (view === "intro" || view === "ending") return;

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (typing || event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.key === "b" || event.key === "B") {
        event.preventDefault();
        setView("board");
      } else if (event.key === "a" || event.key === "A") {
        event.preventDefault();
        setView("archive");
      } else if (event.key === "Escape") {
        closeArtifact();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [view, setView, closeArtifact]);

  const revealedFragment = lastRevealedFragmentId
    ? fragmentsById[lastRevealedFragmentId] ?? null
    : null;

  if (view === "intro") {
    return (
      <main className="scanline-overlay flex min-h-screen flex-col">
        <IntroScreen onStart={startGame} />
      </main>
    );
  }

  const profile = computeIdentityProfile(store);

  return (
    <div className="flex min-h-screen flex-col">
      <GameHeader
        chapter={chapter}
        discoveredCount={discoveredFragmentIds.length}
        totalFragments={fragments.length}
        unresolvedCount={unresolvedCount}
        currentView={view}
        onOpenBoard={() => setView("board")}
        onOpenArchive={() => setView("archive")}
        onReset={resetGame}
      />

      <main className="scanline-overlay mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-3 px-3 py-3 md:px-5 md:py-4">
        {view === "archive" ? <ArchiveView /> : null}

        {view === "board" ? <IdentityBoard /> : null}

        {view === "ending" ? <EndingSequence /> : null}
      </main>

      <footer className="border-t border-edge px-3 py-2 md:px-5">
        <p className="text-[0.6rem] tracking-wide text-ink-faint">
          {profile.preservedFragmentIds.length} fragments held ·{" "}
          {contradictions.length} known contradictions · dominant reading:{" "}
          {profile.isBalanced
            ? "composite"
            : profile.dominantTheme
              ? themeLabels[profile.dominantTheme]
              : "none"}
        </p>
      </footer>

      {revealedFragment && selectedArtifactId ? (
        <FragmentToast
          title={revealedFragment.title}
          themeLabel={themeLabels[revealedFragment.theme]}
          detail={revealedFragment.summary}
          onDismiss={clearRevealedFragment}
        />
      ) : null}
    </div>
  );
}
