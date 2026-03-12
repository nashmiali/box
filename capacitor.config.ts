import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.boxitv.app',
  appName: 'BoxiTV',
  webDir: 'dist',
  server: {
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
