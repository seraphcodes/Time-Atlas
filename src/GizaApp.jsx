import { Component, lazy, Suspense, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Overlay } from './ui/Overlay'
import { journey, T_END } from './journey/journey'
import { giza } from './content/giza'
import { MOTION } from './design/tokens'

gsap.registerPlugin(ScrollTrigger)

// The world is its own download. The title, words and loading screen are
// already on screen while it arrives.
const Scene = lazy(() => import('./Scene'))

function webglWorks() {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch {
    return false
  }
}

// Shown when the 3D world cannot run: the story is still readable.
function Fallback({ reason }) {
  return (
    <main className="fallback">
      <p className="fallback-wordmark">TimeAtlas</p>
      <h1>{giza.place}</h1>
      <p className="fallback-reason">{reason}</p>
      {giza.captions.map((c) => (
        <section key={c.title}>
          <h2>{c.title}</h2>
          <p>{c.text}</p>
          {c.note && <p className="note">{c.note}</p>}
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
      <p className="loading-line">Preparing {giza.place}, {giza.dateline ?? '2560 BC'}</p>
      <span className="loading-rod" aria-hidden="true" />
    </div>
  )
}

export default function GizaApp() {
  const scroller = useRef()
  const [ready, setReady] = useState(false)
  const [webgl] = useState(webglWorks)

  // The page is a tall, empty scroll track. Its position drives the journey.
  useEffect(() => {
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
      <h1 className="sr-only">TimeAtlas: {giza.place}, 2560 BC. An interactive 3D journey.</h1>
      <div className={`stage ${ready ? 'is-ready' : ''}`} aria-hidden="true">
        <Guard>
          <Suspense fallback={null}>
            <Scene onReady={() => setReady(true)} />
          </Suspense>
        </Guard>
      </div>
      <Overlay />
      <Loading done={ready} />
      <div ref={scroller} className="scroll-track" aria-hidden="true" style={{ height: `${T_END * MOTION.screensPerScene * 100 + 100}vh` }} />
    </main>
  )
}
