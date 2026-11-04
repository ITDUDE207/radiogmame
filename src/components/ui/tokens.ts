import type { ArtifactType, IdentityTheme } from "@/types/game";

export const artifactTypeLabels: Record<ArtifactType, string> = {
  email: "Email",
  "browser-tab": "Browser Tab",
  playlist: "Playlist",
  "note-draft": "Note Draft",
  "deleted-file": "Deleted File",
  "chat-message": "Chat Message",
  "photo-caption": "Photo Caption",
  "system-log": "System Log",
};

/** Single-character glyphs keep the file list compact at 768px. */
export const artifactTypeGlyphs: Record<ArtifactType, string> = {
  email: "@",
  "browser-tab": "◇",
  playlist: "♪",
  "note-draft": "¶",
  "deleted-file": "⌫",
  "chat-message": "⌗",
  "photo-caption": "▣",
  "system-log": "›",
};

export const themeLabels: Record<IdentityTheme, string> = {
  caretaker: "The Caretaker",
  "escape-artist": "The Escape Artist",
  stranger: "The Stranger",
};

export const themeAccentClasses: Record<IdentityTheme, string> = {
  caretaker: "text-caretaker border-caretaker/40 bg-caretaker/10",
  "escape-artist": "text-escape border-escape/40 bg-escape/10",
  stranger: "text-stranger border-stranger/40 bg-stranger/10",
};

export const themeDotClasses: Record<IdentityTheme, string> = {
  caretaker: "bg-caretaker",
  "escape-artist": "bg-escape",
  stranger: "bg-stranger",
};

/** Format an ISO timestamp as a stable, locale-independent string. */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  const pad = (value: number) => String(value).padStart(2, "0");
  return [
    `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`,
    `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`,
  ].join(" ");
}
