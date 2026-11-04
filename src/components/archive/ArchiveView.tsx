"use client";

import { useMemo, useState } from "react";
import { archiveFolders, artifactsById } from "@/content/artifacts";
import { fragmentsById } from "@/content/fragments";
import { getArtifactsInFolder, getLinkedArtifacts, searchArtifacts } from "@/lib/archive";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { FolderList } from "@/components/archive/FolderList";
import { ArtifactList } from "@/components/archive/ArtifactList";
import { ArtifactViewer } from "@/components/archive/ArtifactViewer";
import { ResolveMemoryPanel } from "@/components/contradictions/ResolveMemoryPanel";
import { useGameStore } from "@/state/game-store";

export function ArchiveView() {
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const discoveredArtifactIds = useGameStore((s) => s.discoveredArtifactIds);
  const selectedArtifactId = useGameStore((s) => s.selectedArtifactId);
  const linkSourceId = useGameStore((s) => s.linkSourceId);
  const playerLinks = useGameStore((s) => s.playerLinks);
  const playerTags = useGameStore((s) => s.playerTags);
  const lastRevealedFragmentId = useGameStore((s) => s.lastRevealedFragmentId);

  const openArtifact = useGameStore((s) => s.openArtifact);
  const closeArtifact = useGameStore((s) => s.closeArtifact);
  const addPlayerTag = useGameStore((s) => s.addPlayerTag);
  const beginLink = useGameStore((s) => s.beginLink);
  const completeLink = useGameStore((s) => s.completeLink);
  const removeLink = useGameStore((s) => s.removeLink);

  const visibleArtifacts = useMemo(() => {
    const pool = activeFolderId ? getArtifactsInFolder(activeFolderId) : undefined;
    return searchArtifacts(query, pool);
  }, [activeFolderId, query]);

  const selectedArtifact = useMemo(
    () => (selectedArtifactId ? artifactsById[selectedArtifactId] ?? null : null),
    [selectedArtifactId],
  );

  const linkedArtifacts = useMemo(
    () => (selectedArtifact ? getLinkedArtifacts(selectedArtifact.id, playerLinks) : []),
    [selectedArtifact, playerLinks],
  );

  const revealedFragment =
    lastRevealedFragmentId && selectedArtifactId
      ? fragmentsById[lastRevealedFragmentId] ?? null
      : null;

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[14rem_minmax(0,1fr)_minmax(0,1.15fr)]">
      <Panel className="order-2 min-h-0 overflow-y-auto md:order-2 xl:order-1">
        <PanelHeader title="File system" meta="/recovered" />
        <FolderList
          folders={archiveFolders}
          artifacts={searchArtifacts("")}
          activeFolderId={activeFolderId}
          onSelectFolder={(folderId) => {
            setActiveFolderId(folderId);
            closeArtifact();
          }}
        />
      </Panel>

      <Panel className="order-1 flex min-h-0 flex-col md:order-1 xl:order-2">
        <PanelHeader
          title={activeFolderId ?? "All items"}
          meta={`${visibleArtifacts.length} recovered`}
          actions={
            linkSourceId ? (
              <span className="text-[0.6rem] tracking-wide text-accent uppercase">
                pick a target
              </span>
            ) : null
          }
        />
        <div className="border-b border-edge px-2 py-2">
          <label htmlFor="archive-search" className="sr-only">
            Search the archive
          </label>
          <input
            id="archive-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="search titles, bodies, tags…"
            className="w-full rounded-sm border border-edge-strong bg-shell px-2 py-1.5 text-xs text-ink placeholder:text-ink-faint"
          />
        </div>
        <div className="max-h-[26rem] min-h-0 flex-1 overflow-y-auto xl:max-h-none">
          <ArtifactList
            artifacts={visibleArtifacts}
            selectedArtifactId={selectedArtifactId}
            discoveredArtifactIds={discoveredArtifactIds}
            linkSourceId={linkSourceId}
            onOpenArtifact={openArtifact}
            onLinkTarget={(artifactId) =>
              linkSourceId ? completeLink(artifactId) : beginLink(artifactId)
            }
          />
        </div>
      </Panel>

      <Panel className="order-3 flex min-h-0 flex-col md:col-span-2 xl:col-span-1 xl:order-3">
        {selectedArtifact ? (
          <ArtifactViewer
            artifact={selectedArtifact}
            revealedFragment={revealedFragment}
            linkedArtifacts={linkedArtifacts}
            playerTags={playerTags[selectedArtifact.id] ?? []}
            playerLinks={playerLinks}
            onAddTag={(tag) => addPlayerTag(selectedArtifact.id, tag)}
            onOpenLinked={openArtifact}
            onRemoveLink={removeLink}
            onClose={closeArtifact}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center p-6">
            <p className="max-w-xs text-center text-xs leading-relaxed text-ink-faint">
              Select an artifact to read it. Opening a file may recover a memory
              fragment. Use the link buttons to connect two files by hand.
            </p>
          </div>
        )}
      </Panel>

      <div className="order-4 md:col-span-2 xl:col-span-1">
        <ResolveMemoryPanel />
      </div>
    </div>
  );
}
