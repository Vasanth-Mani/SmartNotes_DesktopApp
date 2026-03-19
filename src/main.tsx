import { StrictMode, useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import App from './App';
import './index.css';

function Root() {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('smartnotes-theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#7c4dff',
          },
          ...(mode === 'light'
            ? {
                background: {
                  default: '#f5f7fa',
                  paper: '#ffffff',
                },
              }
            : {
                background: {
                  default: '#121212',
                  paper: '#1e1e1e',
                },
              }),
        },
        shape: {
          borderRadius: 12,
        },
        typography: {
          fontFamily:
            '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
        },
        components: {
          MuiAccordion: {
            styleOverrides: {
              root: {
                borderRadius: '12px !important',
                '&:before': { display: 'none' },
              },
            },
          },
          MuiFab: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
              },
            },
          },
        },
      }),
    [mode],
  );

  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('smartnotes-theme', next);
      return next;
    });
  };

  return (
    <StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App toggleTheme={toggleTheme} isDark={mode === 'dark'} />
      </ThemeProvider>
    </StrictMode>
  );
}

createRoot(document.getElementById('root')!).render(<Root />);
