import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// The social preview needs an absolute address. On Vercel it is filled in
// from the project's own domain; set SITE_URL to override (for example once
// you add a custom domain).
const site = (
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://timeatlas.vercel.app')
).replace(/\/$/, '')

const siteUrl = () => ({
  name: 'site-url',
  transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', site),
})

export default defineConfig({
  // Relative paths so the build works on Vercel and inside a preview frame.
  base: './',
  plugins: [react(), siteUrl()],
  build: {
    // The Giza fonts are small, so they are inlined. The paintings and the Inter font
    // stay separate files so the browser can cache them.
    assetsInlineLimit: (file, content) => !file.includes('/src/home/') && !file.includes('/src/site/') && !file.includes('inter') && content.length <= 120000,
    chunkSizeWarningLimit: 1600,
    // Every experience is its own page, so the home page never downloads a 3D engine.
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        explore: resolve(import.meta.dirname, 'explore/index.html'),
        timeline: resolve(import.meta.dirname, 'timeline/index.html'),
        about: resolve(import.meta.dirname, 'about/index.html'),
        gizaPage: resolve(import.meta.dirname, 'destinations/giza/index.html'),
        romePage: resolve(import.meta.dirname, 'destinations/rome/index.html'),
        giza: resolve(import.meta.dirname, 'experience/giza/index.html'),
        rome: resolve(import.meta.dirname, 'experience/rome-100-ad/index.html'),
      },
    },
  },
})
