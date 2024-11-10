import '@/app/globals.css';
import { ThemeProvider } from 'next-themes';
import type { AppProps } from 'next/app';
import { NextUIProvider} from "@nextui-org/react";
import { Toaster } from '@/components/ui/toaster';
import { SessionProvider } from 'next-auth/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from "@vercel/analytics/react"
import { OpenPanelComponent } from '@openpanel/nextjs';
import { Session } from 'next-auth';

// Extend AppProps to include the session
type AppPropsWithSession = AppProps & {
  pageProps: {
    session?: Session;
  };
};

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppPropsWithSession) {
  return (
    <SessionProvider session={session}>
      <OpenPanelComponent
        clientId={process.env.OPENPANEL_CLIENT_ID as string}
        trackScreenViews={true}
        profileId={session?.user?.id as string}
        trackAttributes={true}
      />
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        themes={[
          'light',
          'dark',
          'emerald',
          'retro',
          'business',
          'coffee',
          'autumn',
          'aqua',
          'corporate',
          'forest',
          'nord'
        ]}
      >
        <NextUIProvider>
          <Component {...pageProps} />
          <Toaster />
        </NextUIProvider>
      </ThemeProvider>
      <SpeedInsights />
      <Analytics />
    </SessionProvider>
  );
}

export default MyApp;

