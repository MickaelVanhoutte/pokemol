import { L, type LText } from '../i18n';
import type { TeamMember } from '../engine/battle/types';

export interface TrainerDef {
  id: string;
  name: LText;
  team: TeamMember[];
  deck: string[];
  before: LText[];
  after: LText[];
  coins: number;
  glitter: number;
}

const basic = ['potion', 'pile', 'pile', 'pile', 'gomme', 'crayon', 'taille-crayon', 'bouclier', 'echange', 'potion'];

export const TRAINERS: Record<string, TrainerDef> = {
  leo: {
    id: 'leo', name: L('Gamin Léo', 'Kid Leo'),
    team: [{ defId: '004', level: 4 }], deck: basic,
    before: [L('Hé ! Tu as une Bestiole ? Moi aussi ! On se bat ?', 'Hey! You’ve got a Critter? Me too! Let’s battle!')],
    after: [L('Oh non… Mon Zigzou a fait des étincelles pour rien !', 'Oh no… My Ziggle sparked for nothing!')],
    coins: 120, glitter: 10,
  },
  iris: {
    id: 'iris', name: L('Fillette Iris', 'Lass Iris'),
    team: [{ defId: '006', level: 5 }, { defId: '007', level: 4 }], deck: [...basic, 'maman'],
    before: [L('J’ai dessiné mes Bestioles moi-même ! Regarde comme elles sont jolies !', 'I drew my Critters myself! Look how pretty they are!')],
    after: [L('Elles sont jolies ET fortes, les tiennes…', 'Yours are pretty AND strong…')],
    coins: 160, glitter: 15,
  },
  luna: {
    id: 'luna', name: L('Médium Luna', 'Medium Luna'),
    team: [{ defId: '009', level: 6 }, { defId: '005', level: 6 }], deck: [...basic, 'gribouillage', 'piece'],
    before: [L('Les esprits de la brume m’ont parlé de toi…', 'The spirits of the mist told me about you…')],
    after: [L('Les esprits n’avaient pas prévu ça.', 'The spirits didn’t see that coming.')],
    coins: 220, glitter: 20,
  },
  paul: {
    id: 'paul', name: L('Randonneur Paul', 'Hiker Paul'),
    team: [{ defId: '008', level: 6 }, { defId: '007', level: 5 }], deck: [...basic, 'potion+', 'professeur'],
    before: [L('Rien de tel qu’une bonne marche… et un bon combat !', 'Nothing beats a good hike… and a good battle!')],
    after: [L('Ouf ! Je vais faire une sieste, comme Ronflon.', 'Phew! I’ll take a nap, like Snoozle.')],
    coins: 260, glitter: 20,
  },
};

/** Gomme picks the starter that yours beats, so the very first battle is winnable. */
export const RIVAL_COUNTER: Record<string, string> = { '001': '003', '002': '001', '003': '002' };
