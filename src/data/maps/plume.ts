import { L } from '../../i18n';
import type { MapDef } from '../../overworld/mapTypes';
import { LOOKS } from '../../overworld/sprites';

/** Village-Plume (birds, quills, the wind and naps) and its Atelier. Its bridge has been erased. */
export const PLUME_MAPS: Record<string, MapDef> = {
  plume: {
    id: 'plume',
    onEnter: 'visitTown',
    name: L('Village-Plume', 'Featherby'),
    border: 'tree',
    rows: [
      'TTTTTTTTTTTTTTTTT~~~TT',
      'T*B......B....B**~~~.T',
      'T..*............*~~~.T',
      'T................~~~.T',
      'T*...............~~~.T',
      'T..:::::::::::::*~~~.T',
      'T..........:.....~~~.T',
      'T...B......:.....~~~.T',
      'T..........:.....~~~.T',
      'T..........:....:===::',
      'T...B......:.:M.:~~~.T',
      'TM:::::::::::::::~~~.T',
      'T####....**:.....~~~.T',
      'T#**#*.....:R~~R.~~~.T',
      'T#*B#....*.:R~~..~~~*T',
      'T####......:S....~~~.T',
      'T*...*::::::*..**~~~.T',
      'TTTTTTTTTTT:TTTTT~~~TT',
    ],
    surf: { rate: 2, table: [{ id: '003', w: 60, min: 11, max: 15 }, { id: '013', w: 40, min: 11, max: 15 }, { id: '101', w: 50, min: 11, max: 15 }] },
    fishing: { old: [{ id: '099', w: 150, min: 6, max: 10 }, { id: '003', w: 60, min: 6, max: 10 }], good: [{ id: '099', w: 100, min: 14, max: 18 }, { id: '003', w: 100, min: 14, max: 18 }], super: [{ id: '003', w: 100, min: 17, max: 23 }, { id: '099', w: 50, min: 17, max: 19 }] },
    // the bridge to the east was rubbed out by Team Gomme (rebuilt later in the story)
    patches: [
      { id: 'plumeBridge', x: 17, y: 9, rows: ['eee'], unless: 'a2.bridge' },
      // Marine left its watercolour runs (the third choice)
      { id: 'plumeBridgeRun', x: 17, y: 9, rows: ['uuu'], if: 'choix:pont:b' },
    ],
    buildings: [
      { kind: 'center', x: 4, y: 1, w: 5, h: 4, door: 2, to: { map: 'centre', x: 5, y: 6, facing: 'up' } },
      { kind: 'shop', x: 10, y: 1, w: 4, h: 4, door: 1, to: { map: 'boutique', x: 4, y: 6, facing: 'up' } },
      { kind: 'gym', x: 5, y: 7, w: 6, h: 4, door: 3, roof: '#c8b48a', to: { map: 'atelierPlume', x: 7, y: 14, facing: 'up' } },
      // the quill-maker's studio by the bridge, the cottage of Gaspard's neighbour, and the dovecote
      { kind: 'house', x: 12, y: 6, w: 4, h: 4, door: 1, roof: '#4a8ab0', to: { map: 'maisonAtelier', x: 5, y: 6, facing: 'up' } },
      { kind: 'house', x: 1, y: 7, w: 3, h: 4, door: 1, roof: '#d07a9a', to: { map: 'maisonPetite', x: 3, y: 5, facing: 'up' } },
      { kind: 'tower', x: 6, y: 13, w: 3, h: 3, door: 1, roof: '#e0a030',
        lockedText: L('Le pigeonnier du village. Des dizaines de Piafou y dorment, la tête sous l’aile. Chut !', 'The village dovecote. Dozens of Chirpies sleep inside, heads tucked under their wings. Shh!') },
    ],
    warps: [
      { x: 11, y: 17, to: { map: 'bois', x: 18, y: 1, facing: 'down' } },
      { x: 21, y: 9, to: { map: 'route3', x: 1, y: 2, facing: 'right' } },
      // up the river in the paper boat, to the Lac des Couleurs
      ...[17, 18, 19].map((x, i) => ({ x, y: 0, to: { map: 'lac', x: 20 + i, y: 30, facing: 'up' as const } })),
    ],
    items: [{ x: 20, y: 1, item: 'page-5', hidden: true }],
    signs: [{ x: 12, y: 15, text: L('VILLAGE-PLUME\nOn y fait la sieste au chant des oiseaux.\nAtelier de Gaspard', 'FEATHERBY\nNaps to the sound of birdsong.\nGaspard’s Atelier') }],
    npcs: [
      { id: 'papiPlume', x: 14, y: 15, look: { hair: '#e8e8f0', shirt: '#8a5a32', pants: '#5a4a3a', hat: '#e0a030' }, facing: 'left', script: 'papiPlume' },
      { id: 'bridgeMan', x: 16, y: 8, look: LOOKS.sailor, facing: 'right', script: 'plumeBridge' },
      { id: 'birdKid', x: 5, y: 14, look: LOOKS.kid, facing: 'right', wander: true, text: [L('Les Piafou chantent tous les matins. Mais ce matin, ils se sont tus d’un coup…', 'The Chirpies sing every morning. But this morning they suddenly went quiet…')], afterStory: { text: [L('Les Piafou chantent de nouveau tous les matins. Et depuis quelques jours, ils chantent deux fois plus fort !', 'The Chirpies sing every morning again. And for a few days now, they’ve been singing twice as loud!')] } },
      { id: 'plumeGranny', x: 14, y: 4, look: LOOKS.granny, facing: 'down', wander: true, text: [L('Gaspard, le Maître d’Atelier, dort plus qu’il ne se bat. Mais quand il se réveille… attention !', 'Gaspard, the Atelier Master, sleeps more than he battles. But when he wakes up… watch out!')] },
      { id: 'pecheurPlume', x: 16, y: 14, look: LOOKS.sailor, facing: 'right', script: 'canneBois' },
      { id: 'plumePiaf', x: 15, y: 12, mon: '013', look: LOOKS.kid, facing: 'left', wander: true, text: [L('Le Piafou s’ébroue dans la vasque. Des gouttes partout ! Piou !', 'The Chirpie splashes about in the birdbath. Drops everywhere! Cheep!')] },
      { id: 'plumeKite', x: 9, y: 13, look: { hair: '#e0a030', shirt: '#5ab0e0', pants: '#4a4a6a' }, facing: 'up', wander: true, text: [
        L('Ici, le vent ne s’arrête jamais. Mon cerf-volant vole depuis mardi : je n’arrive plus à le faire redescendre !', 'The wind here never stops. My kite has been flying since Tuesday: I can’t get it back down!'),
      ] },
      { id: 'plumeFacteur', x: 15, y: 10, look: LOOKS.cyclist, facing: 'left', text: [
        L('Ici, on pose un caillou sur chaque lettre. Sinon, le vent les livre tout seul… n’importe où !', 'Here we put a pebble on every letter. Otherwise the wind delivers them by itself… anywhere at all!'),
      ] },
      { id: 'plumeRonflon', x: 15, y: 3, mon: '008', look: LOOKS.kid, facing: 'down', text: [L('Le Ronflon dort dans l’herbe. À chaque ronflement, des plumes s’envolent autour de lui.', 'The Snoozle is asleep in the grass. Every snore sends feathers flying around it.')] },
      { id: 'plumePeintre', x: 2, y: 3, look: { hair: '#3a2a1a', shirt: '#f2ead8', pants: '#6a8a4a', hat: '#c8b48a' }, facing: 'down', text: [
        L('Je dessine les plumes que le vent m’apporte. Il n’y en a pas deux pareilles !', 'I draw the feathers the wind brings me. No two are alike!'),
        L('Avec une plume taillée, on dessine plus fin qu’avec n’importe quel crayon.', 'With a cut quill you can draw finer than with any pencil.'),
      ] },
    ],
    residents: [
      // Village-Plume: the quill-maker, who cuts drawing quills from the Chirpies' moulted feathers
      { id: 'plumassiere', x: 4, y: 2, look: { hair: '#8a4a2a', shirt: '#4a8ab0', pants: '#5a4a3a', longHair: true }, facing: 'down', fromDoor: [['plume', 13, 10]], text: [
        L('Je taille des plumes à dessin dans les plumes que perdent les Piafou. Les plus légères s’appellent des Plumes Vives.', 'I cut drawing quills from the feathers the Chirpies shed. The lightest ones are called Swift Quills.'),
        L('Une Bestiole qui tient une Plume Vive agit parfois avant tout le monde. Comme si le vent la poussait !', 'A Critter holding a Swift Quill sometimes moves before everyone else. As if the wind were pushing it!'),
        L('Le calligraphe de l’Auberge écrit les surnoms des Bestioles avec mes plumes. Va le voir !', 'The calligrapher at the Inn writes Critters’ nicknames with my quills. Go and see him!'),
      ], afterStory: {
        text: [L('Le vent m’a apporté une plume toute dorée. Je n’en avais jamais vu de pareille… J’en ai taillé une Plume Vive.', 'The wind brought me a golden feather. I’d never seen one like it… I cut a Swift Quill from it.')],
        gift: { item: 'plume-vive', text: L('Prends-la : je crois bien qu’elle venait de chez toi.', 'Take it: I think it came from your way.') },
      } },
      { id: 'plumassiereMon', x: 8, y: 4, mon: '013', look: LOOKS.kid, facing: 'left', fromDoor: [['plume', 13, 10]], text: [L('Le Piafou te tend une plume du bout du bec. C’est un cadeau… ou il veut que tu la tailles ?', 'The Chirpie holds out a feather in its beak. A present… or does it want you to sharpen it?')] },
      // Village-Plume: Gaspard's neighbour and her lullaby-singing Chantouille
      { id: 'voisineGaspard', x: 2, y: 2, look: LOOKS.grandma, facing: 'down', fromDoor: [['plume', 2, 11]], text: [
        L('Je suis la voisine de Gaspard. Il ronfle si fort que les Piafou lui répondent en chantant !', 'I’m Gaspard’s neighbour. He snores so loudly the Chirpies sing back to him!'),
        L('Pour faire la sieste au frais, il a ouvert toutes les fenêtres de son Atelier. Ça fait de ces courants d’air ! On y glisse sur le papier glacé jusqu’à se cogner quelque part.', 'To nap somewhere cool, he opened every window of his Atelier. What a draught! You slide over the glossy paper until you bump into something.'),
      ] },
      { id: 'voisineMon', x: 5, y: 4, mon: '005', look: LOOKS.kid, facing: 'left', fromDoor: [['plume', 2, 11]], text: [L('Le Chantouille fredonne une berceuse… Tu bâilles déjà.', 'The Croonball hums a lullaby… You’re yawning already.')] },
    ],
  },

  atelierPlume: {
    id: 'atelierPlume',
    name: L('Atelier Plume', 'Feather Atelier'),
    indoor: true,
    border: 'void',
    backdrop: 'lab',
    // Gaspard opened every window: the gusts are glossy paper you slide on until something stops you. A perch in
    // each hall (Nina's, then Lou's) is the only way on, and the gap in front of Gaspard is reached from Lou's
    // perch (src/data/ateliers/plume.test.ts)
    rows: [
      'WWwWwWqWqWwWwWW',
      'WphffcccccffhpW',
      'WtfffcccccffftW',
      'WpfffffffffffpW',
      'WCCCCCCfCCCCCCW',
      'WIpIIIIIIIffIIW',
      'WIIIIIpIIIffIIW',
      'WIpIIIIIIIIIIIW',
      'WCCICCCCCCCCCCW',
      'WIffIIIIIIIIIIW',
      'WIffIIIIIIIpIIW',
      'WIIIIIpIIIIIIIW',
      'WIIIIIIIIIIIIIW',
      'WffffffffffffpW',
      'WpfffffffffffpW',
      'WWWWWWWXWWWWWWW',
    ],
    warps: [{ x: 7, y: 15, to: { map: 'plume', x: 8, y: 11, facing: 'down' } }],
    npcs: [
      { id: 'plumeT4', x: 10, y: 3, look: { hair: '#6a4a2a', shirt: '#c8b48a', pants: '#5a5a7a', hat: '#8ab0e0' }, facing: 'left', trainer: 'plumeT4', sight: 3 },
      { id: 'gaspard', x: 7, y: 2, look: LOOKS.leaderPlume, facing: 'down', trainer: 'gaspard', sight: 1 },
      { id: 'plumeT3', x: 11, y: 6, look: { hair: '#e0a030', shirt: '#5ab0e0', pants: '#4a4a6a', longHair: true, bow: '#f05a7a' }, facing: 'left', trainer: 'plumeT3', sight: 1 },
      { id: 'plumeT2', x: 2, y: 9, look: LOOKS.girl, facing: 'right', trainer: 'plumeT2', sight: 1 },
      { id: 'plumeT1', x: 10, y: 13, look: LOOKS.hiker, facing: 'left', trainer: 'plumeT1', sight: 3 },
      { id: 'plumeGuide', x: 5, y: 14, look: { hair: '#3a2a1a', shirt: '#ffffff', pants: '#5a8ad6' }, facing: 'right',
        text: [
          L('Chut… Gaspard fait la sieste. Ses Bestioles Normal tapent dur, mais les Spectres ne craignent pas leurs coups !', 'Shh… Gaspard is napping. His Normal Critters hit hard, but Ghosts don’t fear their blows!'),
          L('Il a ouvert toutes les fenêtres : les courants d’air font filer sur le papier glacé jusqu’au premier obstacle. Les perchoirs, eux, ne glissent pas !', 'He opened every window: the draughts send you sliding over the glossy paper until something stops you. The perches don’t slide!'),
        ] },
    ],
  },
};
