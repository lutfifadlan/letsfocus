import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'today.letsfocus.www',
  appName: "Let's Focus",
  webDir: 'out',
  server: {
    url: 'http://192.168.0.102:3000',
    cleartext: true,
  },
  ios: {
    scheme: "App",
    contentInset: "always",
    limitsNavigationsToAppBoundDomains: true
  },
  plugins: {
    CapacitorCookies: {
      enabled: true
    }
  }
};

export default config;
