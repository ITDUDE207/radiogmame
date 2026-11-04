import { contradictions } from "@/content/fragments";
import { defaultEndingId, endings } from "@/content/endings";
import type {
  Ending,
  EndingCondition,
  IdentityProfile,
  IdentityTheme,
} from "@/types/game";
import { getFragments, type FragmentBoardState } from "@/lib/fragment";
import {
  getDiscoveredContradictions,
  type ContradictionState,
} from "@/lib/contradiction";

const THEME_ORDER: IdentityTheme[] = ["caretaker", "escape-artist", "stranger"];

export function createEmptyThemeCounts(): Record<IdentityTheme, number> {
  return { caretaker: 0, "escape-artist": 0, stranger: 0 };
}

/** The themes with the highest preserved-fragment count (ties are all kept). */
export function findDominantThemes(
  themeCounts: Record<IdentityTheme, number>,
): IdentityTheme[] {
  const highest = Math.max(0, ...THEME_ORDER.map((theme) => themeCounts[theme]));
  if (highest === 0) return [];
  return THEME_ORDER.filter((theme) => themeCounts[theme] === highest);
}

/**
 * Build the live identity summary from the current board state. Counts are
 * driven by preserved fragments, so dismissing or locking a fragment changes
 * the version of Mara the player is holding.
 */
export function computeIdentityProfile(state: ContradictionState): IdentityProfile {
  const preserved = getFragments(state.preservedFragmentIds).filter(
    (fragment) => !state.lockedFragmentIds.includes(fragment.id),
  );

  const themeCounts = createEmptyThemeCounts();
  for (const fragment of preserved) {
    themeCounts[fragment.theme] += 1;
  }

  const dominantThemes = findDominantThemes(themeCounts);
  const isBalanced = dominantThemes.length > 1;
  const dominantTheme = dominantThemes.length === 1 ? dominantThemes[0] : null;

  const discovered = getDiscoveredContradictions(state);
  const resolvedContradictionIds = state.resolvedContradictionIds.filter((id) =>
    contradictions.some((contradiction) => contradiction.id === id),
  );
  const unresolvedContradictionIds = discovered
    .filter((contradiction) => !resolvedContradictionIds.includes(contradiction.id))
    .map((contradiction) => contradiction.id);

  return {
    themeCounts,
    dominantTheme,
    dominantThemes,
    isBalanced,
    preservedFragmentIds: preserved.map((fragment) => fragment.id),
    pinnedFragmentIds: [...state.pinnedFragmentIds],
    dismissedFragmentIds: [...state.dismissedFragmentIds],
    lockedFragmentIds: [...state.lockedFragmentIds],
    discoveredFragmentIds: [...state.discoveredFragmentIds],
    resolvedContradictionIds,
    unresolvedContradictionIds,
  };
}

function matchesCondition(
  profile: IdentityProfile,
  condition: EndingCondition,
): boolean {
  const resolvedCount = profile.resolvedContradictionIds.length;
  const unresolvedCount = profile.unresolvedContradictionIds.length;

  if (condition.requiresBalancedThemes && !profile.isBalanced) return false;
  if (condition.dominantTheme && profile.dominantTheme !== condition.dominantTheme) {
    return false;
  }
  if (
    condition.minResolvedContradictions !== undefined &&
    resolvedCount < condition.minResolvedContradictions
  ) {
    return false;
  }
  if (
    condition.maxResolvedContradictions !== undefined &&
    resolvedCount > condition.maxResolvedContradictions
  ) {
    return false;
  }
  if (
    condition.minUnresolvedContradictions !== undefined &&
    unresolvedCount < condition.minUnresolvedContradictions
  ) {
    return false;
  }
  if (
    condition.maxUnresolvedContradictions !== undefined &&
    unresolvedCount > condition.maxUnresolvedContradictions
  ) {
    return false;
  }
  return true;
}

/**
 * Choose the ending for the committed identity. Conditions are evaluated from
 * highest priority down, and the composite ending is the total fallback so this
 * function always returns a result.
 */
export function selectEnding(profile: IdentityProfile): Ending {
  const ordered = [...endings].sort((a, b) => b.priority - a.priority);
  const match = ordered.find((ending) => matchesCondition(profile, ending.condition));
  if (match) return match;
  const fallback = endings.find((ending) => ending.id === defaultEndingId);
  return fallback ?? ordered[ordered.length - 1];
}

/** Commit is only meaningful once the player has kept at least one fragment. */
export function canCommitIdentity(state: ContradictionState): boolean {
  return (
    state.discoveredFragmentIds.length > 0 && state.preservedFragmentIds.length > 0
  );
}

/** Short status line used by the header and the commit screen. */
export function describeProfile(profile: IdentityProfile): string {
  if (profile.dominantThemes.length === 0) return "No version of Mara is being held.";
  if (profile.isBalanced) return "A composite of all three readings.";
  return `Dominant reading: ${profile.dominantTheme}.`;
}

export function getFragmentCountsByTheme(
  state: FragmentBoardState,
): Record<IdentityTheme, number> {
  return computeIdentityProfile({
    ...state,
    resolvedContradictionIds: [],
    resolvedInterpretations: {},
  }).themeCounts;
}
