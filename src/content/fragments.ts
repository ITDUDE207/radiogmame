import type {
  Contradiction,
  IdentityTheme,
  MemoryFragment,
} from "@/types/game";

/** Display metadata for the three identity themes. */
export const identityThemes: {
  id: IdentityTheme;
  label: string;
  blurb: string;
}[] = [
  {
    id: "caretaker",
    label: "The Caretaker",
    blurb: "The one who stayed, paid, remembered, and never said so.",
  },
  {
    id: "escape-artist",
    label: "The Escape Artist",
    blurb: "The one who planned, packed light, and left a return ticket open.",
  },
  {
    id: "stranger",
    label: "The Stranger",
    blurb: "The one with three names, no face, and a room no one else entered.",
  },
];

/**
 * Thirteen memory fragments recovered across the archive. Each belongs to one
 * theme and carries a stance: support, complicate, or contradict.
 */
export const fragments: MemoryFragment[] = [
  {
    id: "f1",
    title: "The Standing Order",
    theme: "caretaker",
    stance: "support",
    summary:
      "She funded her mother's life in silence, monthly, and asked for nothing in return.",
    detail:
      "The transfer was set up years ago and never adjusted. It is the kind of care that is easiest to miss because it never announces itself.",
    artifactId: "a1",
    incompatibleWith: ["f4"],
  },
  {
    id: "f2",
    title: "Tuesdays, 8pm",
    theme: "caretaker",
    stance: "support",
    summary: "She kept a standing call with her mother, and kept it when it was hard.",
    detail:
      "The calls are short and rehearsed, but they are never skipped. She answers the hard question with a shorter one and books the next week anyway.",
    artifactId: "a2",
  },
  {
    id: "f3",
    title: "Withdrawing From the Table",
    theme: "caretaker",
    stance: "complicate",
    summary: "Near the end she stopped turning up, and started apologising by email.",
    detail:
      "The care did not stop, but her presence did. The same person who never missed a call begins to measure the distance in weeks she cannot keep straight.",
    artifactId: "a5",
  },
  {
    id: "f4",
    title: "Reliable Isn't a Compliment",
    theme: "caretaker",
    stance: "contradict",
    summary: "She called the care a job, and said she was going to stop doing it.",
    detail:
      "The letter is addressed to her mother and never sent. In it the standing order is not generosity; it is a role she can no longer carry quietly.",
    artifactId: "a9",
    incompatibleWith: ["f1"],
  },
  {
    id: "f5",
    title: "The Plan, Unnamed",
    theme: "escape-artist",
    stance: "support",
    summary: "She wrote a departure plan and refused to call it one.",
    detail:
      "Every step is logistical: end the job cleanly, quiet the money, book nothing. It reads like someone leaving for good, and careful enough that they knew it.",
    artifactId: "a4",
    incompatibleWith: ["f6"],
  },
  {
    id: "f6",
    title: "A Return Without a Date",
    theme: "escape-artist",
    stance: "complicate",
    summary:
      "She bought a one-way ticket and, in the same minute, a return with no date on it.",
    detail:
      "The terminal log records two transactions eleven seconds apart. She left with the option of coming back held open, and told at least one person she would use it.",
    artifactId: "a11",
    incompatibleWith: ["f5"],
  },
  {
    id: "f7",
    title: "Four-Month Terms",
    theme: "escape-artist",
    stance: "support",
    summary: "She searched for work that would let her be paid somewhere else, alone.",
    detail:
      "The filters say more than the pages do: no relocation required, no fixed address, a client who never meets you. She was designing an absence with a salary.",
    artifactId: "a6",
    incompatibleWith: ["f8"],
  },
  {
    id: "f8",
    title: "Two Cups, Two Boots",
    theme: "escape-artist",
    stance: "complicate",
    summary: "Her packing and playlists are all built for two people, not one.",
    detail:
      "One bag, no sentiment, that was the rule. The bag holds a second toothbrush, and the playlist she exported for someone was never sent but never deleted either.",
    artifactId: "a10",
    incompatibleWith: ["f7"],
  },
  {
    id: "f9",
    title: "The Third Name",
    theme: "stranger",
    stance: "support",
    summary: "She kept three identities so that one of them could vanish cleanly.",
    detail:
      "One name for the lease and the bank, one for the work, one with no name at all. The third exists so that a version of her can disappear without the others explaining it.",
    artifactId: "a17",
    incompatibleWith: ["f12"],
  },
  {
    id: "f10",
    title: "A Self Arranged to Be Looked At",
    theme: "stranger",
    stance: "complicate",
    summary:
      "She built an empty profile, then opened it sixty-one times to watch it stay empty.",
    detail:
      "No photo, no bio, three followers who are all her. The account is not a hiding place. It is a display case for a person who is not there.",
    artifactId: "a7",
    incompatibleWith: ["f13"],
  },
  {
    id: "f11",
    title: "The Six-Hour Gap",
    theme: "stranger",
    stance: "contradict",
    summary:
      "Six hours vanish from the machine, and it wakes to a photograph with no filename.",
    detail:
      "The log is complete except for the silence. Afterwards the machine sits awake for eleven minutes with nobody at it, and one song carries fourteen hours of a life.",
    artifactId: "a14",
  },
  {
    id: "f12",
    title: "The Two Letters to Nobody",
    theme: "stranger",
    stance: "support",
    summary:
      "The only letters she called honest were the ones with no recipient, signed with an invented name.",
    detail:
      "Eleven unsent letters. Two addressed to nobody, and those are the ones she could only finish by signing as someone else. She wanted to be read; she did not want to be recognised.",
    artifactId: "a19",
    incompatibleWith: ["f9"],
  },
  {
    id: "f13",
    title: "The Orderly Shutdown",
    theme: "stranger",
    stance: "support",
    summary:
      "Her last act on the machine was to delete the letter she wrote to her mother, then shut down cleanly.",
    detail:
      "One file to trash, one file reconsidered and restored, then a requested shutdown. Nothing was left running. She tidied the machine the way she tidied the flat.",
    artifactId: "a27",
    incompatibleWith: ["f10"],
  },
];

export const fragmentsById: Record<string, MemoryFragment> = Object.fromEntries(
  fragments.map((fragment) => [fragment.id, fragment]),
);

/**
 * Five contradictions. Each fires once every fragment it names has been
 * discovered, and each demands a choice between two incompatible readings.
 */
export const contradictions: Contradiction[] = [
  {
    id: "c1",
    title: "One Way",
    prompt:
      "The plan says she was leaving for good. The ticket says she bought a return and left the date open.",
    fragmentIds: ["f5", "f6"],
    interpretations: [
      {
        id: "c1-a",
        label: "She was leaving for good.",
        preservesFragmentId: "f5",
        locksFragmentIds: ["f6"],
        consequence:
          "The return leg becomes a reflex, not an intention. You keep the plan and lose the promise.",
      },
      {
        id: "c1-b",
        label: "She meant to come back.",
        preservesFragmentId: "f6",
        locksFragmentIds: ["f5"],
        consequence:
          "The plan becomes a rehearsal she never finished. You keep the promise and lose the certainty.",
      },
    ],
  },
  {
    id: "c2",
    title: "Two Toothbrushes",
    prompt:
      "She searched for work that would let her be alone. She packed for two and exported a playlist for someone who never received it.",
    fragmentIds: ["f7", "f8"],
    interpretations: [
      {
        id: "c2-a",
        label: "She was going alone.",
        preservesFragmentId: "f7",
        locksFragmentIds: ["f8"],
        consequence:
          "The second toothbrush becomes an accident of habit. You keep the clean escape.",
      },
      {
        id: "c2-b",
        label: "Someone was going with her.",
        preservesFragmentId: "f8",
        locksFragmentIds: ["f7"],
        consequence:
          "The solo searches become a cover story. You keep the second cup on the table.",
      },
    ],
  },
  {
    id: "c3",
    title: "The Second Coat",
    prompt:
      "She paid for her mother's life without being asked. She wrote that reliability is a job she intends to quit.",
    fragmentIds: ["f1", "f4"],
    interpretations: [
      {
        id: "c3-a",
        label: "The care was love.",
        preservesFragmentId: "f1",
        locksFragmentIds: ["f4"],
        consequence:
          "The unsent letter becomes exhaustion, not accusation. You keep the standing order.",
      },
      {
        id: "c3-b",
        label: "The care was a job.",
        preservesFragmentId: "f4",
        locksFragmentIds: ["f1"],
        consequence:
          "The monthly transfer becomes maintenance, not devotion. You keep the letter.",
      },
    ],
  },
  {
    id: "c4",
    title: "The Third Name",
    prompt:
      "She built a self no one could find. She wrote two honest letters and signed them with a name she invented, hoping someone would read them.",
    fragmentIds: ["f9", "f12"],
    interpretations: [
      {
        id: "c4-a",
        label: "She wanted to disappear.",
        preservesFragmentId: "f9",
        locksFragmentIds: ["f12"],
        consequence:
          "The letters to nobody become drafts, not messages. You keep the third name.",
      },
      {
        id: "c4-b",
        label: "She wanted to be found.",
        preservesFragmentId: "f12",
        locksFragmentIds: ["f9"],
        consequence:
          "The third name becomes a hiding place she outgrew. You keep the invented signature.",
      },
    ],
  },
  {
    id: "c5",
    title: "The Last Login",
    prompt:
      "She arranged a version of herself to be looked at. Her last act on the machine was to delete the letter and shut it down clean.",
    fragmentIds: ["f10", "f13"],
    interpretations: [
      {
        id: "c5-a",
        label: "She left it for someone to find.",
        preservesFragmentId: "f10",
        locksFragmentIds: ["f13"],
        consequence:
          "The tidy shutdown becomes a gesture toward an audience. You keep the empty profile.",
      },
      {
        id: "c5-b",
        label: "She was tidying up after herself.",
        preservesFragmentId: "f13",
        locksFragmentIds: ["f10"],
        consequence:
          "The empty profile becomes a habit, not a message. You keep the orderly shutdown.",
      },
    ],
  },
];

export const contradictionsById: Record<string, Contradiction> =
  Object.fromEntries(contradictions.map((c) => [c.id, c]));
