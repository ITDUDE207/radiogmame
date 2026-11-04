import { beforeEach, describe, expect, it } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GameClient } from "@/components/GameClient";
import { useGameStore } from "@/state/game-store";
import { fragments } from "@/content/fragments";

/**
 * Walks the whole vertical slice: intro -> archive -> open artifacts ->
 * discover fragments -> resolve a contradiction -> commit an ending.
 */
describe("Error 404: Self Not Found — vertical slice", () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it("starts on the intro screen and explains the premise", async () => {
    render(<GameClient />);

    const premise = screen.getByTestId("intro-premise");
    const wordCount = premise.textContent!.trim().split(/\s+/).length;

    expect(wordCount).toBeLessThanOrEqual(80);
    expect(screen.getByRole("heading", { name: /error 404/i })).toBeInTheDocument();
    expect(screen.getByTestId("start-game")).toBeInTheDocument();
  });

  it("runs the full loop from intro to ending", async () => {
    const user = userEvent.setup();
    render(<GameClient />);

    // 1. Start the game.
    await user.click(screen.getByTestId("start-game"));

    // The persistent header appears with chapter and fragment count.
    const header = screen.getByTestId("game-header");
    expect(within(header).getByText(/chapter one/i)).toBeInTheDocument();
    expect(screen.getByTestId("header-fragment-count")).toHaveTextContent(
      `0/${fragments.length}`,
    );

    // 2. Open artifacts through the store to keep the test focused on the loop
    //    rather than on scrolling a long file list. Wrapped in act() so React
    //    flushes the resulting re-render.
    await act(async () => {
      useGameStore.getState().openArtifact("a4"); // reveals f5 — the plan to leave
      useGameStore.getState().openArtifact("a11"); // reveals f6 — the return ticket
    });

    const afterDiscover = useGameStore.getState();
    expect(afterDiscover.discoveredFragmentIds).toEqual(
      expect.arrayContaining(["f5", "f6"]),
    );

    // 3. The Resolve Memory panel surfaces the contradiction.
    const contradiction = screen.getByTestId("active-contradiction");
    expect(contradiction).toBeInTheDocument();
    expect(within(contradiction).getByText(/^one way$/i)).toBeInTheDocument();

    // 4. Resolve it by preserving the return ticket.
    await user.click(screen.getByTestId("resolve-c1-b"));

    const afterResolve = useGameStore.getState();
    expect(afterResolve.resolvedContradictionIds).toContain("c1");
    expect(afterResolve.preservedFragmentIds).toContain("f6");
    expect(afterResolve.lockedFragmentIds).toContain("f5");

    // 5. Open the Identity Board and confirm the profile reflects the choice.
    await user.click(screen.getByRole("button", { name: /identity board/i }));

    const profile = screen.getByTestId("identity-profile");
    expect(within(profile).getByTestId("identity-verdict")).toBeInTheDocument();
    expect(screen.getByTestId("fragment-card-f6")).toBeInTheDocument();
    expect(screen.getByTestId("fragment-card-f5")).toHaveAttribute(
      "data-state",
      "locked",
    );

    // 6. Commit and reach an ending.
    await user.click(screen.getByTestId("commit-identity"));

    expect(screen.getByTestId("ending-panel")).toBeInTheDocument();
    expect(screen.getByTestId("ending-title")).toBeInTheDocument();
    expect(useGameStore.getState().endingId).toBeTruthy();
    expect(useGameStore.getState().committed).toBe(true);
  });

  it("can reach three different endings through different choices", async () => {
    const commit = (openIds: string[], resolutions: [string, string][]) => {
      useGameStore.getState().resetGame();
      useGameStore.getState().startGame();
      for (const id of openIds) useGameStore.getState().openArtifact(id);
      for (const [contradictionId, interpretationId] of resolutions) {
        useGameStore.getState().resolveActiveContradiction(
          contradictionId,
          interpretationId,
        );
      }
      useGameStore.getState().commitIdentity();
      return useGameStore.getState().endingId;
    };

    // Caretaker: preserve f1, f2, f3 and settle enough conflicts.
    const caretaker = commit(
      ["a1", "a2", "a3", "a4", "a11", "a9"],
      [
        ["c1", "c1-a"],
        ["c3", "c3-a"],
      ],
    );

    // Escape artist: preserve f5, f7, f8.
    const escapeArtist = commit(
      ["a4", "a11", "a6", "a10"],
      [["c1", "c1-a"]],
    );

    // Stranger: preserve f9, f10, f12.
    const stranger = commit(["a17", "a7", "a19"], []);

    const reached = new Set([caretaker, escapeArtist, stranger]);
    expect(reached.size).toBeGreaterThanOrEqual(3);
  });

  it("offers a reset that returns the player to the intro screen", async () => {
    const user = userEvent.setup();
    render(<GameClient />);

    await user.click(screen.getByTestId("start-game"));
    await user.click(screen.getByRole("button", { name: /reset game/i }));

    expect(screen.getByTestId("intro-premise")).toBeInTheDocument();
    expect(useGameStore.getState().discoveredArtifactIds).toEqual([]);
  });

  it("navigates between views with the keyboard", async () => {
    const user = userEvent.setup();
    render(<GameClient />);

    await user.click(screen.getByTestId("start-game"));
    expect(screen.getByTestId("artifact-list")).toBeInTheDocument();

    await user.keyboard("b");
    expect(screen.getByTestId("identity-profile")).toBeInTheDocument();

    await user.keyboard("a");
    expect(screen.getByTestId("artifact-list")).toBeInTheDocument();
  });

  it("recovers a fragment by clicking an artifact row", async () => {
    const user = userEvent.setup();
    render(<GameClient />);

    await user.click(screen.getByTestId("start-game"));
    await user.click(screen.getByTestId("artifact-row-a1"));

    expect(screen.getByTestId("artifact-viewer")).toBeInTheDocument();
    expect(useGameStore.getState().discoveredFragmentIds).toContain("f1");
    expect(screen.getByTestId("header-fragment-count")).toHaveTextContent(
      `1/${fragments.length}`,
    );  
  });

  it("draws a link between two artifacts from the file list", async () => {
    const user = userEvent.setup();
    render(<GameClient />);

    await user.click(screen.getByTestId("start-game"));

    await user.click(screen.getByTestId("artifact-link-a13"));
    expect(useGameStore.getState().linkSourceId).toBe("a13");

    await user.click(screen.getByTestId("artifact-link-a15"));

    const links = useGameStore.getState().playerLinks;
    expect(links).toEqual([{ from: "a13", to: "a15" }]);
    expect(useGameStore.getState().linkSourceId).toBeNull();
  });
});
