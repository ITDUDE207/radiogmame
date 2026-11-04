import type { FragmentStance, IdentityTheme } from "@/types/game";
import { themeLabels } from "@/components/ui/tokens";

export function fragmentThemeLabel(theme: IdentityTheme): string {
  return themeLabels[theme];
}

export const stanceLabels: Record<FragmentStance, string> = {
  support: "Supports",
  complicate: "Complicates",
  contradict: "Contradicts",
};

export function fragmentStanceLabel(stance: FragmentStance): string {
  return stanceLabels[stance];
}
