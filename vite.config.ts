import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
  base: './',
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['icon.svg'],
    manifest: {
      name: 'KaloriVision AI', short_name: 'KaloriVision', description: 'Fotoğrafını çek, besinini tanı, kalorini öğren.',
      lang: 'tr', start_url: './', scope: './', display: 'standalone', orientation: 'portrait', background_color: '#f6faf7', theme_color: '#16a34a',
      icons: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }],
    },
    workbox: { globPatterns: ['**/*.{js,css,html,svg,png}'], maximumFileSizeToCacheInBytes: 30 * 1024 * 1024, navigateFallback: 'index.html' },
  })],
  build: { chunkSizeWarningLimit: 2000 },
});
