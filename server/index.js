import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'
import { createStickerHandler } from './stickers.js'

const root = resolve('dist')
const api = createStickerHandler()
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.pdf': 'application/pdf', '.woff': 'font/woff', '.woff2': 'font/woff2' }

const server = createServer(async (request, response) => {
  const url = new URL(request.url, 'http://localhost')
  if (url.pathname.startsWith('/api/')) return api(request, response)
  if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405, { Allow: 'GET, HEAD' }).end(); return }
  try {
    const path = resolve(root, `.${decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname)}`)
    if (!path.startsWith(root + sep)) { response.writeHead(403).end(); return }
    const info = await stat(path)
    if (!info.isFile()) { response.writeHead(404).end(); return }
    const headers = { 'Content-Type': types[extname(path).toLowerCase()] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Accept-Ranges': 'bytes', 'Cache-Control': path.endsWith('/index.html') ? 'no-cache' : 'public, max-age=3600' }
    // Preserve seeking and efficient loading for the portfolio's existing videos.
    const range = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/)
    const start = range ? Number(range[1]) : 0
    const end = range && range[2] ? Math.min(Number(range[2]), info.size - 1) : info.size - 1
    if (range && (start > end || start >= info.size)) { response.writeHead(416, { 'Content-Range': `bytes */${info.size}` }).end(); return }
    headers['Content-Length'] = range ? end - start + 1 : info.size
    if (range) headers['Content-Range'] = `bytes ${start}-${end}/${info.size}`
    response.writeHead(range ? 206 : 200, headers)
    if (request.method === 'HEAD' || info.size === 0) { response.end(); return }
    const stream = createReadStream(path, { start, end })
    stream.on('error', () => response.destroy())
    stream.pipe(response)
  } catch { response.writeHead(404).end('Not found') }
})

const port = Number(process.env.PORT || 3000)
server.listen(port, process.env.HOST || '127.0.0.1', () => console.log(`Portfolio: http://localhost:${port}`))
