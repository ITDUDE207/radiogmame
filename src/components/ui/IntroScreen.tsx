"use client";

import { Button } from "@/components/ui/Button";

export function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        <p className="text-[0.6rem] tracking-[0.28em] text-ink-faint uppercase">
          Recovery session · device: MV-2019 · one chapter available
        </p>
        <h2 className="mt-3 text-2xl leading-tight text-ink md:text-3xl">
          Error 404: Self Not Found
        </h2>
        <p className="mt-1 text-xs tracking-[0.14em] text-accent uppercase">
          Chapter One — The Last Login
        </p>

        <p
          data-testid="intro-premise"
          className="mt-5 text-[0.82rem] leading-[1.9] text-ink-muted"
        >
          Mara Voss is missing. Her laptop was recovered with the disk intact. You
          have the emails, tabs, playlists, drafts, and deleted files she left
          behind. Some of them disagree. Open what you can, recover the fragments,
          and decide which version of her to keep. The archive will not tell you
          which one is true.
        </p>

        <ul className="mt-5 flex flex-col gap-1.5 text-[0.72rem] text-ink-faint">
          <li>· Click a file to open it. Opening a file can recover a fragment.</li>
          <li>· Use link to connect two files by hand.</li>
          <li>· Press Tab and Enter to move through the archive by keyboard.</li>
          <li>· Press B for the Identity Board, A for the archive, Esc to close.</li>
        </ul>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Button
            variant="primary"
            data-testid="start-game"
            onClick={onStart}
            autoFocus
          >
            Begin recovery
          </Button>
          <span className="text-[0.65rem] text-ink-faint">
            Nothing is uploaded. Nothing leaves this machine.
          </span>
        </div>
      </div>
    </div>
  );
}
