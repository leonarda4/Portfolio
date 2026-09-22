import { useEffect, useRef, useState } from 'react'

function RippleButton({ children, variant = 'ghost', href, download, target, rel }) {
  const rippleRef = useRef(null)
  const Component = href ? 'a' : 'button'
  const actionProps = href ? { href, download, target, rel } : { type: 'button' }

  function positionRipple(event) {
    const rect = event.currentTarget.getBoundingClientRect()
    const ripple = rippleRef.current
    const size = Math.hypot(rect.width, rect.height) * 2
    ripple.style.width = `${size}px`
    ripple.style.left = `${event.clientX - rect.left}px`
    ripple.style.top = `${event.clientY - rect.top}px`
  }

  return (
    <Component
      {...actionProps}
      className={`ripple-button ripple-button--${variant}`}
      onPointerEnter={positionRipple}
      onPointerMove={positionRipple}
      onPointerLeave={positionRipple}
    >
      <span className="ripple-button-label">{children}</span>
      <span className="ripple-button-fill" ref={rippleRef} aria-hidden="true" />
    </Component>
  )
}

function MediaBetweenText({ firstText, secondText, imageSrc, imageAlt, isActive, onPointerEnter, onPointerLeave }) {
  return (
    <span
      className={`media-between-text${isActive ? ' is-active' : ''}`}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <span>{firstText}</span>
      <span className="media-frame" aria-hidden="true">
        <span>(</span>
        <span className="media-image">
          <img src={imageSrc} alt={imageAlt} />
        </span>
        <span>)</span>
      </span>
      <span>{secondText}</span>
    </span>
  )
}

function MediaStatement() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const rows = [
    { firstText: 'Hi! I’m', secondText: 'Leonarda,', imageSrc: '/assets/selfie.gif', imageAlt: 'Selfie of Leonarda' },
    { firstText: 'product designer', secondText: 'with', imageSrc: '/assets/product_design.gif', imageAlt: 'Product design work' },
    { firstText: 'a', secondText: 'CS background', imageSrc: '/assets/CS.gif', imageAlt: 'Computer science work' },
  ]

  useEffect(() => {
    if (hoveredIndex !== null) {
      return undefined
    }

    const timer = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % rows.length)
    }, 2000)

    return () => window.clearInterval(timer)
  }, [hoveredIndex, rows.length])

  function handlePointerEnter(index) {
    setHoveredIndex(index)
    setActiveIndex(index)
  }

  function handlePointerLeave() {
    setHoveredIndex(null)
    setActiveIndex((currentIndex) => (currentIndex + 1) % rows.length)
  }

  return rows.map((row, index) => (
    <MediaBetweenText
      {...row}
      isActive={activeIndex === index}
      onPointerEnter={() => handlePointerEnter(index)}
      onPointerLeave={handlePointerLeave}
      key={row.imageSrc}
    />
  ))
}

function AnnouncementRibbon({ className = '', decorative = false }) {
  const [isPaused, setIsPaused] = useState(false)

  return (
    <div
      className={`construction-tape ${className}${isPaused ? ' is-paused' : ''}`}
      role={decorative ? undefined : 'note'}
      aria-label={decorative ? undefined : 'under construction'}
      aria-hidden={decorative ? 'true' : undefined}
      onPointerEnter={() => setIsPaused(true)}
      onPointerLeave={() => setIsPaused(false)}
    >
      <div className="construction-tape-track" aria-hidden="true">
        {[0, 1].map((group) => (
          <div className="construction-tape-group" key={group}>
            {Array.from({ length: 8 }, (_, index) => (
              <span className="construction-tape-message" key={index}>
                under construction <span className="construction-tape-separator">·</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function App() {
  return (
    <main className="portfolio portfolio-page">
      <section className="intro" aria-labelledby="intro-title">
        <h1 id="intro-title" className="statement">
          <MediaStatement />
        </h1>
        <p className="status">web development is in progress, view the projects in a PDF format</p>

        <div className="portfolio-links" aria-label="Portfolio PDF">
          <RippleButton
            variant="green"
            href="/assets/Leonarda_Lovric_Portfolio.pdf"
            target="_blank"
            rel="noreferrer"
          >
            view on web
          </RippleButton>
          <RippleButton href="/assets/Leonarda_Lovric_Portfolio.pdf" download="Leonarda_Lovric_Portfolio.pdf">
            download
          </RippleButton>
        </div>
      </section>
      <AnnouncementRibbon />
      <AnnouncementRibbon className="construction-tape--lower" decorative />
    </main>
  )
}

export default App
