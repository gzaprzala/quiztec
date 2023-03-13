import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  root: './frontend',

  build: {
    minify: 'esbuild',
    manifest: true,
    target: 'esnext',
    outDir: '../web',
    cssTarget: 'esnext',
    emptyOutDir: true,
  },
})
