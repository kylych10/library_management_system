import { createTheme } from '@mui/material/styles';

// ── Design Tokens ─────────────────────────────────────────────────────────────
export const tokens = {
  primary:   '#4F46E5',
  primaryDk: '#4338CA',
  primaryLt: '#EEF2FF',
  secondary: '#7C3AED',
  success:   '#10B981',
  warning:   '#F59E0B',
  error:     '#EF4444',
  info:      '#3B82F6',

  gray50:  '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray700: '#374151',
  gray900: '#111827',

  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
  },
};

// ── MUI Theme ─────────────────────────────────────────────────────────────────
const muiTheme = createTheme({
  palette: {
    primary:   { main: tokens.primary,   dark: tokens.primaryDk, light: tokens.primaryLt, contrastText: '#fff' },
    secondary: { main: tokens.secondary, contrastText: '#fff' },
    success:   { main: tokens.success,   contrastText: '#fff' },
    warning:   { main: tokens.warning,   contrastText: '#fff' },
    error:     { main: tokens.error,     contrastText: '#fff' },
    info:      { main: tokens.info,      contrastText: '#fff' },
    background: { default: '#F8FAFF', paper: '#FFFFFF' },
    text: {
      primary:   tokens.gray900,
      secondary: tokens.gray500,
      disabled:  tokens.gray400,
    },
    divider: tokens.gray200,
  },

  typography: {
    fontFamily: [
      'Inter', '-apple-system', 'BlinkMacSystemFont',
      '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif',
    ].join(','),
    h1: { fontSize: 'clamp(2rem, 5vw, 3.5rem)',  fontWeight: 800, lineHeight: 1.1 },
    h2: { fontSize: 'clamp(1.6rem, 4vw, 2.75rem)', fontWeight: 700, lineHeight: 1.2 },
    h3: { fontSize: 'clamp(1.3rem, 3vw, 2rem)',  fontWeight: 700, lineHeight: 1.3 },
    h4: { fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: 'clamp(1rem, 2vw, 1.25rem)',   fontWeight: 600, lineHeight: 1.4 },
    h6: { fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)', fontWeight: 600, lineHeight: 1.5 },
    body1: { fontSize: '1rem',     lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.6 },
    caption: { fontSize: '0.75rem', lineHeight: 1.5 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0.2 },
  },

  shape: { borderRadius: tokens.radius.md },

  breakpoints: {
    values: { xs: 0, sm: 480, md: 768, lg: 1024, xl: 1280, '2xl': 1440 },
  },

  shadows: [
    'none',
    '0 1px 2px rgba(0,0,0,0.05)',
    '0 1px 4px rgba(0,0,0,0.06)',
    '0 2px 8px rgba(0,0,0,0.07)',
    '0 4px 12px rgba(0,0,0,0.08)',
    '0 6px 16px rgba(0,0,0,0.09)',
    '0 8px 24px rgba(0,0,0,0.10)',
    '0 12px 32px rgba(0,0,0,0.11)',
    '0 16px 40px rgba(0,0,0,0.12)',
    '0 20px 48px rgba(0,0,0,0.13)',
    '0 24px 56px rgba(0,0,0,0.14)',
    '0 28px 64px rgba(0,0,0,0.15)',
    '0 32px 72px rgba(0,0,0,0.16)',
    '0 36px 80px rgba(0,0,0,0.17)',
    '0 40px 88px rgba(0,0,0,0.18)',
    '0 44px 96px rgba(0,0,0,0.19)',
    '0 48px 104px rgba(0,0,0,0.20)',
    '0 52px 112px rgba(0,0,0,0.21)',
    '0 56px 120px rgba(0,0,0,0.22)',
    '0 60px 128px rgba(0,0,0,0.23)',
    '0 64px 136px rgba(0,0,0,0.24)',
    '0 68px 144px rgba(0,0,0,0.25)',
    '0 72px 152px rgba(0,0,0,0.26)',
    '0 76px 160px rgba(0,0,0,0.27)',
    '0 80px 168px rgba(0,0,0,0.28)',
  ],

  components: {
    // ── Button ───────────────────────────────────────────────────────────────
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.lg,
          fontWeight: 600,
          padding: '10px 20px',
          fontSize: '0.9rem',
          transition: 'all 0.2s ease',
          // Ensure text is never invisible due to color/background conflicts
          '&.MuiButton-containedPrimary': {
            background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.secondary})`,
            color: '#ffffff !important',
            '&:hover': {
              background: `linear-gradient(135deg, ${tokens.primaryDk}, #6D28D9)`,
              color: '#ffffff',
              transform: 'translateY(-1px)',
              boxShadow: '0 8px 24px rgba(79,70,229,0.35)',
            },
            '&.Mui-disabled': {
              background: tokens.gray200,
              color: `${tokens.gray400} !important`,
            },
          },
          '&.MuiButton-containedSecondary': {
            backgroundColor: tokens.secondary,
            color: '#ffffff !important',
            '&:hover': { backgroundColor: '#6D28D9', color: '#ffffff' },
          },
          '&.MuiButton-containedSuccess': {
            backgroundColor: tokens.success,
            color: '#ffffff !important',
          },
          '&.MuiButton-containedError': {
            backgroundColor: tokens.error,
            color: '#ffffff !important',
          },
          '&.MuiButton-containedWarning': {
            backgroundColor: tokens.warning,
            color: '#ffffff !important',
          },
          '&.MuiButton-outlinedPrimary': {
            borderColor: tokens.primary,
            color: `${tokens.primary} !important`,
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: tokens.primaryLt,
              borderColor: tokens.primaryDk,
              color: `${tokens.primaryDk} !important`,
            },
          },
          '&.MuiButton-outlinedError': {
            borderColor: tokens.error,
            color: `${tokens.error} !important`,
            backgroundColor: 'transparent',
            '&:hover': { backgroundColor: '#FEF2F2' },
          },
          '&.MuiButton-outlinedSuccess': {
            borderColor: tokens.success,
            color: `${tokens.success} !important`,
            backgroundColor: 'transparent',
            '&:hover': { backgroundColor: '#F0FDF4' },
          },
          '&.MuiButton-text': {
            backgroundColor: 'transparent',
          },
          '&.MuiButton-textPrimary': {
            color: `${tokens.primary} !important`,
          },
        },
        sizeLarge: { padding: '12px 28px', fontSize: '1rem' },
        sizeSmall: { padding: '6px 14px',  fontSize: '0.8rem' },
      },
    },

    // ── TextField ────────────────────────────────────────────────────────────
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: tokens.radius.md,
            backgroundColor: '#fff',
            transition: 'box-shadow 0.2s ease',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: tokens.primary,
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${tokens.primaryLt}`,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: tokens.primary,
                borderWidth: 2,
              },
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: tokens.primary,
          },
        },
      },
    },

    // ── Select ────────────────────────────────────────────────────────────────
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.md,
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: tokens.primary,
            borderWidth: 2,
          },
        },
      },
    },

    // ── Card ─────────────────────────────────────────────────────────────────
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.xl,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          border: `1px solid ${tokens.gray100}`,
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
          },
        },
      },
    },

    // ── Paper ────────────────────────────────────────────────────────────────
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: { borderRadius: tokens.radius.xl },
        elevation1: { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
        elevation2: { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
        elevation3: { boxShadow: '0 8px 24px rgba(0,0,0,0.10)' },
      },
    },

    // ── Dialog ───────────────────────────────────────────────────────────────
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: tokens.radius['2xl'],
          boxShadow: '0 25px 60px rgba(0,0,0,0.18)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: { fontWeight: 700, fontSize: '1.1rem', paddingBottom: 8 },
      },
    },

    // ── Chip ─────────────────────────────────────────────────────────────────
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.75rem',
          borderRadius: tokens.radius.lg,
        },
      },
    },

    // ── Tab ──────────────────────────────────────────────────────────────────
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          minHeight: 48,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
          backgroundColor: tokens.primary,
        },
      },
    },

    // ── AppBar ────────────────────────────────────────────────────────────────
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 0 rgba(0,0,0,0.08)',
          backdropFilter: 'blur(8px)',
        },
      },
    },

    // ── ListItemButton ────────────────────────────────────────────────────────
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.md,
          transition: 'all 0.2s ease',
        },
      },
    },

    // ── Snackbar / Alert ──────────────────────────────────────────────────────
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: tokens.radius.md, fontWeight: 500 },
      },
    },

    // ── Tooltip ────────────────────────────────────────────────────────────────
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: tokens.radius.sm,
          fontSize: '0.75rem',
          fontWeight: 500,
          backgroundColor: tokens.gray900,
        },
        arrow: { color: tokens.gray900 },
      },
    },

    // ── Pagination ────────────────────────────────────────────────────────────
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.md,
          fontWeight: 600,
          '&.Mui-selected': {
            backgroundColor: tokens.primary,
            color: '#fff',
            '&:hover': { backgroundColor: tokens.primaryDk },
          },
        },
      },
    },

    // ── Avatar ────────────────────────────────────────────────────────────────
    MuiAvatar: {
      styleOverrides: {
        root: { fontWeight: 700 },
      },
    },

    // ── Divider ────────────────────────────────────────────────────────────────
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: tokens.gray200 },
      },
    },

    // ── CssBaseline ───────────────────────────────────────────────────────────
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
          scrollbarWidth: 'thin',
          scrollbarColor: `${tokens.gray200} transparent`,
        },
        '*::-webkit-scrollbar': { width: 6, height: 6 },
        '*::-webkit-scrollbar-track': { background: 'transparent' },
        '*::-webkit-scrollbar-thumb': {
          background: tokens.gray200,
          borderRadius: 6,
          '&:hover': { background: tokens.gray300 },
        },
        html: { scrollBehavior: 'smooth', WebkitFontSmoothing: 'antialiased' },
        body: {
          background: '#F8FAFF',
          overflowX: 'hidden',
        },
        'img, video': { maxWidth: '100%', height: 'auto' },
        a: { color: 'inherit', textDecoration: 'none' },
      },
    },
  },
});

export default muiTheme;
