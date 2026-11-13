import { useEffect, useRef, useState } from 'react'
import Nav from '../home/Nav'
import Footer from '../site/Footer'
import { AXIS, STATUS, places } from '../site/places'
import bgWideWebp from '../home/img/second-wide.webp'
import bgWideJpg from '../home/img/second-wide.jpg'
import bgNarrowWebp from '../home/img/second-narrow.webp'
import bgNarrowJpg from '../home/img/second-narrow.jpg'

const ROOT = '../'
const chapters = [...places].sort((a, b) => a.at - b.at)
const round100 = (n) => (Math.round(n / 100) * 100).toLocaleString('en')
// There is no year 0, so a BC year is one further from today than the plain subtraction says.
const yearsAgo = (at) => AXIS.to - at - (at < 0 ? 1 : 0)
const between = (a, b) => b.at - a.at - (a.at < 0 && b.at > 0 ? 1 : 0)

export default function Timeline() {
  const [active, setActive] = useState(0)
  const list = useRef()
  const refs = useRef([])

  // Which chapter is in the middle of the screen, and how far down the line we are.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number(e.target.dataset.i))),
      { rootMargin: '-45% 0px -45% 0px' },
    )
    refs.current.forEach((el) => el && io.observe(el))
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const el = list.current
        if (!el) return
        const r = el.getBoundingClientRect()
        const p = Math.min(1, Math.max(0, (window.innerHeight * 0.5 - r.top) / r.height))
        el.style.setProperty('--p', p.toFixed(4))
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const cur = chapters[active]

  return (
    <div className="tl-page">
      <div className="backdrop" aria-hidden="true">
        <picture>
          <source media="(max-width: 700px)" srcSet={bgNarrowWebp} type="image/webp" />
          <source media="(max-width: 700px)" srcSet={bgNarrowJpg} />
          <source srcSet={bgWideWebp} type="image/webp" />
          <img src={bgWideJpg} alt="" draggable="false" />
        </picture>
      </div>

      <Nav root={ROOT} current="Timeline" />

      <main id="main">
        <section className="tl-head">
          <h1>The long way back.</h1>
          <p>Scroll down through time. Each place is a chapter, and the gold line fills as you pass it.</p>
        </section>

        <div className="tl-body">
          <aside className="tl-year glass" aria-hidden="true">
            <span className="tl-year-label">You are at</span>
            <span className="tl-year-num" key={cur.id}>{cur.year}</span>
            <span className="tl-year-place">{cur.name}</span>
            <span className="tl-year-ago">About {round100(yearsAgo(cur.at))} years ago</span>
          </aside>

          <ol className="tl-list" ref={list}>
            <i className="tl-line" aria-hidden="true" />
            <i className="tl-fill" aria-hidden="true" />
            {chapters.map((p, i) => (
              <li key={p.id} className={`tl-item ${active === i ? 'is-active' : ''}`} data-i={i} ref={(el) => (refs.current[i] = el)}>
                {i > 0 && (
                  <p className="tl-gap"><span>About {round100(between(chapters[i - 1], p))} years later</span></p>
                )}
                <i className={`tl-dot is-${p.status}`} aria-hidden="true" />
                <article className="tl-card glass" aria-labelledby={`tl-${p.id}`}>
                  <img src={p.image} alt={p.imageAlt} width="800" height="500" loading={i === 0 ? 'eager' : 'lazy'} />
                  <div className="tl-card-body">
                    <p className={`panel-status is-${p.status}`}>{STATUS[p.status].label} <span aria-hidden="true">/</span> {p.year}</p>
                    <h2 id={`tl-${p.id}`}>{p.name}</h2>
                    <p className="tl-blurb">{p.blurb}</p>
                    {p.facts && (
                      <dl className="tl-facts">
                        {p.facts.map(([k, v]) => (
                          <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                        ))}
                      </dl>
                    )}
                    {p.credit && <p className="panel-credit">{p.credit}</p>}
                    {p.status === 'open' && (
                      <div className="panel-actions">
                        <a className="btn" href={ROOT + p.experience}>Enter {p.name}</a>
                        <a className="btn btn-ghost" href={ROOT + p.page}>Read the field guide</a>
                      </div>
                    )}
                  </div>
                </article>
              </li>
            ))}
            <li className="tl-item tl-today">
              <p className="tl-gap"><span>About {round100(between(chapters[chapters.length - 1], { at: AXIS.to }))} years to today</span></p>
              <i className="tl-dot is-today" aria-hidden="true" />
              <div className="tl-end glass">
                <h2>Today.</h2>
                <p>Four places are on the map. One is open to walk through. See them side by side on one line.</p>
                <a className="btn" href={ROOT + 'explore/'}>Open Explore</a>
              </div>
            </li>
          </ol>
        </div>
      </main>

      <Footer root={ROOT} note="Places shown in 3D are reconstructions. Years for places not built yet are where we would start, not promises. Background: Thomas Cole, The Course of Empire: The Arcadian or Pastoral State, 1834 (public domain), darkened." />
    </div>
  )
}
