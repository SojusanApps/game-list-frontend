import { createTheme, CSSVariablesResolver, MantineColorsTuple, virtualColor } from "@mantine/core";

import scrollAreaClasses from "./ScrollArea.module.css";

// Mapped from src/css/colors.css — indigo primary, amber secondary, slate background.
// Brand/state colours that change hue between schemes are split into a light and a dark
// tuple and joined with virtualColor() below, so Mantine derives filled/light/outline
// variables and the auto-contrast label colour per scheme (instead of us overriding
// --mantine-color-* in CSS, which left Mantine's derived colours out of sync).
const primaryLight: MantineColorsTuple = [
  "#eef2ff", // 0 - lightest
  "#e0e7ff", // 1 - primary-100
  "#c7d2fe", // 2 - primary-200
  "#a5b4fc", // 3 - primary-300
  "#818cf8", // 4 - primary-400
  "#6366f1", // 5 - primary-500 (main shade)
  "#4f46e5", // 6 - primary-600
  "#4338ca", // 7 - primary-700
  "#3730a3", // 8 - primary-800
  "#312e81", // 9 - primary-900
];

const secondaryLight: MantineColorsTuple = [
  "#fff7ed", // 0 - lightest
  "#ffedd5", // 1 - secondary-100
  "#fed7aa", // 2 - secondary-200
  "#fdba74", // 3 - secondary-300
  "#fb923c", // 4 - secondary-400
  "#f97316", // 5 - secondary-500
  "#ea580c", // 6 - secondary-600
  "#c2410c", // 7 - secondary-700
  "#9a3412", // 8 - secondary-800
  "#7c2d12", // 9 - secondary-900
];

const background: MantineColorsTuple = [
  "#ffffff", // 0 - background-100
  "#f8fafc", // 1 - background-200
  "#f1f5f9", // 2 - background-300
  "#e2e8f0", // 3 - background-400
  "#cbd5e1", // 4 - background-500
  "#94a3b8", // 5 - background-600
  "#64748b", // 6 - background-700
  "#475569", // 7 - background-800
  "#334155", // 8 - background-900
  "#0f172a", // 9 - background-950
];

const errorLight: MantineColorsTuple = [
  "#fef2f2", // 0
  "#fee2e2", // 1 - error-100
  "#fecaca", // 2 - error-200
  "#fca5a5", // 3 - error-300
  "#f87171", // 4 - error-400
  "#ef4444", // 5 - error-500
  "#dc2626", // 6 - error-600
  "#b91c1c", // 7 - error-700
  "#991b1b", // 8 - error-800
  "#7f1d1d", // 9 - error-900
];

const success: MantineColorsTuple = [
  "#ecfdf5", // 0
  "#d1fae5", // 1 - success-100
  "#a7f3d0", // 2 - success-200
  "#6ee7b7", // 3 - success-300
  "#34d399", // 4 - success-400
  "#10b981", // 5 - success-500
  "#059669", // 6 - success-600
  "#047857", // 7 - success-700
  "#065f46", // 8 - success-800
  "#064e3b", // 9 - success-900
];

// Neon cyan — dark-mode brand (mirrors --color-primary-* in colors.css)
const primaryDark: MantineColorsTuple = [
  "#ecfeff", // 0
  "#cffafe", // 1
  "#a5f3fc", // 2
  "#67e8f9", // 3
  "#22d3ee", // 4
  "#06b6d4", // 5 - main shade, near-black label via autoContrast
  "#0891b2", // 6
  "#0e7490", // 7
  "#155e75", // 8
  "#164e63", // 9
];

// Neon magenta — dark-mode secondary (mirrors --color-secondary-* in colors.css)
const secondaryDark: MantineColorsTuple = [
  "#fdf4ff", // 0
  "#fae8ff", // 1
  "#f5d0fe", // 2
  "#f0abfc", // 3
  "#e879f9", // 4
  "#d946ef", // 5
  "#c026d3", // 6
  "#a21caf", // 7
  "#86198f", // 8
  "#701a75", // 9
];

// Same ramp as errorLight, but the main shade is error-600 so white labels pass 4.5:1.
const errorDark: MantineColorsTuple = [
  "#fef2f2", // 0
  "#fee2e2", // 1
  "#fecaca", // 2
  "#fca5a5", // 3
  "#f87171", // 4
  "#dc2626", // 5 - main shade (error-600)
  "#b91c1c", // 6
  "#991b1b", // 7
  "#7f1d1d", // 8
  "#7f1d1d", // 9
];

export const theme = createTheme({
  primaryColor: "primary",
  // Light uses shade 6 so white labels reach 4.5:1 on the indigo fill; dark keeps the neon
  // shade 5 and autoContrast flips its label to near-black.
  primaryShade: { light: 6, dark: 5 },
  autoContrast: true,
  // ~0.179 is where black and white labels have equal contrast: anything lighter gets black.
  luminanceThreshold: 0.179,

  colors: {
    primaryLight,
    primaryDark,
    secondaryLight,
    secondaryDark,
    errorLight,
    errorDark,
    primary: virtualColor({ name: "primary", light: "primaryLight", dark: "primaryDark" }),
    secondary: virtualColor({ name: "secondary", light: "secondaryLight", dark: "secondaryDark" }),
    error: virtualColor({ name: "error", light: "errorLight", dark: "errorDark" }),
    success,
    background,
  },

  fontFamily:
    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",

  // The spacing and radius scales shared components build on. The values are Mantine's defaults, written
  // out so the scale is documented in one place: prefer `p="lg"`, `radius="lg"` or `var(--mantine-radius-lg)`
  // over pixel literals in new code.
  spacing: { xs: "10px", sm: "12px", md: "16px", lg: "20px", xl: "32px" },
  radius: { xs: "2px", sm: "4px", md: "8px", lg: "16px", xl: "32px" },
  defaultRadius: "md",

  headings: {
    fontWeight: "700",
    sizes: {
      h1: { fontWeight: "800", lineHeight: "1.2" },
      h2: { lineHeight: "1.25" },
    },
  },

  components: {
    Title: {
      styles: { root: { letterSpacing: "-0.02em" } },
    },
    Paper: {
      defaultProps: { radius: "lg" },
    },
    Button: {
      defaultProps: {
        variant: "filled",
      },
    },
    Tooltip: {
      defaultProps: {
        // Touch devices have no hover — open on tap too, so icon-only tooltips
        // (gender, warning counts, etc.) aren't unreachable on mobile.
        events: { hover: true, focus: true, touch: true },
      },
    },
    TextInput: {
      defaultProps: {
        size: "md",
      },
    },
    PasswordInput: {
      defaultProps: {
        size: "md",
      },
    },
    Select: {
      defaultProps: {
        size: "md",
      },
    },
    MultiSelect: {
      defaultProps: {
        size: "md",
      },
    },
    Checkbox: {
      defaultProps: {
        size: "md",
      },
    },
    ScrollArea: {
      defaultProps: {
        type: "hover",
      },
      classNames: scrollAreaClasses,
    },
  },
});

// Point Mantine's own surface/secondary-text variables at the app's AA-checked tokens:
// `c="dimmed"` was gray-6 (3.3:1 on white), and dialogs/menus used Mantine's #242424 body
// instead of the surface the panels use.
export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {
    "--mantine-color-dimmed": "var(--color-text-500)",
  },
  dark: {
    "--mantine-color-dimmed": "var(--color-text-500)",
    "--mantine-color-body": "var(--color-background-100)",
  },
});
