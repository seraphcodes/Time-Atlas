// The 3D world and its quality ladder. Loaded on its own, after the page
// has already shown the title and loading screen, because three.js is most
// of the download.
import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { World } from './world/World'
import { Post } from './camera/Post'
import { calm } from './design/calm'

const COARSE = window.matchMedia('(pointer: coarse)').matches
// For testing: ?q=high or ?q=low fixes the quality level.
const FORCED = ['high', 'low'].find((q) => q === new URLSearchParams(window.location.search).get('q'))
const TOP = Math.min(window.devicePixelRatio || 1, COARSE ? 1.5 : 1.75)
const LADDER = [{ post: true, dpr: TOP }, { post: false, dpr: TOP }]
for (let d = TOP - 0.25; d >= 1; d -= 0.25) LADDER.push({ post: false, dpr: d })
const START = FORCED === 'high' ? 0 : FORCED === 'low' || COARSE ? 1 : 0

// Says "the world is drawing" once a few real frames have been painted, so the
// loading screen lifts onto a picture and not onto a blank canvas.
function Ready({ onReady }) {
  const n = useRef(0)
  useFrame(() => {
    if (n.current < 0) return
    if (++n.current > 20) {
      n.current = -1
      onReady()
    }
  })
  return null
}

export default function Scene({ onReady }) {
  // Quality is a ladder. Step 0 is everything on; each step down gives up
  // something: first the cinematic finish (camera/Post.jsx), then resolution.
  // A device that drops frames climbs down; one with power to spare climbs
  // back up. Phones start one step down and never get the finish.
  const [step, setStep] = useState(START)
  const lastChange = useRef(0)
  const locked = useRef(false)
  const move = (by) => {
    const now = performance.now()
    if (FORCED || locked.current || now - lastChange.current < 5000) return // let each change settle first
    lastChange.current = now
    setStep((s) => Math.min(LADDER.length - 1, Math.max(START, s + by)))
  }
  // If the frame rate keeps swinging up and down, stop one step lower and stay there.
  const settle = () => {
    if (FORCED) return
    locked.current = true
    setStep((s) => Math.min(LADDER.length - 1, s + 1))
  }
  const { post, dpr } = LADDER[step]

  return (
    <Canvas
      shadows="percentage"
      dpr={dpr}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: 46, near: 1, far: 45000, position: [770, -22, 30] }}
    >
      <PerformanceMonitor flipflops={3} onDecline={() => move(1)} onIncline={() => move(-1)} onFallback={settle} />
      <World />
      {post && !calm && <Post />}
      <Ready onReady={onReady} />
    </Canvas>
  )
}
