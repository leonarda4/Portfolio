import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { profile } from '../src/content/profile.js'
import { aboutNotes } from '../src/content/about-collage.js'
import { experiments } from '../src/content/experiments.js'
import { imageMetadata } from './lib/image-metadata.js'

const root = process.cwd()
const output = resolve(root, 'dist')
const origin = 'https://leonardalovric.com'
const readyExperiments = experiments.filter(item => (item.cover || item.coverVideo) && item.title)
const optimizedMedia = JSON.parse(await readFile(resolve(root, 'src/content/optimized-media.json'), 'utf8'))
const tomsoftPreviews = JSON.parse(await readFile(resolve(root, 'src/content/tomsoft-cover-previews.json'), 'utf8'))
const fallbackImage = {
  url: `${origin}/assets/social/portfolio-preview.png`,
  alt: 'Leonarda Lovrić’s portfolio landing screen with her name, product designer title, and playful introduction.',
  ...await imageMetadata(resolve(root, 'public/assets/social/portfolio-preview.png')),
}
async function socialImageFor(project) {
  if (!/\.(png|jpe?g)$/i.test(project?.cover || '')) return fallbackImage
  return {
    url: new URL(project.cover, origin).href,
    alt: project.coverAlt || project.title,
    ...await imageMetadata(resolve(root, 'public', `.${project.cover}`)),
  }
}
const projectFiles = ['project-three.json', 'project-one.json', 'project-two.json', 'project-four.json']
const projects = await Promise.all(projectFiles.map(async file =>
  JSON.parse(await readFile(resolve(root, 'src/content', file), 'utf8')),
))

const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character])

function publicValue(value) {
  if (Array.isArray(value)) return value.map(publicValue).filter(item => item !== undefined)
  if (!value || typeof value !== 'object') return value
  if (value.type === 'pending') return undefined
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !['editorialNotes', 'coverBrief'].includes(key))
    .map(([key, item]) => [key, publicValue(item)])
    .filter(([, item]) => item !== undefined))
}

function publicProject(project) {
  const fields = ['slug', 'title', 'cardTitle', 'cardStatus', 'summary', 'tags', 'cover', 'coverGraphic', 'coverVideo', 'coverAlt', 'metadata', 'teaser', 'sections']
  return {
    ...Object.fromEntries(fields.filter(key => project[key] !== undefined).map(key => [key, publicValue(project[key])])),
    canonicalUrl: `${origin}/projects/${project.slug}/`,
  }
}

const publicProjects = projects.map(publicProject)
await mkdir(resolve(output, 'projects'), { recursive: true })

function renderImage(src, alt, { eager = false, sizes = '(max-width: 760px) calc(100vw - 48px), 680px' } = {}) {
  const image = optimizedMedia.images[src]
  const attributes = image
    ? ` width="${image.width}" height="${image.height}" srcset="${image.sources.map(source => `${escapeHtml(source.src)} ${source.width}w`).join(', ')}" sizes="${escapeHtml(sizes)}"`
    : ''
  return `<img src="${escapeHtml(image?.src || src)}" alt="${escapeHtml(alt)}"${attributes} decoding="async"${eager ? ' fetchpriority="high"' : ' loading="lazy"'}>`
}

function renderCover(project, options) {
  if (project.coverGraphic === 'tomsoft') {
    // Match the existing component's embedded previews instead of fetching its
    // multi-megabyte archival SVG before React mounts the interactive cover.
    return `<div class="tomsoft-cover" role="img" aria-label="${escapeHtml(project.coverAlt)}">${Object.entries(tomsoftPreviews).map(([name, src]) => `<div class="tomsoft-cover__panel tomsoft-cover__panel--${escapeHtml(name)}"><div class="tomsoft-cover__screen"><img class="tomsoft-cover__screen-preview" src="${escapeHtml(src)}" alt="" width="480" height="300"></div></div>`).join('')}</div>`
  }
  return project.cover ? renderImage(project.cover, project.coverAlt || '', options) : `<p class="cover-label">${escapeHtml(project.coverAlt || project.title)}</p>`
}

function renderMedia(item) {
  const source = item.src
  const alt = item.alt || item.title || ''
  const caption = item.caption || item.label
  if (!source) return ''
  if (/\.(mp4|mov|webm)(?:\?|$)/i.test(source)) {
    return `<figure class="study-media"><video controls preload="metadata"${item.poster ? ` poster="${escapeHtml(item.poster)}"` : ''}><source src="${escapeHtml(source)}"><a href="${escapeHtml(source)}">Watch ${escapeHtml(item.title || 'the video')}</a></video>${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ''}</figure>`
  }
  return `<figure class="study-media">${renderImage(source, alt)}${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ''}</figure>`
}

const hiddenKeys = new Set([
  'type', 'id', 'src', 'poster', 'logo', 'layout', 'controls', 'autoPlay', 'muted',
  'loop', 'preload', 'connector', 'width', 'height', 'orientation', 'dateTime',
])

function renderNode(value, key = '') {
  if (value == null || value === '') return ''
  if (Array.isArray(value)) {
    const children = value.map(item => renderNode(item)).filter(Boolean)
    return children.length ? `<ul>${children.map(child => `<li>${child}</li>`).join('')}</ul>` : ''
  }
  if (typeof value !== 'object') {
    const text = escapeHtml(value)
    if (key === 'title') return `<h3>${text}</h3>`
    if (key === 'date') return `<p><time>${text}</time></p>`
    if (key === 'label') return `<p><strong>${text}</strong></p>`
    if (key === 'url') return `<p><a href="${text}">${text}</a></p>`
    if (['body', 'description', 'caption', 'alt', 'note', 'quote', 'attribution', 'value', 'before', 'after'].includes(key)) {
      return `<p>${key === 'quote' ? '<q>' : ''}${text}${key === 'quote' ? '</q>' : ''}</p>`
    }
    return key ? `<p><strong>${escapeHtml(key)}:</strong> ${text}</p>` : `<p>${text}</p>`
  }
  if (value.type === 'pending') return ''
  if (value.src && (value.alt || /\.(mp4|mov|webm)(?:\?|$)/i.test(value.src))) return renderMedia(value)

  const date = value.dateTime ? value.dateTime : ''
  const parts = []
  for (const [childKey, childValue] of Object.entries(value)) {
    if (hiddenKeys.has(childKey)) continue
    if (childKey === 'date' && date) {
      parts.push(`<p><time datetime="${escapeHtml(date)}">${escapeHtml(childValue)}</time></p>`)
      continue
    }
    parts.push(renderNode(childValue, childKey))
  }
  return parts.filter(Boolean).join('')
}

function renderBlock(block) {
  if (block.type === 'pending') return ''
  if (block.type === 'text') {
    return `${block.title ? `<h3>${escapeHtml(block.title)}</h3>` : ''}${block.body ? `<p>${escapeHtml(block.body).replace(/\n\n/g, '</p><p>')}</p>` : ''}`
  }
  return renderNode(block)
}

function renderProjectHtml(project) {
  const mediaCover = renderCover(project, { eager: true, sizes: '100vw' })
  const metadata = (project.metadata || []).map(item =>
    `<div><dt>${escapeHtml(item.label)}</dt><dd>${escapeHtml(item.value)}</dd></div>`,
  ).join('')
  const renderSection = section => {
    const openingIndex = section.useSectionHeading ? -1 : (section.blocks?.[0]?.type === 'text' ? 0 : -1)
    const opening = section.blocks?.[openingIndex]
    const heading = opening?.title || section.label
    const description = section.summary || opening?.body
    const navLabel = section.navLabel || section.label
    const intro = heading !== navLabel ? `<p class="section-label">${escapeHtml(navLabel)}</p>` : ''
    const blocks = (section.blocks || []).map((block, index) => index === openingIndex ? '' : renderBlock(block)).filter(Boolean).join('')
    const nested = (section.subsections || []).map(renderSection).join('')
    return `<section id="${escapeHtml(section.id)}" class="study-section"><header class="section-intro">${intro}<h2>${escapeHtml(heading)}</h2>${description ? `<p class="section-description">${escapeHtml(description)}</p>` : ''}</header>${blocks}${nested}</section>`
  }
  const openingSections = (project.sections || []).filter(section => section.placement === 'opening').map(renderSection).join('')
  const otherSections = (project.sections || []).filter(section => section.placement !== 'opening').map(renderSection).join('')
  const teaser = project.teaser ? `<div class="study-teaser">${renderBlock(project.teaser)}</div>` : ''
  const links = (project.sections || []).map(section =>
    `<a class="layout-nav-item" href="#${escapeHtml(section.id)}">${escapeHtml(section.navLabel || section.label)}</a>`,
  ).join('')
  const desktopNav = `<nav class="layout-nav desktop-nav" aria-label="Case study sections">${links}</nav>`
  return `<a class="skip-link" href="#main-content">Skip to content</a><div id="main-content"><main class="case-study" data-project="${escapeHtml(project.slug)}"><div class="project-cover case-cover">${mediaCover}</div><div class="study-layout page-grid"><aside class="study-nav layout-sidebar"><div class="sidebar-heading"><a class="sidebar-back" href="/">Back to Home</a></div>${desktopNav}</aside><article class="study-content"><h1 class="study-title">${escapeHtml(project.title)}</h1><p class="study-summary">${escapeHtml(project.summary)}</p><dl class="project-metadata">${metadata}</dl>${openingSections}${teaser}${otherSections}<nav class="study-end" aria-label="Project navigation"><a href="/">All projects</a></nav></article></div></main></div>`
}

function renderHomeHtml() {
  const projectCards = publicProjects.map((project, index) =>
    `<a class="project-card" href="/projects/${escapeHtml(project.slug)}/"><div class="project-cover" role="img" aria-label="${escapeHtml(project.coverAlt || project.title)}">${renderCover(project, { eager: index < 2, sizes: '(max-width: 760px) 100vw, 40vw' })}</div><div class="card-copy"><h2>${escapeHtml(project.cardTitle || project.title)}${project.cardStatus ? `<span class="card-status"> / ${escapeHtml(project.cardStatus)}</span>` : ''}</h2><p>${escapeHtml(project.summary)}</p></div></a>`,
  ).join('')
  const experimentCards = readyExperiments.map(item =>
    `<a class="project-card" href="${escapeHtml(item.video)}"><div class="project-cover">${renderImage(item.cover, item.coverAlt, { sizes: '(max-width: 760px) 100vw, 40vw' })}</div><div class="card-copy"><h2>${escapeHtml(item.cardTitle || item.title)}${item.cardStatus ? `<span class="card-status"> / ${escapeHtml(item.cardStatus)}</span>` : ''}</h2></div></a>`,
  ).join('')
  const sideQuests = `<section id="play" class="home-section home-play" aria-labelledby="play-heading"><header class="home-section-heading"><h2 id="play-heading" class="accent-type">side quests</h2></header><div class="project-grid experiment-grid">${experimentCards}</div></section>`
  const notes = aboutNotes.map(note => `<li>${escapeHtml(note.text).replace(/\n/g, '<br>')}</li>`).join('')
  const navigationLinks = [['home', 'Home'], ['work', 'Work'], ['play', 'Side quests'], ['about', 'About me'], ['contact', 'Contact']]
    .map(([id, label]) => `<a class="layout-nav-item" href="#${id}">${label}</a>`).join('')
  return `<a class="skip-link" href="#main-content">Skip to content</a><div id="main-content"><main class="home page-grid"><aside class="layout-sidebar home-nav"><nav class="layout-nav desktop-nav" aria-label="Main navigation">${navigationLinks}</nav></aside><div class="layout-main"><section id="home" class="intro"><h1><span class="intro-statement">${escapeHtml(profile.name)} is a product designer who thinks in systems</span><span class="accent-heading accent-type">&amp; plays with tech.</span></h1><p>${escapeHtml(profile.introduction)}</p></section><section id="work" class="home-work" aria-label="Selected work"><div class="project-grid">${projectCards}</div></section>${sideQuests}<section id="about" class="home-section home-about" aria-labelledby="about-heading"><header class="home-section-heading"><h2 id="about-heading">About me</h2></header><ol class="about-notes" aria-label="My path into design">${notes}</ol></section><footer id="contact" class="footer home-section home-contact"><h2 id="contact-heading">Let’s connect</h2><a href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a><a href="${escapeHtml(profile.resume)}">Resume</a></footer></div></main></div>`
}

function jsonLdProject(project) {
  return {
    '@type': 'CreativeWork',
    '@id': `${origin}/projects/${project.slug}/#project`,
    name: project.title,
    description: project.summary,
    url: `${origin}/projects/${project.slug}/`,
    creator: { '@id': `${origin}/#person` },
    keywords: project.tags,
    image: project.cover ? new URL(project.cover, origin).href : undefined,
  }
}

function jsonLdHome() {
  const sameAs = profile.socials.filter(item => item.url).map(item => item.url)
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${origin}/#person`,
        name: profile.name,
        url: `${origin}/`,
        description: profile.introduction,
        email: `mailto:${profile.email}`,
        knowsAbout: [...new Set(publicProjects.flatMap(project => project.tags || []))],
        sameAs: sameAs.length ? sameAs : undefined,
      },
      { '@type': 'WebSite', '@id': `${origin}/#website`, url: `${origin}/`, name: `${profile.name} Portfolio`, publisher: { '@id': `${origin}/#person` } },
      { '@type': 'ProfilePage', '@id': `${origin}/#webpage`, url: `${origin}/`, name: `${profile.name} | Portfolio`, mainEntity: { '@id': `${origin}/#person` }, isPartOf: { '@id': `${origin}/#website` } },
    ],
  }
}

function jsonLdForProject(project) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Person', '@id': `${origin}/#person`, name: profile.name, url: `${origin}/`, description: profile.introduction, sameAs: profile.socials.filter(item => item.url).map(item => item.url) },
      { ...jsonLdProject(project), isPartOf: { '@id': `${origin}/#website` } },
      { '@type': 'WebSite', '@id': `${origin}/#website`, url: `${origin}/`, name: `${profile.name} Portfolio` },
    ],
  }
}

function replaceHeadValue(html, regex, replacement) {
  return regex.test(html) ? html.replace(regex, replacement) : html.replace('</head>', `${replacement}\n  </head>`)
}

function setMeta(html, name, content) {
  const tag = `<meta name="${name}" content="${escapeHtml(content)}" />`
  return replaceHeadValue(html, new RegExp(`<meta\\s+name="${name}"\\s+content="[^"]*"\\s*\\/?>`), tag)
}

function setProperty(html, property, content) {
  const tag = `<meta property="${property}" content="${escapeHtml(content)}" />`
  return replaceHeadValue(html, new RegExp(`<meta\\s+property="${property}"\\s+content="[^"]*"\\s*\\/?>`), tag)
}

function preparePage(template, { title, description, canonical, image, jsonLd, content, openGraphType }) {
  let html = template.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
  html = setMeta(html, 'description', description)
  html = setMeta(html, 'robots', 'index,follow')
  html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${canonical}" />`)
  html = setProperty(html, 'og:title', title)
  if (openGraphType) html = setProperty(html, 'og:type', openGraphType)
  html = setProperty(html, 'og:description', description)
  html = setProperty(html, 'og:url', canonical)
  html = setProperty(html, 'og:image', image.url)
  html = setProperty(html, 'og:image:type', image.type)
  html = setProperty(html, 'og:image:width', image.width)
  html = setProperty(html, 'og:image:height', image.height)
  html = setProperty(html, 'og:image:alt', image.alt)
  html = setMeta(html, 'twitter:title', title)
  html = setMeta(html, 'twitter:description', description)
  html = setMeta(html, 'twitter:image', image.url)
  html = setMeta(html, 'twitter:image:alt', image.alt)
  html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>\n  </head>`)
  return html.replace('<div id="root"></div>', `<div id="root">${content}</div>`)
}

function markdownNode(value) {
  if (value == null || value === '') return ''
  if (Array.isArray(value)) return value.map(markdownNode).filter(Boolean).join('\n\n')
  if (typeof value !== 'object') return String(value)
  if (value.type === 'pending') return ''
  if (value.src && value.alt) {
    const src = new URL(value.src, origin).href
    const caption = value.caption || value.label
    return `![${value.alt}](${src})${caption ? `\n\n${caption}` : ''}`
  }
  if (value.src && /\.(mp4|mov|webm)(?:\?|$)/i.test(value.src)) {
    return `[Watch ${value.title || 'video'}](${new URL(value.src, origin).href})`
  }
  const parts = []
  if (value.title) parts.push(`### ${value.title}`)
  if (value.label) parts.push(`**${value.label}**`)
  if (value.date) parts.push(value.date)
  for (const key of ['body', 'description', 'caption', 'alt', 'note', 'quote', 'attribution', 'value', 'before', 'after']) {
    if (value[key] !== undefined && value[key] !== '') parts.push(String(value[key]))
  }
  if (value.url) parts.push(`[${value.title || value.url}](${value.url})`)
  for (const [key, item] of Object.entries(value)) {
    if (hiddenKeys.has(key) || ['title', 'label', 'date', 'body', 'description', 'caption', 'alt', 'note', 'quote', 'attribution', 'value', 'before', 'after', 'url'].includes(key)) continue
    const rendered = markdownNode(item)
    if (rendered) parts.push(rendered)
  }
  return parts.join('\n\n')
}

function projectMarkdown(project) {
  const lines = [`# ${project.title}`, '', `Canonical URL: ${origin}/projects/${project.slug}/`, '', project.summary, '', '## Project details', '']
  for (const item of project.metadata || []) lines.push(`- **${item.label}:** ${item.value}`)
  if (project.tags?.length) lines.push(`- **Topics:** ${project.tags.join(', ')}`)
  const sections = project.sections || []
  for (const section of sections.filter(section => section.placement === 'opening')) {
    lines.push('', `## ${section.label}`, '')
    for (const block of section.blocks || []) {
      if (block.type === 'pending') continue
      const rendered = block.type === 'text'
        ? [block.title ? `### ${block.title}` : '', block.body || ''].filter(Boolean).join('\n\n')
        : markdownNode(block)
      if (rendered) lines.push(rendered, '')
    }
    for (const subsection of section.subsections || []) {
      lines.push(`### ${subsection.label}`, '')
      for (const block of subsection.blocks || []) {
        const rendered = block.type === 'text'
          ? [block.title ? `#### ${block.title}` : '', block.body || ''].filter(Boolean).join('\n\n')
          : markdownNode(block)
        if (rendered) lines.push(rendered, '')
      }
    }
  }
  if (project.teaser) {
    const teaser = markdownNode(project.teaser)
    if (teaser) lines.push('', teaser, '')
  }
  for (const section of sections.filter(section => section.placement !== 'opening')) {
    lines.push('', `## ${section.label}`, '')
    for (const block of section.blocks || []) {
      if (block.type === 'pending') continue
      const rendered = block.type === 'text'
        ? [block.title ? `### ${block.title}` : '', block.body || ''].filter(Boolean).join('\n\n')
        : markdownNode(block)
      if (rendered) lines.push(rendered, '')
    }
    for (const subsection of section.subsections || []) {
      lines.push(`### ${subsection.label}`, '')
      for (const block of subsection.blocks || []) {
        const rendered = block.type === 'text'
          ? [block.title ? `#### ${block.title}` : '', block.body || ''].filter(Boolean).join('\n\n')
          : markdownNode(block)
        if (rendered) lines.push(rendered, '')
      }
    }
  }
  return `${lines.join('\n').trim()}\n`
}

const projectMarkdownFiles = await Promise.all(publicProjects.map(async project => {
  const markdown = projectMarkdown(project)
  await writeFile(resolve(output, 'projects', `${project.slug}.md`), markdown)
  return markdown
}))

const baseTemplate = await readFile(resolve(output, 'index.html'), 'utf8')
const homeDescription = profile.introduction
const socialImage = fallbackImage
const homeHtml = preparePage(baseTemplate, {
  title: `${profile.name} | Product Designer`,
  description: homeDescription,
  canonical: `${origin}/`,
  image: socialImage,
  jsonLd: jsonLdHome(),
  content: renderHomeHtml(),
})
await writeFile(resolve(output, 'index.html'), homeHtml)

for (const project of publicProjects) {
  const page = preparePage(baseTemplate, {
    title: `${project.title} | ${profile.name}`,
    description: project.summary,
    canonical: `${origin}/projects/${project.slug}/`,
    image: await socialImageFor(project),
    jsonLd: jsonLdForProject(project),
    content: renderProjectHtml(project),
    openGraphType: 'article',
  })
  const directory = resolve(output, 'projects', project.slug)
  await mkdir(directory, { recursive: true })
  await writeFile(resolve(directory, 'index.html'), page)
}

const notes = aboutNotes.map(note => `- ${note.text.replace(/\n/g, ' ')}`).join('\n')
const tomsoft = publicProjects.find(project => project.slug === 'tomsoft')
const tomsoftRole = tomsoft?.metadata?.find(item => item.label === 'Role')?.value
const tomsoftTimeline = tomsoft?.metadata?.find(item => item.label === 'Timeline')?.value
const experience = tomsoft ? [{
  organization: 'Tomsoft',
  role: tomsoftRole,
  projectPeriod: tomsoftTimeline,
  description: tomsoft.summary,
  url: tomsoft.canonicalUrl,
}] : []
const projectIndex = publicProjects.map(project =>
  `- [${project.title}](${project.canonicalUrl}): ${project.summary} Topics: ${(project.tags || []).join(', ')}. [Markdown](${origin}/projects/${project.slug}.md).`,
).join('\n')
const experimentIndex = readyExperiments.map(item =>
  `- [${item.title}](${new URL(item.video, origin).href}): ${item.coverAlt}`,
).join('\n')
const education = aboutNotes.filter(note => ['degree', 'erasmus', 'masters'].includes(note.key)).map(note => `- ${note.text.replace(/\n/g, ' ')}`).join('\n')
const llmsExperience = experience.map(item =>
  `- [Tomsoft](${item.url}): ${item.role}. Project period: ${item.projectPeriod}. ${item.description}`,
).join('\n')
const llms = `# ${profile.name}\n\n> ${profile.introduction}\n\n## About\n\n${profile.headline}\n\n## Education\n\n${education}\n\n## Professional experience\n\n${llmsExperience}\n\n## Background\n\n${notes}\n\n## Projects\n\n${projectIndex}\n\n## Side quests\n\n${experimentIndex}\n\n## Contact\n\n- Email: [${profile.email}](mailto:${profile.email})\n- [Resume](${new URL(profile.resume, origin).href})\n`
await writeFile(resolve(output, 'llms.txt'), llms)

const fullText = `# ${profile.name}\n\nCanonical URL: ${origin}/\n\n${profile.introduction}\n\n## Background\n\n${notes}\n\n## Side quests\n\n${experimentIndex}\n\n## Contact\n\n- Email: ${profile.email}\n- Resume: ${new URL(profile.resume, origin).href}\n\n${projectMarkdownFiles.join('\n\n---\n\n')}`
await writeFile(resolve(output, 'llms-full.txt'), fullText)

const allTopics = [...new Set(publicProjects.flatMap(project => project.tags || []))]
const portfolio = {
  schemaVersion: '1.0',
  owner: {
    '@id': `${origin}/#person`,
    name: profile.name,
    description: profile.introduction,
    headline: profile.headline,
    email: profile.email,
    website: `${origin}/`,
    education: aboutNotes.filter(note => ['degree', 'erasmus', 'masters'].includes(note.key)).map(note => note.text),
    background: aboutNotes.map(note => note.text),
    areasOfPractice: allTopics,
    links: profile.socials.filter(item => item.url),
  },
  professionalExperience: experience,
  experiments: readyExperiments.map(item => ({ ...item, video: new URL(item.video, origin).href })),
  projects: publicProjects,
}
await writeFile(resolve(output, 'portfolio.json'), `${JSON.stringify(portfolio, null, 2)}\n`)
await writeFile(resolve(output, 'portfolio.schema.json'), `${JSON.stringify({
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  title: 'Leonarda Lovrić Portfolio',
  type: 'object',
  required: ['schemaVersion', 'owner', 'projects'],
  properties: {
    schemaVersion: { type: 'string' },
    owner: { type: 'object', required: ['@id', 'name', 'website'], properties: {
      '@id': { type: 'string', format: 'uri' },
      name: { type: 'string' },
      description: { type: 'string' },
      headline: { type: 'string' },
      email: { type: 'string', format: 'email' },
      website: { type: 'string', format: 'uri' },
      education: { type: 'array', items: { type: 'string' } },
      background: { type: 'array', items: { type: 'string' } },
      areasOfPractice: { type: 'array', items: { type: 'string' } },
      links: { type: 'array', items: { type: 'object' } },
    } },
    experiments: { type: 'array', items: { type: 'object', required: ['slug', 'title', 'video'], properties: {
      slug: { type: 'string' }, title: { type: 'string' }, video: { type: 'string', format: 'uri' },
    } } },
    professionalExperience: { type: 'array', items: { type: 'object', required: ['organization', 'role', 'projectPeriod', 'url'], properties: {
      organization: { type: 'string' },
      role: { type: 'string' },
      projectPeriod: { type: 'string' },
      description: { type: 'string' },
      url: { type: 'string', format: 'uri' },
    } } },
    projects: { type: 'array', items: {
      type: 'object',
      required: ['slug', 'title', 'summary', 'canonicalUrl', 'sections'],
      properties: {
        slug: { type: 'string' },
        title: { type: 'string' },
        summary: { type: 'string' },
        canonicalUrl: { type: 'string', format: 'uri' },
        tags: { type: 'array', items: { type: 'string' } },
        metadata: { type: 'array', items: { type: 'object' } },
        sections: { type: 'array', items: { type: 'object' } },
      },
    } },
  },
}, null, 2)}\n`)

const robotText = `User-agent: *\nAllow: /\nDisallow: /api/\n\nUser-agent: GPTBot\nDisallow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: ChatGPT-User\nAllow: /\n\nUser-agent: ClaudeBot\nDisallow: /\n\nUser-agent: Claude-SearchBot\nAllow: /\n\nUser-agent: Claude-User\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: Perplexity-User\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`
await writeFile(resolve(output, 'robots.txt'), robotText)

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[`<url><loc>${origin}/</loc></url>`, ...publicProjects.map(project => `<url><loc>${project.canonicalUrl}</loc></url>`)].map(url => `  ${url}`).join('\n')}\n</urlset>\n`
await writeFile(resolve(output, 'sitemap.xml'), sitemap)

const styles = [...baseTemplate.matchAll(/<link[^>]+rel="stylesheet"[^>]*>/g)].map(match => match[0]).join('\n')
await writeFile(resolve(output, '404.html'), `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Page not found | ${escapeHtml(profile.name)}</title>${styles}</head><body><main><h1>Page not found</h1><p>This page may have moved or no longer exists.</p><a href="/">Return to the portfolio</a></main></body></html>\n`)
