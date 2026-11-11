import { useEffect, useState } from 'react'

export default function useSectionNavigation(sections) {
  const [active, setActive] = useState(sections[0].id)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const nav = document.querySelector('.home-nav')
      const threshold = Math.max(120, (nav?.getBoundingClientRect().bottom || 0) * (window.innerWidth <= 760 ? 1 : 0) + 24)
      let current = sections[0].id
      for (const section of sections) {
        if (document.getElementById(section.id)?.getBoundingClientRect().top <= threshold) current = section.id
      }
      if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) current = sections.at(-1).id
      setActive(current)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    update()
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [sections])

  function jump(id) {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
    if (id === sections[0].id) window.scrollTo({ top: 0, behavior })
    else document.getElementById(id)?.scrollIntoView({ behavior, block: 'start' })
    setActive(id)
  }

  return { active, jump }
}
