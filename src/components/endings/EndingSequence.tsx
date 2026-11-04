"use client";

import { useMemo } from "react";
import { endingsById } from "@/content/endings";
import { contradictions } from "@/content/fragments";
import { computeIdentityProfile } from "@/lib/ending";
import { getInterpretation } from "@/lib/contradiction";
import { Button } from "@/components/ui/Button";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { themeLabels } from "@/components/ui/tokens";
import { useGameStore } from "@/state/game-store";

export function EndingSequence() {
  const state = useGameStore((s) => s);
  const endingId = state.endingId;
  const ending = endingId ? endingsById[endingId] ?? null : null;

  const profile = useMemo(() => computeIdentityProfile(state), [state]);

  const openBoard = useGameStore((s) => s.setView);
  const reset = useGameStore((s) => s.resetGame);

  if (!ending) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-xs text-ink-faint">No identity has been committed yet.</p>
      </div>
    );
  }

  const resolved = contradictions.filter((contradiction) =>
    state.resolvedContradictionIds.includes(contradiction.id),
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 py-2">
      <Panel data-testid="ending-panel" className="overflow-hidden">
        <div className="border-b border-edge px-5 py-4">
          <p className="text-[0.6rem] tracking-[0.24em] text-ink-faint uppercase">
            Chapter One — End of record
          </p>
          <h2
            data-testid="ending-title"
            className="mt-2 text-xl leading-tight text-ink md:text-2xl"
          >
            {ending.title}
          </h2>
          <p className="mt-2 max-w-2xl text-[0.75rem] leading-relaxed text-ink-faint italic">
            {ending.epigraph}
          </p>
        </div>

        <div className="flex flex-col gap-3 px-5 py-4">
          {ending.paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="max-w-2xl text-[0.82rem] leading-[1.85] text-ink-muted"
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-edge px-5 py-3">
          <Button variant="primary" onClick={() => openBoard("board")}>
            Return to the Identity Board
          </Button>
          <Button variant="outline" onClick={() => openBoard("archive")}>
            Back to the archive
          </Button>
          <Button variant="danger" onClick={reset}>
            Start a new recovery
          </Button>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Panel>
          <PanelHeader title="The Mara you committed" />
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 px-3 py-3 text-[0.7rem]">
            <dt className="text-ink-faint">Fragments held</dt>
            <dd className="text-right text-ink">
              {profile.preservedFragmentIds.length}
            </dd>
            <dt className="text-ink-faint">Caretaker</dt>
            <dd className="text-right text-ink">{profile.themeCounts.caretaker}</dd>
            <dt className="text-ink-faint">Escape Artist</dt>
            <dd className="text-right text-ink">
              {profile.themeCounts["escape-artist"]}
            </dd>
            <dt className="text-ink-faint">Stranger</dt>
            <dd className="text-right text-ink">{profile.themeCounts.stranger}</dd>
            <dt className="text-ink-faint">Conflicts resolved</dt>
            <dd className="text-right text-ink">
              {profile.resolvedContradictionIds.length}
            </dd>
            <dt className="text-ink-faint">Conflicts left open</dt>
            <dd className="text-right text-ink">
              {profile.unresolvedContradictionIds.length}
            </dd>
            <dt className="text-ink-faint">Fragments locked out</dt>
            <dd className="text-right text-ink">{profile.lockedFragmentIds.length}</dd>
          </dl>
        </Panel>

        <Panel>
          <PanelHeader
            title="What you decided"
            meta={`${resolved.length} of ${contradictions.length}`}
          />
          {resolved.length === 0 ? (
            <p className="px-3 py-3 text-[0.7rem] leading-relaxed text-ink-faint">
              You settled nothing. Every reading is still standing, which is its own
              kind of answer.
            </p>
          ) : (
            <ul className="divide-y divide-edge/60">
              {resolved.map((contradiction) => {
                const chosenId = state.resolvedInterpretations[contradiction.id];
                const chosen = chosenId
                  ? getInterpretation(contradiction, chosenId)
                  : undefined;
                const preserved = chosen
                  ? profile.preservedFragmentIds.includes(
                      chosen.preservesFragmentId,
                    )
                  : false;
                return (
                  <li key={contradiction.id} className="px-3 py-2">
                    <p className="text-[0.7rem] text-ink">{contradiction.title}</p>
                    <p className="mt-0.5 text-[0.65rem] text-ink-muted">
                      {chosen?.label ?? "—"}
                    </p>
                    {!preserved ? (
                      <p className="mt-0.5 text-[0.6rem] text-ink-faint">
                        Later overridden on the board.
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>

      <p className="pb-2 text-center text-[0.65rem] text-ink-faint">
        Dominant reading:{" "}
        {profile.isBalanced
          ? "none — composite"
          : profile.dominantTheme
            ? themeLabels[profile.dominantTheme]
            : "none"}
      </p>
    </div>
  );
}
