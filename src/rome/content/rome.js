// Words for the Rome experience. Every claim here is checked in
// FACT-CHECK-ROME.md; the status of each building is in HISTORY.md.
// evidence: 'Documented' | 'Inferred' | 'Invented' (what the 3D shows)
// status: 'Standing' | 'Being rebuilt' | 'Not yet built'

import { STREET, STREETS, fp, suburaWalk, frameAz, localPoint, PLACES, PERISTYLE_PATH, STADIUM_PATH, TRACK_PATH } from '../world/layout'

// Street-level views: the compass bearing for looking along (lx) and across
// (lz, + towards the south-east side) the Subura street.
const SU = [Math.cos(STREET.rot), -Math.sin(STREET.rot)], SN = [Math.sin(STREET.rot), Math.cos(STREET.rot)]
const lookAz = (lx, lz) => (Math.atan2(-(SU[0] * lx + SN[0] * lz), -(SU[1] * lx + SN[1] * lz)) * 180) / Math.PI
// Walking line on the Sacra Via: in front of the Basilica Aemilia's portico, then up to the Colosseum.
const SACRA = [fp(-45, -20), fp(88, -20), ...STREETS.find((st) => st.name === 'Sacra Via').pts.slice(2)]
const WALK_NOTE = 'You are standing in the street. Drag to look around; pinch, scroll or use the arrow keys to walk; double tap to fly back up.'

// Inside the Colosseum (session 7): a ring of seats in the middle tier, and the
// long axis of the sand. Frame as in Colosseum.jsx; its group stands 1 m up.
const COL_Y = 1 // the Colosseum's group stands at y = 1 (Colosseum.jsx); the ground under the arena is the hypogeum pit
const COL = { arena: [41.5, 24] } // as COL.arena in Colosseum.jsx (kept here so this file stays light)
const SEAT_A = COL.arena[0] + 21.5 + 0.35 // the front row of the middle tier, above the dividing wall
const SEAT_T0 = -Math.PI / 2 + 0.42 // across from the emperor's box, beside the box on this side
const SEAT_PATH = Array.from({ length: 73 }, (_, i) => {
  const t = SEAT_T0 + (i / 72) * Math.PI * 2
  return localPoint('colosseum', SEAT_A * Math.cos(t), (SEAT_A - (COL.arena[0] - COL.arena[1])) * Math.sin(t))
})
const SAND_PATH = [localPoint('colosseum', -38, 0), localPoint('colosseum', 38, 0)]

const PA = 'S. B. Platner and T. Ashby, A Topographical Dictionary of Ancient Rome (1929)'
const CLARIDGE = 'Amanda Claridge, Rome: An Oxford Archaeological Guide (2010)'
const COARELLI = 'Filippo Coarelli, Rome and Environs: An Archaeological Guide (2014)'
const ROMANA = 'Encyclopaedia Romana, University of Chicago'

export const rome = {
  region: 'Imperial Rome',
  place: 'Rome',
  dateline: 'AD 100',
  year: 100,
  captions: [
    {
      at: [0.55, 1.15],
      title: 'A city of perhaps a million',
      text: 'In AD 100 Rome was the largest city in the ancient world. Estimates run from half a million to over a million people, most of them living in apartment blocks of four or five storeys.',
      note: 'The monuments stand where archaeology places them. The ordinary houses are our reconstruction, built to fit the hills and streets.',
    },
    {
      at: [1.35, 1.95],
      title: 'The river and the Capitol',
      text: 'Barges brought grain, oil and marble up the Tiber from the sea. Above the river, on the Capitol, stands the Temple of Jupiter, rebuilt by Domitian after a fire in AD 80.',
    },
    {
      at: [2.15, 2.75],
      title: 'Trajan’s city',
      text: 'Trajan has ruled for two years. Workmen are rebuilding the Circus Maximus. His great forum does not exist yet: the ridge it will replace still joins the Capitol to the Quirinal.',
    },
    {
      at: [2.95, 3.4],
      title: 'The Forum',
      text: 'The heart of public life: law courts, the Senate house, the speakers’ platform and Rome’s oldest temples. At the end of the Sacra Via, the Colosseum is twenty years old.',
    },
  ],
  explore: {
    title: 'Explore Rome',
    hint: 'Drag to look around, pinch to zoom, tap a building to visit it.',
    hintMouse: 'Drag to look around, scroll to zoom, click a building to visit it.',
    walk: 'Drag to look around. Pinch, scroll or use the arrow keys to walk; tap the ground to go there. Houses stop you; monuments let you through.',
    walkMouse: 'Drag to look around. Scroll or use the arrow keys to walk; click the ground to go there. Houses stop you; monuments let you through.',
    today: 'Rome today. Faint white is the city of AD 100, stone is what survives, blue-grey was built later.',
  },
}

// Markers. `place` refers to world/layout.js; `y` is the height of the marker
// above the ground; `range` is how close the camera must be to show it.
// `view` is where the camera flies when it is opened: distance in metres,
// compass bearing `az` the camera looks from (0 = from the south, 90 = from
// the east) and `pol`, the angle down from straight overhead.
export const MARKERS = [
  {
    id: 'colosseum', place: 'colosseum', y: 52, range: 4000,
    title: 'The Colosseum', when: 'Opened AD 80', status: 'Standing', evidence: 'Documented',
    text: 'The Flavian Amphitheatre is twenty years old. Titus opened it in 80 with a hundred days of games; Domitian completed it and added the passages under the arena. About 189 by 156 metres and 48 metres high, it held perhaps 50,000 people.',
    note: 'The crowd is our addition, for a day of games. Tap the arena, the awning, the gates or the emperor’s box to look closer.',
    sources: ['Encyclopaedia Britannica, “Colosseum”', 'World History Encyclopedia, “Colosseum”', PA],
    view: { radius: 330, az: 40, pol: 62 },
  },
  {
    id: 'colArena', place: 'colArena', y: 8, range: 520,
    title: 'The arena and what lay beneath', when: 'Underground level added by Domitian', status: 'Standing', evidence: 'Documented',
    text: 'The fights took place on a wooden floor covered with sand. Beneath it lay the hypogeum, the underground level, rebuilt in stone by Domitian: corridors, cages and lifts, with walls about six metres high. In his time 28 lifts stood along a curved corridor, each worked by a capstan, raising caged animals and scenery to trapdoors in the floor.',
    note: 'The corridors are simplified here. The 60 smaller lifts often described today were added about a century later. The arena measured about 83 by 48 metres; some sources give more.',
    sources: ['Parco archeologico del Colosseo, “The hypogeum”', 'H.-J. Beste (German Archaeological Institute), as reported in Smithsonian, 2011', PA],
    actions: ['beneath'],
    view: { radius: 150, az: 40, pol: 52 },
  },
  {
    id: 'colAttic', place: 'colAttic', y: 50, range: 520,
    title: 'The awning', when: 'Shade for the crowd', status: 'Standing', evidence: 'Inferred',
    text: 'Round the top, 240 wooden masts stood on stone corbels that can still be seen. From them, sailors of the imperial fleet at Misenum rigged a vast awning of canvas strips to shade the crowd. The attic wall between the masts carried gilded bronze shields, added by Domitian.',
    note: 'No canvas survives. The shape of the awning here is a reconstruction.',
    sources: [ROMANA, 'World History Encyclopedia, “Colosseum”'],
    actions: ['velarium'],
    view: { radius: 150, az: 340, pol: 74 },
  },
  {
    id: 'colNorthGate', place: 'colNorthGate', y: 14, range: 420,
    title: 'The emperor’s entrance', when: 'Middle of the north side', status: 'Standing', evidence: 'Inferred',
    text: 'Of the 80 ground-floor arches, 76 were numbered so spectators could find their seats. The four on the axes were grand entrances; the two in the middle of the long sides were for the imperial family, and a colonnade led from this one towards the Esquiline.',
    note: 'The porch is a reconstruction: its position is known, its form is not.',
    sources: [PA, ROMANA],
    view: { radius: 95, az: 160, pol: 72 },
  },
  {
    id: 'colWestGate', place: 'colWestGate', y: 14, range: 420,
    title: 'The gladiators’ gates', when: 'The two ends of the oval', status: 'Standing', evidence: 'Documented',
    text: 'At each end of the oval a gate led straight onto the sand. Through the Porta Triumphalis the gladiators paraded in; through the Porta Libitinensis, named after the goddess of funerals, the dead were carried out.',
    note: 'Which gate stood at which end is not certain.',
    sources: [ROMANA, PA],
    view: { radius: 95, az: 250, pol: 72 },
  },
  {
    id: 'colPulvinar', place: 'colPulvinar', y: 11, range: 260,
    title: 'The emperor’s box', when: 'On the podium', status: 'Standing', evidence: 'Inferred',
    text: 'The best seats were nearest the sand. Senators sat on the podium on chairs of their own, and the emperor watched from a box in the middle of one long side, with a second box, probably for the city prefect, facing it.',
    note: 'Sources disagree on which side the emperor sat, so both boxes are shown alike. Seats were assigned by rank: white togas below, the poor and women at the top.',
    sources: [PA, 'World History Encyclopedia, “Colosseum”'],
    view: { radius: 70, az: 160, pol: 68 },
  },
  {
    id: 'colSeating', place: 'colSeating', y: 30, range: 420,
    title: 'Who sits where', when: 'Seats by rank', status: 'Standing', evidence: 'Documented',
    text: 'Augustus’s law on seating sorted the crowd by rank. Senators sat on the podium round the sand, on chairs of their own; the knights sat behind them; ordinary citizens above, in white togas; and at the very top, on wooden seats under the colonnade, women and the poor. Spectators entered through the numbered arches, and an inscription of AD 80 records the seats given to one college of priests, measured out in feet on each tier.',
    note: 'Gold: senators. Red: knights. Blue: citizens. Green: women and the poor. A simplification: the law also set aside places for soldiers, married men, boys with their tutors, and the Vestal Virgins.',
    sources: ['Suetonius, Augustus 44', ROMANA, 'Acta of the Arval Brothers, CIL VI 2059 (AD 80)', 'the-colosseum.net, “The public of games”'],
    actions: ['seating'],
    view: { radius: 150, az: frameAz('colosseum', 0.3, -1), pol: 42 },
  },
  {
    id: 'colGames', place: 'colGames', y: 6, range: 420,
    title: 'A day at the games', when: 'Morning to evening', status: 'Standing', evidence: 'Documented',
    text: 'A full day followed a fixed order. In the morning came the hunts: lions, bears, bulls and deer, with hunters, among scenery raised through the trapdoors. At midday condemned criminals were put to death, and many spectators left for lunch. In the afternoon the gladiators fought in matched pairs, each pair with a referee, to music from a water organ and horns. A fighter could ask for mercy; the giver of the games decided.',
    note: 'The pairs follow Roman art: a Thracian against a murmillo with the fish on his helmet, a net-fighter against a “chaser”. The midday executions are described, not shown. Figures are simplified and nobody is hurt here.',
    sources: ['T. Wiedemann, Emperors and Gladiators (1992)', 'Seneca, Letters 7', 'Encyclopaedia Romana, “The Zliten mosaic”', 'Martial, On the Spectacles', 'Metropolitan Museum of Art, “Gladiators: types and training”'],
    actions: ['hunt', 'fight'],
    view: { radius: 75, az: frameAz('colosseum', 0.2, -1), pol: 40 },
  },
  {
    id: 'colSeat', place: 'colSeat', y: 3, range: 300,
    title: 'Take a seat', when: 'The middle tier', status: 'Standing', evidence: 'Inferred',
    text: 'You are sitting in the front row of the ordinary citizens, above the knights, across the sand from the emperor’s box. From here the arena looks small: about 83 by 48 metres, with some 50,000 people round it. Turn the awning on from its card to sit in the shade.',
    note: 'The crowd is simplified: far fewer figures than real spectators, and none in the rows just around you. ' + WALK_NOTE,
    sources: [ROMANA, 'World History Encyclopedia, “Colosseum”'],
    view: { walk: { pts: SEAT_PATH, s: 0, loop: true, y: COL_Y + 14.6 + 0.5 + 1.25 }, az: frameAz('colosseum', -Math.cos(SEAT_T0) * SEAT_A, -Math.sin(SEAT_T0) * (SEAT_A - 17.5)), pol: 77 },
  },
  {
    id: 'colSand', place: 'colSand', y: 2, range: 300,
    title: 'Stand on the sand', when: 'The arena floor', status: 'Standing', evidence: 'Inferred',
    text: 'This is the gladiator’s view: the wooden floor under the sand, the marble wall of the podium, the senators just above it, and tier after tier rising into the sky. Ask for the hunt or the gladiators from “A day at the games” and walk among them.',
    note: WALK_NOTE,
    sources: [ROMANA, PA],
    view: { walk: { pts: SAND_PATH, s: 16, y: COL_Y + 0.4 + 1.65 }, az: frameAz('colosseum', 1, 0.3), pol: 96 },
  },
  {
    id: 'forum', place: 'forum', y: 18, range: 2600,
    title: 'The Roman Forum', when: 'Centre of Rome since the 7th century BC', status: 'Standing', evidence: 'Documented',
    text: 'The old heart of the city. Cases were heard in the basilicas, the Senate met in the Curia and orators spoke from the Rostra. By AD 100 much business had moved to the newer imperial forums next door, and the gilded horseman of Domitian that stood in the square had been pulled down after his murder in 96.',
    note: 'Buildings stand where published coordinates place them, to within about 10 metres. Their colours, the statues and the crowd are our reconstruction.',
    sources: [PA, ROMANA, COARELLI],
    view: { radius: 200, az: 110, pol: 66 },
  },
  {
    id: 'sacraVia', place: 'sacraVia', y: 4, range: 500,
    title: 'Walk the Sacra Via', when: 'Rome’s oldest street', status: 'Standing', evidence: 'Documented',
    text: 'The Sacred Way ran through the Forum from the Velia, a low ridge near the Colosseum, to the foot of the Capitol. Triumphal processions climbed it to the Temple of Jupiter. Here you stand at street level, as a Roman would, looking up the street towards the Colosseum.',
    note: WALK_NOTE,
    sources: [PA, COARELLI],
    view: { walk: { pts: SACRA, s: 58 }, az: 245, pol: 87 },
  },
  {
    id: 'basilicaJulia', place: 'basilicaJulia', y: 28, range: 900,
    title: 'Basilica Julia', when: 'Rebuilt by Augustus', status: 'Standing', evidence: 'Documented',
    text: 'A huge covered hall where the Hundred Men’s court, the centumviri, heard inheritance cases. Its steps still carry game boards scratched by people waiting around.',
    sources: [PA, CLARIDGE],
    view: { radius: 170, az: 30, pol: 60 },
  },
  {
    id: 'basilicaAemilia', place: 'basilicaAemilia', y: 26, range: 900,
    title: 'Basilica Aemilia', when: 'Rebuilt after a fire in 14 BC', status: 'Standing', evidence: 'Inferred',
    text: 'A hall for business and the courts on the north side of the square, first built in 179 BC. After a fire in 14 BC Augustus had it rebuilt in the name of the Aemilius family, and it was repaired again in AD 22. Pliny the Elder counted it among the three most beautiful buildings in the world. Its front towards the square was a portico of shops.',
    note: 'The plan is known from excavation; the elevation follows the surviving fragments and reconstructions.',
    sources: ['Pliny the Elder, Natural History 36.102', PA],
    view: { radius: 160, az: 200, pol: 62 },
  },
  {
    id: 'rostra', place: 'rostra', y: 9, range: 600,
    title: 'The Rostra', when: 'Speakers’ platform', status: 'Standing', evidence: 'Documented',
    text: 'From this platform magistrates and emperors addressed the people. Its name means “beaks”: its front carried the bronze prows of captured warships.',
    sources: [PA, COARELLI],
    view: { radius: 70, az: 70, pol: 72 },
  },
  {
    id: 'divusJulius', place: 'divusJulius', y: 25, range: 800,
    title: 'Temple of the Deified Julius', when: 'Dedicated 29 BC', status: 'Standing', evidence: 'Inferred',
    text: 'Built where Julius Caesar’s body was burned in 44 BC, after the Senate declared him a god. A platform for speakers ran across its front, with a niche for the altar.',
    note: 'Only the concrete core survives; columns and roof are reconstructed.',
    sources: [PA, 'Encyclopaedia Romana'],
    view: { radius: 110, az: 290, pol: 66 },
  },
  {
    id: 'lacusCurtius', place: 'lacusCurtius', y: 5, range: 400,
    title: 'Lacus Curtius', when: 'Ancient shrine in the square', status: 'Standing', evidence: 'Inferred',
    text: 'A small paved enclosure marking a spot where, in legend, the ground opened and a Roman leapt in to save the city. Pliny the Elder mentions a fig, an olive and a vine growing nearby, and a statue of Marsyas stood in the square.',
    note: 'The enclosure is documented; the plants and statue are placed by us.',
    sources: ['Pliny the Elder, Natural History 15.78', PA],
    view: { radius: 45, az: 120, pol: 70 },
  },
  {
    id: 'curia', place: 'curia', y: 32, range: 900,
    title: 'The Senate house', when: 'Curia Julia, 29 BC', status: 'Standing', evidence: 'Inferred',
    text: 'Begun by Julius Caesar and completed by Augustus, this is where the Senate met. The brick building that stands today is a rebuild from about AD 300, on the same plan.',
    sources: [PA, CLARIDGE],
    view: { radius: 120, az: 200, pol: 64 },
  },
  {
    id: 'saturn', place: 'saturn', y: 28, range: 900,
    title: 'Temple of Saturn', when: 'Rebuilt 42 BC', status: 'Standing', evidence: 'Documented',
    text: 'One of Rome’s oldest temples. The state treasury, the aerarium, was kept in its podium. The eight columns standing today come from a later rebuild, after a fire in the 3rd century.',
    sources: [PA, CLARIDGE],
    view: { radius: 130, az: 80, pol: 62 },
  },
  {
    id: 'castor', place: 'castor', y: 30, range: 900,
    title: 'Temple of Castor and Pollux', when: 'Rebuilt by Tiberius, AD 6', status: 'Standing', evidence: 'Documented',
    text: 'Dedicated to the twin gods who, legend said, brought news of a Roman victory to this spot. Three of its columns still stand.',
    sources: [PA, CLARIDGE],
    view: { radius: 140, az: 330, pol: 62 },
  },
  {
    id: 'vesta', place: 'vesta', y: 20, range: 700,
    title: 'Temple of Vesta', when: 'Rebuilt after AD 64', status: 'Standing', evidence: 'Inferred',
    text: 'The round shrine of the goddess of the hearth, whose sacred fire must never go out. The Vestal Virgins who tended it lived in the large house behind.',
    note: 'Its form is known from coins and from fragments of a later rebuild.',
    sources: [PA, COARELLI],
    view: { radius: 90, az: 300, pol: 60 },
  },
  {
    id: 'archTitus', place: 'archTitus', y: 20, range: 900,
    title: 'Arch of Titus', when: 'After AD 81', status: 'Standing', evidence: 'Documented',
    text: 'Set up by Domitian for his brother Titus, honouring the capture of Jerusalem in AD 70. Reliefs inside the arch show the treasures of the Temple carried in triumph.',
    note: 'The bronze chariot on top is known from coins; its exact form is a reconstruction.',
    sources: ['Diana E. E. Kleiner, Roman Architecture lectures, Yale University', PA],
    view: { radius: 90, az: 250, pol: 66 },
  },
  {
    id: 'capitolium', place: 'capitolium', y: 40, range: 2400,
    title: 'Temple of Jupiter on the Capitol', when: 'Rebuilt by Domitian after AD 80', status: 'Standing', evidence: 'Inferred',
    text: 'Rome’s greatest temple, shared by Jupiter, Juno and Minerva. After the fire of 80 Domitian rebuilt it; Plutarch says the gilding alone cost over 12,000 talents.',
    note: 'Only parts of the platform survive. The columns and gilded roof follow the written descriptions.',
    sources: ['Plutarch, Life of Publicola 15', PA],
    view: { radius: 230, az: 10, pol: 62 },
  },
  {
    id: 'palace', place: 'domusFlavia', y: 36, range: 2400,
    title: 'The imperial palace', when: 'Finished AD 92', status: 'Standing', evidence: 'Inferred',
    text: 'Domitian’s palace on the Palatine, designed by his architect Rabirius and finished in 92. Trajan lives here now. This western half held the state rooms: a throne hall with walls over 30 metres high, a basilica, a garden court whose pool surrounds an octagonal fountain shaped like a maze, and a great banquet hall between two oval fountains. The poet Martial told Domitian to laugh at the pyramids, so far did his palace outdo them. Our word “palace” comes from the name of this hill, the Palatium.',
    note: 'The plan is known from excavation; the heights, roofs and colours are our reconstruction. ' + WALK_NOTE,
    sources: [CLARIDGE, PA, 'Statius, Silvae 4.2', 'Martial, Epigrams 8.36', 'Turismo Roma and the Parco archeologico del Colosseo'],
    view: { walk: { pts: PERISTYLE_PATH, s: 4 }, az: frameAz('palace', -0.55, 1), pol: 91 },
  },
  {
    id: 'domusAugustana', place: 'domusAugustana', y: 28, range: 1500,
    title: 'The emperor’s house', when: 'Domus Augustana', status: 'Standing', evidence: 'Inferred',
    text: 'East of the state rooms lay the emperor’s own house, built round two courts: an upper one with a pool and a small shrine on an island, and a lower one with a fountain of four crescent-shaped basins. Its curved front looked out over the Circus Maximus.',
    note: 'The real lower court lies about ten metres deeper in the hill. Our hill is simplified here, so both courts stand at one level. The layout follows the excavated plan; the elevations are ours.',
    sources: [CLARIDGE, PA, 'Gardens of the Roman Empire: “Domus Flavia, Upper Peristyle”'],
    view: { radius: 260, az: 25, pol: 58 },
  },
  {
    id: 'palatineStadium', place: 'palatineStadium', y: 18, range: 1500,
    title: 'The palace stadium', when: 'A garden, 160 × 48 m', status: 'Standing', evidence: 'Inferred',
    text: 'Shaped like a racecourse, 160 by 48 metres, with a portico round it and a great box for the emperor in the middle of the long side. It was most likely a garden for walking and riding rather than a place for races, like the garden “hippodromes” in the country villas that Pliny the Younger describes.',
    note: 'It lay below the level of the palace; here it stands at the level of our simplified hill. The trees and fountains are our reconstruction. ' + WALK_NOTE,
    sources: ['Turismo Roma, “Stadio Palatino”', 'Pliny the Younger, Letters 5.6', CLARIDGE],
    view: { walk: { pts: STADIUM_PATH, s: 12 }, az: frameAz('palace', 0, 1), pol: 92 },
  },
  {
    id: 'circus', place: 'circus', y: 32, range: 3600,
    title: 'Circus Maximus', when: 'Being rebuilt by Trajan', status: 'Being rebuilt', evidence: 'Inferred',
    text: 'Rome’s chariot-racing track, about 621 by 118 metres, with seats for perhaps 150,000 people. Trajan is rebuilding it in stone, using stone from a lake Domitian had dug for mock sea battles, and adding seats on the Palatine side. Pliny praises the work in a speech of September 100, and coins of 103 show it finished.',
    note: 'The scaffolding and cranes mark the works in progress; where exactly they stood is not known. Pliny the Elder’s figure of 250,000 seats is thought too high.',
    sources: [PA, ROMANA, 'Yale University Art Gallery, sestertius of Trajan, 103', 'Pliny the Younger, Panegyricus 51', 'Dionysius of Halicarnassus 3.68'],
    view: { radius: 620, az: 30, pol: 60 },
  },
  {
    id: 'circusTrack', place: 'circusTrack', y: 3, range: 500,
    title: 'On the track', when: 'Chariot races', status: 'Standing', evidence: 'Documented',
    text: 'Twelve starting gates, a long central barrier with water basins, shrines and statues, and at each end a turning post with three gilded cones. A race ran seven laps: seven bronze eggs and seven bronze dolphins, the dolphins set up by Agrippa, were moved one by one to count them. Domitian once held a hundred races in a day by cutting them to five laps.',
    note: 'The statues and shrines on the barrier stand for many that are recorded; their exact places are ours. ' + WALK_NOTE,
    sources: [ROMANA, 'Cassius Dio 49.43', 'Suetonius, Domitian 4', PA],
    view: { walk: { pts: TRACK_PATH, s: 14 }, az: frameAz('circus', 1, -0.12), pol: 91 },
  },
  {
    id: 'obelisk', place: 'obelisk', y: 28, range: 700,
    title: 'Augustus’s obelisk', when: 'Set up in 10 BC', status: 'Standing', evidence: 'Documented',
    text: 'After conquering Egypt, Augustus brought this obelisk from Heliopolis and set it on the barrier in 10 BC. It was carved for the pharaohs Seti I and Ramesses II, so it was already some 1,300 years old, and stands about 24 metres tall. Today it rises in the Piazza del Popolo.',
    note: 'Its height here leaves out the modern base.',
    sources: ['Pliny the Elder, Natural History 36.71', PA, ROMANA],
    view: { radius: 90, az: frameAz('circus', 0.3, 1), pol: 76 },
  },
  {
    id: 'archTitusCircus', place: 'archTitusCircus', y: 20, range: 900,
    title: 'The Arch of Titus in the Circus', when: 'AD 81', status: 'Standing', evidence: 'Inferred',
    text: 'In the middle of the curved end stood a triple arch of white marble, voted by the Senate in 81 for Titus’s capture of Jerusalem: about 17 metres wide and nearly 20 metres high. It is a different arch from the one on the Sacra Via, which Domitian built after his brother’s death.',
    note: 'Fragments were dug up in 2015. Its shape follows coins and the excavators’ reconstruction; the chariot group on top is our guess.',
    sources: ['Inscription ILS 264, copied by the Einsiedeln Anonymous', 'Sovrintendenza Capitolina, Circus Maximus site notices', 'Wanted in Rome, May 2015'],
    view: { radius: 70, az: frameAz('circus', -1, 0), pol: 78 },
  },
  {
    id: 'circusBox', place: 'circusBox', y: 16, range: 600,
    title: 'The gods’ box', when: 'Pulvinar', status: 'Standing', evidence: 'Inferred',
    text: 'Images of the gods watched the races from a shrine on the Palatine side, near where the emperor sat. Domitian had watched from a closed room of his own; Trajan did away with it, and Pliny praises him for sitting where the people could see him.',
    note: 'Its form and exact place are our reconstruction.',
    sources: ['Pliny the Younger, Panegyricus 51', PA],
    view: { radius: 70, az: frameAz('circus', 0.6, -1), pol: 76 },
  },
  {
    id: 'bathsTitus', place: 'bathsTitus', y: 30, range: 1500,
    title: 'The Baths of Titus', when: 'Opened AD 80', status: 'Standing', evidence: 'Inferred',
    text: 'Opened with the Colosseum in 80, these were the first of Rome’s great imperial baths: a cold hall, a warm room and a hot room on one line, with an exercise court on each side. A broad flight of steps led down to the square in front of the Colosseum.',
    note: 'Little survives. The plan comes mostly from a drawing by the architect Andrea Palladio in the 1500s, which scholars use with caution. Heights and roofs are our reconstruction.',
    sources: ['Stanford Digital Forma Urbis Romae Project', 'Turismo Roma, “The Baths of Titus”', 'Suetonius, Titus 7'],
    view: { radius: 240, az: 10, pol: 62 },
  },
  {
    id: 'domusAurea', place: 'domusAurea', y: 30, range: 1800,
    title: 'What is left of Nero’s Golden House', when: 'Built AD 64–68', status: 'Standing', evidence: 'Inferred',
    text: 'After the fire of 64 Nero built a vast palace with a park and a lake in the middle of the city. The Flavians gave the land back to the people, and the Colosseum stands where the lake was. This wing on the Oppian hill, with its domed octagonal hall, still stands in AD 100. A fire in 104 will damage it, and Trajan will build his great baths over it.',
    note: 'The front of this wing and the octagonal hall survive underground today. Their outside form here is our reconstruction.',
    sources: ['Suetonius, Nero 31', 'Martial, On the Spectacles 2', 'Stanford Digital Forma Urbis Romae Project', PA],
    view: { radius: 330, az: 10, pol: 62 },
  },
  {
    id: 'colossus', place: 'colossus', y: 38, range: 900,
    title: 'The Colossus', when: 'Made for Nero, after AD 64', status: 'Standing', evidence: 'Inferred',
    text: 'A bronze statue about 30 metres tall, made for Nero and turned by Vespasian into the Sun god. In AD 100 it still stands in the entrance court of Nero’s Golden House. Hadrian moved it beside the amphitheatre around 128, and the Colosseum may be named after it.',
    sources: [PA, 'Fred Albertson, “Zenodorus’s Colossus of Nero”, Memoirs of the American Academy in Rome 46 (2001)'],
    view: { radius: 120, az: 230, pol: 66 },
  },
  {
    id: 'island', place: 'island', y: 22, range: 2200,
    title: 'The Tiber Island', when: 'Temple of Aesculapius, 3rd century BC', status: 'Standing', evidence: 'Inferred',
    text: 'Home of the temple of Aesculapius, god of healing, since the 3rd century BC. The Pons Fabricius of 62 BC, still in use today, links it to the city.',
    sources: [PA, COARELLI],
    view: { radius: 330, az: 60, pol: 60 },
  },
  {
    id: 'marcellus', place: 'marcellus', y: 38, range: 1800,
    title: 'Theatre of Marcellus', when: 'About 13 BC', status: 'Standing', evidence: 'Documented',
    text: 'Completed by Augustus and named after his nephew Marcellus. Its curved outer wall still stands, with apartments built into the top.',
    sources: [PA, CLARIDGE],
    view: { radius: 280, az: 60, pol: 60 },
  },
  {
    id: 'subura', place: 'subura', y: 26, range: 3000,
    title: 'The Subura', when: 'Crowded quarter', status: 'Standing', evidence: 'Invented',
    text: 'A packed district of apartment blocks, shops and taverns, notorious for noise and the danger of fire and collapse. A high firewall shuts it off from the Forum of Augustus.',
    note: 'Every building here is our reconstruction. Types and heights follow Roman building laws and the excavated blocks at Ostia; Trajan limited new buildings to about 18 metres.',
    sources: ['Juvenal, Satires 3', 'Strabo, Geography 5.3.7', 'Epitome de Caesaribus 13.12'],
    view: { radius: 380, az: 220, pol: 58 },
  },
  {
    id: 'suburaStreet', place: 'suburaStreet', y: 3, range: 260,
    title: 'A street in the Subura', when: 'Everyday Rome', status: 'Standing', evidence: 'Invented',
    text: 'Behind the marble forums lay the Subura, a crowded valley of apartment blocks, shops and workshops. Julius Caesar lived here in a modest house before he moved to the Forum. By day the street belongs to people on foot, porters, mules and the litters of the rich: wheeled carts were banned from the city streets for most of the daylight hours. Goods came in at night, and the poet Juvenal complains that their noise kept Rome awake.',
    note: 'The street follows the line of the Argiletum, the old road from the Forum into the Subura. Every building, shop and person on it is our reconstruction, based on Ostia, Pompeii and Roman writers. ' + WALK_NOTE,
    sources: ['Suetonius, Julius 46', 'Juvenal, Satires 3', 'K. D. Matthews, “The Embattled Driver in Ancient Rome”, Expedition (1960)', PA],
    view: { walk: suburaWalk(-100), az: lookAz(1, 0), pol: 88 },
  },
  {
    id: 'insula', place: 'insula', y: 18, range: 220,
    title: 'An apartment block', when: 'Insula', status: 'Standing', evidence: 'Inferred',
    text: 'Most Romans rented rooms in blocks like this one: shops on the ground floor, flats above, four or five storeys high. The higher you lived, the less you paid and the worse your chances in a fire; Juvenal pictures the tenant under the roof tiles as the last to learn the building is burning. After the fire of 64, Nero ordered porticoes along the fronts of new blocks, so their flat roofs could be used to fight fires.',
    note: 'Augustus limited such blocks to 70 Roman feet, about 21 metres, and Trajan to 60 feet, about 18 metres. This block is modelled on the excavated apartment blocks at Ostia, Rome’s port; none of this date survives on this street. ' + WALK_NOTE,
    sources: ['Tacitus, Annals 15.43', 'Suetonius, Nero 16', 'Juvenal, Satires 3', 'Strabo, Geography 5.3.7', 'Epitome de Caesaribus 13.12'],
    view: { walk: suburaWalk(34, 2.6), az: lookAz(0.6, -1), pol: 99 },
  },
  {
    id: 'taberna', place: 'taberna', y: 4, range: 160,
    title: 'A food bar', when: 'Taberna', status: 'Standing', evidence: 'Inferred',
    text: 'Many Romans had no kitchen of their own and bought food ready to eat. Here jars sunk into a marble counter hold hot food and drink. Like every shop, it opens onto the street through a wide doorway closed at night with wooden shutters, and a ladder leads to a low mezzanine lit by the small window above the door. About eight years ago Domitian ordered shopkeepers back behind their thresholds; the poet Martial cheered that Rome was a city again, no longer one great shop.',
    note: 'The counter follows the food bars excavated at Pompeii and Ostia. What each shop on this street sells is our invention. ' + WALK_NOTE,
    sources: ['Martial, Epigrams 7.61', 'Ostia-antica.org, “Shops and bars”', 'World History Encyclopedia'],
    view: { walk: suburaWalk(-36.5, 2.8), az: lookAz(0.25, -1), pol: 94 },
  },
  {
    id: 'bakery', place: 'bakery', y: 5, range: 180,
    title: 'A bakery', when: 'Pistrinum', status: 'Standing', evidence: 'Inferred',
    text: 'Bakers ground their own flour. Grain was poured into the hourglass-shaped upper stone, which a donkey or a slave turned on a cone of lava; the flour was baked in a domed brick oven and the loaves sold over the counter. Rome had had professional bakers for nearly three centuries. One of them, Eurysaces, had his tomb carved with scenes of his trade; it still stands by what is now the Porta Maggiore.',
    note: 'The mills and the oven follow the bakeries found at Pompeii. This bakery and its sign are ours. ' + WALK_NOTE,
    sources: ['Pliny the Elder, Natural History 18.107', 'World History Encyclopedia, “A Pompeii Bakery”', PA],
    view: { walk: suburaWalk(23, -2.6), az: lookAz(0.3, 1), pol: 93 },
  },
  {
    id: 'lacus', place: 'lacus', y: 2.5, range: 140,
    title: 'A street fountain', when: 'Lacus', status: 'Standing', evidence: 'Documented',
    text: 'Most Romans fetched their water from public basins like this one, fed day and night by the aqueducts. Frontinus, the water commissioner, counted 591 of them in about AD 97. Piped water in a private house was a privilege granted by the emperor, so in an apartment block every jar was carried up the stairs.',
    note: 'The basin’s form follows surviving street fountains at Pompeii; its place at this crossing is ours. ' + WALK_NOTE,
    sources: ['Frontinus, De aquaeductu 3 and 78', 'H. B. Evans, Water Distribution in Ancient Rome (1994)'],
    view: { walk: suburaWalk(6, -2.2), az: lookAz(0.57, 0.82), pol: 78 },
  },
  {
    id: 'compitum', place: 'compitum', y: 3.6, range: 140,
    title: 'A crossroads shrine', when: 'Shrine of the Lares', status: 'Standing', evidence: 'Documented',
    text: 'Where streets met, each neighbourhood kept a shrine to the Lares, the guardian spirits of the crossroads. Augustus divided the city into wards, each with its shrine and yearly officials, often freed slaves, and had the Lares crowned with flowers twice a year. Pliny the Elder counted 265 such shrines in AD 73.',
    note: 'The shape follows small shrines known from Rome and Pompeii; the painting of the two Lares is ours. ' + WALK_NOTE,
    sources: ['Pliny the Elder, Natural History 3.66', 'Suetonius, Augustus 31', 'Ostia-antica.org, “Deities at the crossroads”'],
    view: { walk: suburaWalk(22, 2.4), az: lookAz(-0.56, -0.83), pol: 84 },
  },
  {
    id: 'firewall', place: 'firewall', y: 30, range: 600,
    title: 'The firewall', when: 'Forum of Augustus, 2 BC', status: 'Standing', evidence: 'Documented',
    text: 'At the end of the street rises the back wall of the Forum of Augustus, up to 33 metres high, built of stone that does not burn. It shut the marble forum off from the Subura and its frequent fires. Gates led through it from the crowded quarter into the forum.',
    note: 'Long stretches of the wall still stand. The gate at the end of this street stands for the real ones; its exact place is ours. ' + WALK_NOTE,
    sources: ['Turismo Roma, “The Forum of Augustus”', 'Encyclopaedia Romana, “Precinct wall”', 'Vitruvius, On Architecture 2.7.4'],
    view: { walk: suburaWalk(-96), az: lookAz(-1, 0.05), pol: 106 },
  },
  {
    id: 'saddle', place: 'saddle', y: 40, range: 2400,
    title: 'Not built yet: Trajan’s Forum', when: 'Dedicated AD 112', status: 'Not yet built', evidence: 'Documented',
    text: 'In AD 100 a ridge still joins the Capitol to the Quirinal. From about 106 Trajan’s architect, Apollodorus of Damascus, will cut it away for the largest of the imperial forums, dedicated in 112; the Column follows in 113.',
    sources: ['Museo dei Fori Imperiali, “Forum of Trajan”', 'Fasti Ostienses (via Wikipedia, “Trajan’s Forum”)', ROMANA],
    view: { radius: 420, az: 170, pol: 58 },
  },
  {
    id: 'pantheon', place: 'pantheon', y: 32, range: 1800,
    title: 'The Pantheon of Agrippa', when: 'Restored by Domitian', status: 'Standing', evidence: 'Invented',
    text: 'Agrippa’s Pantheon burned in 80 and was restored by Domitian. Nobody knows what it looked like, so this plain temple only marks the spot. The famous domed building is Hadrian’s, begun after another fire in 110.',
    sources: ['Smarthistory / Lumen, “The Pantheon”', 'World History Encyclopedia, “Pantheon”'],
    view: { radius: 260, az: 160, pol: 60 },
  },
  {
    id: 'mausoleum', place: 'mausoleum', y: 46, range: 2200,
    title: 'Mausoleum of Augustus', when: '28 BC', status: 'Standing', evidence: 'Inferred',
    text: 'The tomb of Augustus and his family: a great round drum planted with trees, beside the Tiber on the Campus Martius.',
    note: 'The upper levels are reconstructed; only the lower drum survives.',
    sources: [PA, CLARIDGE],
    view: { radius: 300, az: 140, pol: 60 },
  },
  {
    id: 'aqueduct', place: 'castra', y: 0, range: 0, hidden: true,
    title: 'Aqueducts', when: '', status: 'Standing', evidence: 'Documented', text: '', sources: [],
  },
  {
    id: 'castra', place: 'castra', y: 18, range: 3400,
    title: 'Camp of the Praetorian Guard', when: 'About AD 23', status: 'Standing', evidence: 'Inferred',
    text: 'The walled barracks of the emperor’s guard, built under Tiberius at the edge of the city. Beyond it, the arches of the Aqua Claudia carry water in from the hills; the water commissioner Frontinus listed nine aqueducts in about AD 97.',
    sources: [PA, 'Frontinus, De aquaeductu'],
    view: { radius: 700, az: 210, pol: 55 },
  },
].filter((m) => !m.hidden)

// ---------- Rome today (session 8) ----------
// era: 'now' cards show only in the "today" view; `pair` is the AD 100 card
// for the same place, so switching keeps the card open.
// status: 'Ruin' | 'Standing' | 'Built later' (what stands today)
const PARCO = 'Parco archeologico del Colosseo (colosseo.it)'
const TODAY_NOTE = 'Faint white: the city of AD 100. Stone colour: what survives. Blue-grey: built after AD 100.'
export const NOW_MARKERS = [
  {
    id: 'colosseumToday', place: 'colosseum', y: 52, range: 4000, era: 'now', pair: 'colosseum',
    title: 'The Colosseum today', when: 'Standing, broken on the south side', status: 'Ruin', evidence: 'Documented',
    text: 'The north side still stands to its full height. On the south side the outer ring and the second ring are gone, brought down by the earthquake of 1349 and then quarried for their stone for centuries. Two brick buttresses of the 1800s hold the broken ends: Raffaele Stern’s on the east (1806–07) and Giuseppe Valadier’s on the west (1820s). The arena floor was taken up in the 1800s, so the hypogeum lies open; a modern floor covers part of it.',
    note: 'The line of the break is simplified here: the real edge steps down unevenly, and lower vaults of the seating survive on the south side too. The marble seats are gone everywhere. ' + TODAY_NOTE,
    sources: [PARCO, 'Encyclopaedia Britannica, “Colosseum”', ROMANA],
    view: { radius: 330, az: 15, pol: 60 },
  },
  {
    id: 'forumToday', place: 'forum', y: 18, range: 2600, era: 'now', pair: 'forum',
    title: 'The Forum today', when: 'Dug out again 1800s–1930s', status: 'Ruin', evidence: 'Documented',
    text: 'After antiquity the Forum was stripped for stone and lime, and earth washed down from the hills until it lay about eight metres deep. By the 1500s it was a cattle field, the Campo Vaccino. Excavations in the 1800s, and Giacomo Boni’s from 1898 to 1925, cleared it back to the Roman level. What stands is mostly podium cores, floors and column stumps, with a few columns still up.',
    note: 'Which pieces stand is Documented; their heights and outlines here are simplified. ' + TODAY_NOTE,
    sources: [PARCO, 'Christopher Siwicki, “The man who excavated ancient Rome’s forum”, Art & Object (2022)', 'Giuseppe Vasi, Parte di Campo Vaccino (Stanford, Imago Urbis)'],
    view: { radius: 240, az: 110, pol: 62 },
  },
  {
    id: 'saturnToday', place: 'saturn', y: 28, range: 900, era: 'now', pair: 'saturn',
    title: 'Temple of Saturn today', when: 'Porch rebuilt after a fire in late antiquity', status: 'Ruin', evidence: 'Documented',
    text: 'Eight columns of the porch stand on the podium: six across the front and one more down each side, still carrying the beam. They are not the columns of AD 100. After a fire, perhaps the one of 283, the porch was rebuilt from reused parts, Egyptian granite shafts and bases that do not match, and the inscription says so: the Senate and People of Rome restored what fire had consumed.',
    note: 'The date of the fire is debated (283 or about 360).',
    sources: [PA, 'World History Encyclopedia, “Temple of Saturn, Rome”'],
    view: { radius: 120, az: 80, pol: 64 },
  },
  {
    id: 'vespasianToday', place: 'vespasian', y: 24, range: 700, era: 'now',
    title: 'Temple of Vespasian today', when: 'Three columns', status: 'Ruin', evidence: 'Documented',
    text: 'Of the temple Domitian finished for his father and brother, three marble columns stand at the south-east corner of the porch, two on the front and one on the side, with a piece of the beam carved with sacrificial tools. The rest is the podium’s concrete core.',
    sources: [ROMANA, PA],
    view: { radius: 90, az: 70, pol: 66 },
  },
  {
    id: 'castorToday', place: 'castor', y: 30, range: 900, era: 'now', pair: 'castor',
    title: 'Temple of Castor today', when: 'Three columns on the podium', status: 'Ruin', evidence: 'Documented',
    text: 'The podium survives as a concrete core, seven metres high, stripped of its marble. On it stand three marble columns of the east side, 12.5 metres high, with their beam: in the 1400s the street beside them was called after the three columns.',
    note: 'Which three side columns stand is placed from photographs (Inferred).',
    sources: [PA, 'World History Encyclopedia, “Temple of Castor & Pollux”'],
    view: { radius: 120, az: 60, pol: 64 },
  },
  {
    id: 'curiaToday', place: 'curia', y: 32, range: 900, era: 'now', pair: 'curia',
    title: 'The Senate house today', when: 'Rebuilt by Diocletian, AD 284–305', status: 'Standing', evidence: 'Documented',
    text: 'This is not the building of AD 100. After a fire in 283, Diocletian rebuilt it to the same plan, and about 630 it became the church of Sant’Adriano, which is why it still has its walls. In 1930–36 the church was stripped out and the hall restored to its Roman form; the roof and the upper back are modern. The bronze doors are a copy: the originals were moved to St John Lateran in the 1600s.',
    sources: [ROMANA, 'Turismo Roma, “Curia Iulia”'],
    view: { radius: 110, az: 200, pol: 64 },
  },
  {
    id: 'vestaToday', place: 'vesta', y: 18, range: 700, era: 'now', pair: 'vesta',
    title: 'Temple of Vesta today', when: 'A section rebuilt in 1930', status: 'Ruin', evidence: 'Documented',
    text: 'The marble was stripped off in the 1500s and burnt or reused. What stands is the round podium and a short curved stretch of columns and beam, put back up from fragments in 1930.',
    sources: [ROMANA],
    view: { radius: 70, az: 160, pol: 64 },
  },
  {
    id: 'archTitusToday', place: 'archTitus', y: 20, range: 900, era: 'now', pair: 'archTitus',
    title: 'Arch of Titus today', when: 'Restored 1817–21', status: 'Standing', evidence: 'Documented',
    text: 'In the Middle Ages the arch was built into the fortress of the Frangipane family. Freed in the early 1800s, it was taken apart and rebuilt by Raffaele Stern and Giuseppe Valadier, who filled the missing parts in plain travertine so that the original marble can still be told apart.',
    sources: [PA, ROMANA],
    view: { radius: 90, az: 250, pol: 66 },
  },
  {
    id: 'severus', place: 'severus', y: 24, range: 1100, era: 'now',
    title: 'Arch of Septimius Severus', when: 'AD 203', status: 'Built later', evidence: 'Documented',
    text: 'A century after our date, the Senate set up this marble arch for Septimius Severus and his sons, for their victories over the Parthians. It is about 23 metres high and 25 wide, with three passages. Its far end stands where, in AD 100, the square met the Rostra and the slope of the Capitol.',
    sources: ['Encyclopaedia Britannica, “Arch of Septimius Severus”', ROMANA],
    view: { radius: 90, az: 120, pol: 70 },
  },
  {
    id: 'phocas', place: 'phocas', y: 20, range: 900, era: 'now',
    title: 'Column of Phocas', when: 'AD 608', status: 'Built later', evidence: 'Documented',
    text: 'The last monument added to the Forum: a fluted column 13.6 metres high, taken from an older building and set up in 608 by the exarch Smaragdus in honour of the eastern emperor Phocas, whose gilded statue stood on top. Its base was dug out in 1813.',
    sources: [PA, ROMANA],
    view: { radius: 70, az: 150, pol: 66 },
  },
  {
    id: 'antoninus', place: 'antoninus', y: 26, range: 1100, era: 'now',
    title: 'Temple of Antoninus and Faustina', when: 'AD 141, a church inside since the Middle Ages', status: 'Built later', evidence: 'Documented',
    text: 'Antoninus Pius built it for his wife Faustina in 141; when he died the Senate added his name. Ten columns of green-veined cipollino marble, 17 metres high, still stand in front, because the temple became the church of San Lorenzo in Miranda. The church front behind the columns dates from 1602.',
    note: 'In AD 100 this site lay beside the Basilica Aemilia; what stood here then is not modelled.',
    sources: [PARCO, 'Turismo Roma, “San Lorenzo de’ Speziali in Miranda”'],
    view: { radius: 110, az: 335, pol: 66 },
  },
  {
    id: 'maxentius', place: 'maxentius', y: 30, range: 1600, era: 'now',
    title: 'Basilica of Maxentius', when: 'About AD 308–312, finished by Constantine', status: 'Built later', evidence: 'Documented',
    text: 'The largest hall ever built in the Forum stood on a platform about 100 by 65 metres. Its nave, 35 metres high, has fallen; the north aisle still stands, three coffered vaults each about 20 metres wide and 24.5 metres high. In AD 100 this ground was covered by warehouses and the slope of the Velia.',
    note: 'The fallen nave is drawn only as a low outline.',
    sources: [PARCO, 'Structurae, “Basilica of Maxentius”'],
    view: { radius: 200, az: 335, pol: 62 },
  },
  {
    id: 'venusRoma', place: 'venusRoma', y: 24, range: 1600, era: 'now',
    title: 'Temple of Venus and Roma', when: 'Dedicated AD 135 by Hadrian', status: 'Built later', evidence: 'Inferred',
    text: 'Hadrian’s own design, the largest temple in Rome: two halls back to back, for Venus and for the goddess Roma, on a platform at the top of the Sacra Via. It was built over the entrance court of Nero’s Golden House. The platform, column stumps and the back-to-back apses remain, one apse now inside the church of Santa Francesca Romana.',
    note: 'The platform and the apses are simplified; the bell tower’s height is a guess.',
    sources: [ROMANA, 'The Open University, “Hadrian’s Rome”'],
    view: { radius: 260, az: 0, pol: 55 },
  },
  {
    id: 'constantine', place: 'constantine', y: 22, range: 1600, era: 'now',
    title: 'Arch of Constantine', when: 'AD 315', status: 'Built later', evidence: 'Documented',
    text: 'The Senate’s arch for Constantine’s victory at the Milvian Bridge in 312: 21 metres high, 25.9 wide and 7.4 deep, with a central passage 11.5 by 6.5 metres. Much of its sculpture was taken from monuments of Trajan, Hadrian and Marcus Aurelius, so part of it shows the very emperor of our date.',
    sources: ['Encyclopaedia Britannica, “Arch of Constantine”', 'World History Encyclopedia, “Triumphal Arch”'],
    view: { radius: 90, az: 10, pol: 72 },
  },
  {
    id: 'pantheonToday', place: 'pantheon', y: 44, range: 2400, era: 'now', pair: 'pantheon',
    title: 'The Pantheon', when: 'Rebuilt by Hadrian, about 113–125', status: 'Built later', evidence: 'Documented',
    text: 'The Pantheon that stands is not the temple of AD 100. Hadrian rebuilt it from the ground: a domed rotunda as wide as it is high, about 43 metres, behind a porch of sixteen columns facing north. It kept Agrippa’s name in the inscription. A church since 609, it has been in use for almost 1,900 years.',
    note: 'The dome’s outer steps and the porch are simplified. Which way Agrippa’s earlier temple faced is debated; the plain temple in our AD 100 view only marks the spot.',
    sources: [PA, ROMANA],
    view: { radius: 200, az: 175, pol: 62 },
  },
  {
    id: 'viaFori', place: 'viaFori', y: 6, range: 2200, era: 'now',
    title: 'Via dei Fori Imperiali', when: 'Opened 1932', status: 'Built later', evidence: 'Documented',
    text: 'Mussolini’s parade road, opened as the Via dell’Impero on 28 October 1932, runs straight from Piazza Venezia to the Colosseum. To build it, the Alessandrino quarter of the 1500s, with its houses, churches and convents, was pulled down, and the Velia, the ridge between the Forum and the Colosseum valley, was cut away. It runs over the forums of Caesar, Augustus, Nerva and Trajan.',
    note: 'The width (about 30 m) is our estimate. The ground here is still drawn as it was in AD 100, so the road rides over the Velia that it removed.',
    sources: ['Turismo Roma, “Via dei Fori Imperiali”', 'Wanted in Rome, “The prehistoric elephant and Rome’s lost hill” (2023)'],
    view: { radius: 600, az: 135, pol: 48 },
  },
  {
    id: 'vittoriano', place: 'vittoriano', y: 72, range: 3200, era: 'now',
    title: 'The Vittoriano', when: '1885–1935', status: 'Built later', evidence: 'Documented',
    text: 'The monument to Victor Emmanuel II, the first king of united Italy, was cut into the north slope of the Capitol from 1885, after a medieval neighbourhood and a convent were demolished. It was opened, unfinished, in 1911 and completed in 1935: 135 metres wide, 130 deep and 70 high, 81 with its bronze chariots.',
    note: 'The shape is a simplified mass of terraces, colonnade and wings.',
    sources: ['Turismo Roma, “Vittoriano”', 'VIVE Vittoriano e Palazzo Venezia (cultura.gov.it)'],
    view: { radius: 380, az: 180, pol: 64 },
  },
  {
    id: 'circusToday', place: 'circus', y: 12, range: 3600, era: 'now', pair: 'circus',
    title: 'The Circus Maximus today', when: 'A park', status: 'Ruin', evidence: 'Documented',
    text: 'Almost nothing of the stands is left above ground. The valley is a long grassy park that keeps the shape of the track, used for concerts and gatherings. At the curved east end, excavated remains of the seating and a medieval tower can be seen.',
    note: 'The obelisks were moved in the 1500s: the one from the barrier of AD 100 now stands in Piazza del Popolo.',
    sources: [PARCO, PA],
    view: { radius: 620, az: 30, pol: 60 },
  },
  {
    id: 'palatineToday', place: 'domusFlavia', y: 30, range: 2400, era: 'now', pair: 'palace',
    title: 'The Palatine today', when: 'Ruins, gardens and pines', status: 'Ruin', evidence: 'Documented',
    text: 'The palace survives as high brick walls without their marble: the halls of the Domus Flavia, the courts of the Domus Augustana, the sunken garden stadium. In the 1500s the Farnese family laid out gardens over the Domus Tiberiana. Parts of the hill are still being excavated.',
    note: 'In this view the palace is shown only as the ghost of AD 100; its ruins are not modelled yet.',
    sources: [PARCO, 'Siwicki, Art & Object (2022)'],
    view: { radius: 520, az: 60, pol: 52 },
  },
]

MARKERS.push(...NOW_MARKERS) // one list; each card's era decides when it shows

// Shortcuts offered in free exploration.
export const SPOTS = [
  { label: 'Overview', view: null },
  { label: 'Forum', marker: 'forum' },
  { label: 'Sacra Via', marker: 'sacraVia' },
  { label: 'Subura', marker: 'suburaStreet' },
  { label: 'Colosseum', marker: 'colosseum' },
  { label: 'Arena', marker: 'colArena' },
  { label: 'Seats', marker: 'colSeat' },
  { label: 'Games', marker: 'colGames' },
  { label: 'Capitol', marker: 'capitolium' },
  { label: 'Palace', marker: 'palace' },
  { label: 'Circus', marker: 'circus' },
  { label: 'Track', marker: 'circusTrack' },
  { label: 'Tiber', marker: 'island' },
]

// Shortcuts offered in the "today" view.
export const NOW_SPOTS = [
  { label: 'Overview', view: null },
  { label: 'Forum', marker: 'forumToday' },
  { label: 'Colosseum', marker: 'colosseumToday' },
  { label: 'Constantine', marker: 'constantine' },
  { label: 'Maxentius', marker: 'maxentius' },
  { label: 'Fori road', marker: 'viaFori' },
  { label: 'Vittoriano', marker: 'vittoriano' },
  { label: 'Circus', marker: 'circusToday' },
  { label: 'Pantheon', marker: 'pantheonToday' },
]
