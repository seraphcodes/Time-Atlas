// The eight markers. Each belongs to a moment of the journey (`t`), so they
// are spread across all six scenes, and most can also be opened in scene 6
// (`explore`), where tapping one sets the date to `era` and flies the camera
// to `view`. Positions are in world metres (x east, y up, z south).
// `view`: target point, distance in metres, and the camera's direction as a
// compass bearing `az` (0 = from the south, 90 = from the east) and an angle
// `pol` from straight up (90 = level with the target).
// Every claim here was checked in phase 4; see FACT-CHECK.md.
const LEHNER = 'Mark Lehner, The Complete Pyramids (1997)'
const SHEISHA = 'Hader Sheisha and others, PNAS 119(37), e2202530119 (2022)'
const PETRIE = 'W. M. Flinders Petrie, The Pyramids and Temples of Gizeh (1883)'

export const HOTSPOTS = [
  {
    id: 'harbour',
    title: 'The harbour',
    when: 'c. 2560 BC',
    text: 'The fine white casing stone came by water. Papyrus logbooks found at Wadi al-Jarf, on the Red Sea, record crews carrying Tura limestone to Giza by boat in the later years of Khufu\u2019s reign.',
    sources: ['Pierre Tallet, Les papyrus de la mer Rouge I: Le journal de Merer (2017)', SHEISHA],
    pos: [420, -30, 32],
    t: [0.8, 1.0],
    era: 0,
    explore: true,
    view: { target: [560, -35, 25], radius: 470, az: 270, pol: 72 },
  },
  {
    id: 'ramp',
    title: 'The ramp',
    when: 'c. 2570 BC',
    text: 'Archaeologists still argue about how the ramps ran. A winding ramp is one proposal; straight, internal and mixed designs are others.',
    note: 'The ramp you see is a reconstruction, not a find.',
    sources: [LEHNER, 'Dieter Arnold, Building in Egypt (1991)'],
    pos: [90.5, 38, 0],
    t: [1.05, 1.7],
    explore: false,
  },
  {
    id: 'sledge',
    title: 'Wet sand',
    when: 'c. 2570 BC',
    text: 'A tomb painting made about seven centuries later shows a man pouring water in front of a sledge that carries a statue. In 2014 physicists found that the right amount of water in desert sand roughly halves the pull needed.',
    note: 'A proposal, not proof of what happened at Giza. Clay may have been used as well.',
    sources: ['A. Fall and others, \u201cSliding friction on wet and dry sand\u201d, Physical Review Letters 112, 175502 (2014)'],
    pos: [9.8, 92, 50.8],
    t: [1.6, 1.82],
    explore: false,
  },
  {
    id: 'casing',
    title: 'The casing',
    when: 'c. 2560 BC',
    text: 'The smooth outer skin was fine white limestone from Tura. A few of the lowest casing stones still sit around the foot of the pyramid today.',
    sources: [LEHNER, PETRIE],
    pos: [107, 10, 0],
    t: [2.2, 2.95],
    era: 0,
    explore: true,
    view: { target: [107, 15, 0], radius: 230, az: 90, pol: 80 },
  },
  {
    id: 'queens',
    title: 'The small pyramids',
    when: 'c. 2560 BC',
    text: 'Three small pyramids stand east of the king\u2019s. Tradition names women of his family: his mother Hetepheres, and the queens Meritites and Henutsen. The attributions are still debated.',
    sources: [LEHNER],
    pos: [190, 24, 80],
    t: [2.4, 2.98],
    era: 0.05,
    explore: true,
    view: { target: [190, 10, 80], radius: 280, az: 90, pol: 72 },
  },
  {
    id: 'sarcophagus',
    title: 'The sarcophagus',
    when: 'c. 2560 BC',
    text: 'Cut from one block of granite and slightly too large for the passages leading to it, so it must have been set in place before the chamber was roofed. It was found without a lid.',
    sources: [PETRIE, LEHNER],
    pos: [-1.46, 44.3, 10.0],
    t: [3.8, 4.0],
    explore: false,
  },
  {
    id: 'khafre',
    title: 'Khafre\u2019s pyramid',
    when: 'c. 2540 BC',
    text: 'It stands on bedrock about ten metres higher, so it can look taller than his father\u2019s. The top third still keeps its casing.',
    note: 'Its position here is approximate.',
    sources: [LEHNER],
    pos: [-345, 152, 355],
    t: [4.3, 4.85],
    era: 0.2,
    explore: true,
    view: { target: [-345, 60, 355], radius: 420, az: 45, pol: 78 },
  },
  {
    id: 'city',
    title: 'The edge of the city',
    when: 'Today',
    text: 'The river has moved away and the harbour is gone. The streets of Giza and Cairo now reach the plateau.',
    note: 'The city is a sketch.',
    sources: [SHEISHA, 'Modern satellite imagery'],
    pos: [1000, 55, -300],
    t: [4.95, 5.5],
    era: 1,
    explore: true,
    view: { target: [1000, 30, -300], radius: 700, az: 270, pol: 70 },
  },
]
