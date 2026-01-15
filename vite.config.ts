import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['saxophone_music_3094.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'LaCantat',
        short_name: 'LaCantat',
        description: 'Aplicație pentru gestionarea evenimentelor formației',
        theme_color: '#6366f1',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'saxophone_music_3094.ico',
            sizes: '48x48',
            type: 'image/x-icon'
          },
          {
            src: 'saxophone_music_3094.ico',
            sizes: '192x192',
            type: 'image/x-icon'
          },
          {
            src: 'saxophone_music_3094.ico',
            sizes: '512x512',
            type: 'image/x-icon',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        skipWaiting: false, // Nu activa automat, așteaptă mesajul SKIP_WAITING
        clientsClaim: false, // Nu preia controlul automat
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false // Dezactivează PWA în development pentru a evita erorile cu service worker
      }
    })
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})