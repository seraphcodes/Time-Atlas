// Words, markers and controls over the 3D city.
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { rome, MARKERS, SPOTS, NOW_SPOTS } from './content/rome'
import { journey, subscribe, getView, T_END } from './journey'
import { events, flyTo, flyHome, framing, walkHere, flyUp } from './rig'
import { PLACES } from './world/layout'
import { heightAt } from './world/terrain'
import { calm } from '../design/calm'
import { getState, subscribeState, toggle } from './state'

const TOUCH = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

function targetOf(m) {
  const [x, z] = PLACES[m.place].at
  return [x, heightAt(x, z) + Math.min(12, m.y * 0.3), z]
}

function jumpTo(t) {
  const room = document.documentElement.scrollHeight - window.innerHeight
  window.scrollTo({ top: (t / T_END) * room, behavior: calm ? 'auto' : 'smooth' })
}

function Markers({ onOpen }) {
  const refs = useRef([])
  useEffect(() => {
    let raf
    const shown = []
    const labelled = []
    const tick = () => {
      // Markers are listed by importance. A marker too close on screen to a
      // more important one is hidden; names show only where there is room.
      const placed = []
      const named = []
      MARKERS.forEach((m, i) => {
        const el = refs.current[i]
        const s = journey.hot[i]
        if (!el || !s) return
        let on = s.on
        if (on && placed.some(([x, y]) => Math.abs(x - s.x) < 30 && Math.abs(y - s.y) < 30)) on = false
        if (on) placed.push([s.x, s.y])
        if (on) el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`
        if (shown[i] !== on) {
          shown[i] = on
          el.classList.toggle('is-on', on)
          el.tabIndex = on ? 0 : -1
          el.setAttribute('aria-hidden', String(!on))
        }
        let label = on && s.d < m.range * 0.4
        if (label && named.some(([x, y]) => Math.abs(x - s.x) < 150 && Math.abs(y - s.y) < 40)) label = false
        if (label) named.push([s.x, s.y])
        if (labelled[i] !== label) {
          labelled[i] = label
          el.classList.toggle('has-label', label)
        }
      })
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [])
  return MARKERS.map((m, i) => (
    <button
      key={m.id} ref={(el) => (refs.current[i] = el)} className="hot" type="button" tabIndex={-1} aria-hidden="true"
      aria-label={`${m.title}. Open details`} data-title={m.title} onClick={() => onOpen(m.id)}
    >
      <span className="hot-ring" aria-hidden="true" />
    </button>
  ))
}

// the same place in the other era: AD 100 card ↔ today card
const PAIR = {}
for (const m of MARKERS) if (m.pair) {
  PAIR[m.id] = m.pair
  PAIR[m.pair] = m.id
}
const STATUS_TODAY = { Ruin: 'A ruin today', Standing: 'Standing today', 'Built later': 'Built after AD 100' }

const ACTIONS = {
  beneath: ['Look beneath the arena', 'Put the floor back'],
  velarium: ['Spread the awning', 'Roll up the awning'],
  seating: ['Show who sits where', 'Hide the colours'],
  hunt: ['Morning: the hunt', 'Clear the sand'],
  fight: ['Afternoon: the gladiators', 'Clear the sand'],
}

function Sheet({ m, onClose }) {
  const ref = useRef()
  const st = useSyncExternalStore(subscribeState, getState)
  useEffect(() => {
    ref.current?.focus()
    const esc = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [m, onClose])
  return (
    <div className="sheet rome-sheet" ref={ref} tabIndex={-1} role="dialog" aria-labelledby="sheet-title">
      <p className="sheet-tags">
        <span className={`tag tag-${m.status.replace(/\s+/g, '-').toLowerCase()}`}>{m.era === 'now' ? STATUS_TODAY[m.status] : `${m.status} in AD 100`}</span>
        <span className={`tag tag-${m.evidence.toLowerCase()}`}>{m.evidence}</span>
      </p>
      <h3 id="sheet-title">{m.title}</h3>
      {m.when && <p className="sheet-when">{m.when}</p>}
      {m.actions?.length > 0 && (
        <p className="sheet-actions">
          {m.actions.map((a) => (
            <button key={a} type="button" className="chip" aria-pressed={st[a]} onClick={() => toggle(a)}>
              {ACTIONS[a][st[a] ? 1 : 0]}
            </button>
          ))}
        </p>
      )}
      <p>{m.text}</p>
      {m.note && <p className="note">{m.note}</p>}
      {m.sources?.length > 0 && (
        <p className="sheet-sources">
          <span>Sources</span> {m.sources.join('; ')}
        </p>
      )}
      <button type="button" className="sheet-close" onClick={onClose}>Close</button>
    </div>
  )
}

export function RomeOverlay() {
  const view = useSyncExternalStore(subscribe, getView)
  const [open, setOpen] = useState(null)
  const [hint, setHint] = useState(true)

  const openMarker = useCallback((id) => {
    const m = MARKERS.find((x) => x.id === id)
    if (!m) return
    setOpen(id)
    setHint(false)
    if (journey.view.orbit && m.view) flyTo(m.view, targetOf(m))
  }, [])
  const close = useCallback(() => setOpen(null), [])

  const [walking, setWalking] = useState(false)
  useEffect(() => {
    const pick = (e) => openMarker(e.detail)
    const home = () => setOpen(null)
    const onWalk = (e) => setWalking(e.detail)
    events.addEventListener('pick', pick)
    events.addEventListener('home', home)
    events.addEventListener('walk', onWalk)
    return () => {
      events.removeEventListener('pick', pick)
      events.removeEventListener('home', home)
      events.removeEventListener('walk', onWalk)
    }
  }, [openMarker])

  useEffect(() => {
    document.documentElement.classList.toggle('orbiting', view.orbit)
    document.documentElement.classList.toggle('can-look', view.orbit)
    if (!view.orbit) setOpen((o) => (o && journey.t > 2.9 ? o : null))
  }, [view.orbit])

  const st = useSyncExternalStore(subscribeState, getState)
  const now = st.now
  // Switching era keeps the visitor where they are; an open card turns into
  // its counterpart in the other era, or closes.
  const switchEra = useCallback(() => {
    setOpen((o) => (o ? PAIR[o] || null : null))
    setHint(false)
    toggle('now')
  }, [])
  const spots = now ? NOW_SPOTS : SPOTS
  const m = open ? MARKERS.find((x) => x.id === open) : null
  useEffect(() => {
    const narrow = window.innerWidth < 640
    framing.wantX = m && !narrow ? 0.17 : 0
    framing.wantY = m && narrow ? 0.27 : 0
  }, [m])
  const live = view.caption >= 0 ? `${rome.captions[view.caption].title}. ${rome.captions[view.caption].text}` : ''

  return (
    <div className={`overlay rome-overlay ${m ? 'has-sheet' : ''}`}>
      <div className="scrim" aria-hidden="true" />
      <div className="scrim-top" aria-hidden="true" />
      <p className="sr-only" aria-live="polite">{live}</p>

      <header className="masthead">
        <a className="wordmark" href="../../" aria-label="TimeAtlas home">TimeAtlas</a>
        {view.orbit ? (
          <div className="rome-era" role="group" aria-label="Which Rome to show">
            <button type="button" className="era-opt" aria-pressed={!now} onClick={() => now && switchEra()}>
              <span>AD</span> {rome.year}
            </button>
            <button type="button" className="era-opt" aria-pressed={now} onClick={() => !now && switchEra()}>Today</button>
          </div>
        ) : (
          <p className="year">
            <span>AD</span> {rome.year}
          </p>
        )}
      </header>

      <section className={`hero ${view.hero ? 'is-on' : ''}`} aria-hidden={!view.hero}>
        <p className="hero-region">{rome.region}</p>
        <p className="hero-place">{rome.place}</p>
        <p className="hero-sub">In the reign of Trajan</p>
        <p className="hero-hint">
          <span className="hero-line" aria-hidden="true" />
          Scroll to descend
        </p>
      </section>

      {rome.captions.map((c, i) => (
        <section key={c.title} className={`caption ${view.caption === i ? 'is-on' : ''}`} aria-hidden={view.caption !== i}>
          <h2>{c.title}</h2>
          <p>{c.text}</p>
          {c.note && <p className="note">{c.note}</p>}
        </section>
      ))}

      <Markers onOpen={openMarker} />
      {m && <Sheet m={m} onClose={close} />}

      <nav className={`rome-dock ${view.orbit ? 'is-on' : ''}`} aria-label="Places in Rome" aria-hidden={!view.orbit}>
        {walking && !m && <p className="rome-hint">{TOUCH ? rome.explore.walk : rome.explore.walkMouse}</p>}
        {!walking && hint && !m && !now && <p className="rome-hint">{TOUCH ? rome.explore.hint : rome.explore.hintMouse}</p>}
        {!walking && now && !m && <p className="rome-hint">{rome.explore.today}</p>}
        <div className="rome-chips">
          <button
            type="button" className="chip chip-walk" tabIndex={view.orbit ? 0 : -1}
            onClick={() => {
              setOpen(null)
              setHint(false)
              if (walking) flyUp()
              else walkHere()
            }}
          >
            {walking ? 'Fly up' : 'Walk here'}
          </button>
          {spots.map((s) => (
            <button
              key={s.label} type="button" className="chip" tabIndex={view.orbit ? 0 : -1}
              onClick={() => {
                setHint(false)
                if (!s.marker) {
                  setOpen(null)
                  flyHome()
                } else openMarker(s.marker)
              }}
            >
              {s.label}
            </button>
          ))}
          <button type="button" className="chip chip-quiet" tabIndex={view.orbit ? 0 : -1} onClick={() => { setOpen(null); jumpTo(0) }}>
            Replay
          </button>
        </div>
      </nav>
    </div>
  )
}
