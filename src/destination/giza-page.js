// Words for the Giza field guide. Every fact here is taken from
// src/content/giza.js and src/content/hotspots.js, which were checked in
// phase 4 (see FACT-CHECK.md). Change a fact there first, then here.
// level: 'documented' (excavation or a surviving text), 'inferred'
// (scholars' best reading), 'invented' (added by us so the scene works).

export const LEVELS = {
  documented: 'Documented',
  inferred: 'Inferred',
  invented: 'Invented',
}

export const intro = {
  place: 'Giza',
  date: 'c. 2560 BC',
  region: 'Egypt in the Old Kingdom',
  lead: 'The Great Pyramid is nearly finished. Walk the harbour, the building site and the chambers inside, then travel forward 46 centuries to today.',
  cta: 'Enter Giza, 2560 BC',
  note: 'A guided scroll in 3D, with sound if you want it. Works on phones.',
  facts: [
    ['Height when finished', '146.6 m'],
    ['Height today', 'about 138.5 m'],
    ['Blocks, estimated', '2.3 million'],
    ['Granite brought from', 'Aswan, 800 km+'],
  ],
}

export const stops = [
  {
    title: 'Dawn over the Nile',
    text: 'Boats carry fine white limestone from the quarries at Tura, along the river and its canals, to a harbour below the plateau.',
    marks: [['documented', 'Logbooks of a boat crew survive on papyrus']],
  },
  {
    title: 'The building site',
    text: 'Teams haul blocks on wooden sledges, up ramps of rubble and mudbrick. An estimated 2.3 million blocks went into the pyramid.',
    marks: [['inferred', 'How the ramps ran is still debated']],
  },
  {
    title: 'Stone and sunlight',
    text: 'Finished, it stands 146.6 metres tall, 280 royal cubits, cased in smooth white limestone that catches the morning sun.',
    marks: [['documented', 'Height and casing'], ['invented', 'The capstone: nobody knows what it looked like']],
  },
  {
    title: 'Inside the pyramid',
    text: 'Narrow passages climb from the north face to the Grand Gallery, almost 47 metres long, and on to the King’s Chamber of red granite.',
    marks: [['documented', 'Surveyed by Flinders Petrie in the 1880s'], ['invented', 'The lamp: nobody knows how the chamber was lit']],
  },
  {
    title: 'Forty-six centuries',
    text: 'Two more pyramids rise beside it. The harbour silts up and the Nile shifts east. After an earthquake in 1303, much of the casing is carted off to build Cairo.',
    marks: [['documented', 'The river’s move and the lost casing'], ['inferred', 'Where the other pyramids stand in our scene is approximate']],
  },
  {
    title: 'Your turn',
    text: 'Take the camera. Circle the plateau, move the slider between 2560 BC and today, and open a marker to see what stood or stands there.',
    marks: [],
  },
]

export const thenNow = {
  then: { label: '2560 BC', text: '146.6 metres tall, cased in white limestone. Boats unload stone at a harbour below the plateau.' },
  now: { label: 'Today', text: 'About 138.5 metres tall. The Nile runs seven or eight kilometres away, and Cairo reaches the foot of the plateau. Our city is only a sketch.' },
}

export const ledger = [
  ['It stood 146.6 metres tall, 280 royal cubits', 'documented', 'Lehner 1997; Petrie 1883'],
  ['Boats carried Tura limestone to a harbour at Giza', 'documented', 'Tallet 2017; Lehner and Hawass 2017'],
  ['Red granite came from Aswan, more than 800 km away', 'documented', 'Lehner 1997; Petrie 1883'],
  ['About 2.3 million blocks went into it', 'inferred', 'An estimate. Lehner 1997'],
  ['Blocks were hauled up ramps of rubble and mudbrick', 'inferred', 'Lehner 1997; Arnold 1991'],
  ['The Nile now runs 7 to 8 km east of the plateau', 'documented', 'Sheisha and others 2022; Lehner and Hawass 2017'],
  ['Much of the casing was taken after the 1303 earthquake', 'documented', 'Lehner 1997; Lehner and Hawass 2017'],
  ['The plain limestone capstone', 'invented', 'Its real look is not known'],
  ['The lamp in the King’s Chamber', 'invented', 'How the chamber was lit is not known'],
  ['The skyline of modern Cairo', 'invented', 'A sketch, not a survey'],
]

export const sources = [
  'Mark Lehner, The Complete Pyramids (1997)',
  'W. M. Flinders Petrie, The Pyramids and Temples of Gizeh (1883)',
  'Mark Lehner and Zahi Hawass, Giza and the Pyramids (2017)',
  'Pierre Tallet, Les papyrus de la mer Rouge I: Le “journal de Merer” (2017)',
  'Dieter Arnold, Building in Egypt: Pharaonic Stone Masonry (1991)',
  'Hader Sheisha and others, “Nile waterscapes facilitated the construction of the Giza pyramids during the 3rd millennium BCE”, PNAS 119(37), e2202530119 (2022)',
]

export const next = { place: 'Rome', date: 'AD 100', status: 'Open now', href: 'destinations/rome/' }
