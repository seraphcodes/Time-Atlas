// All words shown on screen for the Giza journey live here.
// Every factual line carries its sources. All of them were checked in phase 4;
// the evidence for each is in FACT-CHECK.md.
const LEHNER = 'Mark Lehner, The Complete Pyramids (1997)'
const PETRIE = 'W. M. Flinders Petrie, The Pyramids and Temples of Gizeh (1883)'
const GIZA_BOOK = 'Mark Lehner and Zahi Hawass, Giza and the Pyramids (2017)'
const SHEISHA = 'Hader Sheisha and others, \u201cNile waterscapes facilitated the construction of the Giza pyramids during the 3rd millennium BCE\u201d, PNAS 119(37), e2202530119 (2022)'

export const giza = {
  place: 'Giza',
  region: 'Egypt in the Old Kingdom',
  // The stops on the measuring rod.
  scenes: [
    { id: 'dawn', title: 'Dawn over the Nile' },
    { id: 'site', title: 'The building site' },
    { id: 'finished', title: 'Stone and sunlight' },
    { id: 'inside', title: 'Inside the pyramid' },
    { id: 'time', title: 'Forty-six centuries' },
    { id: 'explore', title: 'Your turn' },
  ],
  // `at` says when a caption is on screen, in journey time
  // (scene 1 runs from 0 to 1, scene 2 from 1 to 2, and so on).
  captions: [
    {
      at: [0.3, 0.93],
      title: 'Dawn over the Nile',
      text: 'Boats carried fine white limestone from the quarries at Tura, along the river and its canals, to a harbour below the plateau.',
      sources: ['Pierre Tallet, Les papyrus de la mer Rouge I: Le "journal de Merer" (2017)', GIZA_BOOK],
    },
    {
      at: [1.1, 1.5],
      title: 'The building site',
      text: 'An estimated 2.3 million blocks went into the pyramid. Teams hauled them on wooden sledges, up ramps of rubble and mudbrick.',
      note: 'A plausible reconstruction. How the ramps were laid out is still debated.',
      sources: [LEHNER, 'Dieter Arnold, Building in Egypt: Pharaonic Stone Masonry (1991)'],
    },
    {
      at: [2.14, 2.95],
      title: 'Stone and sunlight',
      text: 'Finished, it stood 146.6 metres tall, 280 royal cubits, cased in smooth white limestone that caught the morning sun.',
      note: 'What the capstone looked like is not known, so it is shown as plain limestone.',
      sources: [LEHNER, PETRIE],
    },
    {
      at: [3.1, 3.38],
      title: 'Inside the pyramid',
      text: 'Narrow passages climb from the north face to a tall gallery and two chambers, deep in the masonry.',
      note: 'A third, unfinished chamber lies in the bedrock below. It is not shown.',
      sources: [PETRIE, LEHNER],
    },
    {
      at: [3.48, 3.63],
      title: 'The Grand Gallery',
      text: 'Almost 47 metres long and 8.6 metres high. Each course of the walls steps inwards, until the roof is barely a metre wide.',
      sources: [PETRIE, LEHNER],
    },
    {
      at: [3.78, 3.93],
      title: 'The King’s Chamber',
      text: 'Walls, floor and roof are red granite, brought down the Nile from Aswan, more than 800 kilometres away. The sarcophagus was found empty.',
      note: 'The lamp is ours. No one knows how the chamber was lit.',
      sources: [LEHNER, PETRIE],
    },
    {
      at: [4.27, 4.48],
      title: 'Forty-six centuries',
      text: 'Within about seventy years two more pyramids stood beside it, built for Khafre and Menkaure.',
      note: 'Their positions here are approximate.',
      sources: [LEHNER, GIZA_BOOK],
    },
    {
      at: [4.5, 4.63],
      title: 'The river moves away',
      text: 'The harbour and its canal silted up, and the Nile shifted east. Today it runs seven or eight kilometres from the plateau.',
      note: 'The valley is drawn narrower than it is, so the river stays in view.',
      sources: [SHEISHA, GIZA_BOOK],
    },
    {
      at: [4.65, 4.8],
      title: 'The casing is taken',
      text: 'Rulers reused its stones for centuries. After an earthquake in 1303 loosened what was left, much of it was carted off to build mosques and fortresses in Cairo.',
      sources: [LEHNER, GIZA_BOOK],
    },
    {
      at: [4.84, 5.12],
      lift: true, // sits above the Then/Now slider
      title: 'Then and now',
      text: 'It stands about 138.5 metres tall, some eight less than when it was new. Where boats once unloaded stone, Cairo now reaches the foot of the plateau.',
      note: 'Cairo is a sketch, and the Sphinx is not modelled yet.',
      sources: [LEHNER, GIZA_BOOK],
    },
    {
      at: [5.3, 5.6],
      lift: true,
      title: 'Your turn',
      text: 'Take the camera. Circle the plateau, move the slider to change the century, and open a marker to see what stood or stands there.',
      sources: [],
    },
  ],
  slider: { label: 'Travel between 2560 BC and today', then: '2560 BC', now: 'Today' },
  hints: {
    look: 'Drag to look around',
    lookTouch: 'Swipe sideways to look around',
    orbit: 'Drag to orbit \u00b7 + and \u2212 to zoom',
    orbitTouch: 'Drag to orbit \u00b7 pinch to zoom',
  },
  // The next place in the atlas. It does not exist yet, and says so.
  next: { label: 'Next in the atlas', place: 'Rome', date: 'AD 100', status: 'Open now. Enter Rome', href: '../rome-100-ad/' },
}
