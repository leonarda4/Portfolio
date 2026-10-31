import { lazy, Suspense, useEffect, useState } from 'react'
import { profile, projects } from './portfolioData'
import BeforeAfterChart from './components/BeforeAfterChart'
import TestingPhotos from './components/TestingPhotos'
import FeedbackGrid from './components/FeedbackGrid'
import EchoBlocks, { Sources } from './components/EchoBlocks'
import './components/EchoProject.css'
import ThemeToggle from './components/ThemeToggle'
import SoundscapeCards from './components/SoundscapeCards'
import StickerBoard from './components/StickerBoard'
const BrainyCover = lazy(() => import('./components/BrainyCover'))
const BrainyWorkspace = lazy(() => import('./components/BrainyWorkspace'))
const BrainyMotionBuilder = lazy(() => import('./components/BrainyMotionBuilder'))
const BrainyGraphicsBuilder = lazy(() => import('./components/BrainyGraphicsBuilder'))
const EchoCover = lazy(() => import('./components/EchoCover'))
const GradientGallery = lazy(() => import('./components/GradientGallery'))

// Temporarily hidden; keep visitor notes and the sticker feature available to restore.
const SHOW_STICKERS = false

function Icon({ name }) {
  const paths = { home: 'M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z', work: 'M3 7V5h7l2 2h9v13H3Zm0 3h18', about: 'M5 3h14v18H5Zm3 14c0-4 8-4 8 0M12 7a2 2 0 1 0 0 4 2 2 0 0 0 0-4', resume: 'M6 3h8l4 4v14H6Zm8 0v5h4M9 12h6M9 16h6' }
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>
}
function Navbar({ route }) {
  return <header className="nav-wrap"><nav className="navbar" aria-label="Main navigation">
    {[['home', 'Home', '#/'], ['work', 'Work', '#/work'], ['about', 'About', '#/about']].map(([icon, label, href]) => {
      const current = route === href.slice(1) || (icon === 'work' && route.startsWith('/project/'))
      return <a key={icon} href={href} className={current ? 'active' : ''} aria-current={current ? 'page' : undefined}><Icon name={icon} /><span>{label}</span></a>
    })}{profile.resume ? <a className="nav-resume" href={profile.resume} target="_blank" rel="noreferrer" aria-label="Resume (opens in a new tab)"><Icon name="resume" /><span>Resume</span></a> : <span className="nav-unset nav-resume" aria-disabled="true" aria-label="Resume coming soon" title="Resume coming soon"><Icon name="resume" /><span>Resume</span></span>}
    <ThemeToggle />
  </nav></header>
}
function Mockup({ variant = 'desktop' }) {
  return <div className={`mockup mockup--${variant}`} aria-hidden="true"><div className="mockup-bar"><i /><i /><i /></div><div className="mockup-body"><div className="mockup-side"><b /><b /><b /><b /></div><div className="mockup-content"><span className="skeleton heading" /><span className="skeleton" /><div className="mockup-tiles"><i /><i /><i /></div><div className="mockup-chart">{[34, 55, 43, 76, 60, 85, 70].map((h,i) => <i key={i} style={{height: `${h}%`}} />)}</div><span className="skeleton" /><span className="skeleton" /></div></div></div>
}
function Cover({ project, hero = false }) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (project.coverGraphic === 'brainy') return <div className={`project-cover project-cover--graphic ${hero ? 'case-cover' : ''}`} style={{ backgroundColor: 'var(--brainy-brand-background, #171717)' }}>
    <Suspense fallback={<div style={{ width: '100%', height: '100%', background: 'var(--brainy-brand-background, #171717)' }} />}><BrainyCover hero={hero} /></Suspense>
  </div>
  if (project.coverGraphic === 'echo') return <div className={`project-cover project-cover--graphic ${hero ? 'case-cover' : ''}`} style={{ '--tint': project.accent, '--project-accent': project.accent }}>
    <Suspense fallback={<div className="echo-cover-loading" role="img" aria-label={project.coverAlt} />}><EchoCover hero={hero} /></Suspense>
  </div>
  return <div className={`project-cover ${hero ? 'case-cover' : ''} ${project.coverFit === 'contain' ? 'project-cover--contain' : ''} ${hero && project.coverAspectRatio ? 'case-cover--native-ratio' : ''}`} style={{ '--tint': project.tint, '--cover-aspect-ratio': project.coverAspectRatio, backgroundColor: project.coverBackground }}>{project.coverVideo ? <video src={project.coverVideo} poster={project.cover} autoPlay={!reducedMotion} muted loop playsInline controls={false} disablePictureInPicture disableRemotePlayback preload="metadata" aria-label={project.coverAlt || `${project.title}: installation video`} /> : project.cover ? <img src={project.cover} alt={project.coverAlt} /> : <><span className="cover-label">{project.slug.replaceAll('-', ' ')} / cover image</span><>{project.variant === 'installation' ? <div className="installation-placeholder"><span>＋</span><span>Installation photograph / audiovisual still</span></div> : <Mockup variant={project.variant} />}</><span className="cover-note">Your project imagery goes here</span></>}</div>
}
function ProjectCard({ project }) {
  return <a className="project-card" href={`#/project/${project.slug}`} style={{ '--project-accent': project.accent }}><Cover project={project} /><div className="card-copy"><h2>{project.title}</h2><div className="tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div></a>
}
function Footer() {
  const [now, setNow] = useState(new Date())
  const [copied, setCopied] = useState('')
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(timer) }, [])
  useEffect(() => { if (!copied) return; const timer = setTimeout(() => setCopied(''), 2500); return () => clearTimeout(timer) }, [copied])
  async function copyEmail() { try { await navigator.clipboard.writeText(profile.email); setCopied('Copied!') } catch { setCopied('Please copy the email address manually.') } }
  return <footer className="footer"><div className="footer-inner"><div className="footer-socials">{profile.socials.map((social, i) => social.url ? <a key={social.label} href={social.url} target="_blank" rel="noreferrer"><span>{['in', '⌘', '𝕏'][i]}</span>{social.label} ↗</a> : <span key={social.label} title="Add your profile URL in portfolioData.js"><span>{['in', '⌘', '𝕏'][i]}</span>{social.label}</span>)}</div><p className="location">Currently in {profile.location}, {now.toLocaleTimeString('en-US', { timeZone: profile.timeZone, hour: 'numeric', minute: '2-digit' })}</p><div className="footer-wordmark" aria-hidden="true">{profile.name.split(' ')[0]}</div><div className="contact-note"><span className="note-stamp">✳</span><p>Let’s keep in touch.</p>{profile.email ? <button onClick={copyEmail}>{profile.email} <span aria-live="polite">{copied || '↗'}</span></button> : <span className="email-placeholder">[Your email address]</span>}</div></div></footer>
}
function Home() {
  return <><main className="home"><section className="intro"><h1>{profile.headline}</h1></section><section id="work" className="project-grid" aria-label="Selected work">{projects.map(p => <ProjectCard key={p.slug} project={p} />)}</section></main><Footer /></>
}
function Media({ block, onOpen }) {
  return <figure className={`study-media media--${block.layout}`}>{block.src ? <button className="image-button" onClick={() => onOpen(block)} aria-label={`Enlarge ${block.alt}`}><img src={block.src} alt={block.alt} loading="lazy" /></button> : <div className="media-placeholder">{block.layout === 'phones' ? <div className="phone-pair"><Mockup variant="mobile" /><Mockup variant="mobile" /></div> : <div className="placeholder-frames">{Array.from({ length: block.layout === 'pair' ? 2 : 1 }, (_, i) => <div className="placeholder-frame" key={i}><span>＋</span><span>{block.layout === 'pair' ? `Screen 0${i + 1}` : 'Image / diagram / prototype'}</span></div>)}</div>}<span className="media-label">{block.label}</span></div>}<figcaption>{block.label}</figcaption></figure>
}
function Block({ block, onOpen }) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (block.type === 'brainyGraphics') return <Suspense fallback={<p>Loading graphic recipes…</p>}><BrainyGraphicsBuilder /></Suspense>
  if (block.type === 'brainyBuilder' || block.type === 'brainyFamily') return <Suspense fallback={<p>Loading agents…</p>}><BrainyMotionBuilder family={block.type === 'brainyFamily'} /></Suspense>
  if (block.type === 'brainyWorkspace') return <figure className="brainy-figure"><Suspense fallback={<div style={{ aspectRatio: '8 / 5', background: '#eaeae8' }} />}><BrainyWorkspace /></Suspense><figcaption>{block.caption}</figcaption></figure>
  if (block.type === 'brainyScene') return <figure className="brainy-figure"><Suspense fallback={<div style={{ aspectRatio: '16 / 9', background: 'var(--brainy-brand-background, #171717)' }} />}><BrainyCover inline /></Suspense><figcaption>{block.caption}</figcaption></figure>
  if (block.type === 'gradients') return <Suspense fallback={<p>Loading visual studies…</p>}><GradientGallery /></Suspense>
  if (block.type === 'soundscapes') return <SoundscapeCards />
  if (block.type === 'videos') return <div className="study-videos text-block">
    {block.title && <h3>{block.title}</h3>}
    <div className="study-video-grid">{block.items.map(item => <figure key={item.src}>
      <video poster={item.poster} autoPlay={!reducedMotion} muted loop controls={block.controls || false} disablePictureInPicture disableRemotePlayback playsInline preload="metadata" aria-label={item.title}>
        <source src={item.src} type="video/mp4" />
        <a href={item.src}>Watch {item.title}</a>
      </video>
      {item.caption && <figcaption>{item.caption}</figcaption>}
    </figure>)}</div>
  </div>
  if (['graphic', 'pending', 'questions', 'studyFlow', 'demographics', 'recognition', 'participantCounts', 'visualPlaceholder'].includes(block.type)) return <EchoBlocks block={block} />
  if (block.type === 'testingPhotos') return <div className="text-block">{block.title && <h3>{block.title}</h3>}<TestingPhotos block={block} /></div>
  if (block.type === 'beforeAfter') return <BeforeAfterChart block={block} />
  if (block.type === 'media') return <Media block={block} onOpen={onOpen} />
  if (block.type === 'text') return <div className="text-block"><h3>{block.title}</h3><p>{block.body}</p><Sources items={block.sources} /></div>
  if (block.type === 'columns') return <div className="text-columns">{block.items.map((item, i) => <div key={i}><h3>{item.title}</h3><p>{item.body}</p><Sources items={item.sources} /></div>)}</div>
  if (block.type === 'metrics') return <div className="metrics">{block.items.map((item, i) => <div key={i}><strong>{item.value}</strong><h3>{item.label}</h3><p>{item.note}</p></div>)}</div>
  if (block.type === 'feedback') return <FeedbackGrid block={block} />
  if (block.type === 'quote') return <blockquote><p>“{block.quote}”</p><cite>{block.attribution}</cite></blockquote>
  if (block.type === 'resources') return <div className="resources">{block.items.map((item, i) => <div key={i}><span className="eyebrow">0{i + 1}</span><h3>{item.title}</h3><p>{item.description}</p>{item.url ? <a href={item.url} target="_blank" rel="noreferrer">View {item.title.toLowerCase()} ↗</a> : <span className="resource-unset">[Add link]</span>}</div>)}</div>
  return null
}
function StudySection({ section, onOpen }) {
  const introduction = section.useSectionHeading ? -1 : (section.blocks[0]?.type === 'text' ? 0 : -1)
  const opening = section.blocks[introduction]
  return <section className="study-section" id={section.id} aria-labelledby={`${section.id}-heading`}>
    <header className="section-intro">
      {opening && <p className="section-label">{section.label}</p>}
      <h2 id={`${section.id}-heading`}>{opening?.title || section.label}</h2>
      {opening?.body && <p className="section-description">{opening.body}</p>}
    </header>
    {section.blocks.map((block, index) => index === introduction || block.type === 'pending' ? null : <Block key={index} block={block.type === 'feedback' && block.title === section.label ? { ...block, title: '' } : block} onOpen={onOpen} />)}
  </section>
}
function CaseStudy({ project }) {
  const [active, setActive] = useState(project.sections[0].id)
  const [lightbox, setLightbox] = useState(null)
  useEffect(() => {
    const update = () => {
      let current = project.sections[0].id
      for (const section of project.sections) { const el = document.getElementById(section.id); if (el && el.getBoundingClientRect().top <= 180) current = section.id }
      setActive(current)
    }
    window.addEventListener('scroll', update, { passive: true }); update()
    return () => window.removeEventListener('scroll', update)
  }, [project])
  useEffect(() => {
    if (!lightbox) return
    const previous = document.activeElement
    const close = document.querySelector('.lightbox-close')
    close?.focus()
    const key = e => { if (e.key === 'Escape') setLightbox(null); if (e.key === 'Tab') { e.preventDefault(); close?.focus() } }
    document.addEventListener('keydown', key)
    const oldOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = oldOverflow; previous?.focus() }
  }, [lightbox])
  function jump(id) { document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }); setActive(id) }
  return <><main className="case-study" data-project={project.slug} style={{ '--project-accent': project.accent }}><Cover project={project} hero /><div className="study-layout"><aside className="study-nav"><a className="sidebar-back" href="#/"><span className="sidebar-back-arrow" aria-hidden="true">←</span>Back to Home</a><nav aria-label="Case study sections">{project.sections.map(section => <button key={section.id} className={active === section.id ? 'active' : ''} aria-current={active === section.id ? 'location' : undefined} onClick={() => jump(section.id)}>{section.navLabel || section.label}</button>)}</nav></aside><article className="study-content"><h1 className="study-title">{project.title}</h1><p className="study-summary">{project.summary}</p><dl className="project-metadata">{project.metadata.map(item => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>{project.sections.filter(section => section.placement === 'opening').map(section => <StudySection key={section.id} section={section} onOpen={setLightbox} />)}{project.teaser && <div className="study-teaser"><Block block={{ ...project.teaser, title: '' }} onOpen={setLightbox} /></div>}{project.sections.filter(section => section.placement !== 'opening').map(section => <StudySection key={section.id} section={section} onOpen={setLightbox} />)}<div className="study-end"><a href="#/work">← All projects</a><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top ↑</button></div></article></div></main><Footer />{lightbox && <div className="lightbox" role="dialog" aria-modal="true" aria-label={lightbox.alt} onClick={() => setLightbox(null)}><button className="lightbox-close" onClick={() => setLightbox(null)}>Close ×</button><img src={lightbox.src} alt={lightbox.alt} onClick={e => e.stopPropagation()} /></div>}</>
}
function About() { return <><main className="about-page"><p className="eyebrow">A little about me</p><h1>Hi, I’m {profile.name.split(' ')[0]}.</h1><div className="about-columns"><img src="/assets/selfie.gif" alt="Leonarda" /><div><h2>Product designer.<br />Computer science background.</h2><p>{profile.about}</p><a className="text-link" href="/assets/Leonarda_Lovric_Portfolio.pdf" target="_blank" rel="noreferrer">View portfolio PDF ↗</a></div></div></main><Footer /></> }
export default function App() {
  const [route, setRoute] = useState(window.location.hash.slice(1) || '/')
  useEffect(() => { const change = () => setRoute(window.location.hash.slice(1) || '/'); window.addEventListener('hashchange', change); return () => window.removeEventListener('hashchange', change) }, [])
  const project = projects.find(p => route === `/project/${p.slug}`)
  useEffect(() => {
    document.title = `${project ? project.title : route === '/about' ? 'About' : 'Product designer'} · ${profile.name}`
    if (route === '/work') document.getElementById('work')?.scrollIntoView({ block: 'start' })
    else window.scrollTo({ top: 0, behavior: 'instant' })
  }, [route, project])
  return <><a className="skip-link" href="#main-content" onClick={e => { e.preventDefault(); document.getElementById('main-content')?.focus() }}>Skip to content</a><Navbar route={route} /><div id="main-content" tabIndex={-1}>{project ? <CaseStudy key={project.slug} project={project} /> : route === '/about' ? <About /> : route === '/' || route === '/work' ? <Home /> : <main className="about-page"><h1>Project not found</h1><a href="#/work">Back to selected work</a></main>}</div>{SHOW_STICKERS && <StickerBoard key={route === '/work' ? '/' : route} page={route === '/work' ? '/' : route} />}</>
}
