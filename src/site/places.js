// One list drives the Explore page. Add a place here and it appears on the
// axis and in the cards. `at` is the year (negative = BC) and sets where the
// place sits on the line.
// status: 'open' (you can walk through it), 'planned' (next to be built),
// 'idea' (not decided). Only open places have facts, a page and an experience.
// `thumb`: a square image for the round marker. Leave it out until there is a
// real, licensed photo; the marker then shows the first letter instead.
// `image` + `credit`: the larger picture and its credit line. Photos of places
// that are not built yet show the site today, and the credit says who took them.
// Full licence details live in src/site/credits.js.
import gizaThumb from './img/giza-thumb.webp'
import gizaFinished from './img/giza-finished-s.webp'
import romeThumb from './img/rome-open-thumb.webp'
import romeOpen from './img/rome-open-s.webp'
import athensThumb from './img/athens-thumb.webp'
import athensToday from './img/athens-today.webp'
import angkorThumb from './img/angkor-thumb.webp'
import angkorToday from './img/angkor-today.webp'

export const AXIS = { from: -3000, to: 2026 }

export const places = [
  {
    id: 'giza',
    name: 'Giza',
    year: 'c. 2560 BC',
    at: -2560,
    status: 'open',
    thumb: gizaThumb,
    image: gizaFinished,
    imageAlt: 'The finished Great Pyramid with three small pyramids beside it, rendered in 3D.',
    blurb: 'Boats carry white limestone along the Nile while the Great Pyramid is built. Then travel forward 46 centuries to today.',
    facts: [
      ['Height when finished', '146.6 m'],
      ['Height today', 'about 138.5 m'],
      ['Blocks, estimated', '2.3 million'],
    ],
    experience: 'experience/giza/',
    page: 'destinations/giza/',
  },
  {
    id: 'athens',
    name: 'Athens',
    year: '432 BC',
    at: -432,
    status: 'idea',
    thumb: athensThumb,
    image: athensToday,
    imageAlt: 'The Parthenon on the Acropolis of Athens at dusk, seen today with scaffolding between its columns.',
    credit: 'The Parthenon today. Photo: George E. Koronaios, CC BY-SA 2.0 (cropped)',
    blurb: 'Not built yet. Athens in 432 BC is one of the places we are thinking about.',
  },
  {
    id: 'rome',
    name: 'Rome',
    year: 'AD 100',
    at: 100,
    status: 'open',
    thumb: romeThumb,
    image: romeOpen,
    imageAlt: 'The Colosseum in 3D, with a crowd around it and the red roofs of Rome behind, seen from above.',
    blurb: 'Fly over a city of perhaps a million people, stand in the Roman Forum and beside the Colosseum, walk a crowded street in the Subura, stroll through the emperor’s palace and stand on the track of the Circus Maximus while Trajan rebuilds it.',
    facts: [
      ['Colosseum, size', '189 × 156 m'],
      ['Seats, estimated', 'about 50,000'],
      ['People in Rome, estimated', '0.5 to 1 million'],
    ],
    experience: 'experience/rome-100-ad/',
    page: 'destinations/rome/',
  },
  {
    id: 'angkor',
    name: 'Angkor',
    year: 'c. 1150 AD',
    at: 1150,
    status: 'idea',
    thumb: angkorThumb,
    image: angkorToday,
    imageAlt: 'Angkor Wat and its towers reflected in a pool, seen today.',
    credit: 'Angkor Wat today. Photo: Satdeep Gill, CC BY-SA 4.0 (cropped)',
    blurb: 'Not built yet. Angkor around 1150 AD is one of the places we are thinking about.',
  },
]

export const STATUS = {
  open: { label: 'Open now', filter: 'Open now' },
  planned: { label: 'Planned next', filter: 'Planned' },
  idea: { label: 'Only an idea', filter: 'Ideas' },
}

export const pct = (year) => ((year - AXIS.from) / (AXIS.to - AXIS.from)) * 100
