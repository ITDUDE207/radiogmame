import { describe, expect, it } from "vitest";
import {
  areArtifactsLinked,
  arePlayerLinked,
  discoverArtifact,
  getArtifact,
  getArtifactsInFolder,
  getLinkedArtifacts,
  linkArtifacts,
  searchArtifacts,
  unlinkArtifacts,
} from "@/lib/archive";
import { makeBoardState } from "@/__tests__/helpers";

describe("discovering an artifact", () => {
  it("adds a previously unseen artifact and reveals its fragment", () => {
    const state = makeBoardState();
    const result = discoverArtifact(state, "a1");

    expect(result.wasNew).toBe(true);
    expect(result.discoveredArtifactIds).toEqual(["a1"]);
    expect(result.revealedFragmentId).toBe("f1");
    expect(result.discoveredFragmentIds).toEqual(["f1"]);
  });

  it("is idempotent: reopening a file does not duplicate anything", () => {
    const first = discoverArtifact(makeBoardState(), "a1");
    const second = discoverArtifact(first, "a1");

    expect(second.wasNew).toBe(false);
    expect(second.revealedFragmentId).toBeNull();
    expect(second.discoveredArtifactIds).toEqual(["a1"]);
    expect(second.discoveredFragmentIds).toEqual(["f1"]);
  });

  it("marks an artifact without a fragment as discovered without a reveal", () => {
    const result = discoverArtifact(makeBoardState(), "a13");

    expect(result.wasNew).toBe(true);
    expect(result.discoveredArtifactIds).toContain("a13");
    expect(result.revealedFragmentId).toBeNull();
    expect(result.discoveredFragmentIds).toEqual([]);
  });

  it("ignores unknown artifact ids without throwing", () => {
    const result = discoverArtifact(makeBoardState(), "does-not-exist");

    expect(result.wasNew).toBe(true);
    expect(result.revealedFragmentId).toBeNull();
    expect(result.discoveredArtifactIds).toEqual(["does-not-exist"]);
  });

  it("does not re-reveal a fragment recovered from a different artifact", () => {
    const first = discoverArtifact(makeBoardState(), "a1");
    const second = discoverArtifact(first, "a12");

    expect(second.discoveredFragmentIds).toEqual(["f1"]);
    expect(second.revealedFragmentId).toBeNull();
  });
});

describe("linking two related artifacts", () => {
  it("treats two artifacts that share a tag as linked", () => {
    const a1 = getArtifact("a1")!;
    const a2 = getArtifact("a2")!;

    expect(a1.tags).toContain("family");
    expect(a2.tags).toContain("family");
    expect(areArtifactsLinked(a1, a2)).toBe(true);
  });

  it("treats an explicit cross-reference as linked even without shared tags", () => {
    const a13 = getArtifact("a13")!;
    const a16 = getArtifact("a16")!;

    expect(areArtifactsLinked(a13, a16)).toBe(true);
  });

  it("does not link an artifact to itself", () => {
    const a1 = getArtifact("a1")!;
    expect(areArtifactsLinked(a1, a1)).toBe(false);
  });

  it("returns linked artifacts from the archive index", () => {
    const linked = getLinkedArtifacts("a1");

    expect(linked.map((artifact) => artifact.id)).toContain("a2");
    expect(linked.every((artifact) => artifact.id !== "a1")).toBe(true);
  });

  it("records a player-drawn link once, in canonical order", () => {
    const links = linkArtifacts([], "a13", "a15");
    expect(links).toEqual([{ from: "a13", to: "a15" }]);

    const again = linkArtifacts(links, "a15", "a13");
    expect(again).toEqual([{ from: "a13", to: "a15" }]);
    expect(arePlayerLinked(again, "a13", "a15")).toBe(true);
  });

  it("refuses self-links and unknown artifacts", () => {
    expect(linkArtifacts([], "a1", "a1")).toEqual([]);
    expect(linkArtifacts([], "a1", "nope")).toEqual([]);
  });

  it("surfaces player links through getLinkedArtifacts and can remove them", () => {
    const links = linkArtifacts([], "a13", "a15");
    const linked = getLinkedArtifacts("a13", links);

    expect(linked.map((artifact) => artifact.id)).toContain("a15");

    const removed = unlinkArtifacts(links, "a13", "a15");
    expect(removed).toEqual([]);
    expect(arePlayerLinked(removed, "a13", "a15")).toBe(false);
  });
});

describe("browsing and searching the archive", () => {
  it("filters artifacts by folder", () => {
    const trash = getArtifactsInFolder("trash");
    expect(trash.length).toBeGreaterThan(0);
    expect(trash.every((artifact) => artifact.folderId === "trash")).toBe(true);
  });

  it("searches titles, bodies, sources, and tags", () => {
    expect(searchArtifacts("toothbrush").map((a) => a.id)).toContain("a10");
    expect(searchArtifacts("priya").map((a) => a.id)).toContain("a16");
    expect(searchArtifacts("caretaker")).toEqual([]);
    expect(searchArtifacts("").length).toBeGreaterThan(25);
  });

  it("sorts results newest first", () => {
    const results = searchArtifacts("");
    const timestamps = results.map((artifact) => new Date(artifact.timestamp).getTime());
    const sorted = [...timestamps].sort((a, b) => b - a);
    expect(timestamps).toEqual(sorted);
  });
});
