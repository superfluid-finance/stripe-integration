import {
  Box,
  CssBaseline,
  Paper,
  Stack,
  Theme,
  ThemeOptions,
  ThemeProvider
} from '@mui/material';
import { createWidgetTheme } from '@superfluid-finance/widget';
import { PropsWithChildren, useEffect, useMemo } from 'react';

type Props = PropsWithChildren<{
  themeOptions: ThemeOptions;
}>;

export default function Layout({ children, themeOptions }: Props) {
  // TODO(KK): optimize, expose theme from widget?
  const theme = useMemo(() => createWidgetTheme(themeOptions), [themeOptions]);

  return (
    <ThemeProvider theme={theme}>
      <Stack
        alignItems="center"
        justifyContent="center"
        bgcolor={theme.palette.background.default}
        width="100%"
        height="100%"
      >
        {children}
      </Stack>
    </ThemeProvider>
  );
}
