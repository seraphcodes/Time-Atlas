// TimeAtlas design system, part 1: tokens.
// Every scene reads its colours, measurements and timings from this file,
// so the journey looks like one project.

// The seven-colour Giza palette.
export const PALETTE = {
  limestone: '#E9D9B8', // pyramid casing, architectural surfaces
  sand: '#C9A477', // ground, dunes, terrain
  ochre: '#D5A34C', // sunlight, warm highlights
  sandstone: '#986747', // construction materials, shadows
  nile: '#477F87', // river, water reflections
  lapis: '#344D6B', // sky accents, historical details
  shadow: '#40352C', // interiors, typography
}

// Supporting tones. Each one is a mix of palette colours, kept here so no
// scene invents its own.
export const TONES = {
  core: '#CDB78E', // local core limestone, rougher and darker than the casing
  chips: '#DCCBA6', // trampled quarry chips around the site
  mudbrick: '#A08A6E',
  wood: '#6E4F35',
  linen: '#EFE6D2',
  skin: '#8E5E3F',
  hair: '#2B221C',
  cropA: '#7D8A52',
  cropB: '#98A160',
  fallow: '#B9A06D',
  soil: '#6A5640',
  mud: '#5E5241',
  frond: '#5E7142',
  trunk: '#7B5D41',
  granite: '#8A6A5C', // Aswan granite of the King's Chamber: sandstone cooled with lapis
  weathered: '#A98E66', // core stone after forty-six centuries of sun and sand
  city: '#B4A996', // concrete and dust of the modern city edge
}

// Sky and light, at dawn and in the full golden morning. The Director blends
// between the two as the journey moves on.
export const SKY = {
  dawn: {
    zenith: '#2F4868',
    horizon: '#C99F7C',
    glow: '#F0B46A',
    sun: '#FFB974',
    sunIntensity: 2.4,
    ambient: 0.95,
  },
  day: {
    zenith: '#4C78A4',
    horizon: '#D9CBB0',
    glow: '#F4D9A2',
    sun: '#FFE1B5',
    sunIntensity: 3.2,
    ambient: 1.15,
  },
  // The present day: higher, harder sun and a paler, dustier sky.
  now: {
    zenith: '#6D93B7',
    horizon: '#DCD5C6',
    glow: '#F1E6CF',
    sun: '#FFF0DA',
    sunIntensity: 3.3,
    ambient: 1.25,
  },
}

// The Great Pyramid, in metres. 1 unit in the scene = 1 metre.
export const GIZA = {
  base: 230.3,
  height: 146.6,
  courses: 146, // stylised; the real pyramid has about 210 thinner courses
  coreInset: 1.4,
}

// The pyramids that later kings built beside it. Positions are approximate
// and are re-checked in phase 4. They appear only in the journey through time.
export const NEIGHBOURS = {
  khafre: { base: 215.3, height: 143.5, courses: 143, x: -345, z: 355 },
  menkaure: { base: 103.4, height: 65.5, courses: 65, x: -735, z: 800 },
}

// Land levels, in metres relative to the plateau.
export const LAND = { floodY: -42, bedY: -50, waterY: -44.5 }

// One sun for the whole journey. The compass direction never changes;
// it only climbs slowly, like a single morning.
export const SUN = { azimuthDeg: 14 } // degrees south of due east

// Height (m) the ramp has reached when the visitor arrives at the building site.
// Checked against world/rampPath.js at start-up, so the two cannot drift apart.
export const RAMP_START_TOP = 91.85

export const MOTION = {
  scrollDamp: 3.2, // higher = camera follows the scroll more tightly
  screensPerScene: 2.6,
}
