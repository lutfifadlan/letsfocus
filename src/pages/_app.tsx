import '../styles/globals.css';
import { ThemeProvider } from 'next-themes';
import type { AppProps } from 'next/app';
import { NextUIProvider} from "@nextui-org/react";
import { Toaster } from '@/components/ui/toaster';
import { SessionProvider } from 'next-auth/react';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class">
      <SessionProvider session={pageProps.session}>
        <NextUIProvider>
          <Component {...pageProps} />
          <Toaster />
        </NextUIProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}

export default MyApp;
