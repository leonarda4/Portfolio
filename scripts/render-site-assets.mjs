// Run with Playwright available: node scripts/render-site-assets.mjs
// The template reuses the site's fonts, shared accent class, and original SVGs.
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const publicDir = new URL('../public/', import.meta.url)
const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
  await page.goto(new URL('./social-preview.html', import.meta.url).href)
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all([...document.images].map(image => image.decode()))
    if (!document.fonts.check('48px Inter') || !document.fonts.check('54px Lacquer')) throw new Error('Preview fonts did not load')
  })
  await fs.mkdir(new URL('assets/social/', publicDir), { recursive: true })
  await page.locator('.preview').screenshot({ path: fileURLToPath(new URL('assets/social/portfolio-preview.png', publicDir)) })

  const sunUrl = new URL('assets/theme/sun.svg', publicDir).href
  for (const size of [32, 180]) {
    await page.evaluate(async ({ size, sunUrl }) => {
      const image = new Image()
      image.src = sunUrl
      await image.decode()
      const icon = document.createElement('div')
      icon.id = 'icon'
      icon.style.cssText = `position:relative;width:${size}px;height:${size}px;`
      // Give the home-screen icon a solid background; keep the favicon transparent.
      if (size === 180) icon.style.background = '#161616'
      const inset = size === 180 ? 16 : 1
      const scale = (size - 2 * inset) / Math.max(image.naturalWidth, image.naturalHeight)
      const width = image.naturalWidth * scale
      const height = image.naturalHeight * scale
      image.style.cssText = `position:absolute;left:${(size - width) / 2}px;top:${(size - height) / 2}px;transform:scale(${scale});transform-origin:top left;`
      icon.append(image)
      document.body.replaceChildren(icon)
    }, { size, sunUrl })
    await page.locator('#icon').screenshot({ path: fileURLToPath(new URL(`assets/theme/sun-${size}.png`, publicDir)), omitBackground: true })
  }
  console.log('Rendered sharing cover (1200 × 630), favicon fallback (32 × 32), and home-screen icon (180 × 180).')
} finally {
  await browser.close()
}
