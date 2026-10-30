import { L } from '../../i18n';
import { guideNpc } from '../guides';
import type { MapDef } from '../../overworld/mapTypes';
import { LOOKS } from '../../overworld/sprites';

/** Ville-Pastel and its Atelier, Route 2 and the Misty Woods. */
export const PASTEL_MAPS: Record<string, MapDef> = {
  ville: {
    id: 'ville',
    onEnter: 'visitTown',
    name: L('Ville-Pastel', 'Pastel City'),
    border: 'tree',
    // the Chalk Square and its fountain at the crossroads, the museum's flowerbeds, the gardener's garden, and to the
    // east the artists' quarter: three houses, the butterfly garden by the lane and a pond
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTB.***,......*.....**..**...**.TT',
      'TT..............................TT',
      'T................................T',
      'T................................T',
      'T.......**....*............M....MT',
      'T.......**....*S.........:...:...T',
      'T..:::::::::::::::::::::::::::::.T',
      'T..:.......::.........:#S:##..**.T',
      '::::..T..B::::B.......:#***#.....T',
      '::::.*.*.::::::.**B**.:#*B*#.....T',
      'T........::~~::.......:#***#.....T',
      'T.S....**::~~::.......:#####.....T',
      'TB.....**::::::.......:..........T',
      'TB.......B::::B.......:.......:M.T',
      'T...::::::::::::::::::::::::::::.T',
      'T*.........::..#:#####..*.R~~~*..T',
      'T........*.::..#*B*B*#....~~~~~*TT',
      'TTB..,..**.::..#**,**#....~~~~~BTT',
      'TTTTTTTTTTT::TTTTTTTTTTTTTTTTTTTTT',
    ],
    buildings: [
      { kind: 'center', x: 3, y: 3, w: 5, h: 4, door: 2, to: { map: 'centre', x: 5, y: 6, facing: 'up' } },
      { kind: 'shop', x: 10, y: 3, w: 4, h: 4, door: 1, to: { map: 'boutique', x: 4, y: 6, facing: 'up' } },
      { kind: 'gym', x: 16, y: 3, w: 5, h: 4, door: 2, roof: '#9ed36a', to: { map: 'atelierPastel', x: 7, y: 15, facing: 'up' } },
      { kind: 'house', x: 3, y: 11, w: 4, h: 4, door: 1, roof: '#c8963a', to: { map: 'musee', x: 6, y: 8, facing: 'up' } },
      { kind: 'cave', x: 17, y: 11, w: 5, h: 4, door: 2, to: { map: 'grotte1', x: 11, y: 14, facing: 'up' } },
      // the artists' quarter: the pastel painter's studio, the museum guard's family, a grandmother and her grandson
      { kind: 'house', x: 23, y: 2, w: 4, h: 4, door: 2, roof: '#e89ab8', to: { map: 'maisonAtelier', x: 5, y: 6, facing: 'up' } },
      { kind: 'house', x: 28, y: 2, w: 4, h: 4, door: 1, roof: '#8ab8e0', to: { map: 'maisonVille', x: 4, y: 6, facing: 'up' } },
      { kind: 'house', x: 29, y: 10, w: 4, h: 4, door: 1, roof: '#b89ad8', to: { map: 'maisonPetite', x: 3, y: 5, facing: 'up' } },
    ],
    warps: [
      { x: 11, y: 19, to: { map: 'route1', x: 7, y: 1, facing: 'down' } },
      { x: 12, y: 19, to: { map: 'route1', x: 8, y: 1, facing: 'down' } },
      { x: 0, y: 9, to: { map: 'route2', x: 38, y: 6, facing: 'left' } },
      { x: 0, y: 10, to: { map: 'route2', x: 38, y: 7, facing: 'left' } },
    ],
    triggers: [
      { x: 2, y: 9, w: 1, h: 2, script: 'pastelWestGate', unless: 'badge:pastel' },
      // coming out of the Atelier with the badge: Lison and her drawing (the second choice)
      { x: 16, y: 7, w: 5, h: 2, script: 'pastelDrawing', if: 'badge:pastel', unless: 'choix:musee' },
    ],
    items: [{ x: 22, y: 1, item: 'page-3', hidden: true }],
    signs: [
      { x: 2, y: 12, text: L('VILLE-PASTEL\nLa ville aux mille couleurs.\nAtelier de Mireille · Auberge · Boutique · Musée', 'PASTEL CITY\nThe city of a thousand colours.\nMireille’s Atelier · Inn · Shop · Museum') },
      { x: 15, y: 6, text: L('ATELIER PASTEL\nMaître d’Atelier : Mireille\n« Des ailes, des antennes et mille couleurs ! »', 'PASTEL ATELIER\nAtelier Master: Mireille\n“Wings, antennae and a thousand colours!”') },
      { x: 24, y: 8, text: L('JARDIN DES PAPILLONS\nOn regarde avec les yeux : les Bestioles Insecte font la sieste dans les fleurs.', 'BUTTERFLY GARDEN\nLook with your eyes only: Bug Critters are napping in the flowers.') },
    ],
    npcs: [
      { id: 'tradeVille', x: 4, y: 17, look: LOOKS.kid, facing: 'up', script: 'trade_ville' },
      { id: 'westGuard', x: 2, y: 8, look: LOOKS.hiker, facing: 'down', script: 'pastelWestGuard' },
      { id: 'caveGuard', x: 19, y: 15, look: { hair: '#3a2a1a', shirt: '#c08030', pants: '#4a4a5a', hat: '#f2c14e' }, facing: 'down', hideIf: 'badge:plume',
        text: [L('La Grotte Gribouillis est fermée : on entend des bruits de gomme là-dedans…', 'Scribble Cave is closed: you can hear erasers scrubbing in there…'), L('Reviens quand tu auras le badge de Village-Plume, je te laisserai passer.', 'Come back with the Featherby badge and I’ll let you through.')] },
      { id: 'capucine', x: 7, y: 16, look: LOOKS.girl, facing: 'left', script: 'touffouGift' },
      { id: 'lison', x: 15, y: 8, look: { hair: '#c0582a', shirt: '#f6a7c8', pants: '#5a4a8a', longHair: true }, facing: 'right', script: 'pastelDrawing', showIf: 'badge:pastel', hideIf: 'choix:musee' },
      { id: 'granny', x: 8, y: 9, look: LOOKS.granny, facing: 'down', wander: true, text: [
        L('Ici, tout est dessiné aux pastels. Quand il pleut, les couleurs coulent un peu, c’est joli !', 'Everything here is drawn in pastels. When it rains, the colours run a little. It’s pretty!'),
        L('Et nos haies sont toujours bien taillées : c’est Pistache, notre guide vert. Il garde ses ciseaux pour qui gagnera un badge à l’Atelier.', 'And our hedges are always neatly trimmed: that’s Pistachio, our green guide. He keeps his scissors for whoever wins a badge at the Atelier.'),
      ] },
      { id: 'kid2', x: 19, y: 8, look: { hair: '#5a3a20', shirt: '#f8d030', pants: '#3a5aa8' }, facing: 'left', wander: true, text: [L('Mireille, la Maître d’Atelier, adore les Bestioles Insecte. Le Feu, elles détestent !', 'Mireille, the Atelier Master, loves Bug Critters. They hate Fire!')] },
      guideNpc('vert'),
      // the Chalk Square: a painter at her easel, a kid drawing a hopscotch
      { id: 'pastelPeintre', x: 14, y: 11, look: { hair: '#5a3a2a', shirt: '#f6c8a0', pants: '#7a6aa8', hat: '#e88aa8', longHair: true }, facing: 'left', text: [
        L('Je peins la fontaine aux pastels. Le problème, c’est qu’elle change de couleur chaque fois que le soleil bouge !', 'I’m painting the fountain in pastels. The trouble is, it changes colour every time the sun moves!'),
        L('Tu vas vers Village-Plume ? Ma cousine Mimosa pêche sur la rivière, là-bas. « Jaune pêche sous la pluie » : son ciré jaune, tu ne peux pas le rater !', 'Heading to Featherby? My cousin Mimosa fishes on the river there. “Yellow fishes in the rain”: you can’t miss her yellow raincoat!'),
      ] },
      { id: 'pastelCraie', x: 10, y: 13, look: { hair: '#2a2238', shirt: '#9ad0f0', pants: '#f2a0c0' }, facing: 'down', wander: true, text: [
        L('Je dessine une marelle à la craie sur la place ! Quand il pleut, elle s’efface… alors on en dessine une nouvelle.', 'I’m drawing a hopscotch in chalk on the square! When it rains it washes away… so we draw a new one.'),
      ], afterStory: {
        text: [L('Depuis ton retour, ma marelle tient mieux. Quand il pleut, elle s’efface quand même un peu… Tant mieux : on en redessine une !', 'Since you came back, my hopscotch holds better. When it rains it still fades a little… Good: we draw a new one!')],
      } },
      { id: 'pastelPapivole', x: 26, y: 9, mon: '007', look: LOOKS.kid, facing: 'left', wander: true, text: [
        L('Le Papivole volette de fleur en fleur. Il laisse derrière lui une traînée de poudre rose.', 'The Flutterbug flits from flower to flower, leaving a trail of pink powder behind it.'),
      ] },
    ],
    residents: [
      // the pastel painter, who taught Mireille to draw, and her Lunelle
      { id: 'pastelliste', x: 7, y: 3, look: { hair: '#d8d0c8', shirt: '#f29ac8', pants: '#5a8a9a', hat: '#9ed36a', longHair: true }, facing: 'right', fromDoor: [['ville', 25, 6]], text: [
        L('Les pastels, c’est de la craie de toutes les couleurs. On dessine, on estompe avec le doigt… et on se lave les mains trois fois !', 'Pastels are chalk in every colour. You draw, you smudge it with a finger… and you wash your hands three times!'),
        L('Mireille venait dessiner ici quand elle avait ton âge. Elle ne dessinait que des chenilles ! Et regarde ses papillons, aujourd’hui…', 'Mireille used to come and draw here when she was your age. She only ever drew caterpillars! And look at her butterflies today…'),
      ] },
      { id: 'pastellisteMon', x: 4, y: 4, mon: '006', look: LOOKS.kid, facing: 'down', fromDoor: [['ville', 25, 6]], text: [
        L('La Lunelle s’est endormie sur une boîte de pastels. Elle a du rose plein les oreilles.', 'The Moonbun fell asleep on a box of pastels. Its ears are all pink.'),
      ] },
      // the museum guard and his daughter
      { id: 'gardienMusee', x: 6, y: 2, look: { hair: '#3a2a1a', shirt: '#5a6aa8', pants: '#2a3a5a', hat: '#2a3a5a' }, facing: 'down', fromDoor: [['ville', 29, 6]], text: [
        L('Je suis gardien au Musée des premiers croquis. Mon travail ? Dire « On ne touche pas ! » deux cents fois par jour.', 'I’m a guard at the Museum of First Sketches. My job? Saying “Don’t touch!” two hundred times a day.'),
        L('Ces dessins sont les tout premiers de chaque Bestiole. Un peu de travers, un peu dépassés… C’est ce qui les rend précieux.', 'Those are the very first drawings of each Critter. A bit crooked, a bit over the lines… That’s what makes them precious.'),
      ] },
      { id: 'gardienFille', x: 2, y: 5, look: { hair: '#3a2a1a', shirt: '#f8d030', pants: '#e07aa6', longHair: true }, facing: 'right', wander: true, fromDoor: [['ville', 29, 6]], text: [
        L('Le Prof. Fusain est passé en ville ! Il a pris ma Bestiole en photo. Clic-clac ! Comme ça, elle ne se perdra jamais.', 'Prof. Charcoal came to town! He took a picture of my Critter. Click-clack! That way it will never get lost.'),
      ] },
      // a grandmother, and her grandson who draws bugs
      { id: 'pastelMamie', x: 3, y: 2, look: LOOKS.grandma, facing: 'down', fromDoor: [['ville', 30, 14]], text: [
        L('Quand j’étais petite, Ville-Pastel n’avait que trois couleurs. Aujourd’hui, on n’arrive même plus à les compter !', 'When I was little, Pastel City only had three colours. Today nobody can even count them!'),
      ], afterStory: {
        text: [L('Tu as fait un si long voyage ! Tu dois avoir faim, et ta Bestiole aussi.', 'You’ve been on such a long journey! You must be hungry, and your Critter too.')],
        gift: { item: 'gouter', text: L('Tiens, un goûter. Un dessin qui a faim, c’est un dessin qui grandit !', 'Here, a snack. A hungry drawing is a growing drawing!') },
      } },
      { id: 'pastelGamin', x: 4, y: 3, look: { hair: '#8a4a2a', shirt: '#9ed36a', pants: '#3a5aa8' }, facing: 'left', fromDoor: [['ville', 30, 14]], text: [
        L('À l’Atelier, Mireille garde son jardin derrière une grille. Pour l’ouvrir, on pousse de gros blocs de gomme sur des dalles.', 'At the Atelier, Mireille keeps her garden behind a gate. To open it, you push big eraser blocks onto plates.'),
        L('Moi, j’ai poussé le mien dans un coin… Coincé ! J’ai dû sortir et revenir pour qu’il retourne à sa place.', 'I pushed mine into a corner… Stuck! I had to go out and come back in for it to go back to its place.'),
      ] },
      { id: 'pastelGaminMon', x: 5, y: 4, mon: '012', look: LOOKS.kid, facing: 'left', wander: true, fromDoor: [['ville', 30, 14]], text: [
        L('Le Chenillou grignote le bord du tapis. Miam, du tapis.', 'The Wigglet nibbles the edge of the rug. Yum, rug.'),
      ] },
    ],
  },

  atelierPastel: {
    id: 'atelierPastel',
    name: L('Atelier Pastel', 'Pastel Atelier'),
    indoor: true,
    border: 'void',
    backdrop: 'lab',
    // Mireille's butterfly greenhouse is behind a gate: the two eraser blocks of the studio, pushed onto the two
    // plates below it, open it (the first Atelier: a gentle one, ateliers/pastel.test.ts)
    rows: [
      'WWwWWWwWWWwWWWW',
      'WB***.ccc.***BW',
      'W*B*..ccc..*B*W',
      'W***.*.c.*.***W',
      'WB.*...c...*.BW',
      'WCCCCCpcpCCCCCW',
      'Wfff@ffcff@fffW',
      'WffffffcffffffW',
      'WpfffffcfffffpW',
      'WffffffcffffffW',
      'WffffffcffffffW',
      'WtCCCCfcfCCCCtW',
      'WffffffcffffffW',
      'WftffffcfffftfW',
      'WffffffcffffffW',
      'WpfffffcfffffpW',
      'WWWWWWWXWWWWWWW',
    ],
    obstacles: [{ x: 4, y: 8, kind: 'block' }, { x: 9, y: 8, kind: 'block' }],
    puzzles: [{ flag: 'puzzle:pastelGate', plates: [[4, 6], [10, 6]] }],
    patches: [{ id: 'pastelGate', x: 7, y: 5, rows: ['G'], unless: 'puzzle:pastelGate' }],
    warps: [{ x: 7, y: 16, to: { map: 'ville', x: 18, y: 7, facing: 'down' } }],
    npcs: [
      { id: 'mireille', x: 7, y: 2, look: LOOKS.leaderPastel, facing: 'down', trainer: 'mireille', sight: 1 },
      { id: 'pastelT1', x: 4, y: 13, look: LOOKS.girl, facing: 'right', trainer: 'pastelT1', sight: 3 },
      { id: 'pastelT2', x: 1, y: 7, look: LOOKS.kid, facing: 'right', trainer: 'pastelT2', sight: 3 },
      { id: 'pastelT3', x: 13, y: 7, look: { hair: '#f2d05a', shirt: '#5a4a8a', pants: '#9ed36a' }, facing: 'left', trainer: 'pastelT3', sight: 4 },
      { id: 'pastelT4', x: 5, y: 4, look: { hair: '#8a4a2a', shirt: '#f6a7c8', pants: '#7a6aa8', hat: '#f2d23e', longHair: true }, facing: 'right', trainer: 'pastelT4', sight: 2 },
      { id: 'pastelGuide', x: 5, y: 15, look: { hair: '#3a2a1a', shirt: '#ffffff', pants: '#5a8ad6' }, facing: 'right',
        text: [
          L('Bienvenue à l’Atelier Pastel ! Mireille dessine des Bestioles Insecte. Le Feu leur fait peur, et les Bestioles Fée encaissent bien leurs piqûres.', 'Welcome to the Pastel Atelier! Mireille draws Bug Critters. Fire scares them, and Fairy Critters shrug off their stings.'),
          L('Mireille attend dans sa serre aux papillons, derrière la grille. Pousse les gros blocs de gomme sur les dalles pour l’ouvrir !', 'Mireille is waiting in her butterfly greenhouse, behind the gate. Push the big eraser blocks onto the plates to open it!'),
          L('Un bloc coincé dans un coin ? Sors de l’Atelier et reviens : tout se remet en place. Bonne chance !', 'A block stuck in a corner? Step out of the Atelier and come back: everything goes back in place. Good luck!'),
        ] },
    ],
  },

  route2: {
    id: 'route2',
    name: L('Route des Craies', 'Chalk Lane'),
    border: 'tree',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T....TTTTTT.....*.TTT..TT.*.TTTTTT....*T',
      'T.*...TTTT........TTT..T~~~~~TTTTR..*..T',
      'T.""...TTT......S.TTT.TT~~~~~~TT..*..R.T',
      'T."".*..TT.S......TTT...~~~~~~TT...*T..T',
      'T.......TT...:...TTTTT...~~~~..........T',
      ':::::..TTT.:::::""""""....~~..TT"".:::::',
      ':::::..TTT::::::"""""":::.....TT"".:::::',
      'T...:..TTT::...."""""":::...R..T"".....T',
      'T..""..TTT::#####TTTTT"::.....TT""_____T',
      'T__""__TTT::B***BTTTTT"::____.TT"".....T',
      'T.."".TTTT::B***BTTTTT"::.*..TTTT.:::..T',
      'T...."""""".B***BTTTT..::..."""""":...,T',
      'T___."""""".#####TTTT..:::::"""""":""".T',
      'T....""""""......TTTT.*.....""""""."R".T',
      'T..R..TTTTTT,*...TTTTTT"""""*TTTTT."""*T',
      'T*..*.TTTTTT...*.TTTTTT"""""TTTTTT*""".T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    ],
    buildings: [
      { kind: 'house', x: 12, y: 1, w: 4, h: 4, door: 1, roof: '#e6a23a', to: { map: 'pension', x: 4, y: 6, facing: 'up' } },
    ],
    // a bush hides the nook of the stencil; a chalk rock plugs a short way through the trees (mallet)
    obstacles: [{ x: 21, y: 3, kind: 'bush' }, { x: 31, y: 5, kind: 'rock' }],
    warps: [
      { x: 39, y: 6, to: { map: 'ville', x: 1, y: 9, facing: 'right' } },
      { x: 39, y: 7, to: { map: 'ville', x: 1, y: 10, facing: 'right' } },
      { x: 0, y: 6, to: { map: 'bois', x: 40, y: 7, facing: 'left' } },
      { x: 0, y: 7, to: { map: 'bois', x: 40, y: 8, facing: 'left' } },
    ],
    signs: [{ x: 11, y: 4, text: L('PENSION CRAYONNÉE\nOn garde vos Bestioles !', 'PENCIL DAY CARE\nWe look after your Critters!') }, { x: 16, y: 3, text: L('ROUTE DES CRAIES\n← Bois Brumeux   → Ville-Pastel', 'CHALK LANE\n← Misty Woods   → Pastel City') }],
    npcs: [
      { id: 'r2b', x: 33, y: 11, look: { hair: '#6a4a2a', shirt: '#5a8a3a', pants: '#5a4a3a', hat: '#e0a030', longHair: true }, facing: 'down', trainer: 'r2b', sight: 4 },
      { id: 'r2a', x: 25, y: 9, look: { hair: '#e8e8f0', shirt: '#f29ac8', pants: '#5a8ad6' }, facing: 'left', trainer: 'r2a', sight: 3 },
      { id: 'ninon', x: 14, y: 8, look: LOOKS.girl, facing: 'up', trainer: 'ninon', sight: 3 },
      { id: 'pierrot', x: 1, y: 9, look: LOOKS.kid, facing: 'right', trainer: 'pierrot', sight: 3 },
    ],
    items: [{ x: 1, y: 12, item: 'potion' }, { x: 22, y: 10, item: 'crayon-ball', count: 2 }, { x: 17, y: 1, item: 'pochoir-12' }, { x: 6, y: 5, item: 'crayon-vert' }, { x: 22, y: 1, item: 'pochoir-19' }, { x: 21, y: 1, item: 'baie-doree', count: 2 },
      // the far bank of the pond, by boat
      { x: 26, y: 1, item: 'rappel' }],
    berries: [{ x: 12, y: 11, item: 'baie-peche' }],
    encounters: {
      rate: 21,
      table: [
        { id: '013', w: 28, min: 5, max: 7, time: 'day' },
        { id: '012', w: 20, min: 5, max: 7 },
        { id: '004', w: 18, min: 6, max: 7 },
        { id: '006', w: 28, min: 6, max: 7, time: 'night' },
        { id: '005', w: 14, min: 6, max: 7 },
        { id: '008', w: 4, min: 7, max: 7 },
        { id: '015', w: 6, min: 6, max: 7 },
        { id: '062', w: 14, min: 5, max: 7 },
        { id: '089', w: 14, min: 5, max: 7 },
        { id: '091', w: 14, min: 5, max: 7, time: 'night' },
      ],
    },
  },

  // the first sketches of the Bestioles, framed: her original drawings (src/data/originals.ts)
  musee: {
    id: 'musee',
    name: L('Musée des premiers croquis', 'Museum of First Sketches'),
    indoor: true,
    border: 'void',
    backdrop: 'lab',
    rows: [
      'WqqqqqqqqqqqW',
      'pfffffffffffp',
      'fffffffffffff',
      'fffffffffffff',
      'fqqqqqfqqqqqf',
      'fffffffffffff',
      'fffffcccfffff',
      'pffffcccffffp',
      'fffffcccfffff',
      'WWWWWWXWWWWWW',
    ],
    warps: [{ x: 6, y: 9, to: { map: 'ville', x: 4, y: 15, facing: 'down' } }],
    // eleven frames along the back wall, ten on the stand in the middle, in Bestiodex order
    interact: [
      ...Array.from({ length: 11 }, (_, i) => ({ x: 1 + i, y: 0, script: `musee:${String(i + 1).padStart(3, '0')}` })),
      ...[1, 2, 3, 4, 5, 7, 8, 9, 10, 11].map((x, i) => ({ x, y: 4, script: `musee:${String(i + 12).padStart(3, '0')}` })),
    ],
    npcs: [
      { id: 'conservatrice', x: 9, y: 7, look: { hair: '#d8d0c8', shirt: '#7a3dc2', pants: '#3a3346', longHair: true }, facing: 'left', script: 'musee' },
      { id: 'museeKid', x: 3, y: 2, look: LOOKS.kid, facing: 'up', wander: true,
        text: [L('Celui-là, on dirait mon petit frère qui dessine ! Mais en mieux… enfin, pareil.', 'That one looks like something my little brother would draw! But better… well, the same.')] },
      { id: 'lisonMusee', x: 7, y: 2, look: { hair: '#c0582a', shirt: '#f6a7c8', pants: '#5a4a8a', longHair: true }, facing: 'up', script: 'lisonMusee', showIf: 'choix:musee' },
    ],
  },

  pension: {
    id: 'pension',
    name: L('Pension Crayonnée', 'Pencil Day Care'),
    indoor: true,
    border: 'void',
    backdrop: 'lab',
    rows: [
      'WWwWWWwWW',
      'bbfffffPv',
      'fffCCCfff',
      'fffffffff',
      'pfffffftt',
      'fffffffff',
      'fffffffff',
      'WWWWXWWWW',
    ],
    warps: [{ x: 4, y: 7, to: { map: 'route2', x: 13, y: 5, facing: 'down' } }],
    npcs: [
      { id: 'mamiePension', x: 4, y: 1, look: LOOKS.granny, facing: 'down', script: 'pension' },
      { id: 'papiPension', x: 1, y: 3, look: LOOKS.hiker, facing: 'right',
        text: [L('Deux Bestioles de la même famille, laissées ensemble ici… parfois, on trouve un œuf ! Personne ne sait d’où il vient.', 'Two Critters of the same family left here together… sometimes, an egg turns up! Nobody knows where it comes from.')] },
    ],
    items: [{ x: 7, y: 6, item: 'pierre-immuable' }],
  },

  bois: {
    id: 'bois',
    name: L('Bois Brumeux', 'Misty Woods'),
    border: 'tree',
    backdrop: 'forest',
    tint: 'rgba(60, 50, 120, 0.3)',
    fog: true,
    rows: [
      'TTTTTTTTTTTTTTTTTT:TTTTTTTTTTTTTTTTTTTTTTT',
      'T*.....TTTTTTTT......TTTTTTT..*.TTTTTTTTTT',
      'T......*TTTTTTT...:..TTTTT*...::"""TTTTTTT',
      'T.......TTTTTT"...::"""TTT."".:.TT"TTTTTTT',
      'T.......TTTTT""...:..T"TTTT""::*TT""TTTTTT',
      'T.......TTTT""TT..:..T"TTTTTT"TTTTT:*TTTTT',
      'T*.:."".TT.T"TTTTTTTTT::*.RTT"TTTTT::TTTTT',
      'TT.:::":...::TTTTTTTTT.:::.T""TTTT..::::::',
      'TTT:TTT:::::.TTTTTTTTT.*.::""TTTTT*.::::::',
      'TTT:TTTT*..:*TTTTTTTTTTTTTTTTTTTTT.::.""*T',
      'T*.:.*TTTTT:TTTTTTT*.......RTTT"""":..""TT',
      'T..:"".TTTT:TTTT.T:::::::::::T"""TT....*TT',
      'T..:"".BTTT:"""""":....~~~~.:."TTTTTTTTTTT',
      'T..:...TTTTT""""""."""~~~~~~.TTTTTTTTTTTTT',
      'T.*:..TTTTTTTTTTTTT""".~~~~TTTTTTTTTTTTTTT',
      'TTT:TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    ],
    // the grunts rub out the woods; beating them brings the trees back (and opens a nook by the way out)
    patches: [{ id: 'boisErased', x: 8, y: 1, rows: ['eeee?eeee', 'eeee?eeee'], unless: 'a1.bois' }],
    buildings: [{ kind: 'tower', x: 2, y: 1, w: 4, h: 5, door: 1, script: 'gateTour' }],
    // a gap in the brambles to the south: the Lost Woods (after the 6th badge)
    triggers: [{ x: 3, y: 15, script: 'boisPerduGate' }],
    items: [{ x: 18, y: 12, item: 'crayon-ball', count: 3 }, { x: 1, y: 14, item: 'super-potion' }, { x: 1, y: 13, item: 'page-4', hidden: true }, { x: 20, y: 4, item: 'baie-cerise' }, { x: 6, y: 3, item: 'crayon-olive' },
      // in the nook the grunts had rubbed out, once the trees are back
      { x: 15, y: 1, item: 'super-crayon-ball', hidden: true }],
    warps: [
      { x: 41, y: 7, to: { map: 'route2', x: 1, y: 6, facing: 'right' } },
      { x: 41, y: 8, to: { map: 'route2', x: 1, y: 7, facing: 'right' } },
      { x: 18, y: 0, to: { map: 'plume', x: 11, y: 16, facing: 'up' } },
    ],
    npcs: [
      { id: 'b4', x: 37, y: 11, look: { hair: '#8a4a2a', shirt: '#c05a5a', pants: '#5a4a3a', hat: '#f4f4f8', longHair: true }, facing: 'up', trainer: 'b4', sight: 4 },
      { id: 'b3', x: 29, y: 3, look: { hair: '#4a3020', shirt: '#5a8a3a', pants: '#8a6a3a', hat: '#5a8a3a' }, facing: 'down', trainer: 'b3', sight: 3 },
      { id: 'luna', x: 10, y: 6, look: LOOKS.ghostgirl, facing: 'down', trainer: 'luna', sight: 3 },
      { id: 'paul', x: 16, y: 11, look: LOOKS.hiker, facing: 'down', trainer: 'paul', sight: 3 },
      { id: 'gomme1', x: 22, y: 7, look: LOOKS.gomme, facing: 'up', trainer: 'gomme1', sight: 3 },
      { id: 'gomme2', x: 18, y: 1, look: LOOKS.gommeF, facing: 'down', trainer: 'gomme2', sight: 4, hideIf: 'a1.bois' },
      // the little cocoon of Route 1, the grunt's prisoner: it joins you once the grunt is beaten
      { id: 'coconBois', x: 17, y: 1, look: LOOKS.kid, mon: '073', facing: 'down', showIf: 'a1.r1seen', hideIf: 'gift:coconfus',
        text: [L('Le petit cocon de la route ! Il est coincé derrière le Sbire Gomme. Il tremble…', 'The little cocoon from the road! It’s stuck behind the Eraser Grunt. It’s trembling…')] },
      { id: 'lucioleKid', x: 5, y: 13, look: LOOKS.kid, facing: 'left', wander: false,
        text: [L('Derrière les ronces, au sud, des lucioles dansent la nuit. Ma grande sœur dit qu’elles montrent le chemin d’une clairière… mais il ne faut jamais les perdre de vue !', 'Past the brambles to the south, fireflies dance at night. My big sister says they show the way to a clearing… but you must never lose sight of them!')] },
    ],
    berries: [{ x: 7, y: 12, item: 'baie-reveil' }],
    encounters: {
      rate: 14,
      table: [
        { id: '009', w: 45, min: 7, max: 9, time: 'night' },
        { id: '007', w: 14, min: 8, max: 9 },
        { id: '012', w: 8, min: 7, max: 8 },
        { id: '013', w: 12, min: 7, max: 9 },
        { id: '005', w: 12, min: 8, max: 9 },
        { id: '006', w: 12, min: 8, max: 9 },
        { id: '004', w: 8, min: 8, max: 9 },
        { id: '008', w: 4, min: 8, max: 9 },
        { id: '001', w: 3, min: 8, max: 9 },
        { id: '015', w: 8, min: 7, max: 9 },
        { id: '062', w: 10, min: 8, max: 9 },
        { id: '089', w: 10, min: 7, max: 9 },
        { id: '091', w: 12, min: 7, max: 9, time: 'night' },
      ],
    },
  },
};
