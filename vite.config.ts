import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/pokemol/',
  define: {
    // shown in Options, so players can tell which version they are running
    __APP_BUILD__: JSON.stringify(new Date().toISOString().slice(0, 16).replace('T', ' ')),
  },
  plugins: [
    preact(),
    VitePWA({
      // a new version waits until the title screen (usually the next launch) instead of
      // replacing files under a running game; src/state/pwa.ts registers the worker
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        // the app's identity for browsers. Never change it: installed copies would become a
        // different app. If Chrome on Android says the game is "already installed" when it isn't,
        // another web app installed from mickaelvanhoutte.github.io is the cause (a Chrome bug
        // with several apps on one origin), not this manifest.
        id: '/pokemol/?app=atelier-bestioles',
        name: 'Atelier Bestioles',
        short_name: 'Bestioles',
        description: 'Une aventure de Bestioles dessinées à la main.',
        lang: 'fr',
        theme_color: '#2b1f4a',
        background_color: '#1b1430',
        display: 'standalone',
        orientation: 'any',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // everything is downloaded in the background on the first visit, then the game runs offline
        globPatterns: ['**/*.{js,css,html,png,svg,webp,woff2,ogg,mp3,m4a,wav,json}'],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },
    }),
  ],
});
