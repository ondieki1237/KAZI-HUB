import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kazihub.app', // Changed to a unique ID
  appName: 'kazihub',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    // Allow HTTP traffic (required for local network testing)
    allowNavigation: [
      '192.168.1.157:5000', // Backend URL
      'localhost:5000',     // Local backend
    ],
    cleartext: true,        // Allow HTTP (not HTTPS) for development
  },
};

export default config;