# Error 404: Self Not Found

A narrative puzzle game about reconstructing a missing person from her digital
remains. You play a recovery technician working through the recovered laptop of
Mara Voss. Her emails, browser tabs, playlists, drafts, deleted files, chat
exports, photo captions, and system logs are all here. Some of them disagree.

The chapter is called **The Last Login**.

## Premise

Mara Voss is missing. Her laptop was recovered with the disk intact. You have the
emails, tabs, playlists, drafts, and deleted files she left behind. Some of them
disagree. Open what you can, recover the fragments, and decide which version of
her to keep. The archive will not tell you which one is true.

The central question is the one the game refuses to answer for you: if you
reconstruct someone from incomplete and conflicting digital remains, is the
result still them?

## The loop

1. Search the archive of digital artifacts.
2. Discover memory fragments and the relationships between them.
3. Resolve or preserve contradictions between fragments.
4. Commit a version of Mara's identity.
5. See how that choice selects an ending.

Fragments belong to one of three identity themes:

- **The Caretaker** — the one who stayed, paid, remembered, and never said so.
- **The Escape Artist** — the one who planned, packed light, and left a return
  ticket open.
- **The Stranger** — the one with three names, no face, and a room no one else
  entered.

Fragments can **support**, **complicate**, or **contradict** one another. Some
pairs are mutually incompatible: preserving one locks the other out.

## Controls

| Action | Mouse / keyboard |
| --- | --- |
| Open an artifact | Click its row in the file list, or Tab to it and press Enter |
| Close the open artifact | Click the ✕, or press `Esc` |
| Link two artifacts by hand | Click **link** on the first, then **link** on the second |
| Add a player tag | Type in the tag field and press **Tag** |
| Switch to the Identity Board | Click **Identity Board**, or press `B` |
| Switch to the archive | Click **Archive**, or press `A` |
| Move between the file system, file list, and viewer | `Tab` / `Shift+Tab` |
| Reset the chapter | Click **Reset** in the header, or **Start a new recovery** at the end |

## Running the game

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>. The intro screen starts the chapter; the
archive and identity board are at `/game`.

## Building and testing

```bash
npm run build       # production build
npm run test        # unit + integration tests (Vitest)
npm run test:watch  # watch mode
npm run typecheck   # tsc --noEmit
```

The project runs on Next.js 16 (App Router, Turbopack), React 19, TypeScript,
Zustand, and Tailwind CSS 4. Tests use Vitest with React Testing Library and
jsdom.

## Deploying to Vercel

The project is ready to deploy as-is. It has no environment variables, no
database, and no API routes, so no configuration is required beyond pointing
Vercel at the repository.

1. In Vercel, choose **Add New → Project** and import this GitHub repository.
2. Leave the defaults. Vercel detects Next.js and uses `npm ci` to install and
   `next build` to build. `vercel.json` records those commands explicitly.
3. Deploy. Every push to `main` produces a production deployment, and every pull
   request gets a preview deployment.

The `engines` field pins Node `>=20.9.0`, which is the minimum Next.js 16
requires; Vercel's default Node 22 satisfies it. All routes are prerendered as
static content, so the game is served from the CDN with no server runtime.

## Architecture

The game is split so that all narrative content and all game rules are plain,
server-safe modules, and only the interactive shell is a client component.

```
src/
  app/
    layout.tsx          metadata, fonts, global shell
    page.tsx            redirects to /game
    game/page.tsx       renders the client game
  components/
    GameClient.tsx      client shell: view routing, keyboard shortcuts, header
    archive/            FolderList, ArtifactList, ArtifactViewer, ArchiveView
    identity/           IdentityBoard, FragmentCard, IdentityProfilePanel
    contradictions/     ResolveMemoryPanel
    endings/            EndingSequence
    ui/                 Button, Panel, GameHeader, FragmentToast, IntroScreen, tokens
  content/
    artifacts.ts        28 typed artifact records across 8 folders
    fragments.ts        13 memory fragments and 5 contradiction rules
    endings.ts          5 ending records with conditions and prose
  lib/
    archive.ts          discovering artifacts, linking, searching
    fragment.ts         preserve, pin, dismiss, restore, lock incompatible
    contradiction.ts    detect, resolve, reopen contradictions
    ending.ts           identity profile, dominant theme, ending selection
  state/
    game-store.ts       Zustand store (client only)
  types/
    game.ts             shared types
  __tests__/            unit and integration tests
```

`GameClient` is the only client component that owns game state. `app/game/page.tsx`
and `app/layout.tsx` stay server-safe, and the static content modules can be
imported from either side. No JSX contains game logic: every rule lives in
`src/lib/`.

### Pure rules in `src/lib/`

- `archive.ts` — `discoverArtifact`, `areArtifactsLinked`, `linkArtifacts`,
  `searchArtifacts`, `getLinkedArtifacts`
- `fragment.ts` — `preserveFragment`, `pinFragment`, `dismissFragment`,
  `restoreFragment`, `computeLockedFragmentIds`, `areFragmentsIncompatible`
- `contradiction.ts` — `isContradictionDiscovered`, `getUnresolvedContradictions`,
  `resolveContradiction`, `unresolveContradiction`
- `ending.ts` — `computeIdentityProfile`, `findDominantThemes`, `selectEnding`,
  `canCommitIdentity`

## Content structure

### Artifacts (`src/content/artifacts.ts`)

28 artifacts, each with `id`, `type`, `title`, `timestamp`, `source`, `tags`,
`folderId`, `body`, optional `relatedArtifactIds`, and optional
`revealsFragmentId`. All eight required types are present: email, browser tab,
playlist, note draft, deleted file, chat message, photo caption, and system log.
Artifacts are grouped into eight folders (Inbox, Restored Tabs, Playlists,
Drafts, Recycle Bin, Messages, Photo Captions, System Logs).

### Fragments (`src/content/fragments.ts`)

13 fragments, each tied to the artifact that reveals it, assigned a theme, a
stance (`support` / `complicate` / `contradict`), a summary, a longer note, and
optional `incompatibleWith` ids.

### Contradictions

5 contradictions, each naming the fragments involved, a prompt, and exactly two
interpretations. Each interpretation preserves one fragment and locks the other.
Examples: the departure plan versus the open-dated return ticket; the tidy
shutdown versus the letter she deleted three times; the six-hour gap versus the
account with three followers.

### Endings (`src/content/endings.ts`)

5 endings selected by condition, highest priority first:

| Ending | Condition |
| --- | --- |
| `not-found` | 3 or more contradictions left unresolved |
| `caretaker` | caretaker is the dominant theme |
| `escape-artist` | escape artist is the dominant theme |
| `stranger` | stranger is the dominant theme |
| `composite` | the three themes are balanced (fallback) |

## Known limitations

- One chapter only ("The Last Login"). There is no chapter two.
- State lives in memory. Reloading the page starts a new recovery; there are no
  saves, cloud sync, accounts, or database.
- No backend, API routes, or server actions. Nothing is uploaded and no network
  calls are made at runtime.
- The 768px layout keeps the three archive panes stacked rather than side by
  side, so the file list and viewer share one column on narrow screens.
- Contradiction resolution is per-conflict. You can reopen a settled conflict,
  but the chapter never forces you to settle all five before committing.
- All prose is original to this project and written for it.
