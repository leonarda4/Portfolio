import { defineConfig } from 'vite'
import { createStickerHandler } from './server/stickers.js'
import { createDrawingHandler } from './server/drawings.js'

export default defineConfig({
  plugins: [{
    name: 'portfolio-stickers',
    configureServer(server) { server.middlewares.use(createStickerHandler()); server.middlewares.use(createDrawingHandler()) },
    configurePreviewServer(server) { server.middlewares.use(createStickerHandler()); server.middlewares.use(createDrawingHandler()) },
  }],
})
