// Invisible boxes round each building with a marker, so a tap on the
// building itself opens it (not only a tap on the small marker).
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { PLACES } from './layout'
import { useNow } from './era'
import { MARKERS } from '../content/rome'
import { heightAt } from './terrain'
import { picking } from '../rig'

export function Picks() {
  const group = useRef()
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ visible: false }), [])
  const boxes = useMemo(
    () =>
      MARKERS.map((m) => {
        const p = PLACES[m.place]
        const [w, h, d] = p.pick
        return { id: m.id, era: m.era, x: p.at[0], y: heightAt(p.at[0], p.at[1]) + h / 2, z: p.at[1], w, h: Math.max(h, 12), d, rot: p.rot }
      }),
    [],
  )
  // only the tap targets of the era on show answer a tap
  const now = useNow()
  useLayoutEffect(() => {
    group.current.updateMatrixWorld(true)
    picking.objects = group.current.children.filter((c) => (c.userData.era === 'now') === now)
  }, [now])
  return (
    <group ref={group}>
      {boxes.map((b) => (
        <mesh key={b.id} position={[b.x, b.y, b.z]} rotation-y={b.rot} material={mat} userData={{ place: b.id, era: b.era }}>
          <boxGeometry args={[b.w, b.h, b.d]} />
        </mesh>
      ))}
    </group>
  )
}
