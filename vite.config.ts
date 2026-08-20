import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    proxy: {
      // Proxy PlantNet API requests to bypass CORS
      '/api/plantnet': {
        target: 'https://my-api.plantnet.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/plantnet/, ''),
        secure: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // Strip browser-sent headers that cause PlantNet to reject the request
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
          });
        }
      }
    }
  },
  build: {
    // Raise warning threshold to 600kB (our split chunks will be well under this)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/lucide-react')) {
            return 'vendor-ui';
          }
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3') || id.includes('node_modules/victory')) {
            return 'vendor-charts';
          }
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase';
          }
          if (id.includes('node_modules/date-fns')) {
            return 'vendor-dates';
          }
        }
      }
    }
  }
})

