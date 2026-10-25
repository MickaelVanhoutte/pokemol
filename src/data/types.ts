import { L, type LText } from '../i18n';
import type { Major, Rarity, StatKey, TypeId } from './schema';

export interface TypeInfo {
  name: LText;
  /** Main color: inner card border, energy icons. */
  color: string;
  /** Pale tint: card header and body background. */
  light: string;
  /** SVG path (24×24 viewBox) drawn white inside the type disc. */
  icon: string;
}

function burst(points: number, outer: number, inner: number): string {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 ? inner : outer;
    const a = (Math.PI * i) / points - Math.PI / 2;
    pts.push(`${(12 + r * Math.cos(a)).toFixed(2)} ${(12 + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join('L')}Z`;
}

export const TYPES: Record<TypeId, TypeInfo> = {
  plante: {
    name: L('Plante', 'Grass'), color: '#4f9a3c', light: '#eaf5e1',
    icon: 'M12 3C6.5 5.5 4 10.5 5 19.5c8.5.8 13.5-2.5 14.8-8.6C20.6 7.2 17.2 3.6 12 3zM7.5 17.5c2.5-3.5 5-6 9-8.5',
  },
  feu: {
    name: L('Feu', 'Fire'), color: '#e0652b', light: '#fdeadf',
    icon: 'M12.5 2c.8 4 6.5 6.3 6.5 12.2a7 7 0 0 1-14 0c0-3 1.7-5.2 3.3-6.4-.1 2.2.9 3.6 2.1 3.9-.6-3.5.3-7 2.1-9.7z',
  },
  eau: {
    name: L('Eau', 'Water'), color: '#3b7ad4', light: '#e0ecfc',
    icon: 'M12 2.5C9.5 7 5.5 10.8 5.5 15a6.5 6.5 0 0 0 13 0c0-4.2-4-8-6.5-12.5z',
  },
  electrique: {
    name: L('Électrique', 'Lightning'), color: '#e2b400', light: '#fff7d1',
    icon: 'M13.5 2 4.5 13.5h6l-1.5 8.5 10-12.5h-6.2z',
  },
  fee: {
    name: L('Fée', 'Fairy'), color: '#e06aa6', light: '#fde6f2',
    icon: 'M12 2.5l2.3 6.4 6.7.3-5.3 4.1 1.9 6.5L12 16l-5.6 3.8 1.9-6.5L3 9.2l6.7-.3z',
  },
  insecte: {
    name: L('Insecte', 'Bug'), color: '#86a42a', light: '#eff5da',
    icon: 'M12 6.5c-1.8-3.6-7.4-4.2-8 .5-.5 3.8 3.4 5.6 7 4.6-3.2 1.6-4.4 5.7-1.4 6.9 1.4.6 2.1-.6 2.4-1.5.3.9 1 2.1 2.4 1.5 3-1.2 1.8-5.3-1.4-6.9 3.6 1 7.5-.8 7-4.6-.6-4.7-6.2-4.1-8-.5z',
  },
  normal: {
    name: L('Normal', 'Colorless'), color: '#9b907c', light: '#f3f0ea',
    icon: burst(4, 9, 3.2),
  },
  spectre: {
    name: L('Spectre', 'Ghost'), color: '#7b60c3', light: '#eee8f8',
    icon: burst(12, 8.5, 4.2),
  },
  psy: {
    name: L('Psy', 'Psychic'), color: '#b94e9c', light: '#f8e5f2',
    icon: 'M2.5 12c2.5-4.2 5.8-6.3 9.5-6.3s7 2.1 9.5 6.3c-2.5 4.2-5.8 6.3-9.5 6.3S5 16.2 2.5 12zm9.5 3.4a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8z',
  },
  combat: {
    name: L('Combat', 'Fighting'), color: '#b5582e', light: '#f8e6dc',
    icon: 'M6 9.5V7a1.6 1.6 0 0 1 3.2 0V6a1.6 1.6 0 0 1 3.2 0v.5a1.6 1.6 0 0 1 3.2 0V8a1.6 1.6 0 0 1 3.2 0v6.5c0 3.5-2.6 6-6.2 6H11c-3 0-5-2.2-5-5z',
  },
  tenebres: {
    name: L('Ténèbres', 'Darkness'), color: '#40384f', light: '#e9e6ee',
    icon: 'M15.5 3.2a9 9 0 1 0 5.3 14.4A8 8 0 0 1 15.5 3.2z',
  },
};

export const RARITIES: Record<Rarity, { name: LText; weight: number }> = {
  common: { name: L('Commune', 'Common'), weight: 60 },
  uncommon: { name: L('Peu commune', 'Uncommon'), weight: 28 },
  rare: { name: L('Rare', 'Rare'), weight: 10 },
  holo: { name: L('Très rare', 'Very rare'), weight: 2 },
};

/** Major status labels, with the short GBA-style tag shown in HP boxes. */
export const STATUSES: Record<Major, { name: LText; tag: LText; color: string }> = {
  sleep: { name: L('Endormi', 'Asleep'), tag: L('SOM', 'SLP'), color: '#7a86c8' },
  paralyze: { name: L('Paralysé', 'Paralyzed'), tag: L('PAR', 'PAR'), color: '#c8a800' },
  poison: { name: L('Empoisonné', 'Poisoned'), tag: L('PSN', 'PSN'), color: '#a050c0' },
  burn: { name: L('Brûlé', 'Burned'), tag: L('BRL', 'BRN'), color: '#e06030' },
};

export const STAT_NAMES: Record<StatKey, LText> = {
  hp: L('PV', 'HP'),
  atk: L('Attaque', 'Attack'),
  def: L('Défense', 'Defense'),
  spa: L('Atq. Spé.', 'Sp. Atk'),
  spd: L('Déf. Spé.', 'Sp. Def'),
  spe: L('Vitesse', 'Speed'),
};

/** Attack type → defending type → multiplier (missing = ×1). */
const CHART: Partial<Record<TypeId, Partial<Record<TypeId, number>>>> = {
  normal: { spectre: 0 },
  feu: { plante: 2, insecte: 2, feu: 0.5, eau: 0.5 },
  eau: { feu: 2, eau: 0.5, plante: 0.5 },
  plante: { eau: 2, plante: 0.5, feu: 0.5, insecte: 0.5 },
  electrique: { eau: 2, electrique: 0.5, plante: 0.5 },
  combat: { normal: 2, tenebres: 2, insecte: 0.5, psy: 0.5, fee: 0.5, spectre: 0 },
  psy: { combat: 2, psy: 0.5, tenebres: 0 },
  insecte: { plante: 2, psy: 2, tenebres: 2, feu: 0.5, combat: 0.5, spectre: 0.5, fee: 0.5 },
  spectre: { spectre: 2, psy: 2, tenebres: 0.5, normal: 0 },
  tenebres: { psy: 2, spectre: 2, combat: 0.5, tenebres: 0.5, fee: 0.5 },
  fee: { combat: 2, tenebres: 2, feu: 0.5 },
};

export function effectiveness(attack: TypeId, defender: TypeId): number {
  return CHART[attack]?.[defender] ?? 1;
}

export const STATUS_IDS: Major[] = ['sleep', 'paralyze', 'poison', 'burn'];
