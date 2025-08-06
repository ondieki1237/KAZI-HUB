import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory
  const env = loadEnv(mode, process.cwd(), '');

  const isProduction = mode === 'production';
  const HOST = env.HOST || 'localhost';
  const PORT = env.PORT || '5000';
  const CLIENT_PORT = 5173;

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'], // Keep this if needed for dynamic imports
    },
    server: {
      port: CLIENT_PORT,
      host: true,
      // Remove proxy since absolute URLs are used in api.ts and components
    },
    preview: {
      port: CLIENT_PORT,
      host: true,
      allowedHosts: ['kazi-hub-1.onrender.com'],  // <-- Add this line
    },
    build: {
      outDir: 'dist',
      chunkSizeWarningLimit: 1000, // Suppress large chunk warnings
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'socket.io-client'], // Optimize bundle size
          },
        },
      },
    },
    define: {
      'process.env.VITE_API_URL': JSON.stringify(isProduction 
        ? 'https://kazi-hub.onrender.com/api' 
        : `http://${HOST}:${PORT}/api`
      ),
    },
  };
});
