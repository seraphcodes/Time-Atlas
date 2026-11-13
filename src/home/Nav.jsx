import { useEffect, useState } from 'react'
import { GIZA_PATH, nav } from './content'

// `root` is the way back to the site root from the current page ('./', '../', '../../').
// `current` is the label of the page we are on.
export default function Nav({ root = './', current }) {
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const on = () => setSolid(window.scrollY > 8)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className={`nav ${solid || open ? 'is-solid' : ''}`}>
      <div className="nav-bar">
        <a className="nav-mark" href={root} aria-label="TimeAtlas home">TimeAtlas</a>
        <nav className="nav-links" aria-label="Main">
          {nav.map((n) =>
            n.href ? (
              <a key={n.label} href={root + n.href} aria-current={current === n.label ? 'page' : undefined}>{n.label}</a>
            ) : (
              <span key={n.label} className="is-soon" title="Coming soon">{n.label}</span>
            ),
          )}
          <a className="nav-pill" href={root + GIZA_PATH}><span>Start exploring</span></a>
        </nav>
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="nav-sheet"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="nav-toggle-lines" aria-hidden="true" />
        </button>
      </div>
      <div id="nav-sheet" className="nav-sheet" hidden={!open}>
        {nav.map((n) =>
          n.href ? (
            <a key={n.label} className="nav-sheet-link" href={root + n.href} aria-current={current === n.label ? 'page' : undefined}>{n.label}</a>
          ) : (
            <span key={n.label} className="is-soon">{n.label}</span>
          ),
        )}
        <a className="nav-sheet-cta" href={root + GIZA_PATH}>Start exploring</a>
      </div>
    </header>
  )
}
