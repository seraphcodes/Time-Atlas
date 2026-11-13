// The camera's route through the journey. Each key says: at moment t, stand
// at `pos` and look at `look`. The path between keys is a smooth curve, so
// there are no jumps. x = east, y = up, z = south, in metres.
import * as THREE from 'three'

export const CAMERA_KEYS = [
  // Scene 1: dawn over the Nile. Sunrise along the harbour canal, then a slow
  // rising turn across the valley to the plateau.
  { t: 0.0, pos: [770, -22, 30], look: [1770, -46, 250] },
  { t: 0.3, pos: [790, -6, 50], look: [1700, -44, 800] },
  { t: 0.58, pos: [840, 30, 110], look: [820, -30, 1150] },
  { t: 0.82, pos: [900, 70, 300], look: [60, 20, 330] },
  { t: 1.0, pos: [840, 78, 440], look: [0, 46, 60] },

  // Scene 2: the building site. Fly in around the south side, then follow a
  // hauling team up the last stretch of ramp, into the sunrise, onto the
  // working platform.
  { t: 1.22, pos: [430, 72, 430], look: [0, 46, 40] },
  { t: 1.42, pos: [110, 62, 320], look: [-20, 52, 60] },
  { t: 1.58, pos: [-70, 82, 104], look: [-22, 84, 54] },
  { t: 1.72, pos: [-34, 85, 60.5], look: [20, 88.8, 50] },
  { t: 1.87, pos: [20, 92, 55.5], look: [62, 91.5, 38] },
  { t: 2.0, pos: [66, 107, 70], look: [-6, 91, -6] },

  // Scene 3: stone and sunlight. Pull back while the years pass, then circle
  // the finished pyramid towards its north-east corner.
  { t: 2.28, pos: [340, 120, 430], look: [0, 62, 0] },
  { t: 2.55, pos: [500, 62, 170], look: [0, 70, 0] },
  { t: 2.8, pos: [470, 34, -210], look: [0, 72, 0] },
  { t: 3.0, pos: [380, 22, -400], look: [0, 74, 0] },

  // Scene 4: inside the pyramid. Rise to look at the cut face, fly in at the
  // foot of the Grand Gallery, climb it, and stoop through the low passage
  // into the King's Chamber. Then back out through the open side.
  { t: 3.12, pos: [330, 60, -300], look: [10, 40, -30] },
  { t: 3.26, pos: [250, 58, -190], look: [7, 32, -40] },
  { t: 3.36, pos: [90, 34, -75], look: [7, 30, -30] },
  { t: 3.42, pos: [11, 25.2, -39.2], look: [6.6, 30, -22] },
  { t: 3.45, pos: [7.3, 25.3, -37.2], look: [7.2, 33, -19] },
  { t: 3.48, pos: [7.2, 26.4, -35], look: [7.2, 34, -17] },
  { t: 3.6, pos: [7.2, 39.0, -9.5], look: [7.2, 43.5, 0] },
  { t: 3.66, pos: [7.2, 43.7, -0.5], look: [7.2, 43.6, 5] },
  { t: 3.69, pos: [7.2, 43.56, 1.2], look: [7.2, 43.6, 6] },
  { t: 3.72, pos: [7.2, 43.7, 3.4], look: [7.2, 43.8, 8] },
  { t: 3.75, pos: [7.2, 43.56, 6.3], look: [6.0, 43.9, 10] },
  { t: 3.8, pos: [6.3, 44.5, 9.2], look: [0, 44.2, 10.2] },
  { t: 3.87, pos: [4.6, 44.55, 10.1], look: [-1.4, 43.9, 10.1] },
  { t: 3.94, pos: [4.2, 44.6, 10.2], look: [-1.4, 44.0, 10.0] },
  { t: 3.985, pos: [5.4, 44.7, 10.1], look: [-1.4, 44.2, 10.0] },
  { t: 4.05, pos: [42, 50, 4], look: [0, 44.5, 10] },

  // Scene 5: forty-six centuries. Swing round the south side to a high
  // viewpoint in the western desert, then hold almost still while time runs.
  // From here the valley lies behind the pyramids, so the river, the fields
  // and the city can be seen changing, and the afternoon sun lights the faces.
  { t: 4.14, pos: [300, 120, 330], look: [0, 50, 60] },
  { t: 4.24, pos: [-500, 250, 1150], look: [-150, 30, 250] },
  { t: 4.34, pos: [-1500, 300, 900], look: [250, 0, 400] },
  { t: 4.62, pos: [-1750, 300, 650], look: [290, 0, 400] },
  { t: 4.86, pos: [-1720, 360, 520], look: [330, -30, 300] },
  { t: 5.0, pos: [-1700, 400, 470], look: [360, -40, 270] },
]

export function buildPath(keys = CAMERA_KEYS) {
  const posCurve = new THREE.CatmullRomCurve3(keys.map((k) => new THREE.Vector3(...k.pos)), false, 'centripetal')
  const lookCurve = new THREE.CatmullRomCurve3(keys.map((k) => new THREE.Vector3(...k.look)), false, 'centripetal')
  const n = keys.length
  return (t, outPos, outLook) => {
    let i = 0
    while (i < n - 2 && t > keys[i + 1].t) i++
    const f = THREE.MathUtils.clamp((t - keys[i].t) / (keys[i + 1].t - keys[i].t), 0, 1)
    const u = (i + f) / (n - 1)
    posCurve.getPoint(u, outPos)
    lookCurve.getPoint(u, outLook)
  }
}
