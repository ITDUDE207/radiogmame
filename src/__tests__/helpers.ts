import { artifacts } from "@/content/artifacts";
import { fragments } from "@/content/fragments";
import type { FragmentBoardState } from "@/lib/fragment";
import type { ContradictionState } from "@/lib/contradiction";

/** Minimal board state builder for unit tests. */
export function makeBoardState(
  partial: Partial<FragmentBoardState> = {},
): FragmentBoardState {
  return {
    discoveredArtifactIds: [],
    discoveredFragmentIds: [],
    preservedFragmentIds: [],
    pinnedFragmentIds: [],
    dismissedFragmentIds: [],
    lockedFragmentIds: [],
    ...partial,
  };
}

/** Minimal contradiction state builder for unit tests. */
export function makeContradictionState(
  partial: Partial<ContradictionState> = {},
): ContradictionState {
  return {
    ...makeBoardState(),
    resolvedContradictionIds: [],
    resolvedInterpretations: {},
    ...partial,
  };
}

/** Every artifact id, for tests that need the whole archive open. */
export const allArtifactIds = artifacts.map((artifact) => artifact.id);

/** Every fragment id, in content order. */
export const allFragmentIds = fragments.map((fragment) => fragment.id);

/** Every artifact id that reveals a fragment, so tests can open the archive. */
export const revealingArtifactIds = artifacts
  .filter((artifact) => artifact.revealsFragmentId)
  .map((artifact) => artifact.id);

/** All fragments discovered, nothing preserved. */
export function allDiscoveredState(): ContradictionState {
  return makeContradictionState({
    discoveredArtifactIds: allArtifactIds,
    discoveredFragmentIds: allFragmentIds,
  });
}
