// Where everything stands: the single source of positions for the monuments,
// the city fabric, the markers and the camera. See WORLD.md and HISTORY.md.
// Positions are approximate (about ±20 m) from modern coordinates; the Forum
// and the Colosseum get surveyed plans in sessions 2 and 3.
export const DEG = Math.PI / 180

// Orientation helpers. Angles are compass-like in the x–z plane:
// 0 = east, 90 = south, -90 = north.
// along(a): the building's long axis (local x) runs at angle a.
// facing(a): the building's front (local +z) looks towards angle a.
export const along = (a) => -a * DEG
export const facing = (a) => Math.PI / 2 - a * DEG

// The Forum square: its long axis runs about 25° south of east (u), across it
// is n (towards the Palatine). F is the centre of the square.
const U = 25
const u = [Math.cos(U * DEG), Math.sin(U * DEG)]
const n = [-u[1], u[0]]
const F = [10, 7]
export const fp = (a, b) => [F[0] + u[0] * a + n[0] * b, F[1] + u[1] * a + n[1] * b]
export const FORUM = { centre: F, axis: U, length: 115, width: 50 }

// Everything with a marker or a tap target. `pick` is the tap volume:
// [width, height, depth] in the building's own frame.
export const PLACES = {
  // Forum buildings: centres from published coordinates (Wikipedia/Pleiades,
  // ±5–10 m), converted with the formula in WORLD.md. See HISTORY.md.
  forum: { at: fp(0, 0), rot: along(U), pick: [125, 6, 55] },
  basilicaJulia: { at: fp(-30, 61), rot: along(U), pick: [101, 24, 49] },
  basilicaAemilia: { at: fp(51, -50), rot: along(U), pick: [90, 22, 29] },
  curia: { at: fp(-35, -61), rot: facing(132), pick: [18, 32, 27] },
  rostra: { at: fp(-62, -4), rot: facing(U), pick: [24, 5, 12] },
  saturn: { at: fp(-102, 26), rot: facing(U), pick: [22, 26, 40] },
  vespasian: { at: fp(-133, 15), rot: facing(U), pick: [22, 24, 33] },
  concord: { at: fp(-140, -14), rot: facing(U), pick: [45, 24, 24] },
  tabularium: { at: fp(-168, 4), rot: facing(U), pick: [73, 32, 20] },
  divusJulius: { at: fp(80, 11), rot: facing(U + 180), pick: [26, 22, 30] },
  castor: { at: fp(47, 60), rot: facing(U - 90), pick: [32, 28, 50] },
  vesta: { at: fp(89, 37), rot: 0, pick: [16, 16, 16] },
  regia: { at: fp(105, 17), rot: along(U), pick: [20, 9, 14] },
  vestals: { at: fp(132, 62), rot: along(U), pick: [70, 13, 45] },
  archAugustus: { at: fp(70, 36), rot: along(U - 90), pick: [17, 15, 6] },
  archTiberius: { at: fp(-80, 46), rot: along(U - 90), pick: [9, 12, 4] },
  lacusCurtius: { at: fp(-8, 4), rot: along(U), pick: [12, 4, 12] },
  sacraVia: { at: fp(20, -30), rot: along(U), pick: [60, 3, 9] },
  archTitus: { at: [272, 187], rot: along(20), pick: [14, 16, 6] },
  capitolium: { at: [-300, 40], rot: facing(90), pick: [54, 34, 62] },
  junoMoneta: { at: [-190, -165], rot: facing(140), pick: [20, 16, 30] },
  forumCaesar: { at: [-30, -179], rot: along(42), pick: [160, 20, 75] },
  forumAugustus: { at: [82, -185], rot: along(-48), pick: [125, 30, 90] },
  forumNerva: { at: [108, -111], rot: along(-48), pick: [120, 20, 45] },
  templumPacis: { at: [224, -44], rot: along(-48), pick: [135, 15, 110] },
  colosseum: { at: [572, 248], rot: along(20), pick: [189, 48, 156] },
  metaSudans: { at: [445, 262], rot: 0, pick: [16, 17, 16] },
  colossus: { at: [372, 150], rot: facing(200), pick: [14, 36, 14] },
  vestibule: { at: [395, 140], rot: along(18), pick: [140, 10, 95] },
  ludusMagnus: { at: [722, 312], rot: along(18), pick: [80, 12, 62] },
  bathsTitus: { at: [705, 70], rot: facing(100), pick: [120, 25, 110] },
  domusAurea: { at: [910, 40], rot: facing(100), pick: [250, 16, 60] },
  claudius: { at: [790, 525], rot: facing(270), pick: [175, 20, 200] },
  palace: { at: [135, 405], rot: along(-25), pick: [330, 30, 260] },
  apollo: { at: [24, 545], rot: facing(200), pick: [24, 20, 40] },
  circus: { at: [44, 729], rot: along(35), pick: [621, 28, 118] },
  portunus: { at: [-246, 262], rot: facing(-70), pick: [12, 14, 20] },
  hercules: { at: [-266, 318], rot: 0, pick: [16, 14, 16] },
  marcellus: { at: [-447, 67], rot: facing(225), pick: [130, 32, 130] },
  octavia: { at: [-520, -20], rot: along(0), pick: [120, 12, 130] },
  island: { at: [-650, 215], rot: along(-25), pick: [250, 10, 60] },
  pompey: { at: [-994, -311], rot: facing(0), pick: [160, 30, 160] },
  porticusPompey: { at: [-830, -330], rot: along(0), pick: [180, 10, 135] },
  stadium: { at: [-1011, -744], rot: along(-85), pick: [275, 22, 106] },
  pantheon: { at: [-696, -677], rot: facing(90), pick: [44, 26, 30] },
  bathsAgrippa: { at: [-720, -560], rot: along(0), pick: [110, 20, 90] },
  bathsNero: { at: [-860, -770], rot: along(0), pick: [190, 22, 120] },
  saepta: { at: [-560, -640], rot: along(-85), pick: [300, 14, 95] },
  mausoleum: { at: [-738, -1499], rot: 0, pick: [90, 40, 90] },
  emporium: { at: [-950, 1470], rot: along(62), pick: [487, 14, 60] },
  castra: { at: [2050, -1350], rot: along(-30), pick: [440, 8, 380] },
  saddle: { at: [-95, -235], rot: along(-30), pick: [200, 30, 120] },
  subura: { at: [420, -360], rot: 0, pick: [260, 20, 220] },
}

// Districts of ordinary houses. density 0–1, storeys [min, max], street grid
// angle, block size. Types: insula (apartment blocks), domus (houses with
// gardens), horrea (warehouses), mixed.
export const DISTRICTS = [
  { name: 'Subura', x: 420, z: -380, r: 390, density: 1, storeys: [4, 5], angle: -40, type: 'insula' },
  { name: 'Carinae', x: 420, z: -60, r: 230, density: 0.9, storeys: [2, 4], angle: 18, type: 'mixed' },
  { name: 'Velia north', x: 320, z: 60, r: 120, density: 0.9, storeys: [3, 4], angle: 18, type: 'insula' },
  { name: 'Via Lata south', x: -300, z: -430, r: 260, density: 0.9, storeys: [3, 5], angle: -5, type: 'insula' },
  { name: 'Caelian north', x: 640, z: 520, r: 200, density: 0.85, storeys: [3, 4], angle: 18, type: 'insula' },
  { name: 'Forum Boarium', x: -380, z: 520, r: 200, density: 0.85, storeys: [3, 4], angle: 30, type: 'insula' },
  { name: 'Esquiline slopes', x: 950, z: -420, r: 480, density: 0.95, storeys: [3, 5], angle: -15, type: 'insula' },
  { name: 'Quirinal', x: 350, z: -1050, r: 620, density: 0.9, storeys: [2, 5], angle: -48, type: 'mixed' },
  { name: 'Viminal', x: 1050, z: -900, r: 380, density: 0.9, storeys: [3, 5], angle: -45, type: 'insula' },
  { name: 'Velabrum', x: -270, z: 380, r: 200, density: 0.85, storeys: [3, 5], angle: 30, type: 'insula' },
  { name: 'Campus Martius south', x: -700, z: -250, r: 420, density: 0.7, storeys: [3, 5], angle: 0, type: 'insula' },
  { name: 'Via Lata', x: -450, z: -1050, r: 520, density: 0.85, storeys: [3, 5], angle: -5, type: 'insula' },
  { name: 'Aventine', x: -420, z: 1020, r: 430, density: 0.82, storeys: [2, 4], angle: -30, type: 'mixed' },
  { name: 'Lesser Aventine', x: 230, z: 1260, r: 320, density: 0.8, storeys: [2, 4], angle: -30, type: 'mixed' },
  { name: 'Caelian', x: 1000, z: 720, r: 520, density: 0.75, storeys: [2, 4], angle: -12, type: 'domus' },
  { name: 'Colosseum valley east', x: 800, z: 380, r: 240, density: 0.9, storeys: [3, 5], angle: 18, type: 'insula' },
  { name: 'Trastevere', x: -1250, z: 450, r: 620, density: 0.9, storeys: [2, 5], angle: 20, type: 'insula' },
  { name: 'Emporium', x: -900, z: 1500, r: 380, density: 0.7, storeys: [2, 3], angle: 62, type: 'horrea' },
  { name: 'North-east', x: 1550, z: -1000, r: 520, density: 0.65, storeys: [2, 4], angle: -30, type: 'mixed' },
  { name: 'Esquiline east', x: 1750, z: -150, r: 520, density: 0.3, storeys: [2, 3], angle: -10, type: 'domus' },
  { name: 'Porta Capena', x: 700, z: 1150, r: 400, density: 0.7, storeys: [2, 4], angle: 35, type: 'mixed' },
  { name: 'Vatican plain', x: -1900, z: -900, r: 600, density: 0.25, storeys: [2, 3], angle: 0, type: 'domus' },
]

// Gardens (horti) and planted slopes: trees, not houses.
export const GARDENS = [
  { name: 'Horti of Maecenas', x: 1500, z: -280, r: 320 },
  { name: 'Horti of Sallust', x: 750, z: -1700, r: 400 },
  { name: 'Horti of Lucullus', x: 200, z: -2200, r: 380 },
  { name: 'Horti Lamiani', x: 2000, z: 100, r: 300 },
  { name: 'Janiculum', x: -2050, z: 200, r: 700 },
  { name: 'Palatine slopes', x: 135, z: 405, r: 260 },
  { name: 'Capitoline slopes', x: -245, z: -60, r: 180 },
  { name: 'Campus Martius north', x: -900, z: -1300, r: 300 },
  { name: 'Caelian west', x: 650, z: 600, r: 180 },
]

// Main streets, as polylines with a width. The fabric keeps them clear.
export const STREETS = [
  { name: 'Sacra Via', w: 9, pts: [fp(-50, -30), fp(85, -31), fp(118, -6), [200, 140], [272, 187], [445, 262]] },
  { name: 'Argiletum', w: 7, pts: [fp(0, -40), [40, -90], [150, -260], [300, -380]] },
  { name: 'Clivus Suburanus', w: 8, pts: [[300, -380], [650, -480], [1000, -560], [1500, -600]] },
  { name: 'Vicus Longus', w: 7, pts: [[180, -320], [500, -700], [900, -1100], [1300, -1450]] },
  { name: 'Alta Semita', w: 7, pts: [[-60, -330], [300, -800], [700, -1200], [1200, -1700]] },
  { name: 'Via Lata', w: 11, pts: [[-300, -250], [-420, -900], [-520, -1600], [-640, -2500]] },
  { name: 'Vicus Tuscus', w: 7, pts: [fp(23, 62), [-20, 150], [-120, 230], [-240, 360]] },
  { name: 'Via Appia', w: 10, pts: [[445, 262], [560, 700], [700, 1100], [900, 1700], [1300, 2600]] },
  { name: 'Via Labicana', w: 8, pts: [[640, 270], [1100, 220], [1700, 160], [2600, 120]] },
  { name: 'Clivus Scauri', w: 6, pts: [[440, 380], [700, 560], [1000, 700]] },
  { name: 'Vicus Iugarius', w: 6, pts: [fp(-88, 50), [-170, 110], [-280, 240]] },
  { name: 'Via Recta', w: 8, pts: [[-460, -440], [-1100, -460], [-1500, -480]] },
  { name: 'Via Aurelia', w: 8, pts: [[-1000, 300], [-1500, 360], [-2300, 420]] },
  { name: 'Via Ostiensis', w: 8, pts: [[-200, 600], [-450, 1300], [-700, 2200], [-900, 3200]] },
]

// Everyday Rome (session 5): one street in the Subura, on the line of the
// Argiletum, the old road from the Forum into the quarter. Its own frame:
// x along the street (towards the Clivus Suburanus, north-east), z across it
// (+z the south-east side). Every building on it is our reconstruction.
const SA = [150, -260], SB = [300, -380]
const sLen = Math.hypot(SB[0] - SA[0], SB[1] - SA[1])
const sU = [(SB[0] - SA[0]) / sLen, (SB[1] - SA[1]) / sLen]
const sAng = Math.atan2(sU[1], sU[0]) / DEG
export const STREET = {
  at: [(SA[0] + SB[0]) / 2, (SA[1] + SB[1]) / 2],
  rot: along(sAng),
  angle: sAng,
  len: sLen, // about 192 m between the two ends of the old line
  y: 2.4, // street level (the valley floor is levelled here, see terrain.js)
  half: 2.7, // half the carriageway
  walk: 1.7, // pavement width
  cross: 14, // a side lane crosses here (local x)
  from: -122, // the left side runs on towards the firewall
}
STREET.front = STREET.half + STREET.walk
export const streetLocal = (x, z) => {
  const dx = x - STREET.at[0], dz = z - STREET.at[1]
  return [sU[0] * dx + sU[1] * dz, -sU[1] * dx + sU[0] * dz]
}
export const streetPoint = (lx, lz) => [STREET.at[0] + sU[0] * lx - sU[1] * lz, STREET.at[1] + sU[1] * lx + sU[0] * lz]
// The walking line along the middle of the street, for the street-level view.
export const SUBURA_PATH = [streetPoint(-118, 0), streetPoint(96, 0)]
export const suburaWalk = (lx, off = 0) => ({ pts: SUBURA_PATH, s: lx + 118, off })

// Areas the ordinary-house generator must leave empty (a detailed scene
// stands there instead): centre, turn, width along, depth across.
export const CLEARINGS = [{ at: streetPoint(-14, 0), rot: STREET.rot, w: 236, d: 66 }]

// Points on the Colosseum, from its own frame (x along the major axis,
// z along the minor axis, +z towards the south-south-west).
export function colosseumPoint(lx, lz) {
  const p = PLACES.colosseum
  const c = Math.cos(p.rot), s = Math.sin(p.rot)
  return [p.at[0] + lx * c + lz * s, p.at[1] - lx * s + lz * c]
}
const cp = (lx, lz, rot, pick) => ({ at: colosseumPoint(lx, lz), rot: PLACES.colosseum.rot + rot, pick })
PLACES.colArena = cp(0, 0, 0, [83, 6, 48])
PLACES.colNorthGate = cp(0, -86, 0, [14, 16, 12])
PLACES.colWestGate = cp(-102, 0, Math.PI / 2, [14, 16, 12])
PLACES.colAttic = cp(-30, 74, 0, [30, 20, 8])
PLACES.colPulvinar = cp(0, 30, 0, [14, 8, 8])
// session 7: inside
PLACES.colSeating = cp(0, -60, 0, [60, 10, 20])
PLACES.colGames = cp(-8, 0, 0, [10, 4, 10])
PLACES.colSeat = cp(0, -47, 0, [6, 4, 4])
PLACES.colSand = cp(-12, 0, 0, [6, 4, 6])

// Places on the Subura street (session 5).
const sp = (lx, lz, pick, rot = 0) => ({ at: streetPoint(lx, lz), rot: STREET.rot + rot, pick })
PLACES.suburaStreet = sp(-10, 0, [200, 3, 2 * STREET.half])
PLACES.insula = sp(52, -(STREET.front + 3 + 10), [24, 17, 20])
PLACES.taberna = sp(-33, -(STREET.front + 2.5), [6, 4.5, 5])
PLACES.bakery = sp(STREET.cross + 13.5, STREET.front + 4.5, [21, 5, 9])
PLACES.lacus = sp(STREET.cross - 4.1, STREET.half + 0.9, [3.2, 2.5, 2])
PLACES.compitum = sp(STREET.cross + 3.9, -(STREET.front - 0.7), [2.6, 3.5, 2.6])
// The back wall of the Forum of Augustus, seen from the Subura: its outer face.
{
  const f = PLACES.forumAugustus
  const ux = Math.cos(f.rot), uz = -Math.sin(f.rot)
  PLACES.firewall = { at: [f.at[0] + ux * 60, f.at[1] + uz * 60], rot: f.rot, pick: [6, 30, 90] }
}

// A point in the frame of a place (x along its rot, z across).
export function localPoint(name, lx, lz) {
  const p = PLACES[name], c = Math.cos(p.rot), s = Math.sin(p.rot)
  return [p.at[0] + lx * c + lz * s, p.at[1] - lx * s + lz * c]
}
// Session 6: the palace, the Circus Maximus. Frames as in Palatine.jsx and Circus.jsx.
const inFrame = (name, lx, lz, pick) => ({ at: localPoint(name, lx, lz), rot: PLACES[name].rot, pick })
PLACES.domusFlavia = inFrame('palace', -95, -40, [110, 31, 170])
PLACES.domusAugustana = inFrame('palace', 15, 35, [100, 20, 175])
PLACES.palatineStadium = inFrame('palace', 112, 10, [52, 16, 162])
PLACES.obelisk = inFrame('circus', -34.5, 0, [5, 29, 5])
PLACES.archTitusCircus = inFrame('circus', 309.5, 0, [15, 20, 17])
PLACES.circusBox = inFrame('circus', -40, -47, [22, 15, 11])
PLACES.circusTrack = inFrame('circus', -200, 22, [12, 3, 12])
// walking lines (world x/z)
export const PERISTYLE_PATH = [localPoint('palace', -70.2, -64), localPoint('palace', -70.2, -8)] // between the columns and the pool
export const STADIUM_PATH = [localPoint('palace', 112, -62), localPoint('palace', 112, 62)]
export const TRACK_PATH = [localPoint('circus', -282, 22), localPoint('circus', 245, 22)]
// compass bearing (as the camera's az) for looking along (lx) and across (lz) a place's frame
export function frameAz(name, lx, lz) {
  const r = PLACES[name].rot
  const wx = Math.cos(r) * lx + Math.sin(r) * lz, wz = -Math.sin(r) * lx + Math.cos(r) * lz
  return (Math.atan2(-wx, -wz) * 180) / Math.PI
}

// ---------- today (session 8) ----------
// Positions of buildings that stand today but were built after AD 100, from
// their modern coordinates (dx = Δlon × 82,870, dz = −Δlat × 111,000).
PLACES.severus = { at: [-46, -40], rot: along(U - 90), pick: [25, 23, 12] } // Arch of Septimius Severus, 203
PLACES.antoninus = { at: fp(103, -58), rot: facing(U + 90), pick: [22, 20, 32] } // Temple of Antoninus and Faustina, 141
PLACES.phocas = { at: fp(-47, 2), rot: 0, pick: [6, 18, 6] } // Column of Phocas, 608
PLACES.maxentius = { at: [257, 55], rot: along(U), pick: [100, 35, 65] } // Basilica of Maxentius, 308–312
PLACES.venusRoma = { at: [348, 166], rot: along(15), pick: [145, 30, 100] } // Temple of Venus and Roma, 121–141
PLACES.constantine = { at: [458, 297], rot: 0, pick: [26, 21, 8] } // Arch of Constantine, 315
PLACES.vittoriano = { at: [-185, -258], rot: 0, pick: [135, 70, 130] } // Vittoriano, 1885–1935
export const VIA_FORI = [[-224, -400], [431, 122]] // Via dei Fori Imperiali, 1932, about 30 m wide
PLACES.viaFori = { at: [(VIA_FORI[0][0] + VIA_FORI[1][0]) / 2 + 60, (VIA_FORI[0][1] + VIA_FORI[1][1]) / 2 + 48], rot: Math.atan2(-(VIA_FORI[1][1] - VIA_FORI[0][1]), VIA_FORI[1][0] - VIA_FORI[0][0]), pick: [120, 4, 30] }
// The archaeological park today: no houses are drawn here in "today" mode.
const PARK = [
  { x: 30, z: 20, r: 190 }, // Forum valley
  { x: 135, z: 410, r: 240 }, // Palatine
  { x: 520, z: 220, r: 175 }, // Colosseum valley
  { x: 330, z: 140, r: 120 }, // Velia
  { x: 44, z: 729, r: 330, sy: 0.35, rot: -35 }, // Circus Maximus, a park
  { x: -20, z: -190, r: 170, sy: 0.6, rot: -40 }, // imperial forums, dug out in 1924–32
]
export function inPark(x, z) {
  return PARK.some((p) => {
    const dx = x - p.x, dz = z - p.z
    if (!p.sy) return dx * dx + dz * dz < p.r * p.r
    const a = (p.rot * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a)
    const u = dx * c + dz * s, v = (-dx * s + dz * c) / p.sy
    return u * u + v * v < p.r * p.r
  })
}
