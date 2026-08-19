import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AppTheme = "light" | "dark" | "pitch-black";

interface AppThemeState {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

// One-time migration: before this store existed, the Mantine Select in the
// footer wrote directly to Mantine's own "colorScheme" localStorage key. Read
// it once so switching to app-owned theme identity (see
// docs/adr/0004-app-owned-theme-identity.md) doesn't reset an existing
// user's explicit light/dark choice back to the system default.
function detectInitialTheme(): AppTheme {
  const legacy = globalThis.localStorage.getItem("colorScheme");
  if (legacy === "light" || legacy === "dark") return legacy;
  return globalThis.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function mantineSchemeFor(theme: AppTheme): "light" | "dark" {
  return theme === "light" ? "light" : "dark";
}

export const useAppThemeStore = create<AppThemeState>()(
  persist(
    set => ({
      theme: detectInitialTheme(),
      setTheme: theme => set({ theme }),
    }),
    {
      name: "appTheme",
    },
  ),
);

// Reflected onto the DOM as its own attribute (separate from Mantine's
// data-mantine-color-scheme) so CSS can target Pitch Black specifically
// without depending on Mantine's mechanics.
function applyThemeAttribute(theme: AppTheme): void {
  document.documentElement.dataset.appTheme = theme;
}

applyThemeAttribute(useAppThemeStore.getState().theme);
useAppThemeStore.subscribe(state => applyThemeAttribute(state.theme));
