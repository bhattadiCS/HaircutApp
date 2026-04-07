import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import {
  getFirebaseBuildGuardMessage,
  getMissingFirebaseConfigKeys,
} from './src/lib/firebaseConfig'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const disablePwaDev = env.VITE_DISABLE_PWA_DEV === 'true'
  const missingFirebaseConfigKeys = getMissingFirebaseConfigKeys(env)
  const shouldRequireFirebaseConfig = mode === 'production' && env.VITE_USE_FIREBASE_EMULATORS !== 'true'

  if (shouldRequireFirebaseConfig && missingFirebaseConfigKeys.length > 0) {
    throw new Error(getFirebaseBuildGuardMessage(missingFirebaseConfigKeys))
  }

  return {
    base: '/HaircutApp/',
    worker: {
      format: 'es',
    },
    plugins: [
      react(),
      VitePWA({
        base: '/HaircutApp/',
        scope: '/HaircutApp/',
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        manifestFilename: 'manifest.json',
        includeAssets: [
          'favicon.png',
          'icons/icon-192.png',
          'icons/icon-192-maskable.png',
          'icons/icon-512.png',
          'icons/icon-512-maskable.png',
          'icons/apple-touch-icon.png',
          'apple-splash/iphone-15-pro-portrait.png',
          'apple-splash/iphone-15-pro-landscape.png',
          'apple-splash/iphone-15-pro-max-portrait.png',
          'apple-splash/iphone-15-pro-max-landscape.png',
        ],
        manifest: {
          name: 'StyleShift AI',
          short_name: 'StyleShift',
          description: 'Local-first hairstyle simulations, live portrait coaching, and barber-ready briefs built for mobile.',
          start_url: '/HaircutApp/',
          scope: '/HaircutApp/',
          display: 'standalone',
          background_color: '#020617',
          theme_color: '#020617',
          orientation: 'portrait',
          icons: [
            {
              src: '/HaircutApp/icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/HaircutApp/icons/icon-192-maskable.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: '/HaircutApp/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/HaircutApp/icons/icon-512-maskable.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          cleanupOutdatedCaches: true,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,json,woff2}'],
          navigateFallback: '/HaircutApp/index.html',
        },
        devOptions: {
          enabled: !disablePwaDev,
          type: 'module',
        },
      }),
    ],
    build: {
      modulePreload: {
        resolveDependencies: (_filename, dependencies, context) => {
          if (context.hostType !== 'html') {
            return dependencies
          }

          return dependencies.filter((dependency) => !dependency.includes('assets/firebase'))
        },
      },
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['react', 'react-dom', 'framer-motion', 'lucide-react'],
            'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
            'vision': ['@mediapipe/tasks-vision'],
            'ai': ['@xenova/transformers']
          }
        }
      },
      chunkSizeWarningLimit: 1000
    },
  }
})
