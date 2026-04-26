import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/Company/",
  build: {
    rollupOptions: {
      output: {
        // Rolldown (Vite 8) requires manualChunks as a function
        manualChunks(id) {
          if (id.includes('firebase/auth'))      return 'vendor-firebase-auth';
          if (id.includes('firebase/firestore')) return 'vendor-firebase-firestore';
          if (id.includes('firebase/storage'))   return 'vendor-firebase-storage';
          if (id.includes('firebase/app') || id.includes('node_modules/firebase'))
                                                 return 'vendor-firebase-app';
          if (id.includes('framer-motion'))      return 'vendor-motion';
          if (id.includes('react-router-dom') || id.includes('react-router'))
                                                 return 'vendor-router';
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/'))
                                                 return 'vendor-react';
        }
      }
    }
  }
})
