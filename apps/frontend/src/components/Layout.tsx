import { CssBaseline, Theme, ThemeOptions, ThemeProvider, createTheme } from "@mui/material"
import { PropsWithChildren, useEffect } from "react"

type Props = PropsWithChildren<{
    theme: ThemeOptions
}>

export default function Layout({ children, theme }: Props) {

    return (
        <ThemeProvider theme={theme}>
            {
                children
            }
        </ThemeProvider>
    )
}