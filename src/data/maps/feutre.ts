import { L } from '../../i18n';
import type { MapDef } from '../../overworld/mapTypes';
import { LOOKS } from '../../overworld/sprites';

/** Route 4, Ville-Feutre (drained of its colours by Team Gomme), their warehouse and the Atelier Fluo. */
export const FEUTRE_MAPS: Record<string, MapDef> = {
  route4: {
    id: 'route4',
    name: L('Route des Feutres', 'Marker Road'),
    border: 'tree',
    rows: [
      'TTTTTTTT::TTTTTTTTTTTTTT',
      'T*.*.TT.::.....*.....*.T',
      'T""""TT.::......"""""".T',
      'T""""TT.::::::.."".."".T',
      'T....TT..:::::.."""""".T',
      'T.*.,TT,..S."""...TT..*T',
      'T.........TT"""TT......T',
      'TTTTTTTTTTTT"""TTTTT...T',
      'TTTTTTTTTTTT"""TTTTT___T',
      'TTT........."""R..~....T',
      'TT...:::::::::..~~~~~..T',
      'T.*..:::::::::.~~..~~~.T',
      'T""".::TTTT....~~..~~~.T',
      'T""".:::::::..*.~~~~~..T',
      'T""".:::::""".....~..*.T',
      'T.......TT"""TT........T',
      'TTTTTTTTTT"""TTTTTTTTTTT',
      'TTTTTTTTTT"""TTTTTTTTTTT',
      'TTTT......"""..........T',
      'T..T......::..""""""...T',
      'T..T::::::::..""""""...T',
      'T.*T::::::::......B....T',
      'T..T::.""""...R.....TT.T',
      'T..."""""""..*..*...TT.T',
      'T..."""...............*T',
      'T..T"""TTTTTTTTT.TTTTTTT',
      'T__T"""TTTTTTTTT.TTTTTTT',
      'T*.."""..R.......T.....T',
      'T...::::::::::::.T.*...T',
      'T"""::::::::::::.T.""".T',
      'T"""..."""""".::.T.""".T',
      'T"""...""""""."""....*.T',
      'TTTTTTTTTTTTTT"""T.....T',
      'TTTTTTTTTTTTTT"""T_____T',
      'T.*..........."""......T',
      'T"""""........"""..""".T',
      'T"""""..::::::::...""".T',
      'T"""""..::.........R...T',
      'T.....*.::.*...........T',
      'TTTTTTTT::TTTTTTTTTTTTTT',
    ],
    warps: [
      { x: 8, y: 39, to: { map: 'port', x: 21, y: 1, facing: 'down' } },
      { x: 9, y: 39, to: { map: 'port', x: 22, y: 1, facing: 'down' } },
      { x: 8, y: 0, to: { map: 'feutre', x: 11, y: 18, facing: 'up' } },
      { x: 9, y: 0, to: { map: 'feutre', x: 12, y: 18, facing: 'up' } },
    ],
    signs: [{ x: 10, y: 5, text: L('ROUTE DES FEUTRES\n↑ Ville-Feutre   ↓ Port-Aquarelle', 'MARKER ROAD\n↑ Felt City   ↓ Port Aquarelle') }],
    npcs: [
      { id: 'r4maud', x: 14, y: 3, look: LOOKS.hiker, facing: 'left', trainer: 'r4maud', sight: 3 },
      { id: 'r4tim', x: 3, y: 10, look: LOOKS.kid, facing: 'right', trainer: 'r4tim', sight: 4 },
      { id: 'r4gomme', x: 13, y: 19, look: LOOKS.gomme, facing: 'left', trainer: 'r4gomme', sight: 3 },
      { id: 'r4a', x: 3, y: 28, look: { hair: '#4a3020', shirt: '#f08a3a', pants: '#2a4a8a', hat: '#2a4a8a' }, facing: 'right', trainer: 'r4a', sight: 4 },
      { id: 'r4b', x: 12, y: 35, look: { hair: '#8a5ad0', shirt: '#2a2238', pants: '#8a5ad0', longHair: true }, facing: 'down', trainer: 'r4b', sight: 2 },
    ],
    items: [
      { x: 1, y: 20, item: 'ticket-or', hidden: true },
      { x: 16, y: 1, item: 'super-crayon-ball', count: 2 },
      { x: 9, y: 2, item: 'pochoir-09' },
      { x: 14, y: 7, item: 'crayon-jaune' },
      // on the islet in the pond: back with the paper boat
      { x: 17, y: 11, item: 'sucette-magique' },
    ],
    berries: [{ x: 18, y: 21, item: 'baie-givree' }],
    // a shortcut from the garden down to the hill, once the bush can be cut
    obstacles: [{ x: 16, y: 25, kind: 'bush' }],
    encounters: {
      rate: 21,
      table: [
        { id: '004', w: 22, min: 16, max: 17 },
        { id: '013', w: 18, min: 16, max: 17 },
        { id: '005', w: 14, min: 15, max: 17 },
        { id: '006', w: 14, min: 15, max: 17 },
        { id: '007', w: 14, min: 15, max: 17 },
        { id: '009', w: 12, min: 15, max: 17 },
        { id: '008', w: 6, min: 16, max: 17 },
        { id: '033', w: 10, min: 16, max: 17 },
        { id: '035', w: 10, min: 15, max: 17 },
        { id: '067', w: 12, min: 16, max: 17 },
        { id: '056', w: 12, min: 16, max: 17 },
        { id: '051', w: 3, min: 15, max: 17 },
        { id: '074', w: 10, min: 15, max: 17 },
        { id: '078', w: 8, min: 15, max: 17, time: 'day' },
        { id: '082', w: 10, min: 15, max: 17, time: 'night' },
        { id: '093', w: 8, min: 15, max: 16 },
        { id: '092', w: 3, min: 17, max: 17, time: 'night' },
        { id: '105', w: 12, min: 15, max: 17 },
      ],
    },
  },

  feutre: {
    id: 'feutre',
    onEnter: 'visitTown',
    name: L('Ville-Feutre', 'Felt City'),
    border: 'tree',
    backdrop: 'city',
    // Team Gomme sucked the colours out of the city (greys, rubbed pale) until Admin Rature is beaten
    drained: true,
    tint: 'rgba(238, 236, 244, 0.28)',
    tintUnless: 'a2.feutre',
    // grey lines kept to remember the night the colours were stolen (the fourth choice)
    patches: [
      { id: 'feutreTrace1', x: 5, y: 9, rows: ['xxx'], if: 'choix:feutre:b' },
      { id: 'feutreTrace2', x: 11, y: 12, rows: ['xx', 'xx'], if: 'choix:feutre:b' },
      { id: 'feutreTrace3', x: 15, y: 15, rows: ['xxxx'], if: 'choix:feutre:b' },
    ],
    // the city of felt-tips: bright signs on every corner, a fountain, a square with the bike maker, and three
    // narrow houses in marker colours (the sign-maker's studio, a retired felt-tip maker, a family)
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T...*B**......*,B,*....T',
      'T...*,**......*****....T',
      'T...####S.....##.##....T',
      'T.........::::.........T',
      'T*:M.....B*::S*.....:M*T',
      'T*:......**::.*.....:.*T',
      'T.:......*B::.......:**T',
      'T.:......,.::.......:..T',
      'T.::::::::::::::::::::.T',
      'T*.......B.::.......::::',
      'T........*.::.......::::',
      'T.S......S.::........*BT',
      'T*.......*.::S.......*.T',
      'T.....:....::....:.....T',
      'T.::::::::::::::::::...T',
      'T...S.R~~R.::......:...T',
      'T*....~~~~.::.*B*..:...T',
      'T**..SR~~R.::.,*,..:::MT',
      'TTTTTTTTTTT::TTTTTTTTTTT',
    ],
    buildings: [
      { kind: 'cave', x: 9, y: 1, w: 5, h: 3, door: 2, to: { map: 'montFusain1', x: 9, y: 12, facing: 'up' } },
      { kind: 'center', x: 4, y: 5, w: 5, h: 4, door: 2, to: { map: 'centre', x: 5, y: 6, facing: 'up' } },
      { kind: 'shop', x: 15, y: 5, w: 4, h: 4, door: 1, to: { map: 'boutique', x: 4, y: 6, facing: 'up' } },
      { kind: 'gym', x: 14, y: 10, w: 6, h: 4, door: 3, roof: '#f2d23e', to: { map: 'atelierFluo', x: 5, y: 10, facing: 'up' }, script: 'fluoDoor' },
      { kind: 'lab', x: 3, y: 10, w: 6, h: 4, door: 3, roof: '#7a7488', to: { map: 'entrepot1', x: 6, y: 10, facing: 'up' } },
      // narrow town houses with felt-tip roofs: the sign-maker's studio, a retired felt-tip maker, a family
      { kind: 'house', x: 19, y: 1, w: 4, h: 4, door: 1, roof: '#ff4fa3', to: { map: 'maisonAtelier', x: 5, y: 6, facing: 'up' } },
      { kind: 'house', x: 1, y: 1, w: 3, h: 4, door: 1, roof: '#3ec46d', to: { map: 'maisonPetite', x: 3, y: 5, facing: 'up' } },
      { kind: 'house', x: 20, y: 14, w: 3, h: 4, door: 1, roof: '#3fa3ff', to: { map: 'maisonVille', x: 4, y: 6, facing: 'up' } },
    ],
    warps: [
      { x: 11, y: 19, to: { map: 'route4', x: 8, y: 1, facing: 'down' } },
      { x: 12, y: 19, to: { map: 'route4', x: 9, y: 1, facing: 'down' } },
      // east: the Piste Cyclable up to Jardin-Gouache
      { x: 23, y: 10, to: { map: 'piste', x: 1, y: 36, facing: 'right' } },
      { x: 23, y: 11, to: { map: 'piste', x: 1, y: 37, facing: 'right' } },
    ],
    signs: [
      { x: 2, y: 12, text: L('VILLE-FEUTRE\nLa ville fluo qui ne dort jamais.\nAtelier de Zélie · Mont Fusain au nord', 'FELT CITY\nThe neon city that never sleeps.\nZelie’s Atelier · Mount Charcoal to the north') },
      { x: 8, y: 3, text: L('MONT FUSAIN\n↑ Par la grotte : Village-Braise, de l’autre côté de la montagne.', 'MOUNT CHARCOAL\n↑ Through the cave: Embervale, on the other side of the mountain.') },
      { x: 5, y: 18, text: L('FONTAINE FLUO\nLe soir, son eau prend la couleur de tous les feutres de la ville.', 'NEON FOUNTAIN\nAt night, its water takes on the colour of every marker in town.') },
      { x: 13, y: 5, text: L('AFFICHE\n« Grand concert du Rockeur Jimmy à l’Atelier Fluo ! Lumières : Lampyrette et Lumignon. »', 'POSTER\n“Big concert by Rocker Jimmy at the Neon Atelier! Lights: Lampfly and Glimmerkin.”') },
      { x: 9, y: 12, text: L('ENTREPÔT DES FEUTRES\nQuelqu’un a gribouillé « GOMME » par-dessus, en gris.', 'MARKER WAREHOUSE\nSomeone has scribbled “GOMME” over it, in grey.') },
      { x: 13, y: 13, text: L('ATELIER FLUO\nMaître d’Atelier : Zélie.\n« Ici, ça pétille ! »', 'NEON ATELIER\nAtelier Master: Zelie.\n“Things crackle in here!”') },
      { x: 4, y: 16, text: L('VÉLOS-CRAYONS\nRéparations, sonnettes et rayons de toutes les couleurs.', 'PENCIL BIKES\nRepairs, bells and spokes in every colour.') },
    ],
    npcs: [
      { id: 'tradeFeutre', x: 18, y: 17, look: LOOKS.girl, facing: 'left', script: 'trade_feutre' },
      { id: 'theo', x: 2, y: 17, look: LOOKS.kid, facing: 'right', script: 'theo' },
      { id: 'feutreMan', x: 10, y: 17, look: LOOKS.hiker, facing: 'left', script: 'feutreMan' },
      { id: 'feutreKid', x: 15, y: 18, look: LOOKS.kid, facing: 'left', wander: true, script: 'feutreKid' },
      { id: 'velociste', x: 5, y: 16, look: { hair: '#3a2a1a', shirt: '#d64545', pants: '#2a2238', hat: '#5b8ad6' }, facing: 'right', script: 'velociste' },
      // the poster man, in front of his poster board: grey posters until the colours come back
      { id: 'feutreAffiche', x: 13, y: 6, look: { hair: '#6a4a2a', shirt: '#f2d23e', pants: '#3a3a5a', hat: '#ff4fa3' }, facing: 'up', hideIf: 'a2.feutre', text: [
        L('Je colle des affiches dans toute la ville. Mais qui a envie de lire une affiche grise ? Même la colle a perdu sa couleur.', 'I put up posters all over the city. But who wants to read a grey poster? Even the glue has lost its colour.'),
      ] },
      { id: 'feutreAfficheOk', x: 13, y: 6, look: { hair: '#6a4a2a', shirt: '#f2d23e', pants: '#3a3a5a', hat: '#ff4fa3' }, facing: 'up', showIf: 'a2.feutre', text: [
        L('Affiche toute neuve ! Le Rockeur Jimmy donne un concert à l’Atelier. Sa Lampyrette et son Lumignon font les lumières : on y voit comme en plein jour !', 'Brand-new poster! Rocker Jimmy is giving a concert at the Atelier. His Lampfly and Glimmerkin do the lights: it’s as bright as day in there!'),
      ] },
      // a granny watering her flower bed
      { id: 'feutreMamie', x: 16, y: 2, look: LOOKS.granny, facing: 'down', hideIf: 'a2.feutre', text: [
        L('Mes fleurs sont devenues toutes grises… Elles sentent toujours bon, au moins. Je les arrose quand même.', 'My flowers have all gone grey… At least they still smell nice. I water them anyway.'),
      ] },
      { id: 'feutreMamieOk', x: 16, y: 2, look: LOOKS.granny, facing: 'down', showIf: 'a2.feutre', text: [
        L('Mes fleurs ont retrouvé leurs couleurs ! Le rose est revenu en premier. Le rose revient toujours en premier.', 'My flowers have their colours back! Pink came back first. Pink always comes back first.'),
      ], afterStory: {
        text: [L('Mes fleurs n’ont jamais été aussi roses. Et en les rempotant, j’ai trouvé quelque chose au fond du pot…', 'My flowers have never been so pink. And while repotting them, I found something at the bottom of the pot…')],
        gift: { item: 'sucette-magique', text: L('Une Sucette Magique ! Elle est pour toi, ma petite fleur.', 'A Magic Lollipop! It’s for you, my little flower.') },
      } },
      { id: 'feutreZig', x: 16, y: 17, mon: '004', look: LOOKS.kid, facing: 'left', wander: true, text: [L('Le Zigzou file entre tes jambes en laissant une traînée d’étincelles. Bzzt !', 'The Ziggle zips between your legs, leaving a trail of sparks. Bzzt!')] },
      { id: 'feutreCycliste', x: 21, y: 12, look: LOOKS.cyclistF, facing: 'left', text: [
        L('À l’est, la Piste Cyclable grimpe jusqu’au Jardin-Gouache. Interdit aux piétons : on n’y passe qu’à vélo !', 'East, the Cycling Track climbs all the way to Gouache Garden. No walkers allowed: bikes only!'),
      ] },
    ],
    residents: [
      // the pink house: the sign-maker who draws the city's neon signs in felt-tip, his apprentice, a Glimmerkin
      { id: 'feutreEnseigne', x: 4, y: 2, look: { hair: '#2a2238', shirt: '#ff4fa3', pants: '#3a3a5a', hat: '#f2d23e' }, facing: 'down', fromDoor: [['feutre', 20, 5]], hideIf: 'a2.feutre', text: [
        L('Je dessine les enseignes de la ville au feutre fluo. Enfin… je dessinais. Mes feutres ne font plus que du gris !', 'I draw the city’s signs in neon marker. Well… I used to. My markers only make grey now!'),
        L('Une enseigne grise, c’est une enseigne que personne ne voit. Autant écrire « FERMÉ » partout.', 'A grey sign is a sign nobody sees. Might as well write “CLOSED” everywhere.'),
      ] },
      { id: 'feutreEnseigneOk', x: 4, y: 2, look: { hair: '#2a2238', shirt: '#ff4fa3', pants: '#3a3a5a', hat: '#f2d23e' }, facing: 'down', fromDoor: [['feutre', 20, 5]], showIf: 'a2.feutre', text: [
        L('Mes enseignes brillent de nouveau ! L’Auberge, la boutique, l’Atelier : c’est moi qui les ai toutes repassées au feutre.', 'My signs glow again! The Inn, the shop, the Atelier: I went over every one of them in felt-tip.'),
        L('Le secret, c’est Zélie qui me l’a appris : un trait de jaune sous le rose, et ça brille même la nuit.', 'Zelie taught me the secret: a line of yellow under the pink, and it glows even at night.'),
      ] },
      { id: 'feutreApprentie', x: 8, y: 4, look: { hair: '#c86a2a', shirt: '#3ec46d', pants: '#3a3a5a', longHair: true }, facing: 'left', fromDoor: [['feutre', 20, 5]], text: [
        L('Je suis apprentie. Pour l’instant, je dessine surtout les flèches des panneaux. C’est important, les flèches : sans elles, tout le monde se perd !', 'I’m an apprentice. For now I mostly draw the arrows on the signs. Arrows matter: without them, everyone gets lost!'),
      ], afterStory: {
        text: [L('J’ai dessiné une nouvelle flèche sur les panneaux : « Par ici, le Bord de la Page ». Tout le monde veut aller voir !', 'I drew a new arrow on the signs: “This way to the Edge of the Page”. Everyone wants to go and see!')],
      } },
      { id: 'feutreLumignon', x: 2, y: 4, mon: '082', look: LOOKS.kid, facing: 'right', fromDoor: [['feutre', 20, 5]], text: [L('Le Lumignon éclaire l’atelier quand il fait nuit. Il bourdonne comme une ampoule.', 'The Glimmerkin lights up the studio at night. It hums like a light bulb.')] },
      // the green house: a retired felt-tip maker from the warehouse, and the Boltbit stuck to his fridge
      { id: 'feutrePapi', x: 2, y: 2, look: { hair: '#e8e8f0', shirt: '#3ec46d', pants: '#4a4458' }, facing: 'down', fromDoor: [['feutre', 2, 5]], hideIf: 'a2.feutre', text: [
        L('J’ai fabriqué des feutres toute ma vie, à l’entrepôt de l’ouest. Et voilà que des gens en gris s’y sont enfermés avec nos couleurs !', 'I made felt-tips all my life, at the warehouse to the west. And now people in grey have locked themselves in there with our colours!'),
      ] },
      { id: 'feutrePapiOk', x: 2, y: 2, look: { hair: '#e8e8f0', shirt: '#3ec46d', pants: '#4a4458' }, facing: 'down', fromDoor: [['feutre', 2, 5]], showIf: 'a2.feutre', text: [
        L('Notre entrepôt est libre ! Le secret d’un bon feutre ? Une goutte d’encre, une pincée de couleur…', 'Our warehouse is free! The secret of a good felt-tip? A drop of ink, a pinch of colour…'),
        L('… et un bouchon qu’on n’oublie jamais de remettre. Un feutre sans bouchon, c’est un feutre qui pleure.', '… and a cap you never forget to put back. A felt-tip without its cap is a felt-tip that cries.'),
      ] },
      { id: 'feutreBoulon', x: 5, y: 2, mon: '035', look: LOOKS.kid, facing: 'left', fromDoor: [['feutre', 2, 5]], text: [L('Le Boulonnet s’est encore collé à la porte du frigo. Il dit qu’il garde les gâteaux.', 'The Boltbit has stuck itself to the fridge door again. It says it’s guarding the cakes.')] },
      // the blue house: a family, whose daughter is Zelie's biggest fan
      { id: 'feutreMaman', x: 3, y: 2, look: LOOKS.mom, facing: 'down', fromDoor: [['feutre', 21, 18]], hideIf: 'a2.feutre', text: [
        L('Zélie a disparu… Ma fille a dessiné des affiches « Avez-vous vu Zélie ? ». Mais en gris, personne ne les remarque.', 'Zelie has vanished… My daughter drew “Have you seen Zelie?” posters. But in grey, nobody notices them.'),
      ] },
      { id: 'feutreMamanOk', x: 3, y: 2, look: LOOKS.mom, facing: 'down', fromDoor: [['feutre', 21, 18]], showIf: 'a2.feutre', text: [
        L('Zélie est revenue ! Ma fille lui a dessiné une affiche « Bon retour, Zélie » plus grande qu’elle.', 'Zelie is back! My daughter drew her a “Welcome back, Zelie” poster bigger than herself.'),
      ] },
      { id: 'feutreFille', x: 7, y: 4, look: LOOKS.girl, facing: 'left', wander: true, fromDoor: [['feutre', 21, 18]], text: [
        L('Zélie dit que les Bestioles Plante ne craignent pas trop ses éclairs. Pourtant, ma plante verte a eu très peur pendant l’orage !', 'Zelie says Grass Critters don’t mind her lightning much. But my houseplant got really scared during the storm!'),
      ] },
      { id: 'feutreLampy', x: 7, y: 2, mon: '092', look: LOOKS.kid, facing: 'down', fromDoor: [['feutre', 21, 18]], text: [L('La Lampyrette clignote doucement : rose, jaune, vert… Elle connaît toutes les couleurs des feutres.', 'The Lampfly blinks softly: pink, yellow, green… It knows every felt-tip colour.')] },
    ],
  },

  entrepot1: {
    id: 'entrepot1',
    dungeon: true,
    name: L('Entrepôt Gomme', 'Eraser Warehouse'),
    indoor: true,
    border: 'void',
    backdrop: 'city',
    tint: 'rgba(60, 55, 75, 0.2)',
    // crayon barriers: red ones stand at first, blue ones lie flat; each switch swaps them.
    // South switch: through the red gate; north switch: through the blue line to the stairs.
    rows: [
      'WWWWWWWWWWWWWW',
      'WUffjfffffCCfW',
      'WfffjfffLffjfW',
      'WfffjfffffCCfW',
      'WCCCCffffffffW',
      'WCCCCZZCCCCCCW',
      'WffffffffffffW',
      'WffCCffffCCffW',
      'WfffffffffLffW',
      'WffffffCCffffW',
      'WffffffffffffW',
      'WWWWWWXWWWWWWW',
    ],
    warps: [
      { x: 6, y: 11, to: { map: 'feutre', x: 6, y: 14, facing: 'down' } },
      { x: 1, y: 1, to: { map: 'entrepot2', x: 2, y: 1, facing: 'right' } },
    ],
    npcs: [
      { id: 'e1g1', x: 6, y: 3, look: LOOKS.gomme, facing: 'down', trainer: 'e1g1', sight: 3 },
      { id: 'e1g2', x: 11, y: 9, look: LOOKS.gommeF, facing: 'left', trainer: 'e1g2', sight: 4 },
      { id: 'e1g3', x: 3, y: 8, look: LOOKS.gomme, facing: 'right', trainer: 'e1g3', sight: 4 },
    ],
    items: [{ x: 12, y: 10, item: 'rappel' }, { x: 12, y: 1, item: 'super-potion' }],
  },

  entrepot2: {
    id: 'entrepot2',
    dungeon: true,
    name: L('Entrepôt Gomme — étage', 'Eraser Warehouse — upstairs'),
    indoor: true,
    border: 'void',
    backdrop: 'city',
    tint: 'rgba(60, 55, 75, 0.28)',
    rows: [
      'WWWWWWWWWWWW',
      'WDfffffffffW',
      'WffffffffffW',
      'WffCCCCCCffW',
      'WffffffffffW',
      'WffffffffffW',
      'WCCffffffCCW',
      'WffffffffffW',
      'WffffffffffW',
      'WWWWWWWWWWWW',
    ],
    warps: [{ x: 1, y: 1, to: { map: 'entrepot1', x: 2, y: 1, facing: 'down' } }],
    npcs: [
      { id: 'e2g1', x: 3, y: 4, look: LOOKS.gommeF, facing: 'down', trainer: 'e2g1', sight: 2 },
      { id: 'rature', x: 6, y: 5, look: LOOKS.rature, facing: 'up', trainer: 'rature', sight: 1, hideIf: 'a2.feutre' },
      { id: 'zelieCaptive', x: 9, y: 8, look: LOOKS.leaderFluo, facing: 'up', hideIf: 'a2.feutre',
        text: [L('Ils m’ont enfermée ici et ont aspiré les couleurs de ma ville avec une gomme géante…', 'They locked me in here and sucked the colours out of my city with a giant eraser…'), L('Bats leur chef, je t’en prie !', 'Beat their boss, please!')] },
    ],
  },

  atelierFluo: {
    id: 'atelierFluo',
    name: L('Atelier Fluo', 'Neon Atelier'),
    indoor: true,
    border: 'void',
    backdrop: 'city',
    tint: 'rgba(250, 240, 90, 0.06)',
    // a concert hall in a grid of rooms: Zélie on her stage right behind the counters, the way round through three
    // rooms, each with a switch that swaps the red and blue crayon barriers (blue doorway, switch, red doorway,
    // switch, blue doorway, switch, red doorway). The last switch is set in the wall of Zélie's hall: it can be
    // pressed from both sides, so a game saved by her (barriers back in place) still finds the way out
    // (src/data/ateliers/feutre.test.ts). The door stays at (5,11): the fluoDoor script warps there.
    rows: [
      'WWwqWwWqWWwWWWWqWwWqW',
      'WpmfcccfmfvfpCvffffpW',
      'WfffcccffffffZffffffW',
      'WfffcccffffffZffffffW',
      'WffffcfffffffCffffffW',
      'WpfffcfffffffLffffffW',
      'WCCCCCCCCCCCCCCjjjCCW',
      'WpfffcfCfffffCmffffpW',
      'WffffcfjfffffCffffffW',
      'WffffcfjfffffZffffLfW',
      'WpfffcfCmfLffZfffffpW',
      'WWWWWXWWWWWWWWWWWWWWW',
    ],
    warps: [{ x: 5, y: 11, to: { map: 'feutre', x: 17, y: 14, facing: 'down' } }],
    npcs: [
      { id: 'zelie', x: 5, y: 2, look: LOOKS.leaderFluo, facing: 'down', trainer: 'zelie', sight: 1 },
      { id: 'fluoT1', x: 12, y: 8, look: LOOKS.girl, facing: 'left', trainer: 'fluoT1', sight: 3 },
      { id: 'fluoT2', x: 16, y: 10, look: LOOKS.kid, facing: 'up', trainer: 'fluoT2', sight: 3 },
      { id: 'fluoT3', x: 17, y: 3, look: { hair: '#2a2238', shirt: '#9be23a', pants: '#ff4fa3', hat: '#2a2238' }, facing: 'left', trainer: 'fluoT3', sight: 3 },
      { id: 'fluoT4', x: 11, y: 4, look: { hair: '#f2d23e', shirt: '#3a3a5a', pants: '#3fa3ff', longHair: true }, facing: 'up', trainer: 'fluoT4', sight: 2 },
      { id: 'fluoGuide', x: 3, y: 10, look: { hair: '#3a2a1a', shirt: '#ffffff', pants: '#5a8ad6' }, facing: 'right',
        text: [
          L('Zélie dessine au feutre fluo : ses Bestioles Électrique piquent ! La Plante encaisse bien.', 'Zelie draws with neon markers: her Electric Critters sting! Grass takes it well.'),
          L('Des crayons géants barrent les portes. Un interrupteur couche les rouges et relève les bleus… et le suivant fait l’inverse ! Regarde bien la couleur de la porte suivante.', 'Giant pencils block the doorways. A switch lays down the red ones and raises the blue ones… and the next one does the opposite! Look carefully at the colour of the next doorway.'),
        ] },
    ],
  },
};
