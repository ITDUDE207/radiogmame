"use client";

import type { ArchiveFolder, Artifact } from "@/types/game";

export interface FolderListProps {
  folders: ArchiveFolder[];
  artifacts: Artifact[];
  activeFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
}

export function FolderList({
  folders,
  artifacts,
  activeFolderId,
  onSelectFolder,
}: FolderListProps) {
  const countFor = (folderId: string) =>
    artifacts.filter((artifact) => artifact.folderId === folderId).length;

  return (
    <nav aria-label="Archive folders" className="flex flex-col gap-0.5 p-2">
      <button
        type="button"
        onClick={() => onSelectFolder(null)}
        aria-current={activeFolderId === null ? "true" : undefined}
        className={[
          "flex items-center justify-between rounded-sm px-2 py-1.5 text-left text-xs transition-colors",
          activeFolderId === null
            ? "bg-accent/15 text-accent"
            : "text-ink-muted hover:bg-white/5 hover:text-ink",
        ].join(" ")}
      >
        <span>All items</span>
        <span className="text-[0.65rem] text-ink-faint">{artifacts.length}</span>
      </button>

      {folders.map((folder) => {
        const active = activeFolderId === folder.id;
        return (
          <button
            key={folder.id}
            type="button"
            onClick={() => onSelectFolder(folder.id)}
            aria-current={active ? "true" : undefined}
            title={folder.description}
            className={[
              "flex items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-xs transition-colors",
              active
                ? "bg-accent/15 text-accent"
                : "text-ink-muted hover:bg-white/5 hover:text-ink",
            ].join(" ")}
          >
            <span className="truncate">
              <span aria-hidden="true" className="mr-1.5 text-ink-faint">
                ▸
              </span>
              {folder.name}
            </span>
            <span className="text-[0.65rem] text-ink-faint">
              {countFor(folder.id)}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
