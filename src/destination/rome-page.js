// Words for the Rome field guide. Every claim here comes from
// src/rome/content/rome.js, checked in FACT-CHECK-ROME.md (sessions 1 to 4).
// Change a fact there first, then here.
// level: 'documented' (excavation or a surviving text), 'inferred'
// (scholars' best reading), 'invented' (added by us so the scene works).
import { MARKERS } from '../rome/content/rome'

export { LEVELS } from './giza-page'

export const intro = {
  place: 'Rome',
  date: 'AD 100',
  region: 'Imperial Rome, the second year of Trajan',
  lead: 'Fly over a city of perhaps a million people, stand in the Roman Forum, walk a crowded street in the Subura, and see the Colosseum twenty years after it opened.',
  cta: 'Enter Rome, AD 100',
  note: 'A guided flight, then free exploration in 3D. Made for phones. It is a big scene, so it takes a moment to load.',
  part: 'Rome is being built in parts. Open now: the city from the air, the Forum, the Colosseum inside and out, a street in the Subura, the emperor’s palace and the Circus Maximus. Still to come: free exploration and a look at Rome today.',
  facts: [
    ['Colosseum, size', '189 × 156 m, 48 m high'],
    ['Seats, estimated', 'about 50,000'],
    ['People in Rome, estimated', '0.5 to 1 million'],
    ['Places you can open', String(MARKERS.length)],
  ],
}

export const stops = [
  {
    title: 'A city of perhaps a million',
    text: 'You begin high above the Tiber. Estimates of Rome’s population in AD 100 run from half a million to over a million, most of them living in apartment blocks of four or five storeys.',
    marks: [['inferred', 'The population is an estimate'], ['invented', 'Every ordinary house is our reconstruction']],
  },
  {
    title: 'The river and the Capitol',
    text: 'Barges bring grain, oil and marble up the Tiber. Above the river stands the Temple of Jupiter on the Capitol, rebuilt by Domitian after the fire of AD 80.',
    marks: [['documented', 'The rebuilding after the fire'], ['inferred', 'Its columns and gilded roof follow written descriptions']],
  },
  {
    title: 'Trajan’s city',
    text: 'Trajan has ruled for two years. The Circus Maximus is being rebuilt, and the ridge where his great forum will stand still joins the Capitol to the Quirinal.',
    marks: [['documented', 'The ridge, and the dates of the forum to come'], ['inferred', 'Where the Circus works stood is not known']],
  },
  {
    title: 'The Roman Forum',
    text: 'You land among the law courts, the Senate house, the speakers’ platform and Rome’s oldest temples. At the end of the Sacra Via stands the Colosseum.',
    marks: [['documented', 'Buildings placed to within about 10 metres'], ['invented', 'The crowd and the statues']],
  },
  {
    title: 'The Colosseum',
    text: 'Walk round it, look beneath the arena, spread the awning, see who sat where, take a seat or stand on the sand, and watch a morning hunt or the afternoon gladiators. It is twenty years old, 189 by 156 metres, and holds perhaps 50,000 people.',
    marks: [['documented', 'Size, the 80 arches, the 240 mast corbels, the underground level with its 28 lifts, seating by rank, the order of a day at the games'], ['inferred', 'The awning’s shape, the statues in the arches, the scenery'], ['invented', 'The spectators, hunters, animals and gladiators']],
  },
  {
    title: 'A street in the Subura',
    text: 'Stand in the street behind the imperial forums: apartment blocks of four and five storeys, shops with their shutters open, a bakery with its mills, a food bar, a fountain and a shrine at the crossing. No carts: by day the street belongs to people on foot.',
    marks: [['documented', 'Shops, porticoes, fountains, shrines and the daytime ban on carts'], ['inferred', 'Bakery and food bar follow Pompeii and Ostia'], ['invented', 'This particular street, its buildings and its people']],
  },
  {
    title: 'The palace and the Circus',
    text: 'On the Palatine stands Domitian’s palace, where Trajan now lives: throne hall, garden courts and a private stadium. Below it, the Circus Maximus is being rebuilt in stone, with scaffolding and cranes on the Palatine side and the triple Arch of Titus at its curved end.',
    marks: [['documented', 'The palace plan, the Circus’s size, the obelisk and the arch'], ['inferred', 'Heights, roofs and the arch’s form'], ['invented', 'Where the scaffolding and cranes stand']],
  },
  {
    title: 'Then and now',
    text: 'The date in the corner is a switch. Tap Today and the city of AD 100 turns into a faint outline, what survives stands in weathered stone, and what was built later appears in blue-grey: the Arch of Septimius Severus, the Basilica of Maxentius, the Arch of Constantine, Mussolini’s road, the Vittoriano. You stay where you are, so you can compare the same spot.',
    marks: [['documented', 'Which buildings survive, and what was built later'], ['inferred', 'The exact outline of each ruin'], ['invented', 'The grey blocks standing in for the modern city outside the park']],
  },
  {
    title: 'Your turn',
    text: 'Drag to look around, pinch to zoom, and tap a building to read about it. Walk here puts you on the ground wherever you are looking: pinch, scroll or use the arrow keys to walk, or tap the ground to go there. The place buttons jump between the Forum, the Sacra Via, the Subura, the Colosseum, the Capitol, the palace, the Circus and its track, and the river.',
    marks: [],
  },
]

export const thenNow = {
  then: { label: 'AD 100', text: 'Our reconstruction of the Colosseum twenty years after it opened, with a crowd in the seats and the masts ready for the awning.' },
  now: { label: 'Today', text: 'A photograph, not our model. Earthquakes, notably in 1349, and centuries of stone-taking brought down the outer wall on the south side, and the arena floor is gone.' },
}

export const ledger = [
  ['The Colosseum opened in AD 80 with 100 days of games; Domitian finished it and added the underground level', 'documented', 'Encyclopaedia Britannica; World History Encyclopedia'],
  ['It measures about 189 by 156 metres and 48 metres high', 'documented', 'Britannica (189 × 156); the height is given as 45 to 50 m by different sources'],
  ['It held about 50,000 people', 'inferred', 'An estimate: World History Encyclopedia gives 45,000 seated and 5,000 standing; others go up to 80,000'],
  ['The arena measured about 83 by 48 metres', 'documented', 'Several sources; World History Encyclopedia gives 87.5 by 54.8 m, so the range is disclosed'],
  ['240 masts on stone corbels carried the awning, worked by sailors of the fleet from Misenum', 'documented', 'Encyclopaedia Romana; World History Encyclopedia'],
  ['The shape of the awning', 'inferred', 'No canvas survives; follows modern reconstructions'],
  ['Statues stood in the arches of the upper storeys', 'inferred', 'Coins of Titus'],
  ['Which end gate was for entry and which for the dead; which side the emperor sat', 'inferred', 'Sources disagree, so the card says so and both boxes are shown alike'],
  ['The direction of the Colosseum’s long axis, about 20° off east–west', 'inferred', 'Measured from map coordinates, uncertain by about 10°'],
  ['The Forum buildings stand where published coordinates place them', 'documented', 'Pleiades and Wikipedia coordinates, to within about 10 m; Concord, Tabularium, Rostra, Regia and the House of the Vestals placed from their neighbours, about 15 m'],
  ['The Basilica Julia measured 101 by 49 metres', 'documented', 'Parco archeologico del Colosseo; Digitales Forum Romanum'],
  ['The Basilica Aemilia was rebuilt after a fire in 14 BC and repaired in AD 22', 'documented', 'Platner and Ashby 1929; Stanford Forma Urbis project'],
  ['The Basilica Aemilia’s height and arches', 'inferred', 'Plan from excavation; elevation from fragments and reconstructions'],
  ['Painted friezes and blue pediments on the temples', 'inferred', 'Traces of paint on Roman marble; the schemes are ours'],
  ['The gilded horseman of Domitian was pulled down in AD 96 and is not shown', 'documented', 'Encyclopaedia Romana; Statius, Silvae 1.1'],
  ['Trajan’s Forum and Column, Hadrian’s Pantheon and Diocletian’s columns are left out of AD 100 because they came later', 'documented', 'Museo dei Fori Imperiali; Smarthistory; Platner and Ashby'],
  ['Today: the Colosseum’s south side lost its outer two rings after the earthquake of 1349; buttresses by Stern (1806–07) and Valadier (1820s)', 'documented', 'Parco archeologico del Colosseo; Encyclopaedia Britannica; Encyclopaedia Romana'],
  ['Today: eight columns of Saturn, three of Vespasian, three of Castor, part of Vesta (rebuilt 1930); the Curia is Diocletian’s rebuilding', 'documented', 'Platner and Ashby; Encyclopaedia Romana; World History Encyclopedia; Turismo Roma'],
  ['Today: the line where the Colosseum’s ruin breaks off and the outlines of the Forum ruins', 'inferred', 'Simplified from photographs and plans'],
  ['Today: later buildings, from the Arch of Septimius Severus (203) to the Vittoriano (1885–1935), at their published sizes', 'documented', 'Encyclopaedia Britannica; Structurae; Turismo Roma; VIVE Vittoriano'],
  ['Today: grey blocks outside the archaeological park', 'invented', 'They stand in for the modern city; they are not its real buildings'],
  ['Trajan limited new buildings to about 18 metres (60 feet)', 'documented', 'Epitome de Caesaribus 13.12; Strabo 5.3.7 for Augustus’s 70 feet'],
  ['Rome had between half a million and over a million people', 'inferred', 'Storey, Antiquity 1997; the conventional figure of one million'],
  ['The Circus Maximus was being rebuilt by Trajan', 'documented', 'Encyclopaedia Romana; a sestertius of 103 (Yale University Art Gallery); Pliny, Panegyricus 51'],
  ['The scaffolding round the Circus', 'invented', 'Where the works stood is not known'],
  ['The Pantheon of Agrippa', 'invented', 'Its form is not known; the plain temple only marks the spot'],
  ['Apartment blocks with shops below, mezzanines over the shops and porticoes in front', 'documented', 'Excavated blocks at Ostia (ostia-antica.org); Tacitus, Annals 15.43; Suetonius, Nero 16'],
  ['Wheeled carts were banned from the streets for most of the day', 'documented', 'The law of Julius Caesar (Tabula Heracleensis), as described by K. D. Matthews, Expedition 1960'],
  ['Domitian ordered shopkeepers back behind their thresholds', 'documented', 'Martial, Epigrams 7.61'],
  ['591 public basins in about AD 97; 265 crossroads shrines in AD 73', 'documented', 'Frontinus, De aquaeductu 78; Pliny the Elder, Natural History 3.66'],
  ['The firewall behind the Forum of Augustus, up to 33 metres high', 'documented', 'Turismo Roma; Encyclopaedia Romana'],
  ['Seats by rank: senators, knights, citizens, women and the poor at the top', 'documented', 'Suetonius, Augustus 44; Encyclopaedia Romana'],
  ['28 lifts under the arena in Domitian’s time (the 60 small lifts came a century later)', 'documented', 'Parco archeologico del Colosseo'],
  ['A day at the games: hunts, midday executions, gladiators in the afternoon, with music', 'documented', 'Wiedemann 1992; Seneca, Letters 7; the Zliten mosaic'],
  ['The hunters, animals, gladiators and their movements', 'invented', 'Simplified figures; nobody is hurt and executions are not shown'],
  ['Domitian’s palace: throne hall, octagonal maze fountain, garden stadium of 160 × 48 m', 'documented', 'Plan from excavation (Claridge; Turismo Roma); heights are ours'],
  ['The Arch of Titus at the curved end of the Circus, AD 81', 'documented', 'Fragments found 2015; inscription ILS 264'],
  ['Trajan’s works on the Circus: scaffolding and cranes', 'invented', 'The rebuilding is documented; where the works stood is not'],
  ['The bakery and the food bar', 'inferred', 'Modelled on Pompeii and Ostia; none excavated on this street'],
  ['The Subura street itself: its buildings, shops, signs and people', 'invented', 'It follows the line of the Argiletum; everything on it is ours'],
  ['Every ordinary house, street, tree and person', 'invented', 'Our reconstruction, fitted to the hills; heights follow Roman building rules and the excavated blocks at Ostia'],
]

export { romeSources as sources } from '../site/credits'

export const next = { place: 'Giza', date: 'c. 2560 BC', status: 'Open now', href: 'destinations/giza/' }
