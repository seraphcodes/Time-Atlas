// All words and links on the home page live here.
// Links are written from the site root; each page passes its own way back to the root.
export const GIZA_HREF = './experience/giza/'
export const GIZA_PATH = 'experience/giza/'
export const ROME_HREF = './experience/rome-100-ad/'

export const nav = [
  // Pages that are not built yet have no href: they render as quiet, inactive text.
  { label: 'Explore', href: 'explore/' },
  { label: 'Timeline', href: 'timeline/' },
  { label: 'About', href: 'about/' },
]

export const hero = {
  title: 'Stand in the past.',
  lead: 'Lost places, rebuilt from what is actually known, and open to walk through.',
  cta: 'Start exploring',
  caption: 'Thomas Cole, The Architect’s Dream, 1840',
  alt: 'A painting by Thomas Cole: an architect rests on a column in the foreground while an imagined city of temples, columns and pyramids glows across the water.',
}

export const second = {
  title: 'Then walk into it.',
  lead: 'Our first journey goes back 4,500 years to Giza, where the Great Pyramid is still being built.',
  cta: 'Enter Giza, 2560 BC',
  caption: 'Thomas Cole, The Course of Empire: The Arcadian or Pastoral State, 1834',
  alt: 'A painting by Thomas Cole: a pastoral landscape at dawn, with shepherds and a stone monument beside a bay, framed by dark olive trees.',
}

// Third screen of the stage: the sun of the painting becomes the sun over Giza.
export const giza = {
  status: 'Open now',
  year: 'c. 2560 BC',
  title: 'Dawn at Giza.',
  lead: 'Stand on the building site, go inside the Great Pyramid, then move 46 centuries forward to today.',
  cta: 'Enter Giza',
  guide: 'Read the field guide',
  guideHref: './destinations/giza/',
  caption: 'Picture: our own 3D reconstruction, not a photograph.',
  // [value, label]
  facts: [
    ['146.6 m', 'high when finished'],
    ['2.3 million', 'blocks, estimated'],
    ['46 centuries', 'from then to today'],
  ],
}

// "How it works": a real sequence, so the steps are numbered.
export const steps = {
  title: 'How it works.',
  list: [
    { title: 'Choose a place and a year.', text: 'Every place sits on one time line, from 3000 BC to today.', go: 'Open Explore', href: 'explore/' },
    { title: 'Walk through it.', text: 'Scroll to travel, drag to look around, and open a marker to read what it is.', go: 'Enter Giza', href: GIZA_PATH },
    { title: 'See how sure we are.', text: 'Every part is marked as documented, inferred or invented, with its source.', go: 'How we mark things', href: 'about/' },
  ],
  // the small key shown in step three: [level, name, example]
  marks: [
    ['documented', 'Documented', 'measured'],
    ['inferred', 'Inferred', 'best reading'],
    ['invented', 'Invented', 'added by us'],
  ],
}

export const next = {
  title: 'Where we go next.',
  lead: 'Athens and Angkor are ideas, not promises. The photos show these places today, because we have not rebuilt them yet.',
  cta: 'See all places on the time line',
}

export const last = {
  title: 'Go and stand there.',
  lead: 'Giza and Rome are open now. No account, nothing to install.',
  cta: 'Enter Giza, 2560 BC',
  ctaRome: 'Enter Rome, AD 100',
  more: 'See all places',
}

export const credits =
  'Paintings by Thomas Cole (public domain), digital images from Wikimedia Commons. Giza and Rome pictures are our own 3D reconstruction. Photos of other places are credited beside them.'
