"use client";

import { themeDotClasses } from "@/components/ui/tokens";
import type { IdentityProfile, IdentityTheme } from "@/types/game";
import { themeLabels } from "@/components/ui/tokens";

export function IdentityProfilePanel({ profile }: { profile: IdentityProfile }) {
  const themes: IdentityTheme[] = ["caretaker", "escape-artist", "stranger"];
  const total = themes.reduce((sum, theme) => sum + profile.themeCounts[theme], 0);

  const verdict = profile.isBalanced
    ? "Composite — no single reading dominates."
    : profile.dominantTheme
      ? `Dominant reading: ${themeLabels[profile.dominantTheme]}.`
      : "No version of Mara is being held.";

  return (
    <section
      data-testid="identity-profile"
      aria-labelledby="identity-profile-title"
      className="border-b border-edge px-3 py-3"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3
          id="identity-profile-title"
          className="text-[0.6rem] tracking-[0.2em] text-ink-faint uppercase"
        >
          Identity profile
        </h3>
        <span className="text-[0.6rem] text-ink-faint">
          {profile.preservedFragmentIds.length} of {profile.discoveredFragmentIds.length}{" "}
          fragments held
        </span>
      </div>

      <p data-testid="identity-verdict" className="mt-2 text-xs text-ink">
        {verdict}
      </p>

      <ul className="mt-3 flex flex-col gap-2">
        {themes.map((theme) => {
          const count = profile.themeCounts[theme];
          const share = total === 0 ? 0 : Math.round((count / total) * 100);
          const dominant = profile.dominantThemes.includes(theme);
          return (
            <li key={theme}>
              <div className="flex items-baseline justify-between text-[0.65rem]">
                <span className={dominant ? "text-ink" : "text-ink-muted"}>
                  <span
                    aria-hidden="true"
                    className={`mr-1.5 inline-block h-2 w-2 rounded-full align-middle ${themeDotClasses[theme]}`}
                  />
                  {themeLabels[theme]}
                </span>
                <span className="text-ink-faint">
                  {count} · {share}%
                </span>
              </div>
              <div
                className="mt-1 h-1 w-full overflow-hidden rounded-full bg-edge"
                role="presentation"
              >
                <div
                  className={`h-full ${themeDotClasses[theme]}`}
                  style={{ width: `${share}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-[0.65rem]">
        <dt className="text-ink-faint">Resolved conflicts</dt>
        <dd className="text-right text-ink">
          {profile.resolvedContradictionIds.length}
        </dd>
        <dt className="text-ink-faint">Unresolved conflicts</dt>
        <dd className="text-right text-ink">
          {profile.unresolvedContradictionIds.length}
        </dd>
        <dt className="text-ink-faint">Dismissed</dt>
        <dd className="text-right text-ink">{profile.dismissedFragmentIds.length}</dd>
        <dt className="text-ink-faint">Locked out</dt>
        <dd className="text-right text-ink">{profile.lockedFragmentIds.length}</dd>
      </dl>
    </section>
  );
}
