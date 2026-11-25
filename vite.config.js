import { defineConfig } from 'vite'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createStickerHandler } from './server/stickers.js'
import { createDrawingHandler } from './server/drawings.js'

const projectSlugs = ['project-one', 'project-two', 'project-three', 'project-four'].map(file =>
  JSON.parse(readFileSync(resolve('src/content', `${file}.json`), 'utf8')).slug,
)

export default defineConfig({
  appType: 'mpa',
  plugins: [{
    name: 'portfolio-stickers',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const pathname = new URL(request.url, 'http://localhost').pathname
        const projectPath = pathname.match(/^\/projects\/([^/]+)\/?$/)
        if (!projectPath) return next()
        if (!projectSlugs.includes(projectPath[1])) { response.writeHead(404).end('Not found'); return }
        request.url = '/index.html'
        next()
      })
      server.middlewares.use(createStickerHandler())
      server.middlewares.use(createDrawingHandler())
    },
    configurePreviewServer(server) { server.middlewares.use(createStickerHandler()); server.middlewares.use(createDrawingHandler()) },
  }],
})
