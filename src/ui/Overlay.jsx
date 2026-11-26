// The words and instruments laid over the 3D world: the opening title, the
// scene captions, the year, the hotspot markers and their cards, the Then/Now
// slider, the orbit controls and a measuring rod that shows progress.
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { giza } from '../content/giza'
import { HOTSPOTS } from '../content/hotspots'
import { journey, subscribe, getView, subscribeEra, getEraTarget, setEraTarget, SCENE_COUNT, T_END } from '../journey/journey'
import { flyTo, orbitHome, orbitZoom } from '../camera/commands'
import { setSound, soundSupported } from '../audio/sound'
import { calm } from '../design/calm'

const TOUCH = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
const NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI']
// Where each scene begins on the journey (scene VI opens on the orbit).
const SCENE_START = [0, 1, 2, 3, 4, 5.4]

// Scroll the page so the journey lands on t. Works for mouse, touch and keyboard.
function jumpTo(t) {
  const room = document.documentElement.scrollHeight - window.innerHeight
  window.scrollTo({ top: (t / T_END) * room, behavior: calm ? 'auto' : 'smooth' })
}

// The Then/Now slider: drag it to choose the date yourself. It is a native
// range input, so touch, mouse and the arrow keys all work.
function EraControl({ on, year }) {
  const value = useSyncExternalStore(subscribeEra, getEraTarget)
  const spoken = year >= 2026 ? 'today' : year < 0 ? `about ${-year} BC` : `AD ${year}`
  return (
    <div className={`era ${on ? 'is-on' : ''}`} style={{ '--at': value }}>
      <input
        type="range" min="0" max="1000" step="1" value={Math.round(value * 1000)} disabled={!on}
        onChange={(e) => setEraTarget(+e.target.value / 1000)}
        aria-label={giza.slider.label} aria-valuetext={spoken}
      />
      <div className="era-ends" aria-hidden="true">
        <span>{giza.slider.then}</span>
        <span>{giza.slider.now}</span>
      </div>
    </div>
  )
}

// The eight markers and the card that opens when one is chosen.
function Hotspots({ orbiting, onSheet }) {
  const [sel, setSel] = useState(null)
  const refs = useRef([])
  const sheet = useRef()
  const opener = useRef(null)

  const open = useCallback((i) => {
    const h = HOTSPOTS[i]
    opener.current = document.activeElement
    setSel(i)
    // In scene 6 a marker also takes you there, and to the right century.
    if (journey.view.orbit && h.view) {
      if (h.era !== undefined) setEraTarget(h.era)
      flyTo(h.view)
    }
  }, [])
  const close = useCallback(() => {
    setSel(null)
    opener.current?.focus?.()
  }, [])

  useEffect(() => onSheet(sel !== null), [sel, onSheet])

  // Markers follow the numbers the camera writes every frame.
  useEffect(() => {
    let raf
    const shown = []
    const tick = () => {
      HOTSPOTS.forEach((_, i) => {
        const el = refs.current[i]
        const s = journey.hot[i]
        if (!el || !s) return
        if (s.on) el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`
        if (shown[i] !== s.on) {
          shown[i] = s.on
          el.classList.toggle('is-on', s.on)
          el.tabIndex = s.on ? 0 : -1
          el.setAttribute('aria-hidden', String(!s.on))
        }
      })
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [])

  // A card closes when the journey moves on from its marker.
  useEffect(() => {
    if (sel === null) return
    const id = setInterval(() => {
      if (!journey.hot[sel]?.wanted) close()
    }, 250)
    return () => clearInterval(id)
  }, [sel, close])
  useEffect(() => {
    if (sel === null) return
    sheet.current?.focus()
    const esc = (e) => e.key === 'Escape' && close()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [sel, close])

  const h = sel !== null ? HOTSPOTS[sel] : null
  return (
    <>
      {HOTSPOTS.map((spot, i) => (
        <button
          key={spot.id} ref={(el) => (refs.current[i] = el)} className="hot" type="button" tabIndex={-1} aria-hidden="true"
          aria-label={`${spot.title}, ${spot.when}. Open details`} data-title={spot.title} onClick={() => open(i)}
        >
          <span className="hot-ring" aria-hidden="true" />
        </button>
      ))}
      {h && (
        <div className="sheet" ref={sheet} tabIndex={-1} role="dialog" aria-labelledby="sheet-title">
          <p className="sheet-when">{h.when}</p>
          <h3 id="sheet-title">{h.title}</h3>
          <p>{h.text}</p>
          {h.note && <p className="note">{h.note}</p>}
          {h.sources?.length > 0 && (
            <p className="sheet-sources">
              <span>Sources</span> {h.sources.join('; ')}
            </p>
          )}
          <button type="button" className="sheet-close" onClick={close}>Close</button>
        </div>
      )}
    </>
  )
}

export function Overlay() {
  const view = useSyncExternalStore(subscribe, getView)
  const marker = useRef()
  const [sound, setSoundOn] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const onSheet = useCallback((open) => setSheetOpen(open), [])

  // Where the visitor may look around or orbit, the cursor says so, and the
  // page stops treating touches as scrolling.
  useEffect(() => {
    document.documentElement.classList.toggle('can-look', view.explore || view.orbit)
    document.documentElement.classList.toggle('orbiting', view.orbit)
  }, [view.explore, view.orbit])

  // The marker on the rod follows the camera, not the scroll bar.
  useEffect(() => {
    let raf
    const tick = () => {
      if (marker.current) marker.current.style.top = `${Math.min(100, (journey.t / T_END) * 100)}%`
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [])

  const toggleSound = () => {
    const next = !sound
    if (setSound(next)) setSoundOn(next)
  }

  const live = view.caption >= 0 ? `${giza.captions[view.caption].title}. ${giza.captions[view.caption].text}` : ''

  return (
    <div className={`overlay ${sheetOpen ? 'has-sheet' : ''}`}>
      <div className="scrim" aria-hidden="true" />
      <div className="scrim-top" aria-hidden="true" />
      <p className="sr-only" aria-live="polite">{live}</p>

      <header className="masthead">
        <a className="wordmark" href="../../" aria-label="TimeAtlas home">TimeAtlas</a>
        <p className="year" aria-live="off">
          {view.year >= 2026 ? (
            'Today'
          ) : view.year < 0 ? (
            <>
              <i>c.</i> {-view.year} <span>BC</span>
            </>
          ) : (
            <>
              <span>AD</span> {view.year}
            </>
          )}
        </p>
      </header>

      {soundSupported && (
        <button type="button" className="sound" onClick={toggleSound} aria-pressed={sound}>
          <span className={`sound-wave ${sound ? 'is-on' : ''}`} aria-hidden="true" />
          Sound {sound ? 'on' : 'off'}
        </button>
      )}

      <section className={`hero ${view.hero ? 'is-on' : ''}`} aria-hidden={!view.hero}>
        <p className="hero-region">{giza.region}</p>
        <p className="hero-place">{giza.place}</p>
        <p className="hero-hint">
          <span className="hero-line" aria-hidden="true" />
          Scroll to travel back
        </p>
      </section>

      {giza.captions.map((caption, i) => (
        <section
          key={caption.title}
          className={`caption ${caption.lift ? 'is-lifted' : ''} ${view.caption === i ? 'is-on' : ''}`}
          aria-hidden={view.caption !== i}
        >
          <h2>{caption.title}</h2>
          <p>{caption.text}</p>
          {caption.note && <p className="note">{caption.note}</p>}
        </section>
      ))}

      <p className={`hint ${view.explore || view.orbit ? 'is-on' : ''}`} aria-hidden={!(view.explore || view.orbit)}>
        <span className="hint-mark" aria-hidden="true" />
        {view.orbit ? (TOUCH ? giza.hints.orbitTouch : giza.hints.orbit) : TOUCH ? giza.hints.lookTouch : giza.hints.look}
      </p>

      <Hotspots orbiting={view.orbit} onSheet={onSheet} />
      <EraControl on={view.slider} year={view.year} />

      <aside className={`next ${view.orbit ? 'is-on' : ''}`} aria-hidden={!view.orbit}>
        <a className="next-link" href={giza.next.href} tabIndex={view.orbit ? 0 : -1}>
          <span className="next-label">{giza.next.label}</span>
          <span className="next-place">
            {giza.next.place}, <span>{giza.next.date}</span>
          </span>
          <span className="next-status">{giza.next.status}</span>
        </a>
      </aside>

      <div className={`tools ${view.orbit ? 'is-on' : ''}`} role="group" aria-label="Camera">
        <button type="button" onClick={() => orbitZoom(0.7)} aria-label="Zoom in" tabIndex={view.orbit ? 0 : -1}>+</button>
        <button type="button" onClick={() => orbitZoom(1.45)} aria-label="Zoom out" tabIndex={view.orbit ? 0 : -1}>{'−'}</button>
        <button type="button" onClick={orbitHome} tabIndex={view.orbit ? 0 : -1}>Reset view</button>
        <button type="button" onClick={() => jumpTo(4.5)} tabIndex={view.orbit ? 0 : -1}>Back to the journey</button>
      </div>

      <nav className="rod" aria-label="Scenes">
        <div className="rod-scale" aria-hidden="true" />
        {giza.scenes.map((scene, i) => (
          <button
            key={scene.id} type="button" className={`rod-stop ${view.scene === i ? 'is-on' : ''}`}
            style={{ top: `${(Math.min(SCENE_START[i], i) / T_END) * 100}%` }}
            aria-label={`Go to scene ${NUMERALS[i]}: ${scene.title}`} aria-current={view.scene === i ? 'step' : undefined}
            title={scene.title} onClick={() => jumpTo(SCENE_START[i])}
          >
            {NUMERALS[i]}
          </button>
        ))}
        <span ref={marker} className="rod-marker" aria-hidden="true" />
      </nav>
    </div>
  )
}
