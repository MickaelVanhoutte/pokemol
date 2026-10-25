import { L, type LText } from '../i18n';
import { createMon, type Mon } from '../engine/pk/creature';

export interface TrainerMon {
  species: string;
  level: number;
}

export interface TrainerDef {
  id: string;
  name: LText;
  party: TrainerMon[];
  money: number;
  before: LText[];
  after: LText[];
  /** Beating this trainer gives a badge. */
  badge?: string;
  badgeName?: LText;
}

/** Trainer creatures: fixed decent IVs so battles feel the same every time. */
export function partyOf(list: TrainerMon[], seed: number): Mon[] {
  const iv = { hp: 12, atk: 12, def: 12, spa: 12, spd: 12, spe: 12 };
  return list.map((t, i) => createMon(t.species, t.level, { rng: seed + i }, iv));
}

export function trainerParty(t: TrainerDef, seed: number): Mon[] {
  return partyOf(t.party, seed);
}

const T = (t: TrainerDef) => t;

export const TRAINERS: Record<string, TrainerDef> = Object.fromEntries([
  // ---------------------------------------------------------------- Chemin des Crayons
  T({
    id: 'leo', name: L('Gamin Léo', 'Kid Leo'), party: [{ species: '006', level: 5 }], money: 100,
    before: [L('Hé ! Tu as une Bestiole ? Moi aussi ! On se bat ?', 'Hey! You’ve got a Critter? Me too! Let’s battle!')],
    after: [L('Oh non… Ma Lunelle a dansé pour rien !', 'Oh no… My Moonbun danced for nothing!')],
  }),
  T({
    id: 'iris', name: L('Fillette Iris', 'Lass Iris'), party: [{ species: '004', level: 6 }, { species: '007', level: 5 }], money: 180,
    before: [L('J’ai dessiné mes Bestioles moi-même ! Regarde comme elles sont jolies !', 'I drew my Critters myself! Look how pretty they are!')],
    after: [L('Elles sont jolies ET fortes, les tiennes…', 'Yours are pretty AND strong…')],
  }),
  // ---------------------------------------------------------------- Bois Brumeux
  T({
    id: 'luna', name: L('Médium Luna', 'Medium Luna'), party: [{ species: '009', level: 9 }, { species: '005', level: 10 }], money: 400,
    before: [L('Les esprits de la brume m’ont parlé de toi…', 'The spirits of the mist told me about you…')],
    after: [L('Les esprits n’avaient pas prévu ça.', 'The spirits didn’t see that coming.')],
  }),
  T({
    id: 'paul', name: L('Randonneur Paul', 'Hiker Paul'), party: [{ species: '007', level: 8 }, { species: '008', level: 9 }], money: 450,
    before: [L('Rien de tel qu’une bonne marche… et un bon combat !', 'Nothing beats a good hike… and a good battle!')],
    after: [L('Ouf ! Je vais faire une sieste, comme Ronflon.', 'Phew! I’ll take a nap, like Snoozle.')],
  }),
  // ---------------------------------------------------------------- Grotte Gribouillis
  T({
    id: 'max', name: L('Spéléo Max', 'Caver Max'), party: [{ species: '004', level: 11 }, { species: '007', level: 11 }], money: 500,
    before: [L('Il fait noir ici, mais mes Bestioles voient tout !', 'It’s dark in here, but my Critters see everything!')],
    after: [L('J’aurais dû prendre une lampe…', 'I should have brought a lamp…')],
  }),
  T({
    id: 'zoe', name: L('Gamine Zoé', 'Kid Zoe'), party: [{ species: '006', level: 12 }, { species: '005', level: 11 }], money: 480,
    before: [L('Chut ! Mes Bestioles chantent pour les chauves-souris.', 'Shh! My Critters are singing to the bats.')],
    after: [L('Les chauves-souris préfèrent ta chanson.', 'The bats like your song better.')],
  }),
  T({
    id: 'bob', name: L('Mineur Bob', 'Miner Bob'), party: [{ species: '008', level: 12 }], money: 600,
    before: [L('Mon Ronflon creuse des tunnels en ronflant !', 'My Snoozle digs tunnels while it snores!')],
    after: [L('Il s’est rendormi. Typique.', 'It fell asleep again. Typical.')],
  }),
  T({
    id: 'tom', name: L('Campeur Tom', 'Camper Tom'), party: [{ species: '003', level: 11 }, { species: '002', level: 11 }, { species: '001', level: 11 }], money: 550,
    before: [L('Moi aussi j’ai eu une Bestiole du Prof. Fusain ! Enfin… trois.', 'I got a Critter from Prof. Charcoal too! Well… three.')],
    after: [L('Le prof avait raison : tu es doué.', 'The prof was right: you’re good.')],
  }),
  T({
    id: 'gardien', name: L('Gardien Ronflon', 'Guardian Snoozle'), money: 1600, badge: 'grotte', badgeName: L('Badge Gribouillis', 'Scribble Badge'),
    party: [{ species: '007', level: 12 }, { species: '004', level: 12 }, { species: '008', level: 14 }],
    before: [
      L('Ronnn… pshhh… Je garde le fond de la grotte depuis cent siestes.', 'Zzzz… pshhh… I’ve guarded the back of this cave for a hundred naps.'),
      L('Si tu me réveilles… il faudra me battre !', 'If you wake me up… you’ll have to beat me!'),
    ],
    after: [L('Bâââille… Bravo. Prends ce badge et laisse-moi dormir.', 'Yaaawn… Well done. Take this badge and let me sleep.')],
  }),
  // ---------------------------------------------------------------- Tour Brumeuse
  T({
    id: 'elsa', name: L('Médium Elsa', 'Medium Elsa'), party: [{ species: '009', level: 15 }, { species: '009', level: 15 }], money: 700,
    before: [L('Deux brumes valent mieux qu’une !', 'Two mists are better than one!')],
    after: [L('La brume se dissipe…', 'The mist is clearing…')],
  }),
  T({
    id: 'pif', name: L('Farceur Pif', 'Prankster Pif'), party: [{ species: '010', level: 17 }], money: 800,
    before: [L('Bouh ! … Tu n’as pas eu peur ? Bon, on se bat alors.', 'Boo! … Not scared? Fine, let’s battle then.')],
    after: [L('Même mes mains de brume n’ont pas suffi !', 'Even my mist hands weren’t enough!')],
  }),
  T({
    id: 'rose', name: L('Conteuse Rose', 'Storyteller Rose'), party: [{ species: '005', level: 16 }, { species: '006', level: 17 }], money: 760,
    before: [L('Il était une fois… un combat terrible !', 'Once upon a time… a terrible battle!')],
    after: [L('…et tu vécus heureux et victorieux. Fin.', '…and you lived happily and victoriously. The end.')],
  }),
  T({
    id: 'hugo', name: L('Magicien Hugo', 'Magician Hugo'), party: [{ species: '007', level: 17 }, { species: '004', level: 18 }], money: 860,
    before: [L('Abracadabra ! Mes Bestioles vont te faire disparaître !', 'Abracadabra! My Critters will make you vanish!')],
    after: [L('C’est moi qui ai disparu…', 'I’m the one who vanished…')],
  }),
  T({
    id: 'ombre', name: L('Ombre de la Tour', 'Shadow of the Tower'), money: 2600, badge: 'tour', badgeName: L('Badge Brume', 'Mist Badge'),
    party: [{ species: '009', level: 21 }, { species: '010', level: 23 }, { species: '011', level: 26 }],
    before: [
      L('Hi hi hi… Tout en haut de la tour, une ombre géante te fait une grimace.', 'Hee hee hee… At the top of the tower, a giant shadow pulls a face at you.'),
      L('Tu veux jouer avec nous ? Alors joue… si tu l’oses !', 'Want to play with us? Then play… if you dare!'),
    ],
    after: [L('Hi hi… Tu ris plus fort que nous. Tu as gagné le droit de garder ce badge.', 'Hee hee… You laugh louder than us. You’ve earned this badge.')],
  }),
].map((t) => [t.id, t]));

/** Gomme picks the starter that yours beats, so the very first battle is winnable. */
export const RIVAL_COUNTER: Record<string, string> = { '001': '003', '002': '001', '003': '002' };
