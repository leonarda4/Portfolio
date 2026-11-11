import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { experiments, profile, projects } from './portfolioData'
import BeforeAfterChart from './components/BeforeAfterChart'
import TestingPhotos from './components/TestingPhotos'
import FeedbackGrid from './components/FeedbackGrid'
import EchoBlocks, { Sources } from './components/EchoBlocks'
import StoryBlocks, { StoryCover } from './components/StoryBlocks'
import TomsoftCover from './components/TomsoftCover'
import AdminSetupFlow from './components/AdminSetupFlow'
import './components/EchoProject.css'
import LayoutNav from './components/LayoutNav'
import ThemeToggle from './components/ThemeToggle'
import { SUPPORTING_PALETTE } from '../design-system/playful-palette'
import SoundscapeCards from './components/SoundscapeCards'
import StickerBoard from './components/StickerBoard'
import { AboutSection, PlaySection } from './components/HomeSections'
import useSectionNavigation from './hooks/useSectionNavigation'
const BrainyCover = lazy(() => import('./components/BrainyCover'))
const BrainyIdeaAgents = lazy(() => import('./components/BrainyIdeaAgents'))
const BrainyWorkspace = lazy(() => import('./components/BrainyWorkspace'))
const BrainyMotionBuilder = lazy(() => import('./components/BrainyMotionBuilder'))
const BrainyGraphicsBuilder = lazy(() => import('./components/BrainyGraphicsBuilder'))
const EchoCover = lazy(() => import('./components/EchoCover'))
const EchoParticipantPreview = lazy(() => import('./components/EchoParticipantPreview'))
const GradientGallery = lazy(() => import('./components/GradientGallery'))

// Restore after shared notes and drawings have a deployed persistence backend.
const SHOW_STICKERS = false

const HOME_SECTIONS = [{ id: 'home', label: 'Home' }, { id: 'work', label: 'Work' }, { id: 'play', label: 'Playground' }, { id: 'about', label: 'About me' }, { id: 'contact', label: 'Contact' }]
const HOME_ROUTES = new Set(['/', ...HOME_SECTIONS.map(section => `/${section.id}`)])

function SiteNavigation({ active, onJump }) {
  const links = HOME_SECTIONS.map(section => ({ ...section, ...(onJump ? { onClick: () => onJump(section.id) } : { href: section.id === 'home' ? '#/' : `#/${section.id}` }) }))
  return <aside className="layout-sidebar home-nav"><LayoutNav label="Main navigation" items={links} active={active} /><ThemeToggle /></aside>
}
function Mockup({ variant = 'desktop' }) {
  return <div className={`mockup mockup--${variant}`} aria-hidden="true"><div className="mockup-bar"><i /><i /><i /></div><div className="mockup-body"><div className="mockup-side"><b /><b /><b /><b /></div><div className="mockup-content"><span className="skeleton heading" /><span className="skeleton" /><div className="mockup-tiles"><i /><i /><i /></div><div className="mockup-chart">{[34, 55, 43, 76, 60, 85, 70].map((h,i) => <i key={i} style={{height: `${h}%`}} />)}</div><span className="skeleton" /><span className="skeleton" /></div></div></div>
}
function Cover({ project, hero = false }) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (project.coverGraphic === 'tomsoft') return <div data-cover="tomsoft" className={`project-cover project-cover--graphic ${hero ? 'case-cover' : ''}`}><TomsoftCover label={project.coverAlt} /></div>
  if (project.coverPlaceholder && !project.cover && !project.coverVideo) return <div data-cover={project.slug} className={`project-cover ${hero ? 'case-cover' : ''}`} style={{ '--tint': project.tint }}>
    <StoryCover {...project.coverPlaceholder} />
  </div>
  if (project.coverGraphic === 'brainy') return <div className={`project-cover project-cover--graphic ${hero ? 'case-cover' : ''}`} style={{ backgroundColor: 'var(--brainy-brand-background, #000000)' }}>
    <Suspense fallback={<div style={{ width: '100%', height: '100%', background: 'var(--brainy-brand-background, #000000)' }} />}><BrainyCover hero={hero} /></Suspense>
  </div>
  if (project.coverGraphic === 'echo') return <div className={`project-cover project-cover--graphic ${hero ? 'case-cover' : ''}`} style={{ '--tint': project.accent, '--project-accent': project.accent }}>
    <Suspense fallback={<div className="echo-cover-loading" role="img" aria-label={project.coverAlt} />}><EchoCover hero={hero} /></Suspense>
  </div>
  return <div data-cover={project.slug} className={`project-cover ${hero ? 'case-cover' : ''} ${project.coverFit === 'contain' ? 'project-cover--contain' : ''} ${hero && project.coverAspectRatio ? 'case-cover--native-ratio' : ''}`} style={{ '--tint': project.tint, '--cover-aspect-ratio': project.coverAspectRatio, backgroundColor: project.coverBackground }}>{project.coverVideo ? <video src={project.coverVideo} poster={project.cover} autoPlay={!reducedMotion} muted loop playsInline controls={false} disablePictureInPicture disableRemotePlayback preload="metadata" aria-label={project.coverAlt || `${project.title}: installation video`} /> : project.cover ? <img src={project.cover} alt={project.coverAlt} /> : <><span className="cover-label">{project.slug.replaceAll('-', ' ')} / cover image</span><>{project.variant === 'installation' ? <div className="installation-placeholder"><span>＋</span><span>Installation photograph / audiovisual still</span></div> : <Mockup variant={project.variant} />}</><span className="cover-note">Your project imagery goes here</span></>}</div>
}
function ProjectCard({ project, onOpen }) {
  return <a className="project-card" href={`#/project/${project.slug}`} aria-haspopup={onOpen ? 'dialog' : undefined} onClick={onOpen ? event => { if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); onOpen(project) } } : undefined} style={{ '--project-accent': project.accent }}><Cover project={project} /><div className="card-copy"><h2>{project.cardTitle || project.title}{project.cardStatus && <span className="card-status"> / {project.cardStatus}</span>}</h2></div></a>
}
function Footer() {
  const [status, setStatus] = useState('')
  const tooltipTimer = useRef(null)
  const blue = SUPPORTING_PALETTE.find(color => color.name === 'Blue')
  useEffect(() => () => clearTimeout(tooltipTimer.current), [])
  async function copyEmail() {
    clearTimeout(tooltipTimer.current)
    try {
      await navigator.clipboard.writeText(profile.email)
      setStatus('Copied!')
    } catch {
      setStatus('Unable to copy. Please select the email.')
    }
    tooltipTimer.current = setTimeout(() => setStatus(''), 2200)
  }
  return <footer id="contact" className="footer home-section home-contact" aria-labelledby="contact-heading" style={{ '--contact-hover': blue.crayon }}>
    <h2 id="contact-heading" className="accent-type">Let's connect!</h2>
    <div className="contact-email-wrap">
      <button type="button" className="contact-email accent-type" onClick={copyEmail} aria-label={`Copy email address ${profile.email}`}>{profile.email}</button>
      <span className="contact-tooltip" role="status" aria-live="polite" aria-atomic="true" data-visible={Boolean(status)}>{status}</span>
    </div>
  </footer>
}
function Home({ onPreview }) {
  const { active, jump } = useSectionNavigation(HOME_SECTIONS)
  return <main className="home page-grid"><SiteNavigation active={active} onJump={jump} /><div className="layout-main">
    <section id="home" className="intro" aria-label="Home"><h1>Leonarda Lovrić is a product designer who thinks in systems <span className="accent-heading accent-type">&amp; plays with tech.</span></h1></section>
    <section id="work" className="home-work" aria-label="Selected work"><div className="project-grid">{projects.map(p => <ProjectCard key={p.slug} project={p} />)}</div></section>
    <PlaySection renderCard={experiment => <ProjectCard key={experiment.slug} project={experiment} onOpen={onPreview} />} />
    <AboutSection />
    <Footer />
  </div></main>
}
function Media({ block, onOpen }) {
  return <figure className={`study-media media--${block.layout}`}>{block.src ? <button className="image-button" onClick={() => onOpen(block)} aria-label={`Enlarge ${block.alt}`}><img src={block.src} alt={block.alt} loading="lazy" /></button> : <div className="media-placeholder">{block.layout === 'phones' ? <div className="phone-pair"><Mockup variant="mobile" /><Mockup variant="mobile" /></div> : <div className="placeholder-frames">{Array.from({ length: block.layout === 'pair' ? 2 : 1 }, (_, i) => <div className="placeholder-frame" key={i}><span>＋</span><span>{block.layout === 'pair' ? `Screen 0${i + 1}` : 'Image / diagram / prototype'}</span></div>)}</div>}<span className="media-label">{block.label}</span></div>}{block.label && <figcaption>{block.label}</figcaption>}</figure>
}
function Block({ block, onOpen }) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (block.type === 'adminSetupFlow') return <AdminSetupFlow onOpen={onOpen} />
  if (['storyTimeline', 'storyFlow', 'storyCallout', 'storyCards'].includes(block.type)) return <StoryBlocks block={block} />
  if (block.type === 'brainyGraphics') return <Suspense fallback={<p>Loading graphic recipes…</p>}><BrainyGraphicsBuilder /></Suspense>
  if (block.type === 'brainyBuilder' || block.type === 'brainyFamily') return <Suspense fallback={<p>Loading agents…</p>}><BrainyMotionBuilder family={block.type === 'brainyFamily'} /></Suspense>
  if (block.type === 'brainyIdeaAgent') return <Suspense fallback={<div style={{ aspectRatio: '3 / 2', background: '#f5f5f3' }} />}><BrainyIdeaAgents kind={block.agent} /></Suspense>
  if (block.type === 'brainyWorkspace') return <figure className="brainy-figure"><Suspense fallback={<div style={{ aspectRatio: '8 / 5', background: '#f5f5f3' }} />}><BrainyWorkspace /></Suspense><figcaption>{block.caption}</figcaption></figure>
  if (block.type === 'brainyScene') return <figure className="brainy-figure"><Suspense fallback={<div style={{ aspectRatio: '16 / 9', background: 'var(--brainy-brand-background, #000000)' }} />}><BrainyCover inline /></Suspense>{block.caption && <figcaption>{block.caption}</figcaption>}</figure>
  if (block.type === 'gradients') return <Suspense fallback={<p>Loading visual studies…</p>}><GradientGallery /></Suspense>
  if (block.type === 'soundscapes') return <SoundscapeCards />
  if (block.type === 'participantPreview') return <Suspense fallback={<div style={{ aspectRatio: '1920 / 692' }} />}><EchoParticipantPreview block={block} /></Suspense>
  if (block.type === 'videos') return <div className="study-videos text-block">
    {block.title && <h3>{block.title}</h3>}
    <div className="study-video-grid">{block.items.map(item => <figure key={item.src}>
      <video width={item.width} height={item.height} poster={item.poster} autoPlay={block.autoPlay !== false && !reducedMotion} muted={block.muted !== false} loop={block.loop !== false} controls={block.controls || false} disablePictureInPicture disableRemotePlayback playsInline preload={block.preload || 'metadata'} aria-label={item.title}>
        <source src={item.src} type="video/mp4" />
        {item.captions && <track kind="captions" src={item.captions} srcLang="en" label="English" />}
        <a href={item.src}>Watch {item.title}</a>
      </video>
      {item.caption && <figcaption>{item.caption}</figcaption>}
    </figure>)}</div>
  </div>
  if (['graphic', 'pending', 'questions', 'studyFlow', 'demographics', 'recognition', 'participantCounts', 'visualPlaceholder'].includes(block.type)) return <EchoBlocks block={block} />
  if (block.type === 'testingPhotos') return <div className="text-block">{block.title && <h3>{block.title}</h3>}<TestingPhotos block={block} /></div>
  if (block.type === 'beforeAfter') return <BeforeAfterChart block={block} />
  if (block.type === 'media') return <Media block={block} onOpen={onOpen} />
  if (block.type === 'mediaPair') return <div className="study-media-pair">{block.items.map(item => <Media key={item.src} block={{ ...item, layout: 'full' }} onOpen={onOpen} />)}</div>
  if (block.type === 'mediaGallery') return <div className="study-app-gallery">{block.items.map(item => <Media key={item.src} block={{ ...item, layout: 'full' }} onOpen={onOpen} />)}</div>
  if (block.type === 'text') return <div className="text-block"><h3>{block.title}</h3><p>{block.body}</p><Sources items={block.sources} /></div>
  if (block.type === 'columns') return <div className="text-columns">{block.items.map((item, i) => <div key={i}><h3>{item.title}</h3><p>{item.body}</p><Sources items={item.sources} /></div>)}</div>
  if (block.type === 'metrics') return <div className="metrics">{block.items.map((item, i) => <div key={i}><strong>{item.value}</strong><h3>{item.label}</h3><p>{item.note}</p></div>)}</div>
  if (block.type === 'feedback') return <FeedbackGrid block={block} />
  if (block.type === 'quote') return <blockquote><p>“{block.quote}”</p><cite>{block.attribution}</cite></blockquote>
  if (block.type === 'resources') return <div className="resources">{block.items.map((item, i) => <div key={i}><h3>{item.title}</h3><p>{item.description}</p>{item.url ? <a href={item.url} target="_blank" rel="noreferrer">View {item.title.toLowerCase()} ↗</a> : <span className="resource-unset">[Add link]</span>}</div>)}</div>
  return null
}
function StudySection({ section, onOpen, nested = false }) {
  const Heading = nested ? 'h3' : 'h2'
  const introduction = section.useSectionHeading ? -1 : (section.blocks[0]?.type === 'text' ? 0 : -1)
  const opening = section.blocks[introduction]
  const description = section.summary || opening?.body
  const navigationLabel = section.navLabel || section.label
  const heading = opening?.title || section.label
  const content = section.blocks.map((block, index) => index === introduction || block.type === 'pending' ? null : <Block key={index} block={block.type === 'feedback' && block.title === section.label ? { ...block, title: '' } : block} onOpen={onOpen} />)
  return <section className={`study-section${section.collapsible ? ' study-section--collapsible' : ''}`} id={section.id} aria-labelledby={`${section.id}-heading`}>
    <header className="section-intro">
      {!nested && heading !== navigationLabel && <p className="section-label">{navigationLabel}</p>}
      <Heading id={`${section.id}-heading`}>{heading}</Heading>
      {description && <p className="section-description">{description}</p>}
    </header>
    {section.collapsible ? <details className="study-details">
      <summary><span className="study-details__more">Read more</span><span className="study-details__less">Read less</span></summary>
      <div className="study-details__content">{content}</div>
    </details> : content}
    {section.subsections?.map(subsection => <StudySection key={subsection.id} section={subsection} onOpen={onOpen} nested />)}
  </section>
}
function CaseStudy({ project }) {
  const nextProject = projects[(projects.findIndex(item => item.slug === project.slug) + 1) % projects.length]
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
  return <><main className="case-study" data-project={project.slug} style={{ '--project-accent': project.accent }}><Cover project={project} hero /><div className="study-layout page-grid"><aside className="study-nav layout-sidebar"><div className="sidebar-heading"><a className="sidebar-back" href="#/"><span className="sidebar-back-arrow" aria-hidden="true">←</span>Back to Home</a></div><LayoutNav label="Case study sections" items={project.sections.map(section => ({ id: section.id, label: section.navLabel || section.label, onClick: () => jump(section.id) }))} active={active} /></aside><article className="study-content"><h1 className="study-title">{project.title}</h1><p className="study-summary">{project.summary}</p><dl className="project-metadata">{project.metadata.map(item => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>{project.sections.filter(section => section.placement === 'opening').map(section => <StudySection key={section.id} section={section} onOpen={setLightbox} />)}{project.teaser && <div className="study-teaser"><Block block={{ ...project.teaser, title: '' }} onOpen={setLightbox} /></div>}{project.sections.filter(section => section.placement !== 'opening').map(section => <StudySection key={section.id} section={section} onOpen={setLightbox} />)}<nav className="study-end" aria-label="Project navigation"><button type="button" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}>Back to top ↑</button><a href={`#/project/${nextProject.slug}`}>Next project →</a></nav></article></div></main>{lightbox && createPortal(<div className="lightbox" role="dialog" aria-modal="true" aria-label={lightbox.alt} onClick={() => setLightbox(null)}><button className="lightbox-close" onClick={() => setLightbox(null)}><span className="sidebar-back-arrow" aria-hidden="true">×</span>Close</button><img src={lightbox.src} alt={lightbox.alt} onClick={e => e.stopPropagation()} /></div>, document.body)}</>
}
function VideoPreview({ experiment, onClose }) {
  const dialog = useRef(null)
  useEffect(() => {
    const element = dialog.current
    const previousFocus = document.activeElement
    const overflow = document.body.style.overflow
    const playing = [...document.querySelectorAll('#root video')].filter(video => !video.paused)
    playing.forEach(video => video.pause())
    element.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      element.close()
      document.body.style.overflow = overflow
      playing.forEach(video => { if (video.isConnected) video.play().catch(() => {}) })
      previousFocus?.focus({ preventScroll: true })
    }
  }, [])
  return createPortal(<dialog ref={dialog} className="lightbox video-preview" aria-label={experiment.title} onCancel={event => { event.preventDefault(); onClose() }} onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    <button type="button" className="lightbox-close" onClick={onClose}><span className="sidebar-back-arrow" aria-hidden="true">×</span>Close</button>
    <video src={experiment.video} poster={experiment.cover} width={experiment.width} height={experiment.height} controls playsInline preload="metadata" aria-label={experiment.title}>
      <a href={experiment.video}>Watch the full video</a>
    </video>
  </dialog>, document.body)
}
export default function App() {
  const [route, setRoute] = useState(window.location.hash.slice(1) || '/')
  const [videoPreview, setVideoPreview] = useState(null)
  useEffect(() => { const change = () => setRoute(window.location.hash.slice(1) || '/'); window.addEventListener('hashchange', change); return () => window.removeEventListener('hashchange', change) }, [])
  const project = projects.find(p => route === `/project/${p.slug}`)
  const experiment = experiments.find(item => route === `/project/${item.slug}`)
  const isHome = HOME_ROUTES.has(route)
  const preview = experiment || videoPreview
  const closePreview = () => { setVideoPreview(null); if (experiment) window.location.hash = '/play' }
  useEffect(() => {
    document.title = `${project?.title || experiment?.title || 'Product designer'} · ${profile.name}`
    if (experiment) document.getElementById('play')?.scrollIntoView({ block: 'start', behavior: 'instant' })
    else if (isHome && route !== '/' && route !== '/home') document.getElementById(route.slice(1))?.scrollIntoView({ block: 'start', behavior: 'instant' })
    else window.scrollTo({ top: 0, behavior: 'instant' })
  }, [route, project, experiment, isHome])
  return <><a className="skip-link" href="#main-content" onClick={e => { e.preventDefault(); document.getElementById('main-content')?.focus() }}>Skip to content</a>{SHOW_STICKERS && <StickerBoard key={isHome || experiment ? '/' : route} page={isHome || experiment ? '/' : route} />}<div id="main-content" tabIndex={-1}>{project ? <CaseStudy key={project.slug} project={project} /> : isHome || experiment ? <Home onPreview={setVideoPreview} /> : <main className="about-page page-grid"><SiteNavigation /><div className="layout-main about-content"><h1>Project not found</h1><a href="#/work">Back to selected work</a></div></main>}</div>{preview && <VideoPreview key={preview.slug} experiment={preview} onClose={closePreview} />}</>
}
