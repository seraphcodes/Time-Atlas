import { useEffect, useRef, useState } from 'react'
import Nav from '../home/Nav'
import Footer from '../site/Footer'
import { AXIS, STATUS, pct, places } from '../site/places'
import bgWideWebp from '../home/img/second-wide.webp'
import bgWideJpg from '../home/img/second-wide.jpg'
import bgNarrowWebp from '../home/img/second-narrow.webp'
import bgNarrowJpg from '../home/img/second-narrow.jpg'

const ROOT = '../'
const YEAR_MARKS = [-3000, -2000, -1000, 1, 1000]
const yearLabel = (y) => (y < 0 ? `${-y} BC` : `${y} AD`)
// Markers alternate above and below the rail so close neighbours never collide.
const ordered = [...places].sort((a, b) => a.at - b.at).map((p, i) => ({ ...p, x: pct(p.at), below: i % 2 === 1 }))
const filters = [['all', 'All'], ...Object.entries(STATUS).map(([id, s]) => [id, s.filter])]

function Medal({ place, className = '' }) {
  return (
    <span className={`medal is-${place.status} ${className}`} aria-hidden="true">
      {place.thumb ? <img src={place.thumb} alt="" draggable="false" /> : <span className="medal-letter">{place.name[0]}</span>}
    </span>
  )
}

export default function Explore() {
  // explore/#rome opens with Rome chosen
  const [sel, setSel] = useState(() => {
    const h = typeof window === 'undefined' ? '' : window.location.hash.slice(1)
    return places.some((p) => p.id === h) ? h : 'giza'
  })
  const [filter, setFilter] = useState('all')
  const [scrub, setScrub] = useState(null)
  const scroller = useRef()
  const rail = useRef()
  const cur = ordered.find((p) => p.id === sel)
  const dimmed = (p) => filter !== 'all' && p.status !== filter

  // On narrow screens the line is wider than the screen: bring the chosen place into view.
  useEffect(() => {
    const el = scroller.current
    if (!el || el.scrollWidth <= el.clientWidth) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollTo({ left: (cur.x / 100) * el.scrollWidth - el.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' })
  }, [cur.x])

  const onMove = (e) => {
    if (e.pointerType === 'touch') return
    const r = rail.current.getBoundingClientRect()
    const p = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
    const y = Math.round((AXIS.from + p * (AXIS.to - AXIS.from)) / 10) * 10
    setScrub({ x: p * 100, label: p > 0.985 ? 'Today' : y <= 0 ? (y === 0 ? '1 AD' : `${-y} BC`) : `${y} AD` })
  }

  return (
    <div className="explore">
      <div className="backdrop" aria-hidden="true">
        <picture>
          <source media="(max-width: 700px)" srcSet={bgNarrowWebp} type="image/webp" />
          <source media="(max-width: 700px)" srcSet={bgNarrowJpg} />
          <source srcSet={bgWideWebp} type="image/webp" />
          <img src={bgWideJpg} alt="" draggable="false" />
        </picture>
      </div>

      <Nav root={ROOT} current="Explore" />

      <main id="main">
        <section className="ex-head">
          <h1>Every place has a year.</h1>
          <p>Move along the line to read the year. Choose a place to see what is there.</p>
        </section>

        <section className="ex-axis" aria-labelledby="axis-h">
          <h2 id="axis-h" className="sr-only">Places on a line from 3000 BC to today</h2>
          <div className="axis-scroll" ref={scroller}>
            <div className={`axis ${cur.below ? 'sel-below' : ''}`} onPointerMove={onMove} onPointerLeave={() => setScrub(null)}>
              <div className="rail glass" ref={rail} aria-hidden="true">
                <i className="ticks ticks-100" />
                <i className="ticks ticks-500" />
                <i className="ticks ticks-1000" />
                {YEAR_MARKS.map((y, i) => (
                  <span key={y} className={`rail-year ${i === 0 ? 'is-first' : ''}`} style={{ left: `${pct(y)}%` }}>{yearLabel(y)}</span>
                ))}
                <span className="rail-year is-last">Today</span>
                <i className="rail-mark" style={{ left: `${cur.x}%` }} />
                {scrub && <i className="scrub-line" style={{ left: `${scrub.x}%` }} />}
              </div>
              {scrub && <span className="scrub-pill" style={{ left: `${scrub.x}%` }} aria-hidden="true">{scrub.label}</span>}

              <i className="beam" style={{ left: `${cur.x}%` }} aria-hidden="true" />

              <ol className="nodes">
                {ordered.map((p, i) => (
                  <li key={p.id} className={`node ${p.below ? 'is-below' : 'is-above'} ${dimmed(p) ? 'is-dim' : ''}`} style={{ left: `${p.x}%`, '--i': i }}>
                    <button type="button" aria-pressed={sel === p.id} onClick={() => setSel(p.id)}>
                      <span className="node-text">
                        <span className={`node-status is-${p.status}`}>{STATUS[p.status].label}</span>
                        <span className="node-name">{p.name}</span>
                        <span className="node-year">{p.year}</span>
                      </span>
                      <Medal place={p} />
                      <i className="stem" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <p className="axis-hint">Swipe the line sideways to see every place.</p>
        </section>

        <section className="panel glass" aria-labelledby="panel-h" aria-live="polite">
          <i className="panel-notch" style={{ left: `${cur.x}%` }} aria-hidden="true" />
          <div className="panel-in" key={cur.id}>
            <img className="panel-img" src={cur.image} alt={cur.imageAlt} width="800" height="500" />
            <div className="panel-copy">
              <p className={`panel-status is-${cur.status}`}>{STATUS[cur.status].label} <span aria-hidden="true">/</span> {cur.year}</p>
              <h2 id="panel-h">{cur.name}</h2>
              <p className="panel-blurb">{cur.blurb}</p>
              {cur.credit && <p className="panel-credit">{cur.credit}</p>}
              {cur.status === 'open' && (
                <div className="panel-actions">
                  <a className="btn" href={ROOT + cur.experience}>Enter {cur.name}</a>
                  <a className="btn btn-ghost" href={ROOT + cur.page}>Read the field guide</a>
                </div>
              )}
            </div>
            {cur.facts && (
              <dl className="panel-facts">
                {cur.facts.map(([k, v]) => (
                  <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                ))}
              </dl>
            )}
          </div>
        </section>

        <section className="all" aria-labelledby="all-h">
          <div className="all-head">
            <h2 id="all-h">All places</h2>
            <div className="chips" role="group" aria-label="Filter places">
              {filters.map(([id, label]) => (
                <button key={id} type="button" className="chip" aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</button>
              ))}
            </div>
          </div>
          <ul className="cards">
            {ordered.map((p) => (
              <li key={p.id}>
                <button type="button" className={`card glass is-${p.status} ${dimmed(p) ? 'is-dim' : ''}`} aria-pressed={sel === p.id} onClick={() => setSel(p.id)}>
                  <Medal place={p} />
                  <span className="card-text">
                    <span className="card-name">{p.name}</span>
                    <span className="card-year">{p.year}</span>
                    <span className={`node-status is-${p.status}`}>{STATUS[p.status].label}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <ul className="legend" aria-label="What the rings mean">
            <li><i className="ring is-open" aria-hidden="true" />Open to walk through</li>
            <li><i className="ring is-planned" aria-hidden="true" />Planned</li>
            <li><i className="ring is-idea" aria-hidden="true" />Only an idea</li>
          </ul>
        </section>
      </main>

      <Footer root={ROOT} note="Places shown in 3D are reconstructions. Each place says what is documented, inferred or invented. Background: Thomas Cole, The Course of Empire: The Arcadian or Pastoral State, 1834 (public domain), darkened." />
    </div>
  )
}
