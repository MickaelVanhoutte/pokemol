import { L } from '../../i18n';
import type { MapDef } from '../../overworld/mapTypes';
import { LOOKS } from '../../overworld/sprites';

/** Route 7 and Jardin-Gouache, the garden town painted in thick gouache (badge 7). */
export const GOUACHE_MAPS: Record<string, MapDef> = {
  route7: {
    id: 'route7',
    name: L('Route des Gouaches', 'Gouache Lane'),
    border: 'tree',
    rows: [
      'TTTTTTTT::TTTTTTTTTTTTTT',
      'T..B**B*::.*.*.....*.TTT',
      'T.BB.*B.::*......*..*TTT',
      'T..T..T..TBBTBBTBBT...TT',
      'T*.B..B""B"".*...*B*..*T',
      'T..B..B""B""......B...*T',
      'T..T..T""TBBTBBT..B.TTTT',
      'T""B.....B......""B.TTTT',
      'T""B..........*.""B*..TT',
      'T""TBBTBBTBBTBBT""T..**T',
      'T"".*.....""B""...B...TT',
      'T"".....*.""B""...BTT.TT',
      'TBBTBBTBBT..T""TBBBTT*TT',
      'T""B...""""....B.*B..*TT',
      'T""B...""""....B*.B...*T',
      'T..T..TBBTBBTBBT..T*.TTT',
      'T.*."""""."""""...B..TTT',
      'T*.."""""."""""...B.*.TT',
      'TTTTTTT..TTTTTTTTTT___TT',
      'T*.T...::.............*T',
      'T......:::::::::::::..TT',
      'T.*.""."""""".*...::..TT',
      'T.."""""""""""".*.::.*.T',
      'TT"""""""""""""TTT::...T',
      'TT""""""*"""""""TT::.R*T',
      'TTT""""""T""""""TT::...T',
      'TTT"""""""*"""""TT""TTTT',
      'TTT"""""""""""""TT""TTTT',
      'TTT"""""""""""""TT""...T',
      'TTT"""""""""""".*.::...T',
      'TT..""""""""".....::.*.T',
      'T....."""".:::::::::...T',
      'TTTTTTTTTTT::TTTTTTTTTTT',
      'T.BBBBB*...::....*..T*.T',
      'T.B***B....::...T......T',
      'T.B*.*..:::::.*..*.T...T',
      'T.B***B.:::::...*.*..T.T',
      'T.BBBBB.::S..*.T...*..*T',
      'T*......::.............T',
      'TTTTTTTT::TTTTTTTTTTTTTT',
    ],
    // a hedge maze (one right way) above a field of tall grass you cross or go round; the garden walk down the
    // east side is one way, over the ledge into the field: the short way back to Glimmerton
    // the maze's top-left nook, once the bush can be cut
    obstacles: [{ x: 1, y: 2, kind: 'bush' }],
    warps: [
      { x: 8, y: 39, to: { map: 'paillette', x: 9, y: 1, facing: 'down' } },
      { x: 9, y: 39, to: { map: 'paillette', x: 10, y: 1, facing: 'down' } },
      { x: 8, y: 0, to: { map: 'gouache', x: 9, y: 14, facing: 'up' } },
      { x: 9, y: 0, to: { map: 'gouache', x: 10, y: 14, facing: 'up' } },
    ],
    signs: [{ x: 10, y: 37, text: L('ROUTE DES GOUACHES\n↑ Jardin-Gouache   ↓ Bourg-Paillette', 'GOUACHE LANE\n↑ Gouache Garden   ↓ Glimmerton') }],
    npcs: [
      { id: 'r7a', x: 12, y: 8, look: LOOKS.granny, facing: 'left', trainer: 'r7a', sight: 3 },
      { id: 'r7c', x: 4, y: 19, look: { hair: '#6a4a2a', shirt: '#6cc05a', pants: '#8a5a32', hat: '#e0a030' }, facing: 'right', trainer: 'r7c', sight: 4 },
      { id: 'r7d', x: 13, y: 33, look: { hair: '#c0582a', shirt: '#a87a3a', pants: '#5a4a3a', hat: '#5a8a3a', longHair: true }, facing: 'left', trainer: 'r7d', sight: 4 },
      { id: 'r7b', x: 4, y: 15, look: LOOKS.hiker, facing: 'right', trainer: 'r7b', sight: 4 },
    ],
    items: [
      { x: 22, y: 19, item: 'sucette-magique', hidden: true },
      { x: 16, y: 1, item: 'rappel' },
      { x: 15, y: 1, item: 'baie-menthe' },
      { x: 13, y: 5, item: 'crayon-mauve' },
      { x: 1, y: 1, item: 'pochoir-20' }, { x: 1, y: 2, item: 'pochoir-27' }, { x: 1, y: 3, item: 'pochoir-29' },
      { x: 2, y: 1, item: 'crayon-indigo' },
      // at the end of a dead end in the maze
      { x: 17, y: 13, item: 'fil-ariane' },
    ],
    berries: [{ x: 2, y: 12, item: 'baie-menthe' }, { x: 2, y: 2, item: 'baie-doree' }],
    encounters: {
      rate: 21,
      table: [
        { id: '007', w: 22, min: 25, max: 27 },
        { id: '012', w: 10, min: 26, max: 27 },
        { id: '013', w: 16, min: 25, max: 27 },
        { id: '006', w: 14, min: 25, max: 27 },
        { id: '005', w: 14, min: 25, max: 27 },
        { id: '004', w: 14, min: 25, max: 27 },
        { id: '008', w: 10, min: 25, max: 27 },
        { id: '026', w: 12, min: 25, max: 27 },
        { id: '048', w: 6, min: 25, max: 27 },
        { id: '052', w: 4, min: 25, max: 27 },
        { id: '068', w: 8, min: 25, max: 27 },
        { id: '063', w: 10, min: 25, max: 27 },
        { id: '084', w: 4, min: 25, max: 27 },
        { id: '090', w: 5, min: 25, max: 27 },
        { id: '094', w: 3, min: 26, max: 27 },
      ],
    },
  },

  gouache: {
    id: 'gouache',
    name: L('Jardin-Gouache', 'Gouache Garden'),
    border: 'tree',
    onEnter: 'visitTown',
    // the old town (Inn, shop, the Atelier in its ring of hedges) and, east of it, the garden quarter: a street of
    // houses, the lily pond with its fountain stone, the painter's glass studio and the shared allotments. The way to the
    // Piste Cyclable stays where it was, a gap in the trees at the top of the old east edge (x 19, y 2–3)
    rows: [
      'TTTTTTTTT::TTTTTTTTTTTTTTTTTTTTT',
      'T*.....**::**.....*TTT....*....T',
      'T......*.::.*....:::TT....*....T',
      'T.......*::*.....:::TT....*....T',
      'T......**::**....S:TTT....M....T',
      'T...::::::::::::::::::::::::::.T',
      'T.B::::::::::::::B.:S*.*.*..**.T',
      'T.B:**........**:B.:.R~~~R.....T',
      'T*B:............:B*:*~~R~~*....T',
      'T.B:............:B.:.R~~~R.....T',
      'T.B:**........**:B.:.*.*.*M....T',
      'T..:::::::::::::::::::::::::::.T',
      'T.S**....::....**..S#####.#####T',
      'T***####.::.####***.#""".:."""#T',
      'T*..#**#.::.#""#..*.#""".:."""#T',
      'TTTTTTTTT::TTTTTTTTTTTTTTTTTTTTT',
    ],
    buildings: [
      { kind: 'center', x: 2, y: 1, w: 5, h: 4, door: 2, to: { map: 'centre', x: 5, y: 6, facing: 'up' } },
      { kind: 'shop', x: 13, y: 1, w: 4, h: 4, door: 1, to: { map: 'boutique', x: 4, y: 6, facing: 'up' } },
      { kind: 'gym', x: 6, y: 7, w: 8, h: 4, door: 4, roof: '#4fae5a', to: { map: 'atelierGouache', x: 7, y: 16, facing: 'up' } },
      // the garden quarter: the florists, an old couple, and the painter's studio with its glass roof
      { kind: 'house', x: 22, y: 1, w: 4, h: 4, door: 1, roof: '#e46a8e', to: { map: 'maisonVille', x: 4, y: 6, facing: 'up' } },
      { kind: 'house', x: 27, y: 1, w: 4, h: 4, door: 2, roof: '#e8b232', to: { map: 'maisonPetite', x: 3, y: 5, facing: 'up' } },
      { kind: 'house', x: 27, y: 7, w: 4, h: 4, door: 1, roof: '#7cc8c4', to: { map: 'maisonAtelier', x: 5, y: 6, facing: 'up' } },
    ],
    warps: [
      { x: 9, y: 15, to: { map: 'route7', x: 8, y: 1, facing: 'down' } },
      { x: 10, y: 15, to: { map: 'route7', x: 9, y: 1, facing: 'down' } },
      { x: 9, y: 0, to: { map: 'route8', x: 8, y: 38, facing: 'up' } },
      { x: 10, y: 0, to: { map: 'route8', x: 9, y: 38, facing: 'up' } },
      // east: the gate at the top of the Piste Cyclable, down to Ville-Feutre
      { x: 19, y: 2, to: { map: 'piste', x: 1, y: 2, facing: 'right' } },
      { x: 19, y: 3, to: { map: 'piste', x: 1, y: 3, facing: 'right' } },
    ],
    signs: [
      { x: 2, y: 12, text: L('JARDIN-GOUACHE\nIci, même l’herbe est peinte à la main.\nAtelier de Basile', 'GOUACHE GARDEN\nHere, even the grass is hand-painted.\nBasil’s Atelier') },
      { x: 17, y: 4, text: L('PISTE CYCLABLE →\nDescente jusqu’à Ville-Feutre.\nVélo-Crayon obligatoire !', 'CYCLING TRACK →\nDownhill all the way to Felt City.\nPencil Bike only!') },
      { x: 20, y: 6, text: L('BASSIN AUX NÉNUPHARS\nSon eau est peinte d’un bleu si épais que les poissons n’arrivent pas à y entrer.', 'LILY POND\nIts water is painted such a thick blue that no fish can get in.') },
      { x: 19, y: 12, text: L('JARDINS PARTAGÉS\nÀ chacun sa parcelle, à tous les couleurs.\nMerci de ne pas croquer les radis peints.', 'SHARED ALLOTMENTS\nA plot for each, colours for all.\nPlease don’t bite the painted radishes.') },
    ],
    items: [{ x: 18, y: 6, item: 'sucette-magique' }, { x: 1, y: 13, item: 'page-10', hidden: true }],
    berries: [{ x: 2, y: 8, item: 'baie-doree' }],
    npcs: [
      { id: 'rosalie', x: 16, y: 13, look: LOOKS.granny, facing: 'left', script: 'rosalie' },
      { id: 'gouaKid', x: 8, y: 13, look: LOOKS.kid, facing: 'left', text: [L('Au nord, la Cité-Encre est toute noire… On dit que le chef des Gomme s’y cache.', 'Up north, Ink City is all black… They say the Team Gomme boss hides there.')] },
      // the fisher gave up on the town's flower beds: she sits by the lily pond now
      {
        id: 'pecheuseGouache', x: 26, y: 8, look: LOOKS.girl, facing: 'left',
        text: [L('Je pêche dans toute Papeterre. Chaque eau a ses Bestioles : la rivière, la mer, le lac…', 'I fish all over Papeterra. Every water has its own Critters: the river, the sea, the lake…'), L('Quand ton équipe grandit, des Bestioles plus fortes viennent mordre, même là où tu as déjà pêché !', 'As your team grows, stronger Critters come to bite, even where you’ve fished before!')],
      },
      { id: 'gouaGardener', x: 24, y: 13, look: { hair: '#e8e8f0', shirt: '#6cae5a', pants: '#7a5a3a', hat: '#e0a030', longHair: true }, facing: 'down', wander: true, text: [
        L('La gouache, c’est épais : quand Basile peint une fleur, elle pousse vraiment !', 'Gouache is thick: when Basil paints a flower, it really grows!'),
        L('Ma parcelle, c’est celle des radis. Je les peins en rouge bien épais : comme ça, ils poussent plus vite.', 'My plot is the radish one. I paint them a nice thick red: that way they grow faster.'),
      ] },
      { id: 'gouaBell', x: 27, y: 14, mon: '062', look: LOOKS.kid, facing: 'left', wander: true, text: [L('Le Clochiflor tinte comme une clochette quand on l’arrose. Ding !', 'The Bellbud tinkles like a little bell when it gets watered. Ding!')] },
      { id: 'gouaPainter', x: 20, y: 9, look: { hair: '#2a2238', shirt: '#f2d06a', pants: '#4a6ad0', hat: '#e04848' }, facing: 'right', text: [
        L('Je peins le bassin à la gouache. Bien épais, bien couvrant… Le hic, c’est que mes nénuphars se mettent à flotter sur la toile.', 'I’m painting the pond in gouache. Nice and thick, nice and opaque… The trouble is, my water lilies start floating on the canvas.'),
      ] },
      { id: 'gouaLily', x: 23, y: 10, mon: '095', look: LOOKS.kid, facing: 'up', wander: true, text: [L('La Nénurette saute de nénuphar en nénuphar… et retombe à côté. Plouf !', 'The Lilyhop hops from lily pad to lily pad… and lands beside them. Splash!')] },
      { id: 'gouaCyclist', x: 17, y: 1, look: LOOKS.cyclistF, facing: 'down', text: [
        L('La Piste Cyclable part juste là, entre les arbres. Elle descend jusqu’à Ville-Feutre sans un coup de pédale !', 'The Cycling Track starts right there, between the trees. It runs downhill to Felt City without a single pedal stroke!'),
        L('Sa grille ne s’ouvre que de ce côté-ci. Pour remonter, je pousse mon vélo à pied…', 'Its gate only opens from this side. To come back up, I push my bike on foot…'),
      ] },
      { id: 'gouaWaterer', x: 15, y: 8, look: { hair: '#6a3a1a', shirt: '#5aa0e0', pants: '#4a8a3a', hat: '#f2d05a' }, facing: 'left', text: [
        L('J’arrose les fleurs autour de l’Atelier. Basile dit que ses Bestioles Plante adorent la pluie… et détestent les allumettes !', 'I water the flowers around the Atelier. Basil says his Grass Critters love the rain… and hate matches!'),
      ] },
    ],
    residents: [
      // the florists: bouquets painted in gouache, which never wilt
      { id: 'gouaFleuriste', x: 6, y: 2, look: { hair: '#8a4a2a', shirt: '#e46a8e', pants: '#5a7a3a', longHair: true, bow: '#f2d05a' }, facing: 'down', fromDoor: [['gouache', 23, 5]], text: [
        L('Je vends des bouquets peints à la gouache : ils ne fanent jamais ! Mais surtout, ne les mets pas dans un vase d’eau… ils dégoulinent.', 'I sell bouquets painted in gouache: they never wilt! But whatever you do, don’t put them in a vase of water… they run.'),
        L('Basile passe chaque matin m’acheter des graines. Il les sème dans sa serre, et le soir, elles sont déjà en fleurs.', 'Basil comes by every morning to buy seeds. He sows them in his greenhouse, and by evening they’re already in bloom.'),
      ] },
      { id: 'gouaFils', x: 3, y: 2, look: LOOKS.kid, facing: 'right', fromDoor: [['gouache', 23, 5]], text: [
        L('J’ai fait pousser un radis gros comme un Ronflon ! Enfin… gros comme sa tête.', 'I grew a radish as big as a Snoozle! Well… as big as its head.'),
      ], afterStory: {
        text: [L('Mon radis a encore grossi ! Maintenant, il est gros comme un Ronflon tout entier. Je ne sais plus où le ranger.', 'My radish grew again! Now it’s as big as a whole Snoozle. I don’t know where to keep it any more.')],
      } },
      { id: 'gouaErabou', x: 7, y: 5, mon: '093', look: LOOKS.kid, facing: 'left', wander: true, fromDoor: [['gouache', 23, 5]], text: [
        L('L’Érabou sème ses feuilles sur le tapis. La fleuriste les ramasse pour ses bouquets.', 'The Maplet sheds its leaves on the rug. The florist picks them up for her bouquets.'),
      ] },
      // an old couple, who remember when the town was still being painted
      { id: 'gouaPapi', x: 2, y: 3, look: { hair: '#e8e8f0', shirt: '#7a9a5a', pants: '#5a4a3a' }, facing: 'left', fromDoor: [['gouache', 29, 5]], text: [
        L('Quand j’étais petit, ici, ce n’était qu’une grande prairie toute pâle. Les gens du village l’ont repeinte brin d’herbe par brin d’herbe.', 'When I was little, this was just a big pale meadow. The village folk repainted it blade of grass by blade of grass.'),
        L('Il faut trois couches de gouache pour un bon brin d’herbe. Avec deux, on voit encore le papier.', 'A good blade of grass takes three coats of gouache. With two, the paper still shows through.'),
      ] },
      { id: 'gouaMamie', x: 4, y: 2, look: LOOKS.grandma, facing: 'down', fromDoor: [['gouache', 29, 5]], text: [
        L('Le jour de notre mariage, on a peint chacun une fleur devant la porte. Cinquante ans plus tard, elles n’ont pas perdu une couleur.', 'On our wedding day, we each painted a flower by the front door. Fifty years later, they haven’t lost a single colour.'),
      ] },
      // the painter's studio under its glass roof
      { id: 'gouaPeintre', x: 2, y: 3, look: { hair: '#c0582a', shirt: '#4a6ad0', pants: '#2a2238', hat: '#2a2238', longHair: true }, facing: 'left', fromDoor: [['gouache', 28, 11]], text: [
        L('La gouache, c’est une peinture qui a du caractère : épaisse, mate, couvrante. Une bonne couche, et on ne voit plus du tout ce qu’il y avait dessous.', 'Gouache is paint with character: thick, matte, opaque. One good coat, and you can’t see what was underneath at all.'),
        L('Basile a gardé deux gros blocs de gomme pris à la Team Gomme. Il s’en sert de poids dans sa serre… Malin, non ?', 'Basil kept two big eraser blocks taken from Team Gomme. He uses them as weights in his greenhouse… Clever, right?'),
      ], afterStory: {
        text: [L('Une bonne couche de gouache cache tout ce qu’il y a dessous… Mais maintenant, je laisse toujours un petit coin du premier dessin. Pour me souvenir.', 'A good coat of gouache hides everything underneath… But now I always leave a little corner of the first drawing. To remember.')],
        gift: { item: 'tablier-peintre', text: L('Tiens, mon vieux tablier. Il a vu plus de couleurs que moi !', 'Here, my old apron. It’s seen more colours than I have!') },
      } },
      { id: 'gouaApprenti', x: 9, y: 5, look: { hair: '#f2d05a', shirt: '#e8e8e8', pants: '#4fae5a' }, facing: 'left', fromDoor: [['gouache', 28, 11]], text: [
        L('Un peu de jaune, un peu de bleu, je mélange… et voilà le « vert Basile » ! C’est le vert du toit de son Atelier.', 'A bit of yellow, a bit of blue, mix it up… and there’s “Basil green”! It’s the green of his Atelier’s roof.'),
      ] },
    ],
  },

  atelierGouache: {
    id: 'atelierGouache',
    name: L('Atelier Gouache', 'Gouache Atelier'),
    indoor: true,
    border: 'void',
    backdrop: 'forest',
    // Basil's greenhouse: a hedge closes his garden by the pond. Its gate opens once the two eraser blocks, each in a
    // flower bed of its own, are pushed into the two niches of the hedge, onto their plates (src/data/ateliers)
    rows: [
      'WwwWwwWwWwwWwwW',
      'W*pR~~~~~~~Rp*W',
      'W**.R~~~~~R.**W',
      'W*...........*W',
      'W.BB.*...*.BB.W',
      'W.*.B.....B.*.W',
      'WBBB@BS:BB@BBBW',
      'W......:......W',
      'WBBB.B.:.B.BBBW',
      'WB***B.:.B***BW',
      'WB***B.:.B***BW',
      'WB***B.:.B***BW',
      'WBBB.B.:.BBB.BW',
      'W......:......W',
      'W*p*.*.:.*.*p*W',
      'W......:......W',
      'Wp*...*:*...*pW',
      'WWWWWWWXWWWWWWW',
    ],
    obstacles: [{ x: 3, y: 9, kind: 'block' }, { x: 11, y: 10, kind: 'block' }],
    puzzles: [{ flag: 'puzzle:gouacheGate', plates: [[4, 6], [10, 6]] }],
    patches: [{ id: 'gouacheGate', x: 7, y: 6, rows: ['G'], unless: 'puzzle:gouacheGate' }],
    signs: [{ x: 6, y: 6, text: L('Écriteau planté dans la haie : « Un bloc sur chaque dalle, et la grille s’ouvre. Coincé ? Ressors et reviens : tout se remet en place. »', 'A sign stuck in the hedge: “A block on each plate, and the gate opens. Stuck? Step out and come back: everything goes back in place.”') }],
    warps: [{ x: 7, y: 17, to: { map: 'gouache', x: 10, y: 11, facing: 'down' } }],
    npcs: [
      { id: 'basile', x: 7, y: 3, look: LOOKS.leaderGouache, facing: 'down', trainer: 'basile', sight: 1 },
      { id: 'gouaT4', x: 9, y: 5, look: { hair: '#3a2a1a', shirt: '#7a5a3a', pants: '#4a6a3a', hat: '#4fae5a' }, facing: 'left', trainer: 'gouaT4', sight: 2 },
      { id: 'gouaT3', x: 13, y: 7, look: { hair: '#e8b0c8', shirt: '#f2a0c0', pants: '#6cae5a', longHair: true, bow: '#e04848' }, facing: 'left', trainer: 'gouaT3', sight: 3 },
      { id: 'gouaT2', x: 6, y: 10, look: LOOKS.hiker, facing: 'right', trainer: 'gouaT2', sight: 2 },
      { id: 'gouaT1', x: 3, y: 15, look: LOOKS.girl, facing: 'right', trainer: 'gouaT1', sight: 4 },
      { id: 'gouaGuide', x: 5, y: 16, look: { hair: '#3a2a1a', shirt: '#ffffff', pants: '#5a8ad6' }, facing: 'right',
        text: [
          L('Basile peint des Bestioles Plante et Insecte. Le Feu, c’est leur cauchemar !', 'Basil paints Grass and Bug Critters. Fire is their nightmare!'),
          L('Son jardin est fermé par une haie. Pousse les deux blocs de gomme dans les niches de la haie : la grille s’ouvrira !', 'His garden is closed off by a hedge. Push the two eraser blocks into the hedge’s niches: the gate will open!'),
        ] },
    ],
  },
};
