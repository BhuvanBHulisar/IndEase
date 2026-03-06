import React, { createContext, useMemo, useState, useLayoutEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

export const ColorModeContext = createContext({ toggleColorMode: () => { } });

export default function ThemeProviderWrapper({ children }) {
    const [mode, setMode] = useState('dark'); // Default to dark for premium feel

    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
            },
            mode,
        }),
        [mode]
    );

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    ...(mode === 'light'
                        ? {
                            primary: { main: '#3b82f6' },
                            secondary: { main: '#6366f1' },
                            background: { default: '#f8fafc', paper: '#ffffff' },
                            text: { primary: '#0f172a', secondary: '#64748b' },
                        }
                        : {
                            primary: { main: '#60a5fa' },
                            secondary: { main: '#818cf8' },
                            background: { default: '#0f172a', paper: '#1e293b' },
                            text: { primary: '#f8fafc', secondary: '#94a3b8' },
                        }),
                },
                typography: {
                    fontFamily: '"Outfit", "Inter", "Roboto", sans-serif',
                    h4: { fontWeight: 700 },
                    h6: { fontWeight: 600 },
                    subtitle2: { fontWeight: 500 },
                },
                shape: { borderRadius: 12 },
                components: {
                    MuiPaper: {
                        styleOverrides: {
                            root: {
                                backgroundImage: 'none',
                                boxShadow: mode === 'light'
                                    ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                                    : '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
                            },
                        },
                    },
                    MuiButton: {
                        styleOverrides: {
                            root: { textTransform: 'none', fontWeight: 600, borderRadius: 8 },
                        },
                    },
                },
            }),
        [mode]
    );

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline />

                {children}
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}



