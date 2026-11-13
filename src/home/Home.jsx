import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Nav from './Nav'
import Footer from '../site/Footer'
import { GIZA_HREF, credits, giza, hero, last, next, second, steps } from './content'
import { STATUS, pct, places } from '../site/places'
import dawnWebp from '../site/img/giza-dawn.webp'
import dawnJpg from '../site/img/giza-dawn.jpg'
import finishedWebp from '../site/img/giza-finished.webp'
import finishedJpg from '../site/img/giza-finished.jpg'
import finishedSmall from '../site/img/giza-finished-s.webp'
import box from './layers/layers.json'
import heroWideWebp from './img/hero-wide.webp'
import heroWideJpg from './img/hero-wide.jpg'
import secondWideWebp from './img/second-wide.webp'
import secondWideJpg from './img/second-wide.jpg'
import secondNarrowWebp from './img/second-narrow.webp'
import secondNarrowJpg from './img/second-narrow.jpg'

gsap.registerPlugin(ScrollTrigger)

// Where the sun sits in the dawn still (fractions of the picture), and the
// picture's size. The light of the second transition grows from, and shrinks
// back into, exactly this point.
const SUN = { x: 0.2893, y: 0.3386, w: 1600, h: 900 }
// Places that are not open yet, planned ones first.
const upcoming = places.filter((p) => p.status !== 'open').sort((a, b) => (a.status === 'planned' ? -1 : 0) - (b.status === 'planned' ? -1 : 0))

const files = import.meta.glob('./layers/*.{webp,jpg}', { eager: true, import: 'default' })
const src = (name, size, ext = 'webp') => files[`./layers/${name}-${size}.${ext}`]

// One cut-out piece of the painting, placed exactly where it sits in the original.
function Layer({ name }) {
  const b = box[name]
  return (
    <picture>
      <source media="(max-width: 700px)" srcSet={src(name, 's')} type="image/webp" />
      <img
        className={`layer layer-${name}`}
        src={src(name, 'l')}
        alt=""
        draggable="false"
        style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` }}
      />
    </picture>
  )
}

export default function Home() {
  const root = useRef()

  // The painting is a stage. Scrolling opens it: the swag lifts, the pillars and
  // drapes part, the foreground sinks away, the city turns to mist, and the
  // second painting is standing behind it. Only transform and opacity change.
  useLayoutEffect(() => {
    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const q = gsap.utils.selector(root)
      const phone = window.matchMedia('(max-width: 700px)').matches
      const scene = q('.scene')[0]
      const sw = () => scene.offsetWidth
      const sh = () => scene.offsetHeight
      root.current.classList.add('is-animated')

      gsap.set(q('.layer-left'), { transformOrigin: '0% 0%' })
      gsap.set(q('.layer-right'), { transformOrigin: '100% 0%' })
      gsap.set(q('.layer-swag'), { transformOrigin: '50% 0%' })
      gsap.set(q('.layer-ped'), { transformOrigin: '50% 100%' })
      gsap.set(q('.layer-mid'), { transformOrigin: '0% 100%' })
      gsap.set(q('.city'), { transformOrigin: '62% 46%' })
      gsap.set(q('.two .art'), { scale: 1.28, transformOrigin: '50% 55%' })
      gsap.set(q('.iris'), { scale: 2.4, opacity: 0 })
      gsap.set(q('.glow'), { scale: 0.5, opacity: 0 })
      gsap.set(q('.mist'), { opacity: 0, scale: 0.8 })
      gsap.set(q('.two .copy'), { opacity: 0, y: 36 })

      // second move: the light, the dawn still behind the stage, the third screen
      const T = 1 // where the first move ends on the timeline
      const sky = q('.sky')[0]
      const light = q('.light')[0]
      const dawn = q('.bd-dawn')[0]
      const dim = q('.bd-dim')[0]
      // the sun's place on screen, from how the still is cropped right now
      const sunAt = () => {
        const w = sky.offsetWidth, h = sky.offsetHeight
        const k = Math.max(w / SUN.w, h / SUN.h)
        const [px, py] = getComputedStyle(dawn).objectPosition.split(' ').map(parseFloat)
        return { x: ((w - SUN.w * k) * px) / 100 + SUN.x * SUN.w * k, y: ((h - SUN.h * k) * py) / 100 + SUN.y * SUN.h * k, w, h }
      }
      const placeSun = () => {
        const p = sunAt()
        root.current.style.setProperty('--sun-x', `${p.x}px`)
        root.current.style.setProperty('--sun-y', `${p.y}px`)
      }
      // how far the light must grow so its solid core reaches the far corner
      const cover = () => {
        const p = sunAt()
        const far = Math.hypot(Math.max(p.x, p.w - p.x), Math.max(p.y, p.h - p.y))
        return (1.15 * far) / (light.offsetWidth * 0.5 * 0.3)
      }
      placeSun()
      ScrollTrigger.addEventListener('refreshInit', placeSun)
      gsap.set(light, { scale: 0.04, opacity: 0 })
      gsap.set(q('.three .copy'), { autoAlpha: 0, y: 36 })
      gsap.set(q('.shade-three'), { opacity: 0 })

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: q('.stage')[0],
          start: 'top top',
          end: phone ? '+=456%' : '+=638%', // the first move keeps its length; the second adds about half
          pin: true,
          scrub: 0.9,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      tl
        // the untouched painting hands over to its layers
        .set(q('.flat'), { autoAlpha: 0 }, 0.004)
        // words leave, the picture brightens
        .to(q('.one .copy'), { opacity: 0, y: -48, duration: 0.1 }, 0)
        .to(q('.cue'), { opacity: 0, duration: 0.05 }, 0)
        .to(q('.one .shade'), { opacity: 0, duration: 0.2 }, 0)
        // the camera leans in for the whole move
        .to(scene, { scale: 1.1, ease: 'sine.inOut', duration: 0.62 }, 0)
        // 1. the swag lifts
        .to(q('.layer-swag'), { y: () => -sh() * 0.3, x: () => -sw() * 0.05, scale: 1.35, rotation: -4, ease: 'power2.in', duration: 0.3 }, 0.05)
        // 2. the curtains part: near pieces travel furthest and fastest
        .to(q('.layer-left'), { x: () => -sw() * 0.36, scale: 1.3, rotation: -3, ease: 'power2.inOut', duration: 0.4 }, 0.1)
        .to(q('.layer-right'), { x: () => sw() * 0.42, scale: 1.34, rotation: 4, ease: 'power2.inOut', duration: 0.44 }, 0.12)
        // 3. the architect's column sinks out of frame
        .to(q('.layer-ped'), { y: () => sh() * 0.62, scale: 1.3, ease: 'power2.in', duration: 0.36 }, 0.16)
        // 4. church and cypresses drift off after the pillar, slower
        .to(q('.layer-mid'), { x: () => -sw() * 0.82, y: () => sh() * 0.08, scale: 1.22, ease: 'power1.in', duration: 0.46 }, 0.22)
        // 5. the city turns to mist
        .to(q('.city'), { scale: 1.32, ease: 'power1.in', duration: 0.42 }, 0.3)
        .to(q('.mist'), { opacity: 1, scale: 1.25, ease: 'power1.inOut', duration: 0.24 }, 0.26)
        .to(q('.city'), { opacity: 0, ease: 'power1.inOut', duration: 0.2 }, 0.44)
        .to(q('.mist'), { opacity: 0, scale: 1.7, ease: 'power1.in', duration: 0.22 }, 0.54)
        .set(q('.one'), { autoAlpha: 0 }, 0.8)
        // 6. the second painting settles; olive closes in, gold gathers in the middle
        .to(q('.two .art'), { scale: 1, ease: 'power2.out', duration: 0.46 }, 0.44)
        .to(q('.iris'), { scale: 1, opacity: 1, ease: 'power2.out', duration: 0.34 }, 0.56)
        .to(q('.glow'), { scale: 1, opacity: 1, ease: 'power2.out', duration: 0.3 }, 0.64)
        .to(q('.two .copy'), { opacity: 1, y: 0, ease: 'power2.out', duration: 0.12 }, 0.86)
        .to({}, { duration: 0.02 })
        // ---- second move: walk into the light ----
        // 7. the words leave; the sun of the painting rises and fills the screen
        .to(q('.two .copy'), { opacity: 0, y: -40, ease: 'power1.in', duration: 0.06 }, T + 0.1)
        .to(light, { opacity: 1, ease: 'power1.out', duration: 0.05 }, T + 0.11)
        .to(light, { scale: cover, ease: 'power2.in', duration: 0.15 }, T + 0.11)
        // 8. behind the light the painting is gone and Giza is standing there
        .set(q('.two'), { autoAlpha: 0 }, T + 0.26)
        .fromTo(dawn, { scale: 1.16 }, { scale: 1, ease: 'power2.out', duration: 0.24 }, T + 0.26)
        // 9. the light draws back into the sun over the Nile
        .to(light, { scale: 0.3, ease: 'power3.out', duration: 0.18 }, T + 0.27)
        .to(light, { opacity: 0, ease: 'power1.in', duration: 0.07 }, T + 0.38)
        .to(q('.shade-three'), { opacity: 1, ease: 'power1.inOut', duration: 0.1 }, T + 0.36)
        .to(q('.three .copy'), { autoAlpha: 1, y: 0, ease: 'power2.out', duration: 0.07 }, T + 0.41)
        .to({}, { duration: 0.04 })

      // ---- after the stage: the rebuilt place stays behind everything ----
      // One dark layer over the still, driven from two places: it comes down as
      // the steps arrive and lifts again for the last line. Both write through
      // one function, so they can never disagree after a jump.
      const shadeWrap = q('.shade-wrap, .how-tail')
      let down = 0, up = 0
      const setDim = () => {
        gsap.set(dim, { opacity: down * (1 - up) })
        // the third screen's own shade hands over to it, late, so its words never sit on a thin patch
        gsap.set(shadeWrap, { opacity: 1 - gsap.utils.clamp(0, 1, (down - 0.4) / 0.6) })
      }
      const follow = (trigger, start, end, write) => {
        const on = (self) => { write(self.progress); setDim() }
        ScrollTrigger.create({ trigger, start, end, onUpdate: on, onRefresh: on })
      }
      // lights down: Giza darkens as the steps arrive
      follow(q('.how')[0], 'top bottom', 'top 45%', (v) => { down = v })
      // the gold line runs from step one to step three
      const stepEls = q('.step')
      const wide = window.matchMedia('(min-width: 901px)').matches
      stepEls.forEach((el) => el.classList.remove('is-on'))
      gsap.fromTo(q('.steps-fill'), { scaleX: wide ? 0 : 1, scaleY: wide ? 1 : 0 }, {
        scaleX: 1, scaleY: 1, ease: 'none',
        scrollTrigger: {
          trigger: q('.steps')[0],
          start: wide ? 'top 78%' : 'top 70%',
          end: wide ? 'top 34%' : 'bottom 62%',
          scrub: 0.5,
          onUpdate: (self) => stepEls.forEach((el, i) => el.classList.toggle('is-on', self.progress >= Math.max(0.02, i / (stepEls.length - 1) - 0.03))),
        },
      })
      // time passes in the dark: dawn becomes the finished pyramid
      gsap.to(q('.bd-finished'), { opacity: 1, ease: 'none', scrollTrigger: { trigger: q('.next')[0], start: 'top 72%', end: 'top 36%', scrub: true } })
      // lights up for the last line
      // (after a beat of darkness, once the cards above have left the screen)
      follow(q('.last')[0], 'top 22%', 'top -35%', (v) => { up = v })

      return () => {
        ScrollTrigger.removeEventListener('refreshInit', placeSun)
        if (root.current) {
          root.current.classList.remove('is-animated')
          stepEls.forEach((el) => el.classList.add('is-on'))
        }
      }
    })

    // Reduced motion: no pinning and nothing moves. The backdrop still changes,
    // as plain fades, when a section reaches the middle of the screen.
    mm.add('(prefers-reduced-motion: reduce)', () => {
      const q = gsap.utils.selector(root)
      const top = (sel) => q(sel)[0].getBoundingClientRect().top
      let waiting = false
      const sync = () => {
        waiting = false
        if (!root.current) return
        const vh = window.innerHeight
        root.current.classList.toggle('lights-down', top('.how') < vh * 0.96)
        root.current.classList.toggle('time-on', top('.next') < vh * 0.6)
        root.current.classList.toggle('lights-up', top('.last') < vh * 0.12)
      }
      const onScroll = () => { if (!waiting) { waiting = true; requestAnimationFrame(sync) } }
      sync()
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', onScroll)
      return () => {
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', onScroll)
        root.current && root.current.classList.remove('lights-down', 'time-on', 'lights-up')
      }
    })

    // text reflows a little when the font arrives; measure again after that
    document.fonts?.ready.then(() => ScrollTrigger.refresh())

    return () => mm.revert()
  }, [])

  // The navbar takes the colour of whatever page is behind it. The blur does
  // that on its own where the browser draws it; where the person has turned
  // transparency off, the bar falls back to this tint, read off the same
  // picture at each point of the scroll and darkened so the links stay readable.
  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const DARK = 0.32
    // colours of the picture behind the bar, [rgb] at each moment of the journey
    const PAINT1 = [153, 150, 149], CURTAIN = [216, 211, 211], WASH = [208, 195, 173], MOSS = [97, 99, 77]
    const SUN = [246, 232, 202], DAWN = [192, 163, 133], NIGHT = [54, 53, 41], DEEP = [50, 54, 45]
    const MIST = [122, 125, 123], SKY = [173, 176, 179], FOOT = [38, 42, 34]
    let stops = []
    const top = (sel) => { const n = el.querySelector(sel); return n ? n.getBoundingClientRect().top + window.scrollY : 0 }
    const build = () => {
      const vh = window.innerHeight
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const how = top('.how'), next = top('.next'), last = top('.last')
      if (reduce) {
        stops = [[0, PAINT1], [top('.slide.two'), MOSS], [top('.slide.three'), DAWN], [how - vh * 0.2, DAWN], [how + 150, NIGHT], [next - 50, DEEP], [last + 100, MIST], [last + 350, SKY]]
      } else {
        const pin = Math.max(1, how - vh)
        const at = (t) => (t / 1.52) * pin
        stops = [[0, PAINT1], [at(0.15), PAINT1], [at(0.36), CURTAIN], [at(0.55), WASH], [at(0.7), [149, 144, 122]], [at(0.85), MOSS], [at(1.0), MOSS],
          [at(1.25), SUN], [at(1.45), DAWN], [how - vh * 0.25, DAWN], [how + 150, NIGHT], [next - 50, DEEP], [last + 100, MIST], [last + 350, SKY]]
      }
      stops.push([document.documentElement.scrollHeight - vh * 1.1, SKY], [document.documentElement.scrollHeight - vh * 0.5, FOOT])
      stops.sort((x, y) => x[0] - y[0])
    }
    let waiting = false
    const paint = () => {
      waiting = false
      const y = window.scrollY
      let a = stops[0], b = stops[stops.length - 1]
      if (y <= a[0]) b = a
      else if (y >= b[0]) a = b
      else for (let i = 1; i < stops.length; i++) if (y <= stops[i][0]) { a = stops[i - 1]; b = stops[i]; break }
      const f = b[0] === a[0] ? 0 : (y - a[0]) / (b[0] - a[0])
      const c = a[1].map((v, i) => Math.round((v + (b[1][i] - v) * f) * DARK))
      el.style.setProperty('--nav-tint', c.join(', '))
    }
    const onScroll = () => { if (!waiting) { waiting = true; requestAnimationFrame(paint) } }
    const onResize = () => { build(); onScroll() }
    build(); paint()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    ScrollTrigger.addEventListener('refresh', onResize)
    const late = setTimeout(onResize, 1200) // after fonts and pictures settle
    return () => {
      clearTimeout(late)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      ScrollTrigger.removeEventListener('refresh', onResize)
    }
  }, [])

  return (
    <div ref={root} className="home">
      {/* Our own Giza stills, fixed behind the page. The stage covers them
          until the second move; after that they stay behind every section. */}
      <div className="sky" aria-hidden="true">
        <picture>
          <source srcSet={dawnWebp} type="image/webp" />
          <img className="bd bd-dawn" src={dawnJpg} alt="" draggable="false" />
        </picture>
        <picture>
          <source srcSet={finishedWebp} type="image/webp" />
          <img className="bd bd-finished" src={finishedJpg} alt="" loading="lazy" decoding="async" draggable="false" />
        </picture>
        <div className="bd-dim" />
      </div>
      <Nav />
      <main>
        {/* The first screen is hidden once the curtains have opened, so the page
            keeps its main heading here for screen readers. */}
        <h1 className="sr-only">TimeAtlas. {hero.title}</h1>
        <section className="stage" aria-label="TimeAtlas">
          <div className="slide one">
            <div className="art-box">
              <div className="scene" role="img" aria-label={hero.alt}>
                <picture>
                  <source media="(max-width: 700px)" srcSet={src('city', 's')} type="image/webp" />
                  <source srcSet={src('city', 'l')} type="image/webp" />
                  <img className="city" src={src('city', 'l', 'jpg')} alt="" draggable="false" />
                </picture>
                <div className="mist" aria-hidden="true" />
                <Layer name="mid" />
                <Layer name="ped" />
                <Layer name="swag" />
                <Layer name="right" />
                <Layer name="left" />
                <picture>
                  <source srcSet={heroWideWebp} type="image/webp" />
                  <img className="flat" src={heroWideJpg} alt="" fetchPriority="high" draggable="false" />
                </picture>
              </div>
            </div>
            <div className="shade" aria-hidden="true" />
            <div className="copy">
              <p className="title" aria-hidden="true">{hero.title}</p>
              <p className="lead">{hero.lead}</p>
              <a className="btn" href={'./explore/'}>{hero.cta}</a>
              <p className="caption">{hero.caption}</p>
            </div>
            <div className="cue" aria-hidden="true">
              <span>Scroll</span>
              <i />
            </div>
          </div>

          <div className="slide two">
            <div className="art-box">
              <picture>
                <source media="(max-width: 700px)" srcSet={secondNarrowWebp} type="image/webp" />
                <source media="(max-width: 700px)" srcSet={secondNarrowJpg} type="image/jpeg" />
                <source srcSet={secondWideWebp} type="image/webp" />
                <img className="art" src={secondWideJpg} alt={second.alt} decoding="async" draggable="false" />
              </picture>
            </div>
            <div className="shade shade-two" aria-hidden="true" />
            <div className="iris" aria-hidden="true" />
            <div className="glow" aria-hidden="true" />
            <div className="copy">
              <h2>{second.title}</h2>
              <p>{second.lead}</p>
              <a className="btn" href={GIZA_HREF}>{second.cta}</a>
              <p className="caption">{second.caption}</p>
            </div>
          </div>

          <div className="light" aria-hidden="true" />

          <div className="slide three">
            <div className="shade-wrap" aria-hidden="true"><div className="shade shade-three" /></div>
            <div className="copy copy-three">
              <div>
                <p className="panel-status">{giza.status} <span>/</span> {giza.year}</p>
                <h2>{giza.title}</h2>
                <p>{giza.lead}</p>
                <div className="btn-row">
                  <a className="btn" href={GIZA_HREF}>{giza.cta}</a>
                  <a className="btn btn-ghost" href={giza.guideHref}>{giza.guide}</a>
                </div>
                <p className="caption">{giza.caption}</p>
              </div>
              <dl className="giza-facts glass">
                {giza.facts.map(([value, label]) => (
                  <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <section className="how" aria-labelledby="how-h">
          <div className="how-tail" aria-hidden="true" />
          <h2 id="how-h" className="sec-h">{steps.title}</h2>
          <ol className="steps">
            <li className="steps-rail" aria-hidden="true"><i className="steps-fill" /></li>
            {steps.list.map((st, i) => (
              <li key={st.title} className="step is-on">
                <span className="step-num" aria-hidden="true">{i + 1}</span>
                <div className="step-card glass">
                  {i === 0 && (
                    <div className="vg vg-rail" aria-hidden="true">
                      <i className="vg-line" />
                      {places.map((p, n) => (
                        <span key={p.id} className={`vg-medal is-${p.status} ${n % 2 ? 'is-below' : ''}`} style={{ '--x': pct(p.at) / 100 }}>
                          <img src={p.thumb} alt="" loading="lazy" />
                        </span>
                      ))}
                      <span className="vg-end">3000 BC</span>
                      <span className="vg-end is-right">Today</span>
                    </div>
                  )}
                  {i === 1 && (
                    <div className="vg vg-still" aria-hidden="true">
                      <img src={finishedSmall} alt="" loading="lazy" />
                      <span>Our 3D model</span>
                    </div>
                  )}
                  {i === 2 && (
                    <ul className="vg vg-marks" aria-hidden="true">
                      {steps.marks.map(([level, name, eg]) => (
                        <li key={level}><i className={`hm is-${level}`} /><b>{name}</b><span>{eg}</span></li>
                      ))}
                    </ul>
                  )}
                  <h3><a href={'./' + st.href}>{st.title}</a></h3>
                  <p>{st.text}</p>
                  <span className="step-go" aria-hidden="true">{st.go}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="next" aria-labelledby="next-h">
          <div className="next-head">
            <h2 id="next-h" className="sec-h">{next.title}</h2>
            <p>{next.lead}</p>
          </div>
          <ul className="next-grid">
            {upcoming.map((p) => (
              <li key={p.id} className={`place glass is-${p.status}`}>
                <div className="place-img"><img src={p.image} alt={p.imageAlt} loading="lazy" /></div>
                <div className="place-body">
                  <p className={`panel-status ${p.status === 'idea' ? 'is-idea' : ''}`}>{STATUS[p.status].label} <span>/</span> {p.year}</p>
                  <h3><a href={'./explore/' + '#' + p.id}>{p.name}</a></h3>
                  <p className="place-blurb">{p.blurb}</p>
                  <p className="panel-credit">{p.credit}</p>
                </div>
              </li>
            ))}
          </ul>
          <a className="btn btn-ghost" href={'./explore/'}>{next.cta}</a>
        </section>

        <section className="last" aria-labelledby="last-h">
          <div className="last-shade" aria-hidden="true" />
          <div className="last-copy">
            <h2 id="last-h">{last.title}</h2>
            <p>{last.lead}</p>
            <div className="btn-row">
              <a className="btn" href={GIZA_HREF}>{last.cta}</a>
              <a className="btn btn-ghost" href={'./explore/'}>{last.more}</a>
            </div>
          </div>
        </section>
      </main>
      <Footer root="./" note={credits} />
    </div>
  )
}
