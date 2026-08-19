# ADR 0004: App-Owned Theme Identity, Independent of Mantine's Color Scheme

**Status:** Accepted
**Date:** 2026-08-19

## Context

Theming today is driven entirely by Mantine's built-in color scheme (`useMantineColorScheme` / `useComputedColorScheme`), persisted via `localStorageColorSchemeManager` under the `colorScheme` key, with `MantineColorScheme` typed as exactly `'light' | 'dark' | 'auto'` in `@mantine/core`. Adding "Pitch Black" — a visually distinct dark variant with its own accent palette and background — doesn't fit as a fourth value there; Mantine's type doesn't allow it, and even if it did, every existing call site that reads `useComputedColorScheme()` expecting two values would need auditing.

## Decision

The app now owns its own theme identity, independent of Mantine's mechanics. A `useAppThemeStore` (Zustand + `persist`, mirroring the existing `useLanguageStore` pattern in `src/lib/languageStore.ts`) holds the canonical value: `"light" | "dark" | "pitch-black"`. Mantine's own color scheme is treated as a derived implementation detail — set to `"light"` or `"dark"` (Pitch Black maps to `"dark"`) whenever our store changes, but never read back by app code that needs to distinguish Pitch Black from plain dark. Anything that needs that distinction (TopBar/Footer background, the body background image) reads our store, not Mantine's.

## Consequences

- Two persisted localStorage entries now exist for what reads as one user-facing preference: Mantine's own `colorScheme` key and our new `appTheme` key. They're kept in sync by construction (the theme select's `onChange` always updates both) — this is deliberate duplication, not drift to fix.
- Any future code that needs to know the *actual* active theme must use the app's theme store/hook, not `useComputedColorScheme()` — the latter will report `"dark"` for Pitch Black too, since Mantine has no concept of it.
