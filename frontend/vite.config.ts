import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    sourcemap: false,
    outDir: 'dist',
    rollupOptions: {
      input: {
        action: resolve(__dirname, 'src/popup/index.html'),
        content: resolve(__dirname, 'src/content/contentScript.ts'),
        background: resolve(__dirname, 'src/background/background.ts'),

      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
