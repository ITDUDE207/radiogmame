/**
 * Shared game domain types.
 *
 * These types are intentionally free of React and Zustand imports so that the
 * content modules and pure `src/lib` helpers stay server-safe and testable.
 */

/** The kinds of digital remains the archive can hold. */
export type ArtifactType =
  | "email"
  | "browser-tab"
  | "playlist"
  | "note-draft"
  | "deleted-file"
  | "chat-message"
  | "photo-caption"
  | "system-log";

/** The three readings of Mara the player can build. */
export type IdentityTheme = "caretaker" | "escape-artist" | "stranger";

/** How a fragment relates to the identity being assembled. */
export type FragmentStance = "support" | "complicate" | "contradict";

/** A folder in the recovered file system. */
export interface ArchiveFolder {
  id: string;
  name: string;
  path: string;
  description: string;
}

/** A single recoverable file in the archive. */
export interface Artifact {
  id: string;
  type: ArtifactType;
  title: string;
  /** ISO-8601 timestamp, used for sorting and the "recovered" clock. */
  timestamp: string;
  source: string;
  folderId: string;
  tags: string[];
  body: string;
  /** Fragment revealed the first time this artifact is opened. */
  revealsFragmentId?: string;
  /** Other artifacts this one visibly references. */
  relatedArtifactIds?: string[];
}

/** A memory fragment: one thread of Mara's identity. */
export interface MemoryFragment {
  id: string;
  title: string;
  theme: IdentityTheme;
  stance: FragmentStance;
  /** Short line shown on the identity board. */
  summary: string;
  /** Longer reflection shown when a fragment is opened. */
  detail: string;
  /** The artifact that reveals this fragment. */
  artifactId: string;
  /** Fragments this one cannot coexist with once both are known. */
  incompatibleWith?: string[];
}

/** One of two mutually exclusive readings of a contradiction. */
export interface ContradictionInterpretation {
  id: string;
  /** Short label for the choice button. */
  label: string;
  /** The fragment kept if this reading is preserved. */
  preservesFragmentId: string;
  /** Fragments locked out when this reading is preserved. */
  locksFragmentIds: string[];
  /** Consequence copy shown after the choice is made. */
  consequence: string;
}

/** A conflict between fragments that the player must resolve or leave open. */
export interface Contradiction {
  id: string;
  title: string;
  prompt: string;
  /** Fragments that must all be discovered before this appears. */
  fragmentIds: string[];
  interpretations: [ContradictionInterpretation, ContradictionInterpretation];
}

/** Data-driven gate that decides when an ending is eligible. */
export interface EndingCondition {
  /** Ending requires this theme to be dominant, or any theme if omitted. */
  dominantTheme?: IdentityTheme;
  /** Ending requires the profile to have no dominant theme (balanced). */
  requiresBalancedThemes?: boolean;
  minResolvedContradictions?: number;
  maxResolvedContradictions?: number;
  minUnresolvedContradictions?: number;
  maxUnresolvedContradictions?: number;
}

/** A terminal state of the chapter. */
export interface Ending {
  id: string;
  title: string;
  /** Higher priority endings are tested first. */
  priority: number;
  condition: EndingCondition;
  /** Epigraph shown beneath the title. */
  epigraph: string;
  /** Body paragraphs, in order. */
  paragraphs: string[];
}

/** The computed summary of the Mara the player has built. */
export interface IdentityProfile {
  themeCounts: Record<IdentityTheme, number>;
  dominantTheme: IdentityTheme | null;
  dominantThemes: IdentityTheme[];
  isBalanced: boolean;
  preservedFragmentIds: string[];
  pinnedFragmentIds: string[];
  dismissedFragmentIds: string[];
  lockedFragmentIds: string[];
  discoveredFragmentIds: string[];
  resolvedContradictionIds: string[];
  unresolvedContradictionIds: string[];
}

/** Views the single-page client experience can render. */
export type GameView = "intro" | "archive" | "board" | "ending";
