import { describe, expect, it } from "vitest";
import { endings, defaultEndingId } from "@/content/endings";
import { contradictions, fragments } from "@/content/fragments";
import {
  canCommitIdentity,
  computeIdentityProfile,
  describeProfile,
  findDominantThemes,
  selectEnding,
} from "@/lib/ending";
import { resolveContradiction } from "@/lib/contradiction";
import { dismissFragment, preserveFragment } from "@/lib/fragment";
import { allDiscoveredState, makeContradictionState } from "@/__tests__/helpers";

/** Settle every contradiction, choosing the first option on each. */
function settleEverything(state: ReturnType<typeof allDiscoveredState>) {
  let next = state;
  for (const contradiction of contradictions) {
    next = resolveContradiction(
      next,
      contradiction.id,
      contradiction.interpretations[0].id,
    );
  }
  return next;
}

/** Take a set of fragments off the profile without releasing any locks. */
function dismissMany(state: ReturnType<typeof allDiscoveredState>, ids: string[]) {
  let next = state;
  for (const id of ids) next = dismissFragment(next, id);
  return next;
}

describe("identity profile", () => {
  it("counts preserved fragments by theme", () => {
    let state = allDiscoveredState();
    state = preserveFragment(state, "f1"); // caretaker
    state = preserveFragment(state, "f2"); // caretaker
    state = preserveFragment(state, "f5"); // escape-artist

    const profile = computeIdentityProfile(state);

    expect(profile.themeCounts.caretaker).toBe(2);
    expect(profile.themeCounts["escape-artist"]).toBe(1);
    expect(profile.themeCounts.stranger).toBe(0);
    expect(profile.dominantTheme).toBe("caretaker");
  });

  it("excludes locked fragments from the counts", () => {
    let state = allDiscoveredState();
    state = preserveFragment(state, "f1");
    state = preserveFragment(state, "f4"); // locks f1

    const profile = computeIdentityProfile(state);

    expect(profile.preservedFragmentIds).not.toContain("f1");
    expect(profile.lockedFragmentIds).toContain("f1");
  });

  it("reports a balanced profile when themes tie", () => {
    let state = allDiscoveredState();
    state = preserveFragment(state, "f1"); // caretaker
    state = preserveFragment(state, "f5"); // escape-artist
    state = preserveFragment(state, "f9"); // stranger

    const profile = computeIdentityProfile(state);

    expect(profile.isBalanced).toBe(true);
    expect(profile.dominantTheme).toBeNull();
    expect(profile.dominantThemes).toEqual([
      "caretaker",
      "escape-artist",
      "stranger",
    ]);
  });

  it("reports no dominant theme when nothing is preserved", () => {
    const profile = computeIdentityProfile(allDiscoveredState());
    expect(profile.dominantThemes).toEqual([]);
    expect(profile.dominantTheme).toBeNull();
    expect(profile.isBalanced).toBe(false);
  });

  it("tracks unresolved contradictions", () => {
    const profile = computeIdentityProfile(allDiscoveredState());
    expect(profile.unresolvedContradictionIds).toHaveLength(contradictions.length);
  });

  it("finds every theme when counts tie at the top", () => {
    expect(
      findDominantThemes({ caretaker: 2, "escape-artist": 2, stranger: 1 }),
    ).toEqual(["caretaker", "escape-artist"]);
  });
});

describe("selecting an ending", () => {
  it("offers at least three endings and a fallback", () => {
    expect(endings.length).toBeGreaterThanOrEqual(3);
    expect(endings.some((ending) => ending.id === defaultEndingId)).toBe(true);
  });

  it("selects the caretaker ending for a caretaker-dominant profile", () => {
    // Settling everything leaves caretaker 3 (f1, f2, f3). Clear the other two
    // readings off the profile so the caretaker reading dominates.
    let state = settleEverything(allDiscoveredState());
    state = dismissMany(state, ["f5", "f7", "f9", "f10", "f11"]);

    const profile = computeIdentityProfile(state);
    expect(profile.dominantTheme).toBe("caretaker");
    expect(profile.unresolvedContradictionIds).toEqual([]);
    expect(selectEnding(profile).id).toBe("caretaker");
  });

  it("selects the escape artist ending for an escape-dominant profile", () => {
    // Settling everything leaves escape artist 2 (f5, f7). Clear the rest.
    let state = settleEverything(allDiscoveredState());
    state = dismissMany(state, ["f2", "f3", "f9", "f10", "f11"]);

    const profile = computeIdentityProfile(state);
    expect(profile.dominantTheme).toBe("escape-artist");
    expect(selectEnding(profile).id).toBe("escape-artist");
  });

  it("selects the stranger ending for a stranger-dominant profile", () => {
    // Settling everything leaves stranger 3 (f9, f10, f11). Clear the rest.
    let state = settleEverything(allDiscoveredState());
    state = dismissMany(state, ["f2", "f3", "f5", "f7"]);

    const profile = computeIdentityProfile(state);
    expect(profile.dominantTheme).toBe("stranger");
    expect(selectEnding(profile).id).toBe("stranger");
  });

  it("selects the composite ending when the themes balance", () => {
    // One reading per theme: f1 (caretaker), f5 (escape), f9 (stranger).
    let state = settleEverything(allDiscoveredState());
    state = dismissMany(state, ["f2", "f3", "f7", "f10", "f11"]);

    const profile = computeIdentityProfile(state);
    expect(profile.themeCounts).toEqual({
      caretaker: 1,
      "escape-artist": 1,
      stranger: 1,
    });
    expect(profile.isBalanced).toBe(true);
    expect(selectEnding(profile).id).toBe("composite");
  });

  it("selects the not-found ending when too much is left unresolved", () => {
    const state = makeContradictionState({
      discoveredArtifactIds: allDiscoveredState().discoveredArtifactIds,
      discoveredFragmentIds: fragments.map((fragment) => fragment.id),
      preservedFragmentIds: ["f1"],
      lockedFragmentIds: [],
    });

    const profile = computeIdentityProfile(state);
    expect(profile.unresolvedContradictionIds.length).toBeGreaterThanOrEqual(3);
    expect(selectEnding(profile).id).toBe("not-found");
  });

  it("prefers not-found over a dominant theme when enough is unresolved", () => {
    let state = allDiscoveredState();
    state = preserveFragment(state, "f1");
    state = preserveFragment(state, "f2");
    state = preserveFragment(state, "f3");

    // Nothing resolved: all five conflicts still open.
    const profile = computeIdentityProfile(state);
    expect(profile.unresolvedContradictionIds.length).toBeGreaterThanOrEqual(3);
    expect(selectEnding(profile).id).toBe("not-found");
  });

  it("moves from not-found to a themed ending as conflicts are settled", () => {
    let state = allDiscoveredState();
    state = preserveFragment(state, "f1");
    state = preserveFragment(state, "f2");
    state = preserveFragment(state, "f3");

    const before = computeIdentityProfile(state);
    expect(selectEnding(before).id).toBe("not-found");

    state = resolveContradiction(state, "c1", "c1-a");
    state = resolveContradiction(state, "c2", "c2-a");
    state = resolveContradiction(state, "c3", "c3-a");

    const profile = computeIdentityProfile(state);
    expect(profile.unresolvedContradictionIds.length).toBe(2);
    expect(selectEnding(profile).id).toBe("caretaker");
  });

  it("always returns an ending, even for an empty profile", () => {
    const ending = selectEnding(computeIdentityProfile(makeContradictionState()));
    expect(ending).toBeDefined();
    expect(ending.id).toBe(defaultEndingId);
  });

  it("gives every ending original prose", () => {
    for (const ending of endings) {
      expect(ending.paragraphs.length).toBeGreaterThanOrEqual(3);
      expect(ending.epigraph.length).toBeGreaterThan(20);
      expect(ending.paragraphs.every((paragraph) => paragraph.length > 40)).toBe(true);
    }
  });
});

describe("committing an identity", () => {
  it("refuses a commit with nothing preserved", () => {
    expect(canCommitIdentity(allDiscoveredState())).toBe(false);
  });

  it("allows a commit once a fragment is held", () => {
    const state = preserveFragment(allDiscoveredState(), "f1");
    expect(canCommitIdentity(state)).toBe(true);
  });

  it("describes the current profile in one line", () => {
    let state = allDiscoveredState();
    state = preserveFragment(state, "f1");
    state = preserveFragment(state, "f2");
    expect(describeProfile(computeIdentityProfile(state))).toContain("caretaker");

    expect(describeProfile(computeIdentityProfile(makeContradictionState()))).toBe(
      "No version of Mara is being held.",
    );
  });
});
