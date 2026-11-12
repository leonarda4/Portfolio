// Run with the portfolio dev server and Playwright available:
// node scripts/render-site-assets.mjs
// PORTFOLIO_CAPTURE_URL can point to another running preview.
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const publicDir = new URL('../public/', import.meta.url)
const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 1512, height: 1000 }, deviceScaleFactor: 1, colorScheme: 'dark', reducedMotion: 'reduce' })
  await page.goto(`${process.env.PORTFOLIO_CAPTURE_URL || 'http://localhost:5173'}/#/about`)
  await page.locator('.home-personal[data-layout="collage"]').waitFor()
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all([...document.querySelectorAll('.home-personal img')].map(image => image.decode()))
    if (!document.fonts.check('16px Inter') || !document.fonts.check('48px Lacquer')) throw new Error('Portfolio fonts did not load')
    const top = document.querySelector('.home-personal').getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: top - 32, behavior: 'instant' })
  })
  const clip = await page.evaluate(() => {
    const section = document.querySelector('.about-collage').getBoundingClientRect()
    const crayons = [...document.querySelectorAll('.about-crayons--about button')].map(element => element.getBoundingClientRect())
    return { x: section.left + window.scrollX, y: section.top + window.scrollY, width: section.width, height: Math.ceil(Math.max(section.bottom, ...crayons.map(box => box.bottom)) - section.top + 16) }
  })
  await fs.mkdir(new URL('assets/social/', publicDir), { recursive: true })
  await page.screenshot({ path: fileURLToPath(new URL('assets/social/about-section.png', publicDir)), clip, fullPage: true })

  await page.setViewportSize({ width: 1200, height: 630 })
  await page.goto(new URL('./social-preview.html', import.meta.url).href)
  await page.evaluate(async () => {
    await Promise.all([...document.images].map(image => image.decode()))
  })
  await page.locator('.preview').screenshot({ path: fileURLToPath(new URL('assets/social/about-preview.png', publicDir)) })

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
