import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  const HOST = env.HOST || 'localhost';
  const PORT = env.PORT || '5000';
  const CLIENT_PORT = 5173;

  const isProduction = mode === 'production';

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      port: CLIENT_PORT,
      host: true,
      proxy: {
        '/api': {
          target: isProduction ? 'https://kazi-hub.onrender.com' : `http://${HOST}:${PORT}`,
          changeOrigin: true,
          secure: false,
        },
        '/socket.io': {
          target: isProduction ? 'wss://kazi-hub.onrender.com' : `ws://${HOST}:${PORT}`,
          ws: true,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      port: CLIENT_PORT,
      host: true,
    },
    define: {
      'process.env.VITE_API_URL': JSON.stringify(isProduction 
        ? 'https://kazi-hub.onrender.com/api' 
        : `http://${HOST}:${PORT}/api`
      ),
    },
  };
});
