import { describe, expect, it } from "vitest";
import { fragments } from "@/content/fragments";
import {
  addDiscoveredFragment,
  areFragmentsIncompatible,
  computeLockedFragmentIds,
  dismissFragment,
  groupFragmentsByTheme,
  pinFragment,
  preserveFragment,
  restoreDismissedFragment,
  restoreFragment,
  unpinFragment,
  wouldLockFragments,
} from "@/lib/fragment";
import { allDiscoveredState, makeBoardState } from "@/__tests__/helpers";

describe("preserving fragments", () => {
  it("adds a discovered fragment to the profile", () => {
    const state = preserveFragment(makeBoardState(), "f2");

    // f2 is not discovered, so preserve is a no-op.
    expect(state.preservedFragmentIds).toEqual([]);
  });

  it("preserves a fragment once it has been discovered", () => {
    const state = preserveFragment(
      makeBoardState({ discoveredFragmentIds: ["f2"] }),
      "f2",
    );

    expect(state.preservedFragmentIds).toEqual(["f2"]);
    expect(state.lockedFragmentIds).toEqual([]);
  });

  it("is idempotent", () => {
    const once = preserveFragment(
      makeBoardState({ discoveredFragmentIds: ["f2"] }),
      "f2",
    );
    const twice = preserveFragment(once, "f2");

    expect(twice.preservedFragmentIds).toEqual(["f2"]);
  });

  it("ignores unknown fragments", () => {
    const state = preserveFragment(makeBoardState(), "nope");
    expect(state.preservedFragmentIds).toEqual([]);
  });
});

describe("locking incompatible fragments", () => {
  it("knows which fragment pairs are incompatible", () => {
    expect(areFragmentsIncompatible("f1", "f4")).toBe(true);
    expect(areFragmentsIncompatible("f5", "f6")).toBe(true);
    expect(areFragmentsIncompatible("f1", "f2")).toBe(false);
    expect(areFragmentsIncompatible("f1", "f1")).toBe(false);
  });

  it("locks a preserved fragment out when its opposite is preserved", () => {
    const state = preserveFragment(
      makeBoardState({ discoveredFragmentIds: ["f1", "f4"] }),
      "f1",
    );
    expect(state.preservedFragmentIds).toEqual(["f1"]);

    const conflicted = preserveFragment(state, "f4");

    expect(conflicted.preservedFragmentIds).toEqual(["f4"]);
    expect(conflicted.lockedFragmentIds).toContain("f1");
  });

  it("reports which preserved fragments a restore would lock out", () => {
    const state = makeBoardState({
      discoveredFragmentIds: ["f1", "f4"],
      preservedFragmentIds: ["f1"],
    });
    expect(wouldLockFragments(state, "f4")).toEqual(["f1"]);
    expect(wouldLockFragments(state, "f2")).toEqual([]);
  });

  it("never locks fragments that are merely discovered", () => {
    const state = addDiscoveredFragment(
      addDiscoveredFragment(makeBoardState(), "f1"),
      "f4",
    );

    expect(state.discoveredFragmentIds).toEqual(["f1", "f4"]);
    expect(state.lockedFragmentIds).toEqual([]);
    expect(state.preservedFragmentIds).toEqual([]);
  });

  it("computes locks from a candidate against the preserved set", () => {
    expect(computeLockedFragmentIds(["f1", "f2"], "f4")).toEqual(["f1"]);
    expect(computeLockedFragmentIds(["f1", "f2"], "f3")).toEqual([]);
  });

  it("refuses to preserve a locked-out fragment", () => {
    const locked = makeBoardState({
      discoveredFragmentIds: ["f1", "f4"],
      lockedFragmentIds: ["f1"],
    });
    const state = preserveFragment(locked, "f1");

    expect(state.preservedFragmentIds).toEqual([]);
  });
});

describe("pinning, dismissing and restoring", () => {
  it("pins a preserved fragment and unpins it again", () => {
    const state = preserveFragment(
      makeBoardState({ discoveredFragmentIds: ["f2"] }),
      "f2",
    );
    const pinned = pinFragment(state, "f2");
    expect(pinned.pinnedFragmentIds).toEqual(["f2"]);

    const unpinned = unpinFragment(pinned, "f2");
    expect(unpinned.pinnedFragmentIds).toEqual([]);
    expect(unpinned.preservedFragmentIds).toEqual(["f2"]);
  });

  it("removes a dismissed fragment from the profile but keeps it discovered", () => {
    const state = preserveFragment(
      makeBoardState({ discoveredFragmentIds: ["f2", "f3"] }),
      "f2",
    );
    const dismissed = dismissFragment(state, "f2");

    expect(dismissed.preservedFragmentIds).toEqual([]);
    expect(dismissed.dismissedFragmentIds).toEqual(["f2"]);
    expect(dismissed.discoveredFragmentIds).toContain("f2");
  });

  it("restores a dismissed fragment into the profile", () => {
    const dismissed = makeBoardState({
      discoveredFragmentIds: ["f2"],
      dismissedFragmentIds: ["f2"],
    });
    const restored = restoreDismissedFragment(dismissed, "f2");
    expect(restored.dismissedFragmentIds).toEqual([]);

    const preserved = restoreFragment(restored, "f2");
    expect(preserved.preservedFragmentIds).toEqual(["f2"]);
  });

  it("does not restore a locked fragment", () => {
    const locked = makeBoardState({
      discoveredFragmentIds: ["f1"],
      dismissedFragmentIds: ["f1"],
      lockedFragmentIds: ["f1"],
    });
    expect(restoreDismissedFragment(locked, "f1")).toBe(locked);
    expect(restoreFragment(locked, "f1")).toBe(locked);
  });

  it("keeps locks in place when a fragment is dismissed", () => {
    const state = preserveFragment(
      makeBoardState({ discoveredFragmentIds: ["f1", "f4"] }),
      "f1",
    );
    const conflicted = preserveFragment(state, "f4");
    expect(conflicted.lockedFragmentIds).toContain("f1");

    const dismissed = dismissFragment(conflicted, "f4");
    expect(dismissed.lockedFragmentIds).toContain("f1");
  });
});

describe("fragment content integrity", () => {
  it("has at least twelve fragments across all three themes", () => {
    expect(fragments.length).toBeGreaterThanOrEqual(12);
    const grouped = groupFragmentsByTheme(fragments);
    expect(grouped.caretaker.length).toBeGreaterThan(0);
    expect(grouped["escape-artist"].length).toBeGreaterThan(0);
    expect(grouped.stranger.length).toBeGreaterThan(0);
  });

  it("gives every fragment a stance of support, complicate, or contradict", () => {
    for (const fragment of fragments) {
      expect(["support", "complicate", "contradict"]).toContain(fragment.stance);
    }
  });

  it("declares incompatibilities symmetrically", () => {
    for (const fragment of fragments) {
      for (const otherId of fragment.incompatibleWith ?? []) {
        expect(areFragmentsIncompatible(fragment.id, otherId)).toBe(true);
      }
    }
  });

  it("can hold a full board of discovered fragments without conflicts", () => {
    const state = allDiscoveredState();
    expect(state.discoveredFragmentIds.length).toBe(fragments.length);
    expect(state.lockedFragmentIds).toEqual([]);
  });
});
