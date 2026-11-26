// The 3D world of Rome and its quality ladder, loaded after the title is up.
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { walk } from './rig'
import { groundAt } from './world/terrain'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { Director } from './Director'
import { Ground } from './world/Ground'
import { Landmarks } from './world/Landmarks'
import { Fabric } from './world/Fabric'
import { Picks } from './world/Picks'
import { Colosseum } from './world/Colosseum'
import { Forum } from './world/Forum'
import { Street } from './world/Street'
import { Palatine } from './world/Palatine'
import { Circus } from './world/Circus'
import { Today } from './world/Today'
import { useNow } from './world/era'
import { Sky } from '../world/Sky'

const COARSE = window.matchMedia('(pointer: coarse)').matches
const FORCED = ['high', 'low'].find((q) => q === new URLSearchParams(window.location.search).get('q'))
const TOP = Math.min(window.devicePixelRatio || 1, COARSE ? 1.5 : 1.75)
const LADDER = []
for (let d = TOP; d >= 1; d -= 0.25) LADDER.push(d)
if (LADDER[LADDER.length - 1] > 1) LADDER.push(1)
const START = FORCED === 'low' ? Math.min(1, LADDER.length - 1) : 0

// A soft ring on the ground where a tap has sent the walker.
function DestRing() {
  const ref = useRef()
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#F2EBDD', transparent: true, opacity: 0.8, depthWrite: false }), [])
  useFrame(({ clock }) => {
    const m = ref.current
    if (!m) return
    m.visible = !!walk.dest
    if (!walk.dest) return
    const [x, z] = walk.dest
    m.position.set(x, groundAt(x, z) + 0.08, z)
    m.scale.setScalar(1 + 0.12 * Math.sin(clock.elapsedTime * 5))
  })
  return (
    <mesh ref={ref} material={mat} rotation-x={-Math.PI / 2} visible={false} renderOrder={3}>
      <ringGeometry args={[0.55, 0.8, 32]} />
    </mesh>
  )
}

function TodayLayer() {
  return <Today on={useNow()} />
}

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

export default function RomeScene({ onReady }) {
  const [step, setStep] = useState(START)
  const last = useRef(0)
  const move = (by) => {
    const now = performance.now()
    if (FORCED || now - last.current < 5000) return
    last.current = now
    setStep((s) => Math.min(LADDER.length - 1, Math.max(START, s + by)))
  }
  return (
    <Canvas
      shadows="percentage"
      dpr={LADDER[step]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: 42, near: 2, far: 60000, position: [-2350, 760, -2350] }}
    >
      <PerformanceMonitor flipflops={3} onDecline={() => move(1)} onIncline={() => move(-1)} />
      <Director />
      <Sky />
      <Ground />
      <Landmarks />
      <Colosseum />
      <Forum />
      <Street />
      <Palatine />
      <Circus />
      <Fabric />
      <TodayLayer />
      <DestRing />
      <Picks />
      <Ready onReady={onReady} />
    </Canvas>
  )
}
