import { Component, lazy, Suspense, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { RomeOverlay } from './RomeOverlay'
import { journey, T_END, SCREENS_PER_SCENE } from './journey'
import { rome, MARKERS } from './content/rome'

gsap.registerPlugin(ScrollTrigger)

const Scene = lazy(() => import('./RomeScene'))

function webglWorks() {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch {
    return false
  }
}

// When the 3D world cannot run, the words are still readable.
function Fallback({ reason }) {
  return (
    <main className="fallback">
      <p className="fallback-wordmark">TimeAtlas</p>
      <h1>{rome.place}, {rome.dateline}</h1>
      <p className="fallback-reason">{reason}</p>
      {rome.captions.map((c) => (
        <section key={c.title}>
          <h2>{c.title}</h2>
          <p>{c.text}</p>
          {c.note && <p className="note">{c.note}</p>}
        </section>
      ))}
      {MARKERS.map((m) => (
        <section key={m.id}>
          <h2>{m.title}</h2>
          <p>{m.text}</p>
        </section>
      ))}
      <button type="button" onClick={() => window.location.reload()}>Reload the page</button>
    </main>
  )
}

class Guard extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error) {
    console.error('TimeAtlas: the 3D world stopped.', error)
  }
  render() {
    return this.state.failed ? <Fallback reason="The 3D world stopped working on this device. The story is below instead." /> : this.props.children
  }
}

function Loading({ done }) {
  return (
    <div className={`loading ${done ? 'is-done' : ''}`} role="status" aria-live="polite" aria-hidden={done}>
      <p className="loading-wordmark">TimeAtlas</p>
      <p className="loading-line">Preparing {rome.place}, {rome.dateline}</p>
      <span className="loading-rod" aria-hidden="true" />
    </div>
  )
}

export default function RomeApp() {
  const scroller = useRef()
  const [ready, setReady] = useState(false)
  const [webgl] = useState(webglWorks)

  useEffect(() => {
    document.documentElement.classList.add('rome')
    const st = ScrollTrigger.create({
      trigger: scroller.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        journey.target = self.progress
      },
    })
    return () => st.kill()
  }, [])

  if (!webgl) return <Fallback reason="Your browser cannot draw 3D graphics, so the journey cannot run here. The story is below instead." />

  return (
    <main>
      <h1 className="sr-only">TimeAtlas: {rome.place}, {rome.dateline}. An interactive 3D journey.</h1>
      <div className={`stage ${ready ? 'is-ready' : ''}`} aria-hidden="true">
        <Guard>
          <Suspense fallback={null}>
            <Scene onReady={() => setReady(true)} />
          </Suspense>
        </Guard>
      </div>
      <RomeOverlay />
      <Loading done={ready} />
      <div ref={scroller} className="scroll-track" aria-hidden="true" style={{ height: `${T_END * SCREENS_PER_SCENE * 100 + 100}vh` }} />
    </main>
  )
}
