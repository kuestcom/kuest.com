import { defineConfig } from 'astro/config'
import cloudflare from '@astrojs/cloudflare'
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  adapter: cloudflare(),
  output: 'server',
  integrations: [react(), mdx()],
  trailingSlash: 'never',
  build: {
    format: 'file',
    inlineStylesheets: 'always',
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
