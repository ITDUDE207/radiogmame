import { archiveFolders, artifacts, artifactsById } from "@/content/artifacts";
import { fragmentsById } from "@/content/fragments";
import type { ArchiveFolder, Artifact } from "@/types/game";

/** Discovery state is plain data so the helpers below stay pure and testable. */
export interface DiscoveryState {
  discoveredArtifactIds: string[];
  discoveredFragmentIds: string[];
}

export interface DiscoveryResult extends DiscoveryState {
  /** The fragment revealed by this open, if any, and if it was new. */
  revealedFragmentId: string | null;
  /** False when the artifact had already been opened. */
  wasNew: boolean;
}

export function getArtifact(artifactId: string): Artifact | undefined {
  return artifactsById[artifactId];
}

export function getFolder(folderId: string): ArchiveFolder | undefined {
  return archiveFolders.find((folder) => folder.id === folderId);
}

export function getArtifactsInFolder(folderId: string): Artifact[] {
  return artifacts.filter((artifact) => artifact.folderId === folderId);
}

/** Newest first; the archive reads like a recovery log. */
export function sortByTimestamp(list: Artifact[]): Artifact[] {
  return [...list].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

/**
 * Two artifacts are linked when one names the other, or when they share a tag.
 * Tags are the archive's own index: they are how Mara filed things together.
 */
export function areArtifactsLinked(a: Artifact, b: Artifact): boolean {
  if (a.id === b.id) return false;
  if (a.relatedArtifactIds?.includes(b.id)) return true;
  if (b.relatedArtifactIds?.includes(a.id)) return true;
  return a.tags.some((tag) => b.tags.includes(tag));
}

/** A link the player drew between two artifacts by hand. */
export interface ArtifactLink {
  from: string;
  to: string;
}

export function linkKey(a: string, b: string): string {
  return [a, b].sort().join("::");
}

/**
 * Record a player-drawn link. Self-links and duplicates are ignored, and the
 * link is stored in a canonical order so `a -> b` and `b -> a` are one link.
 */
export function linkArtifacts(
  links: ArtifactLink[],
  from: string,
  to: string,
): ArtifactLink[] {
  if (!from || !to || from === to) return links;
  if (!getArtifact(from) || !getArtifact(to)) return links;
  const key = linkKey(from, to);
  if (links.some((link) => linkKey(link.from, link.to) === key)) return links;
  const [first, second] = [from, to].sort();
  return [...links, { from: first, to: second }];
}

export function unlinkArtifacts(
  links: ArtifactLink[],
  from: string,
  to: string,
): ArtifactLink[] {
  const key = linkKey(from, to);
  return links.filter((link) => linkKey(link.from, link.to) !== key);
}

export function arePlayerLinked(
  links: ArtifactLink[],
  a: string,
  b: string,
): boolean {
  const key = linkKey(a, b);
  return links.some((link) => linkKey(link.from, link.to) === key);
}

/** Linked artifacts from the archive's own index, plus any player-drawn links. */
export function getLinkedArtifacts(
  artifactId: string,
  playerLinks: ArtifactLink[] = [],
): Artifact[] {
  const source = getArtifact(artifactId);
  if (!source) return [];
  return sortByTimestamp(
    artifacts.filter(
      (candidate) =>
        areArtifactsLinked(source, candidate) ||
        arePlayerLinked(playerLinks, source.id, candidate.id),
    ),
  );
}

/** Case-insensitive search over title, body, source, tags, and type. */
export function searchArtifacts(query: string, pool: Artifact[] = artifacts): Artifact[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return sortByTimestamp(pool);
  return sortByTimestamp(
    pool.filter((artifact) => {
      const haystack = [
        artifact.title,
        artifact.body,
        artifact.source,
        artifact.type,
        artifact.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    }),
  );
}

/**
 * Open an artifact: mark it discovered and reveal its fragment if the fragment
 * has not been recovered yet. Idempotent.
 */
export function discoverArtifact(
  state: DiscoveryState,
  artifactId: string,
): DiscoveryResult {
  const artifact = getArtifact(artifactId);
  const wasNew = !state.discoveredArtifactIds.includes(artifactId);

  const discoveredArtifactIds = wasNew
    ? [...state.discoveredArtifactIds, artifactId]
    : [...state.discoveredArtifactIds];

  let revealedFragmentId: string | null = null;
  let discoveredFragmentIds = [...state.discoveredFragmentIds];

  if (artifact?.revealsFragmentId) {
    const fragmentId = artifact.revealsFragmentId;
    const fragmentExists = Boolean(fragmentsById[fragmentId]);
    const alreadyKnown = discoveredFragmentIds.includes(fragmentId);
    if (fragmentExists && !alreadyKnown) {
      discoveredFragmentIds = [...discoveredFragmentIds, fragmentId];
      revealedFragmentId = fragmentId;
    }
  }

  return {
    discoveredArtifactIds,
    discoveredFragmentIds,
    revealedFragmentId,
    wasNew,
  };
}
