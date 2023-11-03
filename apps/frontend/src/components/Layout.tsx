import { Stack, ThemeOptions, ThemeProvider } from '@mui/material';
import { createWidgetTheme } from '@superfluid-finance/widget';
import { PropsWithChildren, useMemo } from 'react';

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
        bgcolor={theme.palette.background.default}
        width="100vw"
        minHeight="100vh"
        sx={{ pt: '10dvh' }}
      >
        {children}
      </Stack>
    </ThemeProvider>
  );
}
