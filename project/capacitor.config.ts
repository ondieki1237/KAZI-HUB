import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.seth.kazihub',   // use reverse domain style (Play Store requirement)
  appName: 'KaziHub',          // display name of your app
  webDir: 'dist',              // where vite build outputs files
  bundledWebRuntime: false,    // keep runtime separate
  server: {
    androidScheme: 'https'     // ensures secure WebView communication
  }
};

export default config;
