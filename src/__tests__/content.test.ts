import { describe, expect, it } from "vitest";
import { archiveFolders, artifacts, artifactsById } from "@/content/artifacts";
import { contradictions, fragments, fragmentsById } from "@/content/fragments";
import { endings } from "@/content/endings";
import { isContradictionDiscovered } from "@/lib/contradiction";
import { makeBoardState } from "@/__tests__/helpers";

const requiredArtifactTypes = [
  "email",
  "browser-tab",
  "playlist",
  "note-draft",
  "deleted-file",
  "chat-message",
  "photo-caption",
  "system-log",
] as const;

describe("artifact content", () => {
  it("contains at least 25 artifacts", () => {
    expect(artifacts.length).toBeGreaterThanOrEqual(25);
  });

  it("covers all eight required artifact types", () => {
    const present = new Set(artifacts.map((artifact) => artifact.type));
    for (const type of requiredArtifactTypes) {
      expect(present.has(type)).toBe(true);
    }
  });

  it("gives every artifact full metadata", () => {
    for (const artifact of artifacts) {
      expect(artifact.id).toBeTruthy();
      expect(artifact.title.length).toBeGreaterThan(3);
      expect(artifact.body.length).toBeGreaterThan(30);
      expect(artifact.source.length).toBeGreaterThan(2);
      expect(artifact.tags.length).toBeGreaterThan(0);
      expect(Number.isNaN(new Date(artifact.timestamp).getTime())).toBe(false);
      expect(archiveFolders.some((folder) => folder.id === artifact.folderId)).toBe(
        true,
      );
    }
  });

  it("uses unique artifact ids and a matching lookup table", () => {
    const ids = artifacts.map((artifact) => artifact.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(Object.keys(artifactsById)).toHaveLength(artifacts.length);
  });

  it("only cross-references artifacts that exist", () => {
    for (const artifact of artifacts) {
      for (const relatedId of artifact.relatedArtifactIds ?? []) {
        expect(artifactsById[relatedId]).toBeDefined();
      }
    }
  });
});

describe("fragment content", () => {
  it("contains at least 12 fragments with unique ids", () => {
    expect(fragments.length).toBeGreaterThanOrEqual(12);
    const ids = fragments.map((fragment) => fragment.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("points every fragment at an artifact that reveals it", () => {
    for (const fragment of fragments) {
      const artifact = artifactsById[fragment.artifactId];
      expect(artifact).toBeDefined();
      expect(artifact.revealsFragmentId).toBe(fragment.id);
    }
  });

  it("reveals every fragment from at least one artifact", () => {
    const revealed = new Set(
      artifacts
        .map((artifact) => artifact.revealsFragmentId)
        .filter((id): id is string => Boolean(id)),
    );
    for (const fragment of fragments) {
      expect(revealed.has(fragment.id)).toBe(true);
    }
  });

  it("never points an artifact at a fragment that does not exist", () => {
    for (const artifact of artifacts) {
      if (!artifact.revealsFragmentId) continue;
      expect(fragmentsById[artifact.revealsFragmentId]).toBeDefined();
    }
  });

  it("keeps every incompatible reference pointing at a real fragment", () => {
    for (const fragment of fragments) {
      for (const otherId of fragment.incompatibleWith ?? []) {
        expect(fragmentsById[otherId]).toBeDefined();
        expect(otherId).not.toBe(fragment.id);
      }
    }
  });

  it("is fully discoverable: opening every revealing artifact recovers them all", () => {
    const revealingIds = artifacts
      .filter((artifact) => artifact.revealsFragmentId)
      .map((artifact) => artifact.id);
    const recovered = new Set(
      revealingIds.map((id) => artifactsById[id].revealsFragmentId!),
    );
    expect(recovered.size).toBe(fragments.length);
  });
});

describe("contradiction content", () => {
  it("contains at least 4 contradictions", () => {
    expect(contradictions.length).toBeGreaterThanOrEqual(4);
  });

  it("gives each contradiction exactly two interpretations", () => {
    for (const contradiction of contradictions) {
      expect(contradiction.interpretations).toHaveLength(2);
      expect(contradiction.fragmentIds.length).toBeGreaterThanOrEqual(2);
      expect(contradiction.prompt.length).toBeGreaterThan(40);
    }
  });

  it("references real fragments in both directions", () => {
    for (const contradiction of contradictions) {
      const [a, b] = contradiction.interpretations;
      for (const fragmentId of contradiction.fragmentIds) {
        expect(fragmentsById[fragmentId]).toBeDefined();
      }
      for (const interpretation of contradiction.interpretations) {
        expect(fragmentsById[interpretation.preservesFragmentId]).toBeDefined();
        expect(interpretation.locksFragmentIds.length).toBeGreaterThan(0);
        for (const lockedId of interpretation.locksFragmentIds) {
          expect(fragmentsById[lockedId]).toBeDefined();
        }
      }
      // Each side preserves what the other locks out.
      expect(a.preservesFragmentId).not.toBe(b.preservesFragmentId);
      expect(b.locksFragmentIds).toContain(a.preservesFragmentId);
      expect(a.locksFragmentIds).toContain(b.preservesFragmentId);
    }
  });

  it("uses unique contradiction and interpretation ids", () => {
    const contradictionIds = contradictions.map((c) => c.id);
    expect(new Set(contradictionIds).size).toBe(contradictionIds.length);

    const interpretationIds = contradictions.flatMap((c) =>
      c.interpretations.map((interpretation) => interpretation.id),
    );
    expect(new Set(interpretationIds).size).toBe(interpretationIds.length);
  });

  it("gates each contradiction on fragments that can actually be discovered", () => {
    const discovered = fragments.map((fragment) => fragment.id);
    const state = makeBoardState({ discoveredFragmentIds: discovered });
    for (const contradiction of contradictions) {
      expect(isContradictionDiscovered(state, contradiction)).toBe(true);
    }
  });

  it("supports at least four distinct contradictions resolving independently", () => {
    expect(contradictions.length).toBeGreaterThanOrEqual(4);
    const pairs = contradictions.map((c) => [...c.fragmentIds].sort().join("|"));
    expect(new Set(pairs).size).toBe(pairs.length);
  });
});

describe("ending content", () => {
  it("contains at least 3 endings with unique ids", () => {
    expect(endings.length).toBeGreaterThanOrEqual(3);
    const ids = endings.map((ending) => ending.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("covers all three dominant themes plus a fallback", () => {
    const themed = endings.map((ending) => ending.condition.dominantTheme);
    expect(themed).toContain("caretaker");
    expect(themed).toContain("escape-artist");
    expect(themed).toContain("stranger");
    expect(
      endings.some((ending) => ending.condition.requiresBalancedThemes),
    ).toBe(true);
  });

  it("has at least one ending for the unresolved case", () => {
    expect(
      endings.some(
        (ending) => (ending.condition.minUnresolvedContradictions ?? 0) >= 1,
      ),
    ).toBe(true);
  });

  it("gives every ending a priority and readable prose", () => {
    for (const ending of endings) {
      expect(typeof ending.priority).toBe("number");
      expect(ending.title.length).toBeGreaterThan(3);
      expect(ending.paragraphs.length).toBeGreaterThanOrEqual(3);
    }
  });
});
