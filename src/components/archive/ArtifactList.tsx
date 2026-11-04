"use client";

import { artifactTypeGlyphs, artifactTypeLabels, formatTimestamp } from "@/components/ui/tokens";
import type { Artifact } from "@/types/game";

export interface ArtifactListProps {
  artifacts: Artifact[];
  selectedArtifactId: string | null;
  discoveredArtifactIds: string[];
  linkSourceId: string | null;
  onOpenArtifact: (artifactId: string) => void;
  onLinkTarget: (artifactId: string) => void;
}

export function ArtifactList({
  artifacts,
  selectedArtifactId,
  discoveredArtifactIds,
  linkSourceId,
  onOpenArtifact,
  onLinkTarget,
}: ArtifactListProps) {
  const discovered = new Set(discoveredArtifactIds);

  if (artifacts.length === 0) {
    return (
      <p className="px-3 py-6 text-center text-xs text-ink-faint">
        Nothing recovered in this folder yet.
      </p>
    );
  }

  return (
    <ul role="list" className="divide-y divide-edge/60" data-testid="artifact-list">
      {artifacts.map((artifact) => {
        const isOpen = artifact.id === selectedArtifactId;
        const isSeen = discovered.has(artifact.id);
        const isLinkSource = artifact.id === linkSourceId;
        return (
          <li key={artifact.id}>
            <div
              className={[
                "flex items-stretch",
                isOpen ? "bg-white/[0.04]" : "hover:bg-white/[0.02]",
              ].join(" ")}
            >
              <button
                type="button"
                data-testid={`artifact-row-${artifact.id}`}
                onClick={() =>
                  linkSourceId ? onLinkTarget(artifact.id) : onOpenArtifact(artifact.id)
                }
                aria-current={isOpen ? "true" : undefined}
                className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2 text-left"
              >
                <span
                  aria-hidden="true"
                  className={[
                    "w-4 shrink-0 text-center text-sm",
                    isSeen ? "text-accent/80" : "text-ink-faint",
                  ].join(" ")}
                >
                  {artifactTypeGlyphs[artifact.type]}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={[
                      "block truncate text-xs",
                      isSeen ? "text-ink" : "text-ink-muted",
                    ].join(" ")}
                  >
                    {artifact.title}
                  </span>
                  <span className="mt-0.5 block truncate text-[0.6rem] tracking-wide text-ink-faint">
                    {artifactTypeLabels[artifact.type]} · {artifact.source}
                  </span>
                </span>
                <time
                  dateTime={artifact.timestamp}
                  className="hidden shrink-0 text-[0.6rem] text-ink-faint sm:block"
                >
                  {formatTimestamp(artifact.timestamp)}
                </time>
              </button>

              <button
                type="button"
                aria-label={
                  isLinkSource
                    ? `Selected as link source: ${artifact.title}`
                    : `Link ${artifact.title} to another artifact`
                }
                data-testid={`artifact-link-${artifact.id}`}
                onClick={() => onLinkTarget(artifact.id)}
                className={[
                  "shrink-0 border-l border-edge/60 px-2 text-[0.6rem] uppercase transition-colors",
                  isLinkSource
                    ? "bg-accent/20 text-accent"
                    : "text-ink-faint hover:bg-white/5 hover:text-accent",
                ].join(" ")}
              >
                link
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
