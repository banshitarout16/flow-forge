import { createTheme } from "@mui/material/styles";

const colors = {
  red: "#E60023", 
  redDark: "#AD081B", 
  redSoft: "#FFE7EA", 
  ink: "#1A1A1A",
  slate: "#6E6E6E", 
  paper: "#FFFFFF",
  canvas: "#FAF7F6", 
  line: "#EEE7E6", 
};

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: colors.red,
      dark: colors.redDark,
      light: colors.redSoft,
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: colors.ink,
      contrastText: "#FFFFFF",
    },
    background: {
      default: colors.canvas,
      paper: colors.paper,
    },
    text: {
      primary: colors.ink,
      secondary: colors.slate,
    },
    divider: colors.line,
    success: { main: "#1E8E5A" },
    warning: { main: "#C77700" },
    error: { main: colors.red },
    info: { main: "#2B6CB0" },
  },
  shape: {
    borderRadius: 14, 
  },
  typography: {
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    h1: { fontFamily: "'Poppins', sans-serif", fontWeight: 700 },
    h2: { fontFamily: "'Poppins', sans-serif", fontWeight: 700 },
    h3: { fontFamily: "'Poppins', sans-serif", fontWeight: 600 },
    h4: { fontFamily: "'Poppins', sans-serif", fontWeight: 600 },
    h5: { fontFamily: "'Poppins', sans-serif", fontWeight: 600 },
    h6: { fontFamily: "'Poppins', sans-serif", fontWeight: 600 },
    button: { fontFamily: "'Poppins', sans-serif", fontWeight: 600, textTransform: "none" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999, 
          paddingLeft: 20,
          paddingRight: 20,
          paddingTop: 9,
          paddingBottom: 9,
          boxShadow: "none",
        },
        containedPrimary: {
          "&:hover": {
            backgroundColor: colors.redDark,
            boxShadow: "none",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          border: `1px solid ${colors.line}`,
          boxShadow: "0 1px 2px rgba(26,26,26,0.04)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 600,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.paper,
          color: colors.ink,
          boxShadow: `inset 0 -1px 0 ${colors.line}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.paper,
          borderRight: `1px solid ${colors.line}`,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;
export { colors };


