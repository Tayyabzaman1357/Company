import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Base path: "/Company/" for GitHub Pages, "/" for Vercel/other hosts
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_DEPLOY_TARGET === 'ghpages' ? '/Company/' : '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-firebase-app':       ['firebase/app'],
          'vendor-firebase-auth':      ['firebase/auth'],
          'vendor-firebase-firestore': ['firebase/firestore'],
          'vendor-firebase-storage':   ['firebase/storage'],
          'vendor-react':              ['react', 'react-dom'],
          'vendor-router':             ['react-router-dom'],
          'vendor-motion':             ['framer-motion'],
        }
      }
    }
  }
})
