import { L } from '../../i18n';
import type { MapDef } from '../../overworld/mapTypes';
import { LOOKS } from '../../overworld/sprites';

/** Route 8, Cité-Encre (badge 8) and the Usine à Gommes, Team Gomme's headquarters. */
export const ENCRE_MAPS: Record<string, MapDef> = {
  route8: {
    id: 'route8',
    name: L('Route de l’Encre', 'Ink Path'),
    border: 'tree',
    backdrop: 'forest',
    tint: 'rgba(40, 30, 70, 0.22)',
    // an ink river winds across the route: the old road's bridge is broken (its far half by paper boat), so the
    // trail goes up the east bank, through the meander and over the far bridge to the Echo cave's beach
    rows: [
      'TTTTTTTT::TTTTTTTTTTTTTT',
      'T"""TT.T::....*.......TT',
      'T"""TT..::......"""""..T',
      'T"""TT..::.....""*"""".T',
      'T*.*..*.::..TT.."""""..T',
      'T*.TTTTTT"""TT.........T',
      'TTTTTTTTT""".T,,,..*..*T',
      'TTTTTTTTT"""TT......TT.T',
      'TTTTTTTTT""".....TTTTTTT',
      'T...TTTTT""".....TTTTTTT',
      'T........:::.....sTTTRTT',
      'T""".*...sssssssssssssRT',
      'T"""...*..~~~==~~~~~~~~T',
      'T"""..R..~~~~==~~~~~~~~T',
      'T......s~~~~sssssssssRRT',
      'T......s~~~R,""""""TTTTT',
      'T......s~~~,""""""TTTTTT',
      'T.....:s~~~"""""""TTTTTT',
      'T"""..:R~~~,"""""",::.TT',
      'T"""..:.~~~~*,RR.R.::B.T',
      'T"""..:*~~~~~.RssR.::..T',
      'T"""T.:..~~~~~RRRR.::.*T',
      'TTTTTT::..~R~~~~~""""""T',
      'TTTTTT::....s~~~~~"""""T',
      'TTTTT*.::.*.Rs~~~~~"""TT',
      'TTTTT..:::.*.ss~~~~"""TT',
      'T~~~~~~~==~~~~s~~~~R"""T',
      'T~~~~~~~~~~~~~~~~Rs.::.T',
      'T~ssss~~==~~~~~~~sss::.T',
      'T~~~~~~~==~~~~~~~R.s:*RT',
      'T~~~~~ss::sRRRTTRTRR::.T',
      'TssRs.R.,:..RTTTTT.:::.T',
      'T.*..*..:,..RTTTTTT::."T',
      'T""""".*::..."TTT..::""T',
      'T"""""*.::.."""""..::""T',
      'T"""""..::::"""""::::."T',
      'TT*.....::::"""""::::.TT',
      'TTTTT.*.::S.TTTTTT....*T',
      'TTTTTT..::.TTTTTTTT..*.T',
      'TTTTTTTT::TTTTTTTTTTTTTT',
    ],
    // the Grotte des Échos (optional)
    buildings: [
      { kind: 'cave', x: 12, y: 8, w: 5, h: 3, door: 2, to: { map: 'grotteEchos', x: 7, y: 10, facing: 'up' } },
      // the Scribble-Out Cave: a three-floor maze
      { kind: 'cave', x: 2, y: 14, w: 5, h: 3, door: 3, to: { map: 'ratures1', x: 7, y: 10, facing: 'up' } },
    ],
    // the cracked rock that opens the rock pile by the water
    obstacles: [{ x: 16, y: 19, kind: 'rock' }],
    warps: [
      { x: 8, y: 39, to: { map: 'gouache', x: 9, y: 1, facing: 'down' } },
      { x: 9, y: 39, to: { map: 'gouache', x: 10, y: 1, facing: 'down' } },
      { x: 8, y: 0, to: { map: 'encre', x: 9, y: 14, facing: 'up' } },
      { x: 9, y: 0, to: { map: 'encre', x: 10, y: 14, facing: 'up' } },
    ],
    signs: [{ x: 10, y: 37, text: L('ROUTE DE L’ENCRE\n↑ Cité-Encre   ↓ Jardin-Gouache', 'INK PATH\n↑ Ink City   ↓ Gouache Garden') }],
    npcs: [
      { id: 'r8a', x: 12, y: 6, look: LOOKS.ghostgirl, facing: 'left', trainer: 'r8a', sight: 3 },
      { id: 'r8c', x: 22, y: 28, look: LOOKS.gommeF, facing: 'left', trainer: 'r8c', sight: 4 },
      { id: 'r8d', x: 17, y: 34, look: LOOKS.ghostgirl, facing: 'down', trainer: 'r8d', sight: 4 },
      { id: 'r8b', x: 12, y: 14, look: LOOKS.gomme, facing: 'right', trainer: 'r8b', sight: 4 },
    ],
    items: [
      { x: 1, y: 15, item: 'sucette-magique' }, { x: 9, y: 3, item: 'baie-prisme' }, { x: 2, y: 2, item: 'pochoir-11' }, { x: 1, y: 2, item: 'pochoir-28' }, { x: 14, y: 7, item: 'crayon-noir' },
      // in the rock pile by the water, behind the cracked rock (the mallet)
      { x: 16, y: 20, item: 'pochoir-16' }, { x: 15, y: 20, item: 'crayon-argent' },
      // on the sandbar where the river runs into the forest: by paper boat
      { x: 3, y: 28, item: 'rappel' },
    ],
    berries: [{ x: 21, y: 19, item: 'baie-prisme' }],
    encounters: {
      rate: 21,
      table: [
        { id: '009', w: 26, min: 28, max: 29 },
        { id: '010', w: 16, min: 27, max: 29 },
        { id: '013', w: 14, min: 28, max: 29 },
        { id: '008', w: 12, min: 27, max: 29 },
        { id: '004', w: 12, min: 28, max: 29 },
        { id: '007', w: 12, min: 28, max: 29 },
        { id: '011', w: 2, min: 28, max: 29 },
        { id: '026', w: 14, min: 28, max: 29 },
        { id: '036', w: 4, min: 28, max: 29, time: 'day' },
        { id: '043', w: 8, min: 28, max: 29 },
        { id: '057', w: 8, min: 27, max: 29 },
        { id: '056', w: 8, min: 28, max: 29 },
        { id: '083', w: 8, min: 28, max: 29, time: 'night' },
        { id: '096', w: 10, min: 27, max: 29 },
        { id: '098', w: 4, min: 28, max: 29, time: 'night' },
      ],
    },
    // the ink river: by paper boat, or with a rod from the bank
    surf: { rate: 2, table: [{ id: '003', w: 50, min: 27, max: 29 }, { id: '101', w: 40, min: 27, max: 29 }, { id: '032', w: 20, min: 27, max: 29 }, { id: '058', w: 18, min: 27, max: 29 }, { id: '096', w: 20, min: 27, max: 29 }, { id: '102', w: 6, min: 28, max: 29 }] },
    fishing: { low: [{ id: '099', w: 150, min: 10, max: 14 }, { id: '003', w: 60, min: 10, max: 14 }], mid: [{ id: '003', w: 100, min: 20, max: 25 }, { id: '069', w: 40, min: 20, max: 25 }, { id: '099', w: 80, min: 20, max: 24 }], high: [{ id: '003', w: 100, min: 27, max: 29 }, { id: '069', w: 30, min: 27, max: 29 }, { id: '034', w: 8, min: 27, max: 29 }] },
  },

  encre: {
    id: 'encre',
    name: L('Cité-Encre', 'Ink City'),
    border: 'tree',
    backdrop: 'city',
    tint: 'rgba(30, 20, 60, 0.28)',
    onEnter: 'visitTown',
    // the old city (columns 0-18) keeps its buildings; the Place de l'Encrier (its inkwell fountain and calligraphy on
    // stands) in the south-west, the blue ink canal with bookstalls and footbridges, fireflies (`y`) for street lamps,
    // and the east quarter: three houses, the fireflies' garden and the Night Library's tower
    dive: 'encreFonds',
    rows: [
      'TTTTTTTTT::TTTTTTTTTTTTTTTTTTTTTTTTT',
      'T......y*::*y....B.....y....y.....BT',
      'T........::..................*....yT',
      'T........::........................T',
      'T......*.::......*M....*....M......T',
      '::::::::::::::::::::::::::::::.....T',
      'T.......y::*......y.....#####..:S..T',
      'T........::.............#yyy#*.:.y.T',
      'T........::.............#y*y#..:..BT',
      'T.......*::y......*....S##.##.y:*.BT',
      'T:::::::::::::::::::::::::::::::...T',
      'T.S....*.::S..bb.bb.....bb.....y.y.T',
      'Tq.R~~R.q::R~~~dd~~~~==~~~~~==~~~~~T',
      'T..R~~R..::.~~~dd~~~~==~~~~~==~~~~~T',
      'Ty*.RR.yq::.*.y..*......y*.....*y.*T',
      'TTTTTTTTT::TTTTTTTTTTTTTTTTTTTTTTTTT',
    ],
    buildings: [
      { kind: 'center', x: 2, y: 1, w: 5, h: 4, door: 2, to: { map: 'centre', x: 5, y: 6, facing: 'up' } },
      { kind: 'shop', x: 13, y: 1, w: 4, h: 4, door: 1, to: { map: 'boutique', x: 4, y: 6, facing: 'up' } },
      { kind: 'gym', x: 12, y: 6, w: 6, h: 4, door: 3, roof: '#6a5aa6', to: { map: 'atelierEncre', x: 5, y: 10, facing: 'up' }, script: 'atelierEncreDoor' },
      { kind: 'lab', x: 2, y: 6, w: 6, h: 4, door: 3, roof: '#4a4458', to: { map: 'usine1', x: 6, y: 10, facing: 'up' }, script: 'usineDoor' },
      // the east quarter: the ink-maker's house, the night watchman's, the calligrapher's studio and the Night Library
      { kind: 'house', x: 19, y: 1, w: 4, h: 4, door: 1, roof: '#34589c', to: { map: 'maisonVille', x: 4, y: 6, facing: 'up' } },
      { kind: 'house', x: 24, y: 1, w: 4, h: 4, door: 1, roof: '#2a2238', to: { map: 'maisonPetite', x: 3, y: 5, facing: 'up' } },
      { kind: 'house', x: 19, y: 6, w: 4, h: 4, door: 2, roof: '#7b60c3', to: { map: 'maisonAtelier', x: 5, y: 6, facing: 'up' } },
      { kind: 'tower', x: 30, y: 1, w: 4, h: 5, door: 1, roof: '#4a3a6a', to: { map: 'maisonAtelier', x: 5, y: 6, facing: 'up' } },
    ],
    warps: [
      { x: 9, y: 15, to: { map: 'route8', x: 8, y: 1, facing: 'down' } },
      { x: 10, y: 15, to: { map: 'route8', x: 9, y: 1, facing: 'down' } },
      { x: 9, y: 0, to: { map: 'routeBlanche', x: 9, y: 14, facing: 'up' } },
      { x: 10, y: 0, to: { map: 'routeBlanche', x: 10, y: 14, facing: 'up' } },
      // west: the Margin Road (Act 4)
      { x: 0, y: 5, to: { map: 'route9', x: 42, y: 9, facing: 'left' } },
    ],
    // the white wall north of the city stands until the Giant Eraser is stopped (src/story/act4.ts)
    patches: [{ id: 'murBlanc', x: 9, y: 0, rows: ['ee'], unless: 'a4.machine' }],
    triggers: [
      { x: 9, y: 1, w: 2, h: 1, script: 'encreNorth', unless: 'a4.machine' },
      { x: 1, y: 5, script: 'encreWest', unless: 'a3.usine' },
    ],
    signs: [
      { x: 2, y: 11, text: L('CITÉ-ENCRE\nLa ville où la nuit ne sèche jamais.\nAtelier de Nocturne · Usine à Gommes', 'INK CITY\nWhere the night never dries.\nNocturne’s Atelier · Eraser Factory') },
      { x: 3, y: 12, text: L('FONTAINE-ENCRIER\nAutrefois, toute la ville venait y tremper ses plumes. Défense d’y tremper les Bestioles !', 'INKWELL FOUNTAIN\nOnce, the whole city came to dip its quills here. No dipping Critters!') },
      // calligraphy on stands around the square
      { x: 1, y: 12, text: L('Un poème calligraphié :\n« La nuit est un encrier renversé ; chaque étoile, le point d’un i. »', 'A calligraphed poem:\n“The night is a spilled inkwell; every star, the dot of an i.”') },
      { x: 8, y: 12, text: L('Un proverbe calligraphié :\n« Écris doucement : l’encre se souvient de tout. »', 'A calligraphed proverb:\n“Write gently: ink remembers everything.”') },
      { x: 8, y: 14, text: L('Une feuille d’exercice toute tremblée :\n« Bestiole, Bestiole, Bestiole… » La dernière est presque parfaite !', 'A wobbly practice sheet:\n“Critter, Critter, Critter…” The last one is almost perfect!') },
      { x: 11, y: 11, text: L('CANAL D’ENCRE BLEUE\nBaignade interdite : on en ressort tout bleu.', 'BLUE INK CANAL\nNo swimming: you’d come out all blue.') },
      { x: 23, y: 9, text: L('ATELIER DE CALLIGRAPHIE\nCours du soir… et de la nuit.', 'CALLIGRAPHY STUDIO\nEvening classes… and night ones.') },
      { x: 32, y: 6, text: L('BIBLIOTHÈQUE DE LA NUIT\nOuverte du coucher du soleil jusqu’à l’aube. Chut !', 'NIGHT LIBRARY\nOpen from sunset to dawn. Shh!') },
    ],
    items: [{ x: 18, y: 14, item: 'page-11', hidden: true }],
    npcs: [
      { id: 'encreOld', x: 9, y: 12, look: LOOKS.granny, facing: 'down', script: 'encreOld' },
      { id: 'encreGuard', x: 5, y: 11, look: LOOKS.gomme, facing: 'up', hideIf: 'badge:encre', text: [L('L’Usine à Gommes ? Interdit d’entrer ! … À moins d’avoir battu Nocturne, hé hé.', 'The Eraser Factory? No entry! … Unless you’ve beaten Nocturne, hee hee.')] },
      { id: 'encreSmog', x: 8, y: 8, mon: '056', look: LOOKS.kid, facing: 'left', text: [L('Un Fumeron tousse devant l’Usine à Gommes. Même lui trouve que ça sent mauvais.', 'A Smoglet coughs outside the Eraser Factory. Even it thinks it smells bad.')] },
      { id: 'encreWish', x: 2, y: 13, look: LOOKS.girl, facing: 'left', wander: true, text: [L('Si tu jettes une pièce dans la Fontaine-Encrier, ton vœu s’écrit tout seul sur l’eau ! Moi, j’ai souhaité un Brumouille.', 'Toss a coin in the Inkwell Fountain and your wish writes itself on the water! I wished for a Mistchief.')] },
      // a fan of Nocturne's, waiting by the Atelier: while she is away, then once she is back
      { id: 'encreFan', x: 13, y: 11, look: { hair: '#1a1424', shirt: '#7b60c3', pants: '#2a2238', longHair: true }, facing: 'up', hideIf: 'a3.phare', text: [L('L’Atelier est fermé depuis des jours… Nocturne est partie en courant, la cape au vent et un encrier vide à la main.', 'The Atelier’s been shut for days… Nocturne ran off, cape flying, an empty inkwell in her hand.')] },
      { id: 'encreFanBack', x: 13, y: 11, look: { hair: '#1a1424', shirt: '#7b60c3', pants: '#2a2238', longHair: true }, facing: 'up', showIf: 'a3.phare', text: [L('Nocturne est rentrée ! Ça se voit : les étoiles brillent plus fort au-dessus de l’Atelier.', 'Nocturne’s back! You can tell: the stars shine brighter over the Atelier.')] },
      { id: 'encreBooks', x: 16, y: 11, look: { hair: '#8a8494', shirt: '#6a4a3a', pants: '#2a2238', hat: '#4a3a6a' }, facing: 'up', text: [L('Livres d’occasion ! Contes de fantômes, recettes d’encre, vieux Bestiodex tout cornés… Ici, rien ne s’efface !', 'Second-hand books! Ghost stories, ink recipes, dog-eared old Critterdexes… Here, nothing gets rubbed out!')] },
      { id: 'encreCat', x: 25, y: 14, mon: '054', look: LOOKS.kid, facing: 'down', wander: true, text: [L('Le Chapardou te regarde… puis regarde ton sac. Mieux vaut bien le fermer.', 'The Pilfurr looks at you… then at your bag. Better keep it shut.')] },
      { id: 'encreFisher', x: 29, y: 12, look: { hair: '#5a4a3a', shirt: '#4a7a8a', pants: '#3a3a4a', hat: '#c8a060' }, facing: 'right', text: [L('Je pêche dans le canal d’encre bleue. Pour l’instant : trois taches, une vieille plume et un chapeau.', 'I’m fishing in the blue ink canal. So far: three blots, an old quill and a hat.')] },
      { id: 'encreFireflies', x: 26, y: 8, look: { hair: '#f2c14e', shirt: '#3a2a5a', pants: '#2a2238', longHair: true }, facing: 'down', text: [L('Ici, pas de réverbères : ce sont les lucioles qui éclairent les rues. Je les nourris de miettes de crayon jaune.', 'No street lamps here: the fireflies light the streets. I feed them yellow crayon crumbs.')] },
      { id: 'encreStudent', x: 29, y: 10, look: { hair: '#6a3a2a', shirt: '#34589c', pants: '#4a4a5a' }, facing: 'right', wander: true, text: [L('Je vais à la Bibliothèque de la Nuit. Elle ouvre au coucher du soleil… Ici, il ne se lève jamais vraiment, alors elle est toujours ouverte !', 'I’m off to the Night Library. It opens at sunset… The sun never really rises here, so it’s always open!')] },
    ],
    residents: [
      // the ink-maker's family
      { id: 'encreInkmaker', x: 3, y: 2, look: { hair: '#3a3448', shirt: '#2a3a6a', pants: '#4a4458' }, facing: 'down', fromDoor: [['encre', 20, 5]], text: [
        L('Je fabrique l’encre de toute la ville : de l’eau du canal, une pincée de suie… et une larme de Tachou.', 'I make the ink for the whole city: canal water, a pinch of soot… and one Blotling tear.'),
        L('Les Bestioles Spectre adorent l’odeur de l’encre fraîche. Nocturne m’en commande des tonneaux entiers !', 'Ghost Critters love the smell of fresh ink. Nocturne orders it from me by the barrel!'),
      ] },
      { id: 'encreInkGirl', x: 2, y: 5, look: { hair: '#2a2238', shirt: '#5bd6a0', pants: '#34589c', longHair: true }, facing: 'right', fromDoor: [['encre', 20, 5]], text: [
        L('Papa dit que l’encre bleue, c’est pour les lettres, et la noire pour les histoires qui font peur. Moi, j’écris tout en vert !', 'Dad says blue ink is for letters and black for scary stories. I write everything in green!'),
      ] },
      { id: 'encreInkMon', x: 7, y: 3, mon: '096', look: LOOKS.kid, facing: 'left', wander: true, fromDoor: [['encre', 20, 5]], text: [L('Le Tachou laisse une petite tache sur le tapis… et il a l’air très fier de lui.', 'The Blotling leaves a little blot on the rug… and looks very proud of itself.')] },
      // the night watchman, asleep by day
      { id: 'encreWatchman', x: 1, y: 2, look: { hair: '#6a6a7a', shirt: '#2a2238', pants: '#3a3448', hat: '#2a2238' }, facing: 'down', fromDoor: [['encre', 25, 5]], text: [
        L('Chut… Je suis veilleur de nuit : le jour je dors, la nuit je compte les lucioles pour vérifier qu’il n’en manque aucune.', 'Shh… I’m the night watchman: by day I sleep, by night I count the fireflies to make sure none are missing.'),
        L('Depuis que l’Usine à Gommes tourne, elles ont peur : elles brillent moins fort. Ça ne me plaît pas du tout.', 'Since the Eraser Factory started up, they’re scared: they glow less brightly. I don’t like it one bit.'),
      ], afterStory: {
        text: [L('Depuis que l’Usine à Gommes est arrêtée, les lucioles brillent comme jamais. Cette nuit, j’en ai même compté une de plus !', 'Since the Eraser Factory stopped, the fireflies glow like never before. Last night I even counted one more!')],
      } },
      { id: 'encreWatchMon', x: 4, y: 3, mon: '009', look: LOOKS.kid, facing: 'left', fromDoor: [['encre', 25, 5]], text: [L('Le Brumouille flotte au-dessus du lit en bâillant. Lui aussi travaille de nuit.', 'The Mistchief floats above the bed, yawning. It works nights too.')] },
      // the calligrapher's studio
      { id: 'encreCalligrapher', x: 6, y: 2, look: { hair: '#e8e8f0', shirt: '#1a1a2a', pants: '#3a2a5a', longHair: true }, facing: 'down', fromDoor: [['encre', 21, 10]], text: [
        L('Un trait d’encre, ça ne se gomme pas. Alors on respire, on réfléchit… et on ose !', 'A stroke of ink can’t be rubbed out. So you breathe, you think… and you dare!'),
        L('Nocturne a appris à écrire ici, toute petite. Des pâtés partout… mais quelles belles lettres !', 'Nocturne learned to write here when she was tiny. Blots everywhere… but such beautiful letters!'),
      ], afterStory: {
        text: [L('Un trait d’encre ne se gomme pas. Alors, quand on rate, on en fait autre chose : une fleur, une étoile, un petit oiseau…', 'A stroke of ink can’t be rubbed out. So when you slip, you turn it into something else: a flower, a star, a little bird…')],
        gift: { item: 'loupe', text: L('Tiens, ma loupe. Elle aide à voir ce qu’il y a de beau dans les petits ratés.', 'Here, my loupe. It helps you see the beauty in little slips.') },
      } },
      { id: 'encrePupil', x: 2, y: 4, look: LOOKS.kid, facing: 'right', fromDoor: [['encre', 21, 10]], text: [
        L('J’apprends la calligraphie. Aujourd’hui : la lettre « B », comme Bestiole. Ça fait trois jours que je suis sur la boucle du haut.', 'I’m learning calligraphy. Today: the letter “C”, for Critter. I’ve been stuck on its curve for three days.'),
      ] },
      // the Night Library
      { id: 'encreLibrarian', x: 4, y: 2, look: { hair: '#8a5a3a', shirt: '#7a8ad0', pants: '#3a3448', longHair: true }, facing: 'down', fromDoor: [['encre', 31, 6]], text: [
        L('Bienvenue à la Bibliothèque de la Nuit. Tous les livres de la Cité-Encre sont ici… écrits à l’encre : pas une page ne s’efface.', 'Welcome to the Night Library. Every book from Ink City is here… written in ink: not one page can be rubbed out.'),
        L('Si quelqu’un voulait effacer l’histoire de la région, c’est ici qu’il viendrait d’abord. Alors je veille, ma lampe à la main.', 'If anyone wanted to rub out the region’s story, this is where they’d come first. So I keep watch, lamp in hand.'),
      ] },
      { id: 'encreReader', x: 9, y: 4, look: { hair: '#f2d05a', shirt: '#4a7ee0', pants: '#2a2238' }, facing: 'left', fromDoor: [['encre', 31, 6]], text: [
        L('Je lis « La Bestiole qui avalait les ombres ». Ça fait peur… Je le lis avec deux lampes allumées.', 'I’m reading “The Critter Who Swallowed Shadows”. It’s scary… I read it with two lamps on.'),
      ] },
      { id: 'encreLibMon', x: 7, y: 5, mon: '098', look: LOOKS.kid, facing: 'left', fromDoor: [['encre', 31, 6]], text: [L('Un Fanétome somnole entre deux rayonnages, comme une fleur oubliée entre les pages d’un livre.', 'A Wiltwisp dozes between two shelves, like a flower pressed and forgotten in a book.')] },
    ],
  },

  atelierEncre: {
    id: 'atelierEncre',
    name: L('Atelier Encre', 'Ink Atelier'),
    indoor: true,
    border: 'void',
    backdrop: 'tower',
    tint: 'rgba(30, 20, 60, 0.25)',
    // Nocturne's old library: its floor is glossy paper with ink blots. You slide until something stops you (a shelf,
    // a desk, someone standing, a bit of plain floor); slide into a blot and you drop back to the door. The way
    // (src/data/ateliers/encre.test.ts): in by the left gap in the shelves, up to the librarian, right, up, right along
    // the top to the scribe, down, left to the storyteller, up to Nocturne. The door stays at (5,11): the story's
    // `atelierEncreDoor` brings you in at (5,10).
    rows: [
      'QbbbbbbQQQQQQQbbbbbbQ',
      'QpootoooocccooootoopQ',
      'QoooooooocccooooooooQ',
      'QbbbbbbbQQcQQbbbbbbbQ',
      'QIIIOIIIIIIIIIIIIIooQ',
      'QIIIIIIIIIIIItIIOIIIQ',
      'QooIIIIIbIIIIIOIIIIIQ',
      'QIIItIIIIooIIIIIIIIIQ',
      'QIIIIOIIIIIIOIIIIItIQ',
      'QoobbobbbbbbbbobbbbbQ',
      'QoooooooooooooooooooQ',
      'QQQQQXQQQQQQQQQQQQQQQ',
    ],
    warps: [{ x: 5, y: 11, to: { map: 'encre', x: 15, y: 10, facing: 'down' } }],
    // the ink blots: whoever slides into one comes out at the door
    holes: [[4, 4], [16, 5], [14, 6], [5, 8], [12, 8]].map(([x, y]) => ({ x, y, to: { map: 'atelierEncre', x: 5, y: 10, facing: 'up' as const }, fall: true })),
    // Nocturne's fresco: an ink blot until the sixth choice, then painted again or turned into a moon
    patches: [
      { id: 'encreBlot', x: 9, y: 0, rows: ['VAV'], unless: 'choix:encre' },
      { id: 'encreRedone', x: 9, y: 0, rows: ['VVV'], if: 'choix:encre:a' },
      { id: 'encreMoon', x: 9, y: 0, rows: ['VNV'], if: 'choix:encre:b' },
    ],
    interact: [{ x: 9, y: 0, script: 'encreFresque' }, { x: 10, y: 0, script: 'encreFresque' }, { x: 11, y: 0, script: 'encreFresque' }],
    npcs: [
      { id: 'nocturne', x: 10, y: 2, look: LOOKS.leaderEncre, facing: 'down', trainer: 'nocturne', sight: 1 },
      { id: 'encreT1', x: 1, y: 9, look: LOOKS.ghostgirl, facing: 'right', trainer: 'encreT1', sight: 1 },
      { id: 'encreT3', x: 1, y: 6, look: { hair: '#c8c8d0', shirt: '#4a3a6a', pants: '#2a2238', longHair: true }, facing: 'right', trainer: 'encreT3', sight: 1 },
      { id: 'encreT4', x: 19, y: 4, look: { hair: '#1a1424', shirt: '#34589c', pants: '#1a1424', hat: '#2a2238' }, facing: 'left', trainer: 'encreT4', sight: 1 },
      { id: 'encreT2', x: 9, y: 7, look: LOOKS.sailor, facing: 'right', trainer: 'encreT2', sight: 1 },
      { id: 'encreGuide', x: 5, y: 9, look: { hair: '#3a2a1a', shirt: '#ffffff', pants: '#5a8ad6' }, facing: 'down',
        text: [
          L('Nocturne écrit à l’encre de nuit : Bestioles Spectre ! Seuls les Spectres et les Ténèbres les touchent vraiment.', 'Nocturne writes in night ink: Ghost Critters! Only Ghost and Dark really hurt them.'),
          L('Son sol est en papier glacé : on glisse jusqu’au premier obstacle. Et gare aux taches d’encre : tombe dedans, et tu ressors ici, à la porte !', 'Her floor is glossy paper: you slide until something stops you. And mind the ink blots: fall in one and you come out here, at the door!'),
        ] },
    ],
  },

  usine1: {
    id: 'usine1',
    dungeon: true,
    name: L('Usine à Gommes', 'Eraser Factory'),
    indoor: true,
    border: 'void',
    backdrop: 'city',
    tint: 'rgba(60, 55, 75, 0.25)',
    rows: [
      'WWWWWWWWWWWWWW',
      'WUooCCooooCCoW',
      'WooooooooooooW',
      'WCCooCCooCCooW',
      'WooooooooooooW',
      'WooCCCCCCooooW',
      'WooooooooooooW',
      'WCCooooooooCCW',
      'WCCCoooooooooW',
      'Wo@oCCCooooooW',
      'WooooooooooooW',
      'WWWWWWXWWWWWWW',
    ],
    // the storeroom: a block dropped through the hole upstairs lands on its plate and lifts the shutter
    obstacles: [{ x: 2, y: 9, kind: 'block', showIf: 'hole:usine2:1,8' }],
    puzzles: [{ flag: 'puzzle:usineStore', plates: [[2, 9]] }],
    patches: [{ id: 'usineStore', x: 4, y: 10, rows: ['G'], unless: 'puzzle:usineStore' }],
    warps: [
      { x: 6, y: 11, to: { map: 'encre', x: 5, y: 10, facing: 'down' } },
      { x: 1, y: 1, to: { map: 'usine2', x: 2, y: 1, facing: 'right' } },
    ],
    npcs: [
      { id: 'u1g1', x: 4, y: 2, look: LOOKS.gomme, facing: 'down', trainer: 'u1g1', sight: 3 },
      { id: 'u1g2', x: 11, y: 6, look: LOOKS.gommeF, facing: 'left', trainer: 'u1g2', sight: 4 },
      { id: 'u1g3', x: 8, y: 10, look: LOOKS.gomme, facing: 'left', trainer: 'u1g3', sight: 3 },
    ],
    items: [{ x: 12, y: 10, item: 'rappel' }, { x: 1, y: 9, item: 'echarpe-tetue' }, { x: 3, y: 10, item: 'super-potion', count: 2 }],
  },

  usine2: {
    id: 'usine2',
    dungeon: true,
    name: L('Usine à Gommes — atelier', 'Eraser Factory — workshop'),
    indoor: true,
    border: 'void',
    backdrop: 'city',
    tint: 'rgba(60, 55, 75, 0.3)',
    // the shutter to the stairs opens once two eraser blocks weigh on the two plates; a third block
    // dropped down the hole lands in the storeroom below
    rows: [
      'WWWWWWWWWWWWWW',
      'WDoooooooCooUW',
      'WooooooooCoooW',
      'Wooo@ooooCoooW',
      'WooCCCoooooooW',
      'WooooooooCoooW',
      'WooooCoooCoooW',
      'Wooo@ooooCoooW',
      'WOoooooooCoooW',
      'WWWWWWWWWWWWWW',
    ],
    obstacles: [{ id: 'u2a', x: 6, y: 2, kind: 'block' }, { id: 'u2b', x: 6, y: 5, kind: 'block' }, { id: 'u2c', x: 4, y: 6, kind: 'block' }],
    puzzles: [{ flag: 'puzzle:usineShutter', plates: [[4, 3], [4, 7]] }],
    patches: [{ id: 'usineShutter', x: 9, y: 4, rows: ['G'], unless: 'puzzle:usineShutter' }],
    holes: [{ x: 1, y: 8, to: { map: 'usine1', x: 2, y: 9 } }],
    signs: [{ x: 0, y: 2, text: L('NOTE DE SERVICE : les blocs de gomme vont sur les dalles. Coincé ? Redescends et remonte, tout se remet en place.', 'MEMO: the eraser blocks go on the plates. Stuck? Go downstairs and back up, everything goes back in place.') }],
    warps: [
      { x: 1, y: 1, to: { map: 'usine1', x: 2, y: 1, facing: 'down' } },
      { x: 12, y: 1, to: { map: 'usine3', x: 2, y: 8, facing: 'up' } },
    ],
    triggers: [{ x: 10, y: 1, w: 2, h: 2, script: 'rature2Stop', unless: 'tr:rature2' }],
    npcs: [
      { id: 'rature2', x: 11, y: 4, look: LOOKS.rature, facing: 'up', script: 'rature2Stop', hideIf: 'tr:rature2' },
      { id: 'u2g1', x: 11, y: 7, look: LOOKS.gommeF, facing: 'up', trainer: 'u2g1', sight: 2 },
    ],
  },

  usine3: {
    id: 'usine3',
    dungeon: true,
    name: L('Usine à Gommes — sommet', 'Eraser Factory — top'),
    indoor: true,
    border: 'void',
    backdrop: 'city',
    tint: 'rgba(60, 55, 75, 0.36)',
    rows: [
      'WWWWWWWWWWWW',
      'WooooooooooW',
      'WooooooooooW',
      'WooCCooCCooW',
      'WooooooooooW',
      'WooooooooooW',
      'WCCooooooCCW',
      'WooooooooooW',
      'WDoooooooooW',
      'WWWWWWWWWWWW',
    ],
    warps: [{ x: 1, y: 8, to: { map: 'usine2', x: 11, y: 1, facing: 'left' } }],
    triggers: [{ x: 1, y: 5, w: 10, h: 1, script: 'blanche2Stop', unless: 'tr:blanche2' }],
    npcs: [
      { id: 'blanche2', x: 5, y: 2, look: LOOKS.blanche, facing: 'down', script: 'blanche2Stop', hideIf: 'a3.usine' },
    ],
  },
};
