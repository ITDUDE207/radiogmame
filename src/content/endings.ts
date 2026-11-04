import type { Ending } from "@/types/game";

/** The ending used when nothing else matches, so selection is always total. */
export const defaultEndingId = "composite";

/**
 * Five terminal readings of Mara. Selection is data-driven: `selectEnding` in
 * `src/lib/ending.ts` evaluates conditions from highest priority down.
 */
export const endings: Ending[] = [
  {
    id: "not-found",
    title: "Error 404: Self Not Found",
    priority: 100,
    condition: { minUnresolvedContradictions: 3 },
    epigraph: "You can restore a file. You cannot restore a person by leaving the file open.",
    paragraphs: [
      "You commit nothing. The archive keeps its contradictions, filed side by side, both versions equally true and equally unhelpful.",
      "The reconstruction that results is not a person. It is a set of instructions for assembling one, with three steps missing and two steps repeated.",
      "Somewhere in the recovered space there is a letter with no recipient and a name that was never hers. It is still there. It will still be there.",
      "The system logs the session and closes. The title of the record is the only part that is accurate.",
    ],
  },
  {
    id: "caretaker",
    title: "The Standing Order",
    priority: 50,
    condition: { dominantTheme: "caretaker" },
    epigraph: "Care is a thing you do on a schedule, so that it cannot be mistaken for feeling.",
    paragraphs: [
      "You keep the version of Mara who stayed. The transfer runs on the fourth of every month, and the phone rings at eight on a Tuesday, and neither of those things requires her to be in the room.",
      "The letter she wrote and did not send becomes a bad night rather than a verdict. You decide that people are allowed to mean what they say and still do the opposite.",
      "Her mother's phone will ring once, on the fourth, and then not again. That is not a tragedy. It is a standing order.",
      "The archive closes with the flat described in her handwriting: third drawer sticks, boiler is loud and then fine, spare key under the ceramic bowl. Instructions for whoever comes next.",
    ],
  },
  {
    id: "escape-artist",
    title: "The Long Way Round",
    priority: 50,
    condition: { dominantTheme: "escape-artist" },
    epigraph: "She bought a ticket out and a ticket back in the same minute, and told no one which one she was holding.",
    paragraphs: [
      "You keep the version of Mara who was leaving, and who left the door open anyway. Both facts sit in the same eleven seconds of terminal log.",
      "The taxi took the long way and she said it didn't matter, which is what people say when they are deciding something and want the decision to look like weather.",
      "The playlist exported for someone is still in the folder, still unshared, still titled for when you're here again. You let that stand as the thing she would have said if she had been better at the saying.",
      "Somewhere a return leg is still open, dated never. The seat is unallocated. Terminal assigns at gate.",
    ],
  },
  {
    id: "stranger",
    title: "Three Followers",
    priority: 50,
    condition: { dominantTheme: "stranger" },
    epigraph: "She made a place where nobody was, and visited it sixty-one times to check that it stayed that way.",
    paragraphs: [
      "You keep the version of Mara who had three names and used none of them in the same room.",
      "The account with no photo keeps its three followers, all of them her. It is not a hiding place. It is a room she built and then stood in, watching the doorway.",
      "The six hours the machine does not remember stay unremembered. The photograph with no filename is opened once more and closed, and the machine is left awake for eleven minutes with nobody at it.",
      "She tidied the flat, tidied the drive, deleted the letter, and shut down clean. You decide that was not a message. You also keep the possibility that it was.",
    ],
  },
  {
    id: "composite",
    title: "A Reasonable Approximation",
    priority: 10,
    condition: { requiresBalancedThemes: true },
    epigraph: "A reconstruction is not a person. It is the shape a person leaves when the light is at the wrong angle.",
    paragraphs: [
      "You keep all three of her, in roughly equal measure, which is to say you keep none of them whole.",
      "The caretaker pays the rent. The escape artist checks the gate. The stranger sits in the account with no name and waits to see who logs in.",
      "No single version of Mara survives the reconstruction, and the archive does not complain. It was never built to produce a person. It was built to hold what was left over.",
      "You close the session. The profile you assembled is accurate in the way a photograph of a moving subject is accurate: it is her, at that speed, from here.",
    ],
  },
];

export const endingsById: Record<string, Ending> = Object.fromEntries(
  endings.map((ending) => [ending.id, ending]),
);
