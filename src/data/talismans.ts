import { L, type LText } from '../i18n';

/** Run-only relics found in dungeons. */
export interface TalismanDef {
  id: string;
  name: LText;
  text: LText;
  icon: string;
  battle?: {
    startHand?: number;
    luckyCoin?: boolean;
    firstAtkBonus?: number;
    startEnergy?: number;
    startProtect?: number;
  };
  run?: {
    healAfterFight?: number;
    catchBonus?: number;
    coinBonus?: number;
  };
}

export const TALISMANS: TalismanDef[] = [
  {
    id: 'trousse', name: L('Trousse', 'Pencil Case'), icon: '👝',
    text: L('Commencez chaque combat avec 1 carte de plus en main.', 'Start each battle with 1 more card in hand.'),
    battle: { startHand: 1 },
  },
  {
    id: 'gomme-chance', name: L('Gomme porte-bonheur', 'Lucky Eraser'), icon: '🍀',
    text: L('Votre premier lancer de pièce de chaque combat tombe du bon côté.', 'Your first coin flip in each battle lands your way.'),
    battle: { luckyCoin: true },
  },
  {
    id: 'taille-dore', name: L('Taille-crayon doré', 'Golden Sharpener'), icon: '🏅',
    text: L('Votre première attaque de chaque combat inflige 20 dégâts de plus.', 'Your first attack in each battle does 20 more damage.'),
    battle: { firstAtkBonus: 20 },
  },
  {
    id: 'cartable', name: L('Cartable', 'Schoolbag'), icon: '🎒',
    text: L('Votre Bestiole active commence chaque combat avec 1 énergie.', 'Your active Critter starts each battle with 1 energy.'),
    battle: { startEnergy: 1 },
  },
  {
    id: 'pansement', name: L('Pansement', 'Band-Aid'), icon: '🩹',
    text: L('Après chaque combat gagné, vos Bestioles récupèrent 15 PV.', 'After each battle you win, your Critters recover 15 HP.'),
    run: { healAfterFight: 15 },
  },
  {
    id: 'parapluie', name: L('Parapluie', 'Umbrella'), icon: '☂️',
    text: L('Votre Bestiole active subit 20 dégâts de moins au premier tour adverse.', 'Your active Critter takes 20 less damage during the first enemy turn.'),
    battle: { startProtect: 20 },
  },
  {
    id: 'loupe', name: L('Loupe', 'Magnifying Glass'), icon: '🔍',
    text: L('Vos Cartes vierges ont plus de chances de capturer.', 'Your Blank Cards are more likely to capture.'),
    run: { catchBonus: 0.15 },
  },
  {
    id: 'tirelire', name: L('Tirelire', 'Piggy Bank'), icon: '🐷',
    text: L('Gagnez 50 % de pièces en plus après chaque combat.', 'Earn 50% more coins after each battle.'),
    run: { coinBonus: 0.5 },
  },
];

export const TALISMAN_BY_ID: Record<string, TalismanDef> = Object.fromEntries(TALISMANS.map((t) => [t.id, t]));
