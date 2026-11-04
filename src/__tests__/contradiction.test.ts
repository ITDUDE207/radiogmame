import { describe, expect, it } from "vitest";
import { contradictions } from "@/content/fragments";
import {
  getActiveContradiction,
  getDiscoveredContradictions,
  getUnresolvedContradictions,
  isContradictionDiscovered,
  resolveContradiction,
  unresolveContradiction,
} from "@/lib/contradiction";
import { preserveFragment } from "@/lib/fragment";
import { allDiscoveredState, makeContradictionState } from "@/__tests__/helpers";

describe("detecting contradictions", () => {
  it("exposes at least four contradictions", () => {
    expect(contradictions.length).toBeGreaterThanOrEqual(4);
  });

  it("hides a contradiction until every fragment is discovered", () => {
    const partial = makeContradictionState({ discoveredFragmentIds: ["f5"] });
    const c1 = contradictions.find((c) => c.id === "c1")!;

    expect(isContradictionDiscovered(partial, c1)).toBe(false);
    expect(getDiscoveredContradictions(partial)).toEqual([]);
  });

  it("surfaces a contradiction once both fragments are discovered", () => {
    const state = makeContradictionState({ discoveredFragmentIds: ["f5", "f6"] });
    const c1 = contradictions.find((c) => c.id === "c1")!;

    expect(isContradictionDiscovered(state, c1)).toBe(true);
    expect(getDiscoveredContradictions(state).map((c) => c.id)).toContain("c1");
  });

  it("picks the earliest unresolved contradiction as active", () => {
    const state = allDiscoveredState();
    const active = getActiveContradiction(state);
    expect(active?.id).toBe("c1");
  });

  it("removes a contradiction from the unresolved list once settled", () => {
    const state = allDiscoveredState();
    const resolved = resolveContradiction(state, "c1", "c1-a");

    expect(getUnresolvedContradictions(resolved).map((c) => c.id)).not.toContain("c1");
    expect(resolved.resolvedContradictionIds).toContain("c1");
  });
});

describe("resolving a contradiction", () => {
  it("preserves the chosen fragment and locks the other", () => {
    const state = allDiscoveredState();
    const resolved = resolveContradiction(state, "c1", "c1-a");

    expect(resolved.preservedFragmentIds).toContain("f5");
    expect(resolved.lockedFragmentIds).toContain("f6");
    expect(resolved.resolvedInterpretations.c1).toBe("c1-a");
  });

  it("takes the other side when the other interpretation is chosen", () => {
    const state = allDiscoveredState();
    const resolved = resolveContradiction(state, "c1", "c1-b");

    expect(resolved.preservedFragmentIds).toContain("f6");
    expect(resolved.lockedFragmentIds).toContain("f5");
  });

  it("ignores an unknown contradiction or interpretation", () => {
    const state = allDiscoveredState();
    expect(resolveContradiction(state, "nope", "c1-a")).toBe(state);
    expect(resolveContradiction(state, "c1", "nope")).toBe(state);
  });

  it("refuses to resolve a contradiction whose fragments are not discovered", () => {
    const state = makeContradictionState({ discoveredFragmentIds: ["f5"] });
    const resolved = resolveContradiction(state, "c1", "c1-a");
    expect(resolved.resolvedContradictionIds).toEqual([]);
  });

  it("is a no-op when the contradiction is already resolved", () => {
    const state = allDiscoveredState();
    const once = resolveContradiction(state, "c1", "c1-a");
    const twice = resolveContradiction(once, "c1", "c1-b");

    expect(twice).toBe(once);
  });

  it("lets a later decision override an earlier one for the same fragments", () => {
    const state = allDiscoveredState();
    const first = resolveContradiction(state, "c1", "c1-a");
    // Changing your mind means reopening the conflict, then choosing again.
    const reopened = unresolveContradiction(first, "c1");
    const second = resolveContradiction(reopened, "c1", "c1-b");

    expect(second.preservedFragmentIds).toContain("f6");
    expect(second.lockedFragmentIds).toContain("f5");
  });

  it("resolves all five contradictions independently", () => {
    let state = allDiscoveredState();
    for (const contradiction of contradictions) {
      state = resolveContradiction(
        state,
        contradiction.id,
        contradiction.interpretations[0].id,
      );
    }

    expect(state.resolvedContradictionIds).toHaveLength(contradictions.length);
    expect(getUnresolvedContradictions(state)).toEqual([]);
  });
});

describe("reopening a contradiction", () => {
  it("releases the lock it created", () => {
    const state = allDiscoveredState();
    const resolved = resolveContradiction(state, "c1", "c1-a");
    expect(resolved.lockedFragmentIds).toContain("f6");

    const reopened = unresolveContradiction(resolved, "c1");

    expect(reopened.resolvedContradictionIds).not.toContain("c1");
    expect(reopened.lockedFragmentIds).not.toContain("f6");
  });

  it("keeps a lock that another resolution still requires", () => {
    let state = allDiscoveredState();
    state = resolveContradiction(state, "c1", "c1-a");
    state = resolveContradiction(state, "c2", "c2-a");

    const reopened = unresolveContradiction(state, "c1");

    expect(reopened.lockedFragmentIds).toContain("f8");
    expect(reopened.lockedFragmentIds).not.toContain("f6");
  });

  it("is a no-op for an unresolved contradiction", () => {
    const state = allDiscoveredState();
    expect(unresolveContradiction(state, "c1")).toBe(state);
  });

  it("can be resolved again after reopening", () => {
    const state = allDiscoveredState();
    const resolved = resolveContradiction(state, "c1", "c1-a");
    const reopened = unresolveContradiction(resolved, "c1");
    const again = resolveContradiction(reopened, "c1", "c1-b");

    expect(again.preservedFragmentIds).toContain("f6");
    expect(again.lockedFragmentIds).toContain("f5");
  });

  it("recomputes the profile after a reopen", () => {
    const state = allDiscoveredState();
    const withBoard = preserveFragment(state, "f2");
    const resolved = resolveContradiction(withBoard, "c1", "c1-a");
    const reopened = unresolveContradiction(resolved, "c1");

    expect(reopened.preservedFragmentIds).toContain("f2");
    expect(reopened.preservedFragmentIds).toContain("f5");
  });
});
