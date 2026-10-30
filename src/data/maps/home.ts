import { L } from '../../i18n';
import type { MapDef } from '../../overworld/mapTypes';
import { LOOKS } from '../../overworld/sprites';

/** Bourg-Gribouille: home, the rival's house, the lab, and Crayon Road up to Ville-Pastel. */
export const HOME_MAPS: Record<string, MapDef> = {
  maison: {
    id: 'maison',
    name: L('Maison', 'Home'),
    indoor: true,
    border: 'void',
    backdrop: 'lab',
    rows: [
      'WWwWWWwWW',
      'vffffffbb',
      'fffffffff',
      'fttffffff',
      'fttffffhf',
      'pffffffff',
      'fffffffff',
      'WWWWXWWWW',
    ],
    warps: [{ x: 4, y: 7, to: { map: 'bourg', x: 3, y: 6, facing: 'down' } }],
    npcs: [{ id: 'mom', x: 3, y: 3, look: LOOKS.mom, facing: 'left', script: 'mom' }],
    interact: [{ x: 7, y: 4, script: 'bed' }, { x: 0, y: 1, script: 'homeTv' }],
    items: [{ x: 8, y: 1, item: 'page-1', hidden: true }],
  },

  maisonRival: {
    id: 'maisonRival',
    name: L('Maison de {rival}', '{rival}’s house'),
    indoor: true,
    border: 'void',
    backdrop: 'lab',
    rows: [
      'WWwWWWwWW',
      'bbffffffv',
      'fffffffff',
      'ffffttfff',
      'ffffttfff',
      'pffffffff',
      'fffffffff',
      'WWWWXWWWW',
    ],
    warps: [{ x: 4, y: 7, to: { map: 'bourg', x: 15, y: 6, facing: 'down' } }],
    npcs: [{ id: 'grandma', x: 6, y: 3, look: LOOKS.grandma, facing: 'left', script: 'rivalGrandma' }],
  },

  // the player's village: home, the rival's house and the lab (kept where they were; the opening scenes walk the
  // main street and the north road), with the drawing teacher's studio, a family's house, the square of the First
  // Line, the pond and its angler, a vegetable garden and an orchard (it grew to the east and the south)
  bourg: {
    id: 'bourg',
    onEnter: 'visitTown',
    name: L('Bourg-Gribouille', 'Scribbleton'),
    border: 'tree',
    rows: [
      'TTTTTTTTT::TTTTTTTTTTTTTTTTTTT',
      'T*....**.::.......*.......*TTT',
      'T........::.......B*......**TT',
      'T........::........*......**BT',
      'T........::...............B..T',
      'T........::......M..S....M...T',
      'T.M:::::::::::::::::::::::...T',
      'T............:....:..........T',
      'T..S.........:.:::::::.**....T',
      'T............:.:B***B:..B*.BBT',
      'T**..........:::**S**:.....**T',
      'T**..........:.:B***B:.....**T',
      'T**..........:.:::::::.....**T',
      'TBB..........:....:...M......T',
      'T..R~~~~R::::::::::::::::....T',
      'T..~~~~~~..###:###S..........T',
      'T..~~~~~~..#BB:BB#..T*T.T*T.BT',
      'T*.R~~~~R..#:::::#.*...*..*..T',
      'T*..ssss...#BB:BB#..*T.T.T.T.T',
      'T.*........#:::::#....*......T',
      'T..........#######.B....*..RBT',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    ],
    surf: { rate: 2, table: [{ id: '003', w: 100, min: 5, max: 8 }, { id: '101', w: 70, min: 5, max: 8 }] },
    fishing: { low: [{ id: '099', w: 150, min: 5, max: 8 }, { id: '003', w: 60, min: 5, max: 8 }], mid: [{ id: '099', w: 100, min: 12, max: 16 }, { id: '003', w: 100, min: 12, max: 16 }], high: [{ id: '003', w: 100, min: 15, max: 21 }, { id: '099', w: 50, min: 15, max: 19 }] },
    buildings: [
      { kind: 'house', x: 2, y: 2, w: 4, h: 4, door: 1, to: { map: 'maison', x: 4, y: 6, facing: 'up' } },
      { kind: 'house', x: 13, y: 2, w: 4, h: 4, door: 2, roof: '#4a7ad6', to: { map: 'maisonRival', x: 4, y: 6, facing: 'up' } },
      { kind: 'lab', x: 6, y: 9, w: 7, h: 5, door: 3, to: { map: 'labo', x: 5, y: 8, facing: 'up' } },
      // the drawing teacher's studio, and a family's house by the square
      { kind: 'house', x: 21, y: 2, w: 4, h: 4, door: 1, roof: '#e8a838', to: { map: 'maisonAtelier', x: 5, y: 6, facing: 'up' } },
      { kind: 'house', x: 23, y: 10, w: 4, h: 4, door: 1, roof: '#5aa05a', to: { map: 'maisonVille', x: 4, y: 6, facing: 'up' } },
    ],
    warps: [
      { x: 9, y: 0, to: { map: 'route1', x: 7, y: 40, facing: 'up' } },
      { x: 10, y: 0, to: { map: 'route1', x: 8, y: 40, facing: 'up' } },
    ],
    triggers: [
      { x: 9, y: 1, w: 2, h: 1, script: 'profStops', unless: 'rival1' },
      { x: 9, y: 1, w: 2, h: 2, script: 'momShoes', if: 'rival1', unless: 'shoes' },
    ],
    signs: [
      { x: 3, y: 8, text: L('BOURG-GRIBOUILLE\nLà où tout commence au crayon.', 'SCRIBBLETON\nWhere everything starts with a pencil.') },
      { x: 18, y: 10, text: L('PLACE DU PREMIER TRAIT\nOn raconte que Papeterre a commencé ici, par un tout petit trait de crayon.', 'FIRST LINE SQUARE\nThey say Papeterra began right here, with one tiny pencil line.') },
      { x: 20, y: 5, text: L('COURS DE DESSIN\nPour les petits et les grands.\nGommes interdites !', 'DRAWING LESSONS\nFor young and old.\nNo erasers allowed!') },
      { x: 18, y: 15, text: L('POTAGER\nNe pas marcher sur les choux. Ça vaut aussi pour les Chenillou.', 'VEGETABLE GARDEN\nDon’t step on the cabbages. That goes for Wigglets too.') },
    ],
    npcs: [
      // kid1 wanders between home and the north road, off the street Mom runs along (momShoes)
      { id: 'kid1', x: 6, y: 3, look: LOOKS.kid, facing: 'down', wander: true, text: [L('Tu as vu le ciel ? Il y a des lignes dedans, comme sur un cahier d’école !', 'Have you seen the sky? It has lines in it, like a school notebook!')], afterStory: { text: [L('Le ciel a toujours ses lignes de cahier… Mais depuis que tu es {g:revenue|revenu}, j’ai l’impression que quelqu’un nous regarde, tout là-haut. Et qu’il sourit.', 'The sky still has its notebook lines… But since you came back, I feel like someone up there is watching us. And smiling.')] } },
      { id: 'girl1', x: 15, y: 11, look: LOOKS.girl, facing: 'left', wander: true, text: [L('Dans les hautes herbes, des Bestioles sauvages se cachent. Il faut une Bestiole pour s’y aventurer.', 'Wild Critters hide in the tall grass. You need a Critter of your own to go in there.')] },
      { id: 'bourgVoisine', x: 4, y: 11, look: { hair: '#c0582a', shirt: '#f2c14e', pants: '#4a7ad6', longHair: true }, facing: 'right', wander: true, text: [
        L('Le Prof. Fusain m’a encore prise en photo ce matin. J’avais les cheveux en bataille ! « Clic-clac », qu’il a fait.', 'Prof. Charcoal took my picture again this morning. My hair was a mess! “Click-clack,” he went.'),
      ] },
      { id: 'bourgPapi', x: 17, y: 12, look: { hair: '#e8e8f0', shirt: '#a05a3a', pants: '#4a4a5a' }, facing: 'up', text: [
        L('Quand j’étais petit, le bourg n’avait qu’une maison et un crayon. Le reste, on l’a dessiné petit à petit.', 'When I was little, the village had one house and one pencil. We drew the rest bit by bit.'),
        L('Ces fleurs-là, c’est ta maman qui les a plantées. Enfin… elle les a dessinées, et elles ont poussé.', 'Your mom planted those flowers. Well… she drew them, and they grew.'),
      ] },
      { id: 'bourgFacteur', x: 26, y: 7, look: { hair: '#5a3a20', shirt: '#4a7ad6', pants: '#2a3a5a', hat: '#f2c14e' }, facing: 'left', wander: true, text: [
        L('Ici, personne n’écrit de lettres : on s’envoie des dessins ! Ma sacoche est pleine de chats, de soleils et de maisons.', 'Nobody writes letters here: people send each other drawings! My bag is full of cats, suns and houses.'),
      ] },
      { id: 'bourgPecheur', x: 5, y: 18, look: { hair: '#6a4a2a', shirt: '#3a8ac0', pants: '#4a4a5a', hat: '#5a8a3a' }, facing: 'up', text: [
        L('La mare du bourg a l’air toute petite, mais il paraît que des Bestioles vivent tout au fond.', 'The village pond looks tiny, but they say Critters live right at the bottom.'),
        L('J’attends qu’elles mordent depuis ce matin. Patience, patience…', 'I’ve been waiting for a bite since this morning. Patience, patience…'),
      ] },
      { id: 'bourgJardinier', x: 13, y: 17, look: { hair: '#e8e8f0', shirt: '#6a9a4a', pants: '#6a4a2a', hat: '#e8d070' }, facing: 'down', text: [
        L('Mes choux ! Ce Chenillou les grignote depuis le printemps.', 'My cabbages! That Wigglet has been nibbling them since spring.'),
        L('Bah, je le laisse faire. Un dessin qui a faim, c’est un dessin qui grandit.', 'Oh well, I let it be. A hungry drawing is a growing drawing.'),
      ] },
      { id: 'bourgChenillou', x: 15, y: 19, mon: '012', look: LOOKS.kid, facing: 'down', wander: true, text: [L('Le Chenillou mâchouille une feuille de chou, l’air très content de lui.', 'The Wigglet is munching a cabbage leaf, looking very pleased with itself.')] },
      { id: 'bourgGamin', x: 22, y: 19, look: { hair: '#2a2238', shirt: '#5bd6a0', pants: '#6a4a8a' }, facing: 'right', wander: true, text: [
        L('Je fais la course avec le Piafou. Il triche : il a des ailes !', 'I’m racing the Chirpie. It cheats: it has wings!'),
      ] },
      { id: 'bourgPiafou', x: 24, y: 17, mon: '013', look: LOOKS.kid, facing: 'left', wander: true, text: [L('Piou ! Piouuu !', 'Cheep! Cheeep!')] },
    ],
    residents: [
      // the drawing teacher's studio: she, a pupil, and the Ronflon that sits for them
      { id: 'bourgDessin', x: 9, y: 4, look: { hair: '#3a2a1a', shirt: '#e8a838', pants: '#5a4a6a', longHair: true, hat: '#d64545' }, facing: 'left', fromDoor: [['bourg', 22, 6]], text: [
        L('Bienvenue dans mon atelier ! J’apprends à dessiner à tous les enfants du bourg.', 'Welcome to my studio! I teach all the village children to draw.'),
        L('{rival} se dessine toujours plus grand que tout le monde. Et toi, tu dessinais des Bestioles partout, même sur mes murs !', '{rival} always draws himself taller than everyone else. And you drew Critters everywhere, even on my walls!'),
        L('Un conseil d’artiste : un dessin n’est jamais raté. C’est un dessin qui n’a pas fini de grandir.', 'An artist’s advice: a drawing is never a failure. It’s a drawing that hasn’t finished growing.'),
      ], afterStory: {
        text: [L('Mes élèves ne dessinent plus qu’une seule chose : toi et tes Bestioles ! Il y en a sur tous mes murs.', 'My pupils only draw one thing now: you and your Critters! They’re all over my walls.')],
        gift: { item: 'sucette-magique', n: 2, text: L('Tiens, pour la peine. Un dessin n’a jamais fini de grandir… tes Bestioles non plus !', 'Here, for your trouble. A drawing never stops growing… and neither do your Critters!') },
      } },
      { id: 'bourgEleve', x: 1, y: 4, look: { hair: '#f2d05a', shirt: '#f29ac8', pants: '#3a5aa8', longHair: true }, facing: 'right', fromDoor: [['bourg', 22, 6]], text: [
        L('Je dessine le Ronflon. C’est mon troisième dessin aujourd’hui… et il n’a toujours pas ouvert un œil.', 'I’m drawing the Snoozle. It’s my third drawing today… and it still hasn’t opened an eye.'),
      ] },
      { id: 'bourgRonflon', x: 5, y: 4, mon: '008', look: LOOKS.kid, facing: 'left', fromDoor: [['bourg', 22, 6]], text: [L('Le Ronflon pose pour les élèves. Le modèle parfait : il ne bouge jamais.', 'The Snoozle poses for the pupils. The perfect model: it never moves.')] },
      // a family by the square: the dad's snack, the little one's scribble that moved, their Lunelle
      { id: 'bourgPapa', x: 6, y: 2, look: { hair: '#2a2238', shirt: '#e07a5a', pants: '#3a4a6a' }, facing: 'up', fromDoor: [['bourg', 24, 14]], text: [
        L('Chez nous, on goûte avec des tartines de confiture de baies. La recette vient de Mamie Cerise, la grand-mère de {rival}.', 'At our house, snack time is berry-jam toast. The recipe comes from Granny Cherry, {rival}’s grandma.'),
      ] },
      { id: 'bourgPetit', x: 2, y: 5, look: { hair: '#8a4a2a', shirt: '#f2d05a', pants: '#e07aa6' }, facing: 'right', fromDoor: [['bourg', 24, 14]], text: [
        L('J’ai fait un gribouillis… et il s’est mis à bouger ! Maman dit que c’est normal, ici.', 'I made a scribble… and it started to move! Mom says that’s normal around here.'),
      ] },
      { id: 'bourgLunelle', x: 2, y: 1, mon: '006', look: LOOKS.kid, facing: 'down', fromDoor: [['bourg', 24, 14]], text: [L('La Lunelle dort sous la fenêtre. Les soirs de pleine lune, elle danse : ça porte bonheur à toute la maison.', 'The Moonbun sleeps under the window. On full-moon nights it dances: it brings luck to the whole house.')] },
    ],
  },

  labo: {
    id: 'labo',
    name: L('Labo du Prof. Fusain', 'Prof. Charcoal’s Lab'),
    indoor: true,
    border: 'void',
    backdrop: 'lab',
    rows: [
      'WWbbWwWbbWW',
      'mfffffffffm',
      'mfffffffffm',
      'ffffttttfff',
      'fffffffffff',
      'bbfffffffbb',
      'fffffffffff',
      'pfffffffffp',
      'fffffffffff',
      'WWWWWXWWWWW',
    ],
    warps: [{ x: 5, y: 9, to: { map: 'bourg', x: 9, y: 14, facing: 'down' } }],
    // after the ending, the Prof hangs his photo of what Coconfus became beside the window (src/story/coconfus.ts)
    patches: [{ id: 'profPhoto', x: 6, y: 0, rows: ['q'], if: 'prof:photo' }],
    npcs: [
      { id: 'prof', x: 5, y: 2, look: LOOKS.prof, facing: 'down', script: 'prof' },
      { id: 'rival', x: 2, y: 4, look: LOOKS.rival, facing: 'right', script: 'rivalLab', hideIf: 'rival1' },
      { id: 'aide', x: 8, y: 6, look: { hair: '#3a2a1a', shirt: '#6cc05a', pants: '#4a4a5a', coat: true }, facing: 'left', wander: true,
        text: [L('Le prof photographie chaque Bestiole qu’il rencontre. Il dit que comme ça, aucune ne sera jamais perdue.', 'The prof takes a picture of every Critter he meets. He says that way, none will ever be lost.')] },
    ],
    interact: [
      { x: 4, y: 3, script: 'labTable' }, { x: 5, y: 3, script: 'labTable' }, { x: 6, y: 3, script: 'labTable' }, { x: 7, y: 3, script: 'labTable' },
      { x: 10, y: 1, script: 'labCamera' }, { x: 10, y: 2, script: 'labCamera' }, { x: 6, y: 0, script: 'labPhoto' },
    ],
  },

  route1: {
    id: 'route1',
    name: L('Chemin des Crayons', 'Crayon Road'),
    border: 'tree',
    rows: [
      'TTTTTTT::TTTTTTTTTTTTT',
      'T*,TT..::.,."""""".*TT',
      'T,*TT..::..""""""""".T',
      'T..*...::..""""""""".T',
      'T*...."""....****...*T',
      'TT.,TT"""T,.....*.B.TT',
      'TTTTTT"""TTTTTTTTTTTTT',
      'TTTTT."""TTTTTTTTTTTTT',
      'T.*..T"""TTTT"""TTTTTT',
      'T.."..,::..TT"""*TTTTT',
      'T."""..::,.TT""".TTTTT',
      'T""""*.::.,..""".TTTTT',
      'T."""..::....,..*..TTT',
      'T......::::::::::R.".T',
      'TT.,...::::::::::."""T',
      'T..*.TT..*...T"""T"""T',
      'T....TT..TT.TT"""T"""T',
      'T..TTTTTTTTTTT"""TTTTT',
      'TTTTTTTTTTTTTT"""TTTTT',
      'TT*...TT.""".S"""TT..T',
      'T..,:::::""":::::.*..T',
      'T..B:::::""":::::."..T',
      'T...::.*.~~~~*..."""RT',
      'T...::..~~~~~~,."""".T',
      'T*..::..~~~~~~*..""".T',
      'T..."""*~~~~~,.,...*.T',
      'TTTT"""TT~~~~T..*...TT',
      'TTTT"""TTTTTTT______TT',
      'T.*."""..,..........*T',
      'T...::::::::::::..*.*T',
      'T...::::::::::::.*.*.T',
      'T..*...,T.*..""".,R.TT',
      'TTTT...TTT..T"""T*,R.T',
      'TTTTTTTTTTTTT"""TTTTTT',
      'TTTTTTTTTTTTT"""TTTTTT',
      'T*..T...TTTTT"""TT*TTT',
      'T.*.T,...."".::..""TTT',
      'TTT....:::"":::."""".T',
      'T....*.:::"":::."""".T',
      'T..,..S::""""..R"""".T',
      'T*.....::"""".*.."".*T',
      'TTTTTTT::TTTTTTTTTTTTT',
    ],
    // Team Gomme rubbed out the gardener's tall grass near Ville-Pastel; it comes back once Mireille is beaten
    patches: [{ id: 'r1Erased', x: 12, y: 2, rows: ['eeeeeee', 'eeeeeee'], if: 'rival1', unless: 'badge:pastel' }],
    warps: [
      { x: 7, y: 0, to: { map: 'ville', x: 11, y: 18, facing: 'up' } },
      { x: 8, y: 0, to: { map: 'ville', x: 12, y: 18, facing: 'up' } },
      { x: 7, y: 41, to: { map: 'bourg', x: 9, y: 1, facing: 'down' } },
      { x: 8, y: 41, to: { map: 'bourg', x: 10, y: 1, facing: 'down' } },
    ],
    // a grunt chasing Coconfus down the road (src/story/act1.ts): across the whole route, just out of the grass
    // passage, so every way north crosses it
    triggers: [{ x: 1, y: 31, w: 20, h: 1, script: 'route1Gomme', if: 'rival1', unless: 'a1.r1seen' }],
    items: [
      { x: 14, y: 9, item: 'potion' }, { x: 1, y: 1, item: 'crayon-ball', count: 2 }, { x: 1, y: 17, item: 'page-2', hidden: true }, { x: 14, y: 5, item: 'baie-bleue' }, { x: 14, y: 10, item: 'crayon-gris' },
      // in a nook behind a bush, back with the scissors
      { x: 1, y: 35, item: 'rappel' },
    ],
    obstacles: [{ x: 3, y: 37, kind: 'bush' }],
    signs: [
      { x: 13, y: 19, text: L('↑ VILLE-PASTEL', '↑ PASTEL CITY') },
      { x: 6, y: 39, text: L('CHEMIN DES CRAYONS\n↓ Bourg-Gribouille   ↑ Ville-Pastel', 'CRAYON ROAD\n↓ Scribbleton   ↑ Pastel City') },
    ],
    npcs: [
      { id: 'r1a', x: 12, y: 36, look: { hair: '#2a2238', shirt: '#f2c14e', pants: '#3a5aa8', longHair: true }, facing: 'down', trainer: 'r1a', sight: 4 },
      { id: 'iris', x: 3, y: 24, look: LOOKS.girl, facing: 'right', trainer: 'iris', sight: 5 },
      { id: 'leo', x: 12, y: 12, look: LOOKS.kid, facing: 'left', trainer: 'leo', sight: 5 },
      { id: 'r1b', x: 5, y: 7, look: { hair: '#c0582a', shirt: '#4a9a5a', pants: '#2a3a5a', hat: '#f08a3a' }, facing: 'right', trainer: 'r1b', sight: 4 },
      { id: 'gardener', x: 12, y: 4, look: LOOKS.granny, facing: 'left', showIf: 'rival1', hideIf: 'badge:pastel',
        text: [L('Un drôle de type en gris est passé avec une gomme géante… et pouf ! Mes hautes herbes ont disparu !', 'A strange fellow in grey came by with a giant eraser… and poof! My tall grass vanished!'), L('Il parlait d’un « Grand Effaceur »… Brr.', 'He talked about a “Great Eraser”… Brr.')] },
    ],
    berries: [{ x: 18, y: 5, item: 'baie-bleue' }, { x: 3, y: 21, item: 'baie-cerise' }],
    encounters: {
      rate: 21,
      table: [
        { id: '009', w: 8, min: 2, max: 3, time: 'night' },
        { id: '004', w: 24, min: 2, max: 3 },
        { id: '012', w: 24, min: 2, max: 3 },
        { id: '013', w: 24, min: 2, max: 3, time: 'day' },
        { id: '006', w: 30, min: 2, max: 3, time: 'night' },
        { id: '005', w: 10, min: 2, max: 3 },
        { id: '008', w: 4, min: 3, max: 3 },
        { id: '089', w: 16, min: 2, max: 3, time: 'day' },
        { id: '091', w: 14, min: 2, max: 3, time: 'night' },
      ],
    },
  },
};
