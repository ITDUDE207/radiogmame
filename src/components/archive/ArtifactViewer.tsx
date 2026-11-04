"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { artifactTypeLabels, formatTimestamp } from "@/components/ui/tokens";
import { fragmentThemeLabel } from "@/components/identity/labels";
import type { Artifact, MemoryFragment } from "@/types/game";

export interface ArtifactViewerProps {
  artifact: Artifact;
  revealedFragment: MemoryFragment | null;
  linkedArtifacts: Artifact[];
  playerTags: string[];
  playerLinks: { from: string; to: string }[];
  onAddTag: (tag: string) => void;
  onOpenLinked: (artifactId: string) => void;
  onRemoveLink: (from: string, to: string) => void;
  onClose: () => void;
}

export function ArtifactViewer({
  artifact,
  revealedFragment,
  linkedArtifacts,
  playerTags,
  playerLinks,
  onAddTag,
  onOpenLinked,
  onRemoveLink,
  onClose,
}: ArtifactViewerProps) {
  const [draftTag, setDraftTag] = useState("");

  return (
    <article
      data-testid="artifact-viewer"
      aria-labelledby="artifact-viewer-title"
      className="flex h-full min-h-0 flex-col"
    >
      <header className="flex items-start justify-between gap-3 border-b border-edge px-3 py-2.5">
        <div className="min-w-0">
          <p className="text-[0.6rem] tracking-[0.2em] text-ink-faint uppercase">
            {artifactTypeLabels[artifact.type]}
          </p>
          <h3
            id="artifact-viewer-title"
            className="mt-0.5 text-sm leading-snug text-ink"
          >
            {artifact.title}
          </h3>
          <p className="mt-1 text-[0.65rem] text-ink-faint">
            {artifact.source} ·{" "}
            <time dateTime={artifact.timestamp}>
              {formatTimestamp(artifact.timestamp)}
            </time>
          </p>
        </div>
        <Button variant="ghost" onClick={onClose} aria-label="Close artifact">
          ✕
        </Button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <pre
          data-testid="artifact-body"
          className="font-mono text-xs leading-relaxed whitespace-pre-wrap text-ink-muted"
        >
          {artifact.body}
        </pre>

        <section className="mt-4 border-t border-edge/60 pt-3">
          <h4 className="text-[0.6rem] tracking-[0.2em] text-ink-faint uppercase">
            Archive tags
          </h4>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {artifact.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-sm border border-edge-strong px-1.5 py-0.5 text-[0.6rem] text-ink-muted"
              >
                {tag}
              </li>
            ))}
            {playerTags.map((tag) => (
              <li
                key={`player-${tag}`}
                className="rounded-sm border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-[0.6rem] text-accent"
              >
                {tag} · you
              </li>
            ))}
          </ul>
          <form
            className="mt-2 flex gap-1.5"
            onSubmit={(event) => {
              event.preventDefault();
              onAddTag(draftTag);
              setDraftTag("");
            }}
          >
            <label htmlFor="tag-input" className="sr-only">
              Add your own tag
            </label>
            <input
              id="tag-input"
              value={draftTag}
              onChange={(event) => setDraftTag(event.target.value)}
              placeholder="add a tag…"
              className="min-w-0 flex-1 rounded-sm border border-edge-strong bg-shell px-2 py-1 text-xs text-ink placeholder:text-ink-faint"
            />
            <Button type="submit" variant="ghost">
              Tag
            </Button>
          </form>
        </section>

        {revealedFragment ? (
          <section
            data-testid="revealed-fragment"
            className="mt-4 rounded-sm border border-accent/30 bg-accent/[0.06] p-2.5"
          >
            <p className="text-[0.6rem] tracking-[0.2em] text-accent uppercase">
              Fragment recovered — {fragmentThemeLabel(revealedFragment.theme)}
            </p>
            <p className="mt-1 text-xs text-ink">{revealedFragment.title}</p>
            <p className="mt-1 text-[0.7rem] leading-relaxed text-ink-muted">
              {revealedFragment.summary}
            </p>
          </section>
        ) : null}

        <section className="mt-4 border-t border-edge/60 pt-3">
          <h4 className="text-[0.6rem] tracking-[0.2em] text-ink-faint uppercase">
            Linked artifacts ({linkedArtifacts.length})
          </h4>
          {linkedArtifacts.length === 0 ? (
            <p className="mt-1.5 text-[0.7rem] text-ink-faint">
              No links found. Use the link buttons in the file list to draw one.
            </p>
          ) : (
            <ul className="mt-1.5 flex flex-col gap-1">
              {linkedArtifacts.map((linked) => {
                const manual = playerLinks.some(
                  (link) =>
                    (link.from === artifact.id && link.to === linked.id) ||
                    (link.to === artifact.id && link.from === linked.id),
                );
                return (
                  <li
                    key={linked.id}
                    className="flex items-center justify-between gap-2 rounded-sm border border-edge/70 px-2 py-1"
                  >
                    <button
                      type="button"
                      onClick={() => onOpenLinked(linked.id)}
                      className="min-w-0 flex-1 truncate text-left text-[0.7rem] text-ink-muted hover:text-accent"
                    >
                      <span aria-hidden="true" className="mr-1.5">
                        ↳
                      </span>
                      {linked.title}
                    </button>
                    {manual ? (
                      <Button
                        variant="ghost"
                        aria-label={`Remove link to ${linked.title}`}
                        onClick={() => onRemoveLink(artifact.id, linked.id)}
                      >
                        unlink
                      </Button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </article>
  );
}
