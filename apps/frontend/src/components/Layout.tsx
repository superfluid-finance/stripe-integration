import { Box, CssBaseline, Paper, Stack, Theme, ThemeOptions, ThemeProvider, createTheme } from "@mui/material"
import { PropsWithChildren, useEffect, useMemo } from "react"

type Props = PropsWithChildren<{
    themeOptions: ThemeOptions
}>

export default function Layout({ children, themeOptions }: Props) {
    // TODO(KK): optimize, expose theme from widget?
    const theme = useMemo(() => createTheme(themeOptions), [themeOptions.palette?.mode]);

    return (
        <ThemeProvider theme={theme}>
            <Stack alignItems="center" justifyContent="center" bgcolor={theme.palette.background.default} width="100vw" height="100vh">
                {
                    children
                }
            </Stack>
        </ThemeProvider >
    )
}