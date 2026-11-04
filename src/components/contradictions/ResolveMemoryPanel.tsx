"use client";

import { useMemo } from "react";
import { getFragment } from "@/lib/fragment";
import {
  getDiscoveredContradictions,
  getInterpretation,
  getUnresolvedContradictions,
} from "@/lib/contradiction";
import { Button } from "@/components/ui/Button";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { themeLabels } from "@/components/ui/tokens";
import { useGameStore } from "@/state/game-store";
import type { Contradiction } from "@/types/game";

function InterpretationButton({
  contradiction,
  interpretationId,
  onChoose,
}: {
  contradiction: Contradiction;
  interpretationId: string;
  onChoose: () => void;
}) {
  const interpretation = getInterpretation(contradiction, interpretationId);
  if (!interpretation) return null;
  const preserves = getFragment(interpretation.preservesFragmentId);

  return (
    <button
      type="button"
      data-testid={`resolve-${interpretation.id}`}
      onClick={onChoose}
      className="group flex h-full flex-col rounded-sm border border-edge-strong bg-panel-raised p-3 text-left transition-colors hover:border-accent/60 hover:bg-accent/[0.07]"
    >
      <span className="text-xs text-ink group-hover:text-accent">
        {interpretation.label}
      </span>
      {preserves ? (
        <span className="mt-1.5 text-[0.6rem] tracking-[0.14em] text-ink-faint uppercase">
          Preserves: {preserves.title} · {themeLabels[preserves.theme]}
        </span>
      ) : null}
      <span className="mt-2 text-[0.7rem] leading-relaxed text-ink-muted">
        {interpretation.consequence}
      </span>
      <span className="mt-3 text-[0.6rem] tracking-[0.18em] text-accent uppercase">
        Preserve this reading →
      </span>
    </button>
  );
}

export function ResolveMemoryPanel() {
  const state = useGameStore((s) => s);

  const active = useMemo(() => getUnresolvedContradictions(state)[0] ?? null, [state]);
  const discovered = useMemo(() => getDiscoveredContradictions(state), [state]);
  const resolvedIds = state.resolvedContradictionIds;

  const resolve = useGameStore((s) => s.resolveActiveContradiction);
  const reopen = useGameStore((s) => s.reopenContradiction);

  return (
    <Panel
      className="min-h-0 overflow-y-auto"
      data-testid="contradiction-panel"
    >
      <PanelHeader
        title="Resolve memory"
        meta={`${resolvedIds.length}/${discovered.length} conflicts settled`}
      />

      {active ? (
        <div
          data-testid="active-contradiction"
          className="border-b border-edge px-3 py-3"
        >
          <p className="text-[0.6rem] tracking-[0.2em] text-accent uppercase">
            Contradiction discovered
          </p>
          <h3 className="mt-1 text-sm text-ink">{active.title}</h3>
          <p className="mt-1.5 text-[0.72rem] leading-relaxed text-ink-muted">
            {active.prompt}
          </p>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <InterpretationButton
              contradiction={active}
              interpretationId={active.interpretations[0].id}
              onChoose={() =>
                resolve(active.id, active.interpretations[0].id)
              }
            />
            <InterpretationButton
              contradiction={active}
              interpretationId={active.interpretations[1].id}
              onChoose={() =>
                resolve(active.id, active.interpretations[1].id)
              }
            />
          </div>
        </div>
      ) : (
        <p
          data-testid="no-active-contradiction"
          className="border-b border-edge px-3 py-3 text-[0.72rem] leading-relaxed text-ink-faint"
        >
          No conflict is currently open. Keep reading; contradictions surface when
          two fragments cannot both be true.
        </p>
      )}

      {discovered.length > 0 ? (
        <ul className="divide-y divide-edge/60">
          {discovered.map((contradiction) => {
            const resolved = resolvedIds.includes(contradiction.id);
            const chosenId = state.resolvedInterpretations[contradiction.id];
            const chosen = chosenId
              ? getInterpretation(contradiction, chosenId)
              : undefined;
            return (
              <li
                key={contradiction.id}
                data-testid={`contradiction-row-${contradiction.id}`}
                className="flex items-start justify-between gap-3 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-[0.72rem] text-ink">{contradiction.title}</p>
                  <p className="mt-0.5 text-[0.65rem] text-ink-faint">
                    {resolved && chosen
                      ? `Settled: ${chosen.label}`
                      : "Open — both readings still held"}
                  </p>
                </div>
                {resolved ? (
                  <Button variant="ghost" onClick={() => reopen(contradiction.id)}>
                    Reopen
                  </Button>
                ) : (
                  <span className="shrink-0 text-[0.6rem] tracking-[0.14em] text-accent uppercase">
                    open
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}
    </Panel>
  );
}
