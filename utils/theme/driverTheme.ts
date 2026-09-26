import { createTheme } from "@mui/material/styles";
import { baselightTheme } from "./DefaultColors";

export const DASHBOARD_INK = "#0F172A";
export const DASHBOARD_ACCENT = "#c4f82a";
export const DASHBOARD_SURFACE = "#F1F5F9";
export const DASHBOARD_CARD = "#FFFFFF";
export const DASHBOARD_MUTED = "#64748B";
export const DASHBOARD_BORDER = "#E2E8F0";

export const DRIVER_INK = DASHBOARD_INK;
export const DRIVER_ACCENT = DASHBOARD_ACCENT;
export const DRIVER_SURFACE = DASHBOARD_SURFACE;
export const DRIVER_CARD = DASHBOARD_CARD;
export const DRIVER_MUTED = DASHBOARD_MUTED;
export const DRIVER_BORDER = DASHBOARD_BORDER;

export const dashboardTheme = createTheme(baselightTheme, {
  palette: {
    primary: {
      main: DASHBOARD_INK,
      light: "#1E293B",
      dark: "#020617",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#4D7C0F",
      light: DASHBOARD_ACCENT,
      dark: "#365314",
      contrastText: DASHBOARD_INK,
    },
    background: {
      default: DASHBOARD_SURFACE,
      paper: DASHBOARD_CARD,
    },
    text: {
      primary: DASHBOARD_INK,
      secondary: DASHBOARD_MUTED,
    },
    divider: DASHBOARD_BORDER,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: `1px solid ${DASHBOARD_BORDER}`,
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
        },
        elevation1: { boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)" },
        elevation2: { boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)" },
        elevation3: { boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)" },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 10,
          minHeight: 40,
        },
        contained: {
          backgroundColor: DASHBOARD_INK,
          color: "#FFFFFF",
          "&:hover": { backgroundColor: "#1E293B" },
          "&.Mui-disabled": {
            color: "#64748B",
            backgroundColor: "#E2E8F0",
          },
          "& .MuiTypography-root": { color: "inherit" },
        },
        containedPrimary: {
          backgroundColor: DASHBOARD_INK,
          color: "#FFFFFF",
          "&:hover": { backgroundColor: "#1E293B" },
        },
        containedSecondary: {
          backgroundColor: DASHBOARD_ACCENT,
          color: DASHBOARD_INK,
          "&:hover": { backgroundColor: "#d4ff4a" },
        },
        outlined: {
          borderColor: DASHBOARD_INK,
          color: DASHBOARD_INK,
          backgroundColor: "#FFFFFF",
          "&:hover": {
            backgroundColor: "#F8FAFC",
            borderColor: DASHBOARD_INK,
          },
          "& .MuiTypography-root": { color: "inherit" },
        },
        outlinedPrimary: {
          borderColor: DASHBOARD_INK,
          color: DASHBOARD_INK,
        },
        text: {
          color: DASHBOARD_INK,
          "& .MuiTypography-root": { color: "inherit" },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
        colorDefault: {
          backgroundColor: "#E2E8F0",
          color: DASHBOARD_INK,
        },
        outlined: {
          borderColor: DASHBOARD_INK,
          color: DASHBOARD_INK,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#F8FAFC",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: DASHBOARD_MUTED,
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#94A3B8",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: DASHBOARD_INK,
            borderWidth: 2,
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          border: `1px solid ${DASHBOARD_BORDER}`,
          boxShadow: "none",
          "&:before": { display: "none" },
        },
      },
    },
  },
});

export const driverTheme = dashboardTheme;
