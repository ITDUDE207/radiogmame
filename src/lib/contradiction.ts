import { contradictions, contradictionsById } from "@/content/fragments";
import type { Contradiction, ContradictionInterpretation } from "@/types/game";
import {
  applyFragmentLocks,
  preserveFragment,
  type FragmentBoardState,
} from "@/lib/fragment";

/**
 * Contradiction tracking layered on top of the fragment board state.
 *
 * `resolvedContradictionIds` records which conflicts the player has settled.
 * The locks that a resolution implies are stored in `lockedFragmentIds`, which
 * is shared with the fragment module so the board and the panel agree.
 */
export interface ContradictionState extends FragmentBoardState {
  resolvedContradictionIds: string[];
  /** contradictionId -> chosen interpretationId */
  resolvedInterpretations: Record<string, string>;
}

/** A contradiction is available once every fragment it names is discovered. */
export function isContradictionDiscovered(
  state: FragmentBoardState,
  contradiction: Contradiction,
): boolean {
  const discovered = new Set(state.discoveredFragmentIds);
  return contradiction.fragmentIds.every((id) => discovered.has(id));
}

/** Discovered contradictions the player has not yet resolved. */
export function getUnresolvedContradictions(
  state: ContradictionState,
): Contradiction[] {
  const resolved = new Set(state.resolvedContradictionIds);
  return contradictions.filter(
    (contradiction) =>
      !resolved.has(contradiction.id) && isContradictionDiscovered(state, contradiction),
  );
}

/** Every contradiction whose fragments are known, resolved or not. */
export function getDiscoveredContradictions(state: ContradictionState): Contradiction[] {
  return contradictions.filter((contradiction) =>
    isContradictionDiscovered(state, contradiction),
  );
}

export function getContradiction(id: string): Contradiction | undefined {
  return contradictionsById[id];
}

/**
 * The contradiction the "Resolve Memory" panel should surface: the earliest
 * discovered-and-unresolved conflict, in content order.
 */
export function getActiveContradiction(
  state: ContradictionState,
): Contradiction | null {
  return getUnresolvedContradictions(state)[0] ?? null;
}

export function getInterpretation(
  contradiction: Contradiction,
  interpretationId: string,
): ContradictionInterpretation | undefined {
  return contradiction.interpretations.find((entry) => entry.id === interpretationId);
}

/**
 * Resolve a contradiction by preserving one interpretation. The preserved
 * fragment is kept via the same rule the board uses, and the counterpart is
 * locked out. The player can reopen the conflict later.
 */
export function resolveContradiction(
  state: ContradictionState,
  contradictionId: string,
  interpretationId: string,
): ContradictionState {
  const contradiction = getContradiction(contradictionId);
  if (!contradiction) return state;
  if (state.resolvedContradictionIds.includes(contradictionId)) return state;
  if (!isContradictionDiscovered(state, contradiction)) return state;

  const interpretation = getInterpretation(contradiction, interpretationId);
  if (!interpretation) return state;

  const { preservesFragmentId, locksFragmentIds } = interpretation;

  // The preserved reading must be discoverable and not currently locked.
  const base = applyFragmentLocks(state);
  if (base.lockedFragmentIds.includes(preservesFragmentId)) return state;

  const withPreserved = preserveFragment(
    { ...base, lockedFragmentIds: [...base.lockedFragmentIds, ...locksFragmentIds] },
    preservesFragmentId,
  );

  return {
    ...withPreserved,
    lockedFragmentIds: [
      ...new Set([...withPreserved.lockedFragmentIds, ...locksFragmentIds]),
    ],
    resolvedContradictionIds: [...state.resolvedContradictionIds, contradictionId],
    resolvedInterpretations: {
      ...state.resolvedInterpretations,
      [contradictionId]: interpretationId,
    },
  };
}

/**
 * Revert a resolution. Locks are recomputed from the remaining resolutions so
 * that a fragment released by this conflict, but still locked by another, stays
 * locked.
 */
export function unresolveContradiction(
  state: ContradictionState,
  contradictionId: string,
): ContradictionState {
  const contradiction = getContradiction(contradictionId);
  if (!contradiction || !state.resolvedContradictionIds.includes(contradictionId)) {
    return state;
  }

  const resolvedContradictionIds = state.resolvedContradictionIds.filter(
    (id) => id !== contradictionId,
  );

  const resolvedInterpretations = { ...state.resolvedInterpretations };
  delete resolvedInterpretations[contradictionId];

  // Rebuild the lock set from scratch: every other resolution's locks, plus any
  // incompatibility the preserved fragments imply.
  const locks = new Set<string>();
  const preserved = new Set(state.preservedFragmentIds);
  for (const id of resolvedContradictionIds) {
    const other = getContradiction(id);
    const choice = resolvedInterpretations[id];
    const chosen = other && choice ? getInterpretation(other, choice) : undefined;
    for (const lockedId of chosen?.locksFragmentIds ?? []) locks.add(lockedId);
    if (chosen) preserved.add(chosen.preservesFragmentId);
  }

  return applyFragmentLocks({
    ...state,
    lockedFragmentIds: [...locks],
    preservedFragmentIds: [...preserved],
    resolvedContradictionIds,
    resolvedInterpretations,
  });
}
