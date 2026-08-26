import { createTheme, MantineColorsTuple } from "@mantine/core";

import scrollAreaClasses from "./ScrollArea.module.css";

// Mapped from src/css/colors.css — indigo primary, amber secondary, slate background
const primary: MantineColorsTuple = [
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

const secondary: MantineColorsTuple = [
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

const error: MantineColorsTuple = [
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

export const theme = createTheme({
  primaryColor: "primary",
  primaryShade: 5,

  colors: {
    primary,
    secondary,
    background,
    error,
    success,
  },

  fontFamily:
    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",

  defaultRadius: "md",

  components: {
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
