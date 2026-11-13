// The inside of the Great Pyramid as a plan: every passage and chamber is a
// box with a level or sloping floor. The same list builds the 3D rooms and
// the shader code that cuts them out of the solid stone, so they always match.
// Sizes follow Petrie's survey, rounded. x = east, y = up, z = south.

export const AXIS = 7.2 // the passages run 7.2 m east of the pyramid's centre line

// x: centre, w: width, z0→z1: north end → south end, y0→y1: floor height at
// each end, h: height floor to ceiling, stone: 0 limestone, 1 granite.
export const ROOMS = [
  { id: 'descending', x: AXIS, w: 1.05, z0: -101.8, z1: -65.7, y0: 17.0, y1: -1.0, h: 1.34, stone: 0 },
  { id: 'ascending', x: AXIS, w: 1.05, z0: -76.8, z1: -41.0, y0: 4.3, y1: 21.75, h: 1.34, stone: 0 },
  { id: 'gallery', x: AXIS, w: 2.1, z0: -41.3, z1: 0.5, y0: 21.6, y1: 42.26, h: 8.6, stone: 0 },
  { id: 'queenPassage', x: AXIS, w: 1.05, z0: -41.6, z1: -2.5, y0: 21.6, y1: 21.6, h: 1.17, stone: 0 },
  { id: 'queenChamber', x: 4.845, w: 5.75, z0: -2.6, z1: 2.6, y0: 21.6, y1: 21.6, h: 4.67, stone: 0 },
  { id: 'kingPassage', x: AXIS, w: 1.05, z0: 0.3, z1: 7.5, y0: 43.0, y1: 43.0, h: 1.12, stone: 1 },
  { id: 'antechamber', x: AXIS, w: 1.65, z0: 1.9, z1: 4.8, y0: 43.0, y1: 43.0, h: 3.8, stone: 1 },
  { id: 'kingChamber', x: 2.485, w: 10.47, z0: 7.4, z1: 12.63, y0: 43.0, y1: 43.0, h: 5.83, stone: 1 },
]

// The pointed roof of the Queen's Chamber.
export const GABLE = { x: 4.845, w: 5.75, hz: 2.6, yb: 26.24, rise: 1.59 }

// The granite sarcophagus in the King's Chamber.
export const SARCOPHAGUS = { min: [-1.95, 43.0, 8.9], max: [-0.97, 44.05, 11.18] }

export const room = (id) => ROOMS.find((r) => r.id === id)
export const floorAt = (r, z) => r.y0 + ((r.y1 - r.y0) * (z - r.z0)) / (r.z1 - r.z0)

const f = (n) => n.toFixed(4)
const call = (r) => {
  const slope = (r.y1 - r.y0) / (r.z1 - r.z0)
  return `roomSdf(p, ${f(r.x)}, ${f(r.w / 2)}, ${f(r.z0)}, ${f(r.z1)}, ${f(r.y0)}, ${f(slope)}, ${f(r.h)}, ${f(Math.cos(Math.atan(slope)))})`
}

// Distance to the hollow spaces: negative inside a passage or chamber.
export const INTERIOR_GLSL = /* glsl */ `
float roomSdf(vec3 p, float x, float hw, float z0, float z1, float y0, float slope, float h, float c){
  float yf = y0 + slope * (p.z - z0);
  return max(max(abs(p.x - x) - hw, max(z0 - p.z, p.z - z1)), max(yf - p.y, p.y - yf - h) * c);
}
float interiorSdf(vec3 p){
  float d = 1.0e5;
${ROOMS.map((r) => `  d = min(d, ${call(r)});`).join('\n')}
  float roof = ${f(GABLE.yb)} + ${f(GABLE.rise)} * (1.0 - abs(p.z) / ${f(GABLE.hz)});
  d = min(d, max(max(abs(p.x - ${f(GABLE.x)}) - ${f(GABLE.w / 2)}, ${f(GABLE.yb)} - p.y), (p.y - roof) * 0.85));
  return d;
}
float graniteSdf(vec3 p){
  float d = 1.0e5;
${ROOMS.filter((r) => r.stone === 1).map((r) => `  d = min(d, ${call(r)});`).join('\n')}
  return d;
}
`
