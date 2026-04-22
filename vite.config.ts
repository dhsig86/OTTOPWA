import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false, // We will use public/manifest.json
      includeAssets: ['icons/*.png', 'offline.html'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // navigateFallback só entra quando a rede falha de verdade.
        // Excluímos caminhos que não devem nunca ser interceptados pelo SW:
        //   - /login  → pode receber query params do Firebase OAuth redirect
        //   - /__/   → handler interno do Firebase Authentication
        //   - /modules/webview → iframes externos, não são rotas do app
        navigateFallback: '/offline.html',
        navigateFallbackDenylist: [
          /^\/login/,        // Firebase redireciona de volta para /login com ?apiKey=... — não cachear
          /^\/__\//,         // Firebase Auth handler interno
          /^\/modules\/webview/, // Módulos externos — não são rotas React
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'CacheFirst',
          },
          {
            // Para navegações do app: NetworkFirst com fallback para cache.
            // networkTimeoutSeconds garante que o SW não fica esperando para sempre
            // e exibe offline.html só se rede E cache falharem.
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
              },
            },
          }
        ]
      }
    })
  ],
})
