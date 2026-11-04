"use client";

import { useMemo } from "react";
import { fragments } from "@/content/fragments";
import {
  getDiscoveredFragments,
  groupFragmentsByTheme,
} from "@/lib/fragment";
import { computeIdentityProfile } from "@/lib/ending";
import { identityThemes } from "@/content/fragments";
import { Button } from "@/components/ui/Button";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { themeDotClasses } from "@/components/ui/tokens";
import { IdentityProfilePanel } from "@/components/identity/IdentityProfilePanel";
import { FragmentCard } from "@/components/identity/FragmentCard";
import { useGameStore } from "@/state/game-store";

export function IdentityBoard() {
  const state = useGameStore((s) => s);

  const profile = useMemo(() => computeIdentityProfile(state), [state]);

  const discoveredFragments = useMemo(
    () => getDiscoveredFragments(state),
    [state.discoveredFragmentIds, state.lockedFragmentIds],
  );

  const grouped = useMemo(
    () => groupFragmentsByTheme(discoveredFragments),
    [discoveredFragments],
  );

  const totalFragments = fragments.length;

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      <Panel className="min-h-0 overflow-y-auto">
        <PanelHeader
          title="Identity board"
          meta={`${state.discoveredFragmentIds.length}/${totalFragments} recovered`}
        />
        <IdentityProfilePanel profile={profile} />

        <div className="px-3 py-3">
          <h3 className="text-[0.6rem] tracking-[0.2em] text-ink-faint uppercase">
            Pinned
          </h3>
          {profile.pinnedFragmentIds.length === 0 ? (
            <p className="mt-1.5 text-[0.7rem] text-ink-faint">
              Nothing pinned. Pin a fragment to hold it against the rest.
            </p>
          ) : (
            <ul className="mt-1.5 flex flex-col gap-1">
              {profile.pinnedFragmentIds.map((id) => {
                const fragment = fragments.find((entry) => entry.id === id);
                if (!fragment) return null;
                return (
                  <li
                    key={id}
                    className="flex items-center gap-1.5 text-[0.7rem] text-ink-muted"
                  >
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 rounded-full ${themeDotClasses[fragment.theme]}`}
                    />
                    {fragment.title}
                  </li>
                );
              })}
            </ul>
          )}

          <Button
            variant="primary"
            className="mt-4 w-full"
            data-testid="commit-identity"
            disabled={profile.preservedFragmentIds.length === 0}
            onClick={() => useGameStore.getState().commitIdentity()}
          >
            Commit this version of Mara
          </Button>
          <p className="mt-1.5 text-[0.65rem] leading-relaxed text-ink-faint">
            Committing ends the chapter. Unresolved conflicts stay unresolved.
          </p>
        </div>
      </Panel>

      <Panel className="min-h-0 overflow-y-auto">
        <PanelHeader
          title="Discovered fragments"
          meta="grouped by identity theme"
        />
        {discoveredFragments.length === 0 ? (
          <p className="p-6 text-center text-xs text-ink-faint">
            No fragments recovered yet. Return to the archive and open some files.
          </p>
        ) : (
          <div className="flex flex-col gap-5 p-3">
            {identityThemes.map((theme) => {
              const list = grouped[theme.id];
              return (
                <section key={theme.id} aria-labelledby={`theme-${theme.id}`}>
                  <div className="flex items-baseline justify-between gap-3">
                    <h3
                      id={`theme-${theme.id}`}
                      className="flex items-center gap-1.5 text-[0.7rem] tracking-[0.16em] text-ink uppercase"
                    >
                      <span
                        aria-hidden="true"
                        className={`h-2 w-2 rounded-full ${themeDotClasses[theme.id]}`}
                      />
                      {theme.label}
                    </h3>
                    <span className="text-[0.6rem] text-ink-faint">
                      {list.length} fragment{list.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[0.65rem] text-ink-faint">{theme.blurb}</p>

                  {list.length === 0 ? (
                    <p className="mt-2 text-[0.7rem] text-ink-faint">
                      Nothing recovered for this reading yet.
                    </p>
                  ) : (
                    <ul className="mt-2 flex flex-col gap-2">
                      {list.map((fragment) => (
                        <FragmentCard
                          key={fragment.id}
                          fragment={fragment}
                          pinned={profile.pinnedFragmentIds.includes(fragment.id)}
                          preserved={profile.preservedFragmentIds.includes(fragment.id)}
                          dismissed={profile.dismissedFragmentIds.includes(fragment.id)}
                          locked={profile.lockedFragmentIds.includes(fragment.id)}
                          onPin={() => useGameStore.getState().pinToBoard(fragment.id)}
                          onUnpin={() =>
                            useGameStore.getState().unpinFromBoard(fragment.id)
                          }
                          onPreserve={() =>
                            useGameStore
                              .getState()
                              .toggleFragmentPreserved(fragment.id)
                          }
                          onDismiss={() =>
                            useGameStore.getState().dismissFromBoard(fragment.id)
                          }
                          onRestore={() =>
                            useGameStore.getState().restoreToBoard(fragment.id)
                          }
                        />
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}
