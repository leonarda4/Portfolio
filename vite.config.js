import { defineConfig } from 'vite'
import { createStickerHandler } from './server/stickers.js'

export default defineConfig({
  plugins: [{
    name: 'portfolio-stickers',
    configureServer(server) { server.middlewares.use(createStickerHandler()) },
    configurePreviewServer(server) { server.middlewares.use(createStickerHandler()) },
  }],
})
