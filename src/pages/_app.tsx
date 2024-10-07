import '../styles/globals.css';
import { ThemeProvider } from 'next-themes';
import type { AppProps } from 'next/app';
import { NextUIProvider} from "@nextui-org/react";
import { Toaster } from '@/components/ui/toaster';
import { SessionProvider } from 'next-auth/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from "@vercel/analytics/react"

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
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
        <SessionProvider session={pageProps.session}>
          <NextUIProvider>
            <Component {...pageProps} />
            <Toaster />
          </NextUIProvider>
        </SessionProvider>
      </ThemeProvider>
      <SpeedInsights />
      <Analytics />
    </>
  );
}
export default MyApp;

