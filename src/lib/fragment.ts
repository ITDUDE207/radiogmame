import { fragmentsById } from "@/content/fragments";
import type { IdentityTheme, MemoryFragment } from "@/types/game";

/**
 * The fragment-related slice of the game state.
 *
 * `discovered` means the player has read the artifact that carries the fragment.
 * `preserved` means the player has chosen to hold that reading in the profile.
 * `locked` is accumulated from explicit decisions only, so that discovering two
 * incompatible fragments never silently settles a contradiction for the player.
 */
export interface FragmentBoardState {
  discoveredArtifactIds: string[];
  discoveredFragmentIds: string[];
  preservedFragmentIds: string[];
  pinnedFragmentIds: string[];
  dismissedFragmentIds: string[];
  lockedFragmentIds: string[];
}

export function getFragment(fragmentId: string): MemoryFragment | undefined {
  return fragmentsById[fragmentId];
}

export function getFragments(ids: string[]): MemoryFragment[] {
  return ids
    .map((id) => fragmentsById[id])
    .filter((fragment): fragment is MemoryFragment => Boolean(fragment));
}

export function getDiscoveredFragments(state: FragmentBoardState): MemoryFragment[] {
  return getFragments(state.discoveredFragmentIds);
}

export function getPreservedFragments(state: FragmentBoardState): MemoryFragment[] {
  return getFragments(state.preservedFragmentIds).filter(
    (fragment) => !state.lockedFragmentIds.includes(fragment.id),
  );
}

export function groupFragmentsByTheme(
  list: MemoryFragment[],
): Record<IdentityTheme, MemoryFragment[]> {
  const grouped: Record<IdentityTheme, MemoryFragment[]> = {
    caretaker: [],
    "escape-artist": [],
    stranger: [],
  };
  for (const fragment of list) {
    grouped[fragment.theme].push(fragment);
  }
  return grouped;
}

/** Fragments that a given fragment declares itself incompatible with. */
export function getIncompatibleFragmentIds(fragmentId: string): string[] {
  return fragmentsById[fragmentId]?.incompatibleWith ?? [];
}

/**
 * The incompatibility relation is symmetric, so it does not matter which side
 * declared it. Returns true when the two fragments cannot both be preserved.
 */
export function areFragmentsIncompatible(a: string, b: string): boolean {
  if (a === b) return false;
  return (
    getIncompatibleFragmentIds(a).includes(b) ||
    getIncompatibleFragmentIds(b).includes(a)
  );
}

/**
 * Fragments that must be locked out if `fragmentId` is preserved, given what is
 * already preserved. This is the pure rule behind the board's lock behaviour.
 */
export function computeLockedFragmentIds(
  preservedFragmentIds: string[],
  candidateFragmentId: string,
): string[] {
  return preservedFragmentIds.filter(
    (preservedId) =>
      preservedId !== candidateFragmentId &&
      areFragmentsIncompatible(preservedId, candidateFragmentId),
  );
}

/**
 * Drop locked fragments from the profile. Locks themselves are decided by the
 * actions below; this only enforces them.
 */
export function applyFragmentLocks<T extends FragmentBoardState>(state: T): T {
  const locked = new Set(state.lockedFragmentIds);
  return {
    ...state,
    preservedFragmentIds: state.preservedFragmentIds.filter((id) => !locked.has(id)),
    pinnedFragmentIds: state.pinnedFragmentIds.filter((id) => !locked.has(id)),
  };
}

/** Preview: which preserved fragments a restore would lock out. */
export function wouldLockFragments(
  state: FragmentBoardState,
  fragmentId: string,
): string[] {
  return computeLockedFragmentIds(state.preservedFragmentIds, fragmentId);
}

/**
 * Preserve a fragment: it joins the profile and any incompatible fragment that
 * was already preserved is locked out. The newest decision always wins.
 */
export function preserveFragment<T extends FragmentBoardState>(
  state: T,
  fragmentId: string,
): T {
  if (!state.discoveredFragmentIds.includes(fragmentId)) return state;
  if (state.lockedFragmentIds.includes(fragmentId)) return state;

  const newlyLocked = computeLockedFragmentIds(
    state.preservedFragmentIds,
    fragmentId,
  );
  const locked = new Set([...state.lockedFragmentIds, ...newlyLocked]);

  const next = {
    ...state,
    preservedFragmentIds: [
      ...state.preservedFragmentIds.filter((id) => !locked.has(id) && id !== fragmentId),
      fragmentId,
    ],
    dismissedFragmentIds: state.dismissedFragmentIds.filter((id) => id !== fragmentId),
    lockedFragmentIds: [...locked],
  };

  return applyFragmentLocks(next);
}

/**
 * Restore a dismissed fragment back into the profile. Incompatible preserved
 * fragments are locked out, exactly as with `preserveFragment`.
 */
export function restoreFragment<T extends FragmentBoardState>(
  state: T,
  fragmentId: string,
): T {
  if (!state.discoveredFragmentIds.includes(fragmentId)) return state;
  if (state.lockedFragmentIds.includes(fragmentId)) return state;
  return preserveFragment(state, fragmentId);
}

/** Pin a preserved fragment to the top of the identity board. */
export function pinFragment<T extends FragmentBoardState>(
  state: T,
  fragmentId: string,
): T {
  if (!state.discoveredFragmentIds.includes(fragmentId)) return state;
  if (state.lockedFragmentIds.includes(fragmentId)) return state;
  if (state.dismissedFragmentIds.includes(fragmentId)) return state;
  const withPreserved = state.preservedFragmentIds.includes(fragmentId)
    ? state
    : preserveFragment(state, fragmentId);
  return {
    ...withPreserved,
    pinnedFragmentIds: withPreserved.pinnedFragmentIds.includes(fragmentId)
      ? withPreserved.pinnedFragmentIds
      : [...withPreserved.pinnedFragmentIds, fragmentId],
  };
}

export function unpinFragment<T extends FragmentBoardState>(
  state: T,
  fragmentId: string,
): T {
  return {
    ...state,
    pinnedFragmentIds: state.pinnedFragmentIds.filter((id) => id !== fragmentId),
  };
}

/**
 * Dismiss a fragment: it stays discovered and readable, but leaves the profile
 * so it no longer contributes to the identity summary. Dismissal does not
 * release locks, so a dismissed fragment cannot be used to dodge a conflict.
 */
export function dismissFragment<T extends FragmentBoardState>(
  state: T,
  fragmentId: string,
): T {
  const dismissedFragmentIds = state.dismissedFragmentIds.includes(fragmentId)
    ? state.dismissedFragmentIds
    : [...state.dismissedFragmentIds, fragmentId];
  return applyFragmentLocks({
    ...state,
    dismissedFragmentIds,
    preservedFragmentIds: state.preservedFragmentIds.filter((id) => id !== fragmentId),
    pinnedFragmentIds: state.pinnedFragmentIds.filter((id) => id !== fragmentId),
  });
}

/** Undo a dismissal without applying new locks. */
export function restoreDismissedFragment<T extends FragmentBoardState>(
  state: T,
  fragmentId: string,
): T {
  if (state.lockedFragmentIds.includes(fragmentId)) return state;
  if (!state.discoveredFragmentIds.includes(fragmentId)) return state;
  return {
    ...state,
    dismissedFragmentIds: state.dismissedFragmentIds.filter((id) => id !== fragmentId),
  };
}

/** Record a newly discovered fragment. Discovery never creates locks. */
export function addDiscoveredFragment<T extends FragmentBoardState>(
  state: T,
  fragmentId: string,
): T {
  if (!fragmentsById[fragmentId]) return state;
  if (state.discoveredFragmentIds.includes(fragmentId)) return state;
  return {
    ...state,
    discoveredFragmentIds: [...state.discoveredFragmentIds, fragmentId],
  };
}
