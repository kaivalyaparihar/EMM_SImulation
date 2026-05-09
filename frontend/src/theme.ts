import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00f0ff",
      light: "#66f7ff",
      dark: "#00b8c4",
    },
    secondary: {
      main: "#ff0040",
      light: "#ff4d73",
      dark: "#c4002f",
    },
    success: {
      main: "#00ff88",
      light: "#66ffb3",
      dark: "#00c468",
    },
    warning: {
      main: "#ffaa00",
      light: "#ffc74d",
      dark: "#c48300",
    },
    error: {
      main: "#ff0040",
    },
    background: {
      default: "#0a0e17",
      paper: "#111827",
    },
    text: {
      primary: "#e0e6ed",
      secondary: "#8892a4",
    },
  },
  typography: {
    fontFamily: "'Rajdhani', 'Segoe UI', sans-serif",
    h1: {
      fontWeight: 700,
      letterSpacing: "0.05em",
    },
    h2: {
      fontWeight: 700,
      letterSpacing: "0.04em",
    },
    h3: {
      fontWeight: 600,
      letterSpacing: "0.03em",
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    body1: {
      fontSize: "0.95rem",
    },
    body2: {
      fontSize: "0.85rem",
    },
    button: {
      fontWeight: 600,
      letterSpacing: "0.05em",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "rgba(17, 24, 39, 0.8)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(0, 240, 255, 0.1)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "uppercase" as const,
          borderRadius: 4,
          "&.MuiButton-containedPrimary": {
            background: "linear-gradient(135deg, #00f0ff 0%, #0080ff 100%)",
            boxShadow: "0 0 20px rgba(0, 240, 255, 0.3)",
            "&:hover": {
              background: "linear-gradient(135deg, #33f3ff 0%, #3399ff 100%)",
              boxShadow: "0 0 30px rgba(0, 240, 255, 0.5)",
            },
          },
          "&.MuiButton-containedSecondary": {
            background: "linear-gradient(135deg, #ff0040 0%, #ff0080 100%)",
            boxShadow: "0 0 20px rgba(255, 0, 64, 0.3)",
            "&:hover": {
              background: "linear-gradient(135deg, #ff3366 0%, #ff3399 100%)",
              boxShadow: "0 0 30px rgba(255, 0, 64, 0.5)",
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          letterSpacing: "0.03em",
        },
      },
    },
  },
});

export default theme;
