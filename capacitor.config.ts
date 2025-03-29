import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'today.letsfocus.www',
  appName: 'letsfocus',
  webDir: 'out',
  server: {
    url: 'http://192.168.0.102:3000',
    cleartext: true,
  },
};

export default config;
