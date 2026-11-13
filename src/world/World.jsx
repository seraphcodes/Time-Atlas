import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Director } from '../camera/Director'
import { journey } from '../journey/journey'
import { Sky } from './Sky'
import { Terrain } from './Terrain'
import { Nile } from './Nile'
import { Pyramid, Complex, Neighbours } from './Pyramid'
import { Interior } from './Interior'
import { ConstructionSite } from './ConstructionSite'
import { Environment } from './Environment'
import { TimeWind } from './TimeWind'
import { City } from './City'

// The Director comes first so that everything else reads this frame's values.
export function World() {
  const outside = useRef()
  // Sealed inside the pyramid, the outside world is not drawn at all.
  useFrame(() => {
    outside.current.visible = journey.v.inside < 0.999
  })
  return (
    <>
      <Director />
      <group ref={outside}>
        <Sky />
        <Terrain />
        <Nile />
        <Environment />
        <Pyramid />
        <Complex />
        <Neighbours />
        <City />
        <ConstructionSite />
      </group>
      <Interior />
      <TimeWind />
    </>
  )
}
