"use client";

import { create } from "zustand";
import { artifacts } from "@/content/artifacts";
import { contradictions } from "@/content/fragments";
import type { Ending, GameView, IdentityProfile } from "@/types/game";
import {
  discoverArtifact,
  linkArtifacts,
  unlinkArtifacts,
  type ArtifactLink,
} from "@/lib/archive";
import {
  addDiscoveredFragment,
  dismissFragment,
  pinFragment,
  preserveFragment,
  restoreDismissedFragment,
  restoreFragment,
  unpinFragment,
} from "@/lib/fragment";
import {
  resolveContradiction,
  unresolveContradiction,
  type ContradictionState,
} from "@/lib/contradiction";
import {
  canCommitIdentity,
  computeIdentityProfile,
  selectEnding,
} from "@/lib/ending";

/** Snapshot of state used by the header and the identity board. */
export interface GameState extends ContradictionState {
  view: GameView;
  currentChapter: string;
  selectedArtifactId: string | null;
  /** Artifact currently picked as the source of a manual link. */
  linkSourceId: string | null;
  playerLinks: ArtifactLink[];
  /** Player-authored tags, layered on top of the archive's own tags. */
  playerTags: Record<string, string[]>;
  /** Transient notice shown when a fragment is recovered. */
  lastRevealedFragmentId: string | null;
  endingId: string | null;
  /** Set once the ending has been committed, so it is not recomputed. */
  committed: boolean;
}

export interface GameActions {
  startGame: () => void;
  openArtifact: (artifactId: string) => void;
  closeArtifact: () => void;
  addPlayerTag: (artifactId: string, tag: string) => void;
  beginLink: (artifactId: string) => void;
  completeLink: (targetArtifactId: string) => void;
  cancelLink: () => void;
  removeLink: (from: string, to: string) => void;
  toggleFragmentPreserved: (fragmentId: string) => void;
  restoreFragmentToBoard: (fragmentId: string) => void;
  pinToBoard: (fragmentId: string) => void;
  unpinFromBoard: (fragmentId: string) => void;
  dismissFromBoard: (fragmentId: string) => void;
  restoreToBoard: (fragmentId: string) => void;
  resolveActiveContradiction: (
    contradictionId: string,
    interpretationId: string,
  ) => void;
  reopenContradiction: (contradictionId: string) => void;
  commitIdentity: () => void;
  setView: (view: GameView) => void;
  clearRevealedFragment: () => void;
  resetGame: () => void;
}

export type GameStore = GameState & GameActions;

const CHAPTER = "Chapter One — The Last Login";

function createInitialState(): GameState {
  return {
    view: "intro",
    currentChapter: CHAPTER,
    discoveredArtifactIds: [],
    discoveredFragmentIds: [],
    preservedFragmentIds: [],
    pinnedFragmentIds: [],
    dismissedFragmentIds: [],
    lockedFragmentIds: [],
    resolvedContradictionIds: [],
    resolvedInterpretations: {},
    selectedArtifactId: null,
    linkSourceId: null,
    playerLinks: [],
    playerTags: {},
    lastRevealedFragmentId: null,
    endingId: null,
    committed: false,
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...createInitialState(),

  startGame: () => set({ view: "archive" }),

  openArtifact: (artifactId) => {
    const state = get();
    const result = discoverArtifact(
      {
        discoveredArtifactIds: state.discoveredArtifactIds,
        discoveredFragmentIds: state.discoveredFragmentIds,
      },
      artifactId,
    );

    let board: ContradictionState = {
      ...state,
      discoveredArtifactIds: result.discoveredArtifactIds,
      discoveredFragmentIds: result.discoveredFragmentIds,
    };

    if (result.revealedFragmentId) {
      board = {
        ...board,
        ...addDiscoveredFragment(board, result.revealedFragmentId),
      };
    }

    set({
      ...board,
      selectedArtifactId: artifactId,
      lastRevealedFragmentId: result.revealedFragmentId,
      committed: false,
      endingId: null,
    });
  },

  closeArtifact: () => set({ selectedArtifactId: null }),

  addPlayerTag: (artifactId, tag) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    const state = get();
    const existing = state.playerTags[artifactId] ?? [];
    set({
      playerTags: {
        ...state.playerTags,
        [artifactId]: [...new Set([...existing, trimmed])],
      },
    });
  },

  beginLink: (artifactId) => set({ linkSourceId: artifactId }),

  completeLink: (targetArtifactId) => {
    const state = get();
    if (!state.linkSourceId || state.linkSourceId === targetArtifactId) {
      set({ linkSourceId: null });
      return;
    }
    set({
      playerLinks: linkArtifacts(
        state.playerLinks,
        state.linkSourceId,
        targetArtifactId,
      ),
      linkSourceId: null,
    });
  },

  cancelLink: () => set({ linkSourceId: null }),

  removeLink: (from, to) =>
    set({ playerLinks: unlinkArtifacts(get().playerLinks, from, to) }),

  toggleFragmentPreserved: (fragmentId) => {
    const state = get();
    if (state.lockedFragmentIds.includes(fragmentId)) return;
    const next = state.preservedFragmentIds.includes(fragmentId)
      ? dismissFragment(state, fragmentId)
      : preserveFragment(state, fragmentId);
    set(next);
  },

  restoreFragmentToBoard: (fragmentId) => {
    const state = get();
    set(restoreFragment(state, fragmentId));
  },

  pinToBoard: (fragmentId) => set(pinFragment(get(), fragmentId)),

  unpinFromBoard: (fragmentId) => set(unpinFragment(get(), fragmentId)),

  dismissFromBoard: (fragmentId) => set(dismissFragment(get(), fragmentId)),

  restoreToBoard: (fragmentId) => set(restoreDismissedFragment(get(), fragmentId)),

  resolveActiveContradiction: (contradictionId, interpretationId) => {
    const state = get();
    set(resolveContradiction(state, contradictionId, interpretationId));
  },

  reopenContradiction: (contradictionId) => {
    const state = get();
    set(unresolveContradiction(state, contradictionId));
  },

  commitIdentity: () => {
    const state = get();
    if (!canCommitIdentity(state)) return;
    const profile = computeIdentityProfile(state);
    const ending: Ending = selectEnding(profile);
    set({ endingId: ending.id, committed: true, view: "ending" });
  },

  setView: (view) => set({ view }),

  clearRevealedFragment: () => set({ lastRevealedFragmentId: null }),

  resetGame: () => set(createInitialState()),
}));

/** Total artifact count, exposed for the archive footer and tests. */
export const totalArtifactCount = artifacts.length;

/** Total contradiction count, exposed for the commit screen and tests. */
export const totalContradictionCount = contradictions.length;

/** The live identity profile, derived rather than stored. */
export function selectIdentityProfile(state: GameState): IdentityProfile {
  return computeIdentityProfile(state);
}
