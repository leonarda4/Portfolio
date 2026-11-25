import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { get } from 'node:http'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import test from 'node:test'
import { experiments } from '../src/content/experiments.js'
import { profile } from '../src/content/profile.js'
import { imageMetadata } from './lib/image-metadata.js'

const root = process.cwd()
const origin = 'https://leonardalovric.com'
const projectFiles = ['project-three.json', 'project-one.json', 'project-two.json', 'project-four.json']
const projects = await Promise.all(projectFiles.map(async file =>
  JSON.parse(await readFile(resolve(root, 'src/content', file), 'utf8')),
))

function visibleText(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function flattenText(value) {
  if (Array.isArray(value)) return value.flatMap(flattenText)
  if (!value || typeof value !== 'object') return []
  if (value.type === 'pending') return []
  const found = []
  for (const [key, child] of Object.entries(value)) {
    if (['type', 'id', 'src', 'poster', 'logo', 'dateTime', 'layout', 'controls', 'autoPlay', 'muted', 'loop', 'preload'].includes(key)) continue
    if (typeof child === 'string' && child.trim()) found.push(child)
    else found.push(...flattenText(child))
  }
  return found
}

async function assertSocialImage(html, base) {
  const meta = name => html.match(new RegExp(`<meta (?:name|property)="${name}" content="([^"]*)"`))?.[1]
  const image = new URL(meta('og:image'))
  assert.equal(image.origin, origin)
  assert.match(image.pathname, /\.(png|jpe?g)$/i, 'social images use a widely supported raster format')
  const response = await fetch(`${base}${image.pathname}`)
  assert.equal(response.status, 200)
  const actual = await imageMetadata(resolve(root, 'dist', `.${image.pathname}`))
  assert.equal(meta('og:image:type'), actual.type)
  assert.equal(meta('og:image:width'), String(actual.width))
  assert.equal(meta('og:image:height'), String(actual.height))
  assert.match(response.headers.get('content-type'), new RegExp(actual.type))
  assert.equal(meta('twitter:image'), meta('og:image'))
  assert.equal(meta('twitter:image:alt'), meta('og:image:alt'))
  assert.ok(meta('og:image:alt'))
}

async function availablePort() {
  const server = createServer()
  await new Promise((resolveListen, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolveListen)
  })
  const { port } = server.address()
  await new Promise(resolveClose => server.close(resolveClose))
  return port
}

async function waitForServer(url, child) {
  const deadline = Date.now() + 5000
  while (Date.now() < deadline && child.exitCode === null) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {}
    await new Promise(resolveDelay => setTimeout(resolveDelay, 80))
  }
  throw new Error('Production server did not start.')
}

test('production build serves machine-readable pages and assets', async t => {
  const port = await availablePort()
  const child = spawn(process.execPath, ['server/index.js'], {
    cwd: root,
    env: { ...process.env, HOST: '127.0.0.1', PORT: String(port) },
    stdio: 'ignore',
  })
  t.after(() => child.kill())
  const base = `http://127.0.0.1:${port}`
  await waitForServer(base, child)

  const homeResponse = await fetch(base)
  assert.equal(homeResponse.status, 200)
  const homeHtml = await homeResponse.text()
  const homeText = visibleText(homeHtml)
  assert.match(homeText, /Leonarda Lovrić/)
  assert.match(homeText, /product designer/i)
  assert.match(homeHtml, /href="\/projects\/tomsoft\/"/)
  await assertSocialImage(homeHtml, base)
  assert.ok(!homeHtml.includes('src="/assets/tomsoft/tomsoft-cover.svg"'), 'initial HTML avoids downloading the archival Tomsoft SVG')
  assert.match(homeHtml, /id="play"/)
  for (const experiment of experiments) {
    assert.ok(homeText.includes(experiment.cardTitle), `${experiment.slug} is readable without JavaScript`)
    assert.ok(homeHtml.includes(`href="${experiment.video}"`), `${experiment.slug} video has a crawlable link`)
  }

  const homeTitle = homeHtml.match(/<title>(.*?)<\/title>/)?.[1]
  const homeDescription = homeHtml.match(/<meta name="description" content="(.*?)"/)?.[1]
  assert.ok(homeTitle)
  assert.ok(homeDescription)
  assert.match(homeHtml, /<link rel="canonical" href="https:\/\/leonardalovric\.com\/"/)

  const descriptions = new Set([homeDescription])
  for (const project of projects) {
    const response = await fetch(`${base}/projects/${project.slug}/`)
    assert.equal(response.status, 200, `${project.slug} returns HTTP 200`)
    assert.match(response.headers.get('content-type'), /text\/html/)
    const html = await response.text()
    await assertSocialImage(html, base)
    const text = visibleText(html)
    assert.ok(text.includes(project.title), `${project.slug} title is in initial HTML`)
    assert.ok(text.includes(project.summary), `${project.slug} summary is in initial HTML`)
    for (const item of project.metadata) assert.ok(text.includes(item.value), `${project.slug} exposes ${item.label}`)
    assert.match(html, new RegExp(`<link rel="canonical" href="${origin}/projects/${project.slug}/"`))
    assert.ok(html.includes('name="description"'))
    assert.ok(html.includes('property="og:description"'))
    assert.match(html, /property="og:type" content="article"/)
    const description = html.match(/<meta name="description" content="(.*?)"/)?.[1]
    assert.ok(description)
    assert.ok(!descriptions.has(description), `${project.slug} metadata description is unique`)
    descriptions.add(description)
    assert.ok(html.includes('type="application/ld+json"'))
    const jsonLdSource = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1]
    assert.ok(jsonLdSource, `${project.slug} has JSON-LD`)
    const jsonLd = JSON.parse(jsonLdSource)
    assert.deepEqual(jsonLd['@graph'].find(item => item['@type'] === 'Person').sameAs, profile.socials.filter(item => item.url).map(item => item.url))
    assert.ok(jsonLd['@graph'].some(item => item['@type'] === 'CreativeWork' && item.name === project.title))
    for (const section of project.sections || []) {
      for (const block of section.blocks || []) {
        if (block.type !== 'pending' && block.type === 'text' && block.body) {
          assert.ok(text.includes(block.body.replace(/\s+/g, ' ').trim()), `${project.slug} includes ${block.title || section.label}`)
        }
        if (block.description) {
          assert.ok(text.includes(block.description), `${project.slug} includes the description for ${block.type}`)
        }
      }
    }
    const markdownResponse = await fetch(`${base}/projects/${project.slug}.md`)
    assert.equal(markdownResponse.status, 200)
    assert.match(markdownResponse.headers.get('content-type'), /text\/markdown/)
    const markdown = await markdownResponse.text()
    assert.ok(markdown.includes(project.title))
    for (const section of project.sections || []) {
      for (const block of section.blocks || []) {
        if (block.type === 'text' && block.body) assert.ok(markdown.includes(block.body), `${project.slug} Markdown includes ${block.title || section.label}`)
        if (block.description) assert.ok(markdown.includes(block.description), `${project.slug} Markdown includes the description for ${block.type}`)
      }
    }
    const directoryWithoutSlash = await fetch(`${base}/projects/${project.slug}`)
    assert.equal(directoryWithoutSlash.status, 200)
    assert.equal(directoryWithoutSlash.url, `${base}/projects/${project.slug}/`)
    const redirect = await fetch(`${base}/projects/${project.slug}?ref=audit`, { redirect: 'manual' })
    assert.equal(redirect.status, 308)
    assert.equal(redirect.headers.get('location'), `/projects/${project.slug}/?ref=audit`)
  }

  const rootJsonLd = JSON.parse(homeHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])
  assert.ok(rootJsonLd['@graph'].some(item => item['@type'] === 'Person'))
  assert.deepEqual(rootJsonLd['@graph'].find(item => item['@type'] === 'Person').sameAs, profile.socials.filter(item => item.url).map(item => item.url))
  assert.ok(rootJsonLd['@graph'].some(item => item['@type'] === 'ProfilePage'))

  const robots = await fetch(`${base}/robots.txt`)
  assert.equal(robots.status, 200)
  const robotsText = await robots.text()
  assert.match(robotsText, /User-agent: OAI-SearchBot[\s\S]*?Allow: \//)
  assert.match(robotsText, /User-agent: GPTBot[\s\S]*?Disallow: \//)
  assert.match(robotsText, /Sitemap: https:\/\/leonardalovric\.com\/sitemap\.xml/)

  const sitemap = await (await fetch(`${base}/sitemap.xml`)).text()
  assert.match(sitemap, /<urlset/)
  for (const project of projects) assert.ok(sitemap.includes(`${origin}/projects/${project.slug}/`))

  const llms = await (await fetch(`${base}/llms.txt`)).text()
  const full = await (await fetch(`${base}/llms-full.txt`)).text()
  assert.match(llms, /# Leonarda Lovrić/)
  assert.match(llms, /\/projects\/tomsoft\.md/)
  for (const experiment of experiments) {
    assert.ok(llms.includes(experiment.title))
    assert.ok(full.includes(experiment.title))
  }
  for (const project of projects) {
    assert.ok(full.includes(project.title))
    for (const section of project.sections || []) {
      for (const block of section.blocks || []) {
        if (block.type === 'text' && block.body) assert.ok(full.includes(block.body), `llms-full includes ${block.title || section.label}`)
      }
    }
  }

  const portfolio = await (await fetch(`${base}/portfolio.json`)).json()
  assert.equal(portfolio.projects.length, projects.length)
  assert.deepEqual(portfolio.experiments.map(item => item.slug), experiments.map(item => item.slug))
  assert.equal(portfolio.projects[0].canonicalUrl, `${origin}/projects/${projects[0].slug}/`)
  assert.ok(!JSON.stringify(portfolio).includes('editorialNotes'))
  assert.ok(!JSON.stringify(portfolio).includes('coverBrief'))
  assert.ok(!JSON.stringify(portfolio).includes('"type":"pending"'))
  const schema = await (await fetch(`${base}/portfolio.schema.json`)).json()
  assert.ok(schema.required.includes('projects'))

  const notFound = await fetch(`${base}/not-a-public-page/`)
  assert.equal(notFound.status, 404)
  const www = await new Promise((resolveResponse, reject) => {
    get(`${base}/projects/echo/?ref=audit`, { headers: { Host: 'www.leonardalovric.com' } }, response => {
      response.resume()
      resolveResponse(response)
    }).on('error', reject)
  })
  assert.equal(www.statusCode, 308)
  assert.equal(www.headers.location, `${origin}/projects/echo/?ref=audit`)
  const vercel = JSON.parse(await readFile(resolve(root, 'vercel.json'), 'utf8'))
  assert.equal(vercel.trailingSlash, true)
  assert.ok(vercel.redirects.some(rule => rule.permanent && rule.has?.some(condition => condition.type === 'host' && condition.value === 'www.leonardalovric.com')))
})
