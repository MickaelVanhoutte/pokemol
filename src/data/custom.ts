import { L, type LText } from '../i18n';
import { CREATURES, CUSTOM_ID, creature, setCustomSpecies } from './creatures';
import { STENCIL_MOVES, stencilId } from './items';
import { MOVES, MOVE_BY_ID, move } from './moves';
import { TALENTS, talent } from './talents';
import type { SpeciesDef, StatKey, Stats, TypeId } from './schema';

/**
 * L'Atelier des Brouillons (Hameau-Brouillon): the player draws their own Bestiole, gives it one or two types,
 * spreads its base stats, picks a talent and four moves. One per game, kept in the save (`save.atelier`) and
 * changed at the workshop as often as they like: the Bestiole keeps its level. Its limits keep it a good
 * teammate, not a broken one (checked by src/data/custom.test.ts and the balance sims).
 */
export interface CustomDesign {
  /** Its species name, written by the player. */
  name: string;
  /** What kind of Bestiole it is (« Bestiole ___ »). */
  kind: string;
  type: TypeId;
  type2?: TypeId;
  base: Stats;
  talent: string;
  moves: string[];
  /** The drawing, trimmed (a webp data URL), and its overworld miniature (a png data URL). */
  art: string;
  mini: string;
}

export const STAT_TOTAL = 480;
export const STAT_MIN = 30;
export const STAT_MAX = 130;
export const STAT_STEP = 5;
export const NAME_MAX = 12;
/** It joins at the level of the strongest teammate minus two, and never below this. */
export const JOIN_LEVEL = 35;

const TALENT_IDS = new Set(TALENTS.map((t) => t.id));

/** Talents it may take: common ones, none of the immunities, double same-type bonus or always-on boosts. */
export const CUSTOM_TALENTS = [
  'rembourrage', 'increvable', 'petits-traits', 'regard-noir', 'recoloriage', 'papier-epais', 'coup-de-chance',
  'bonne-etoile', 'souple', 'petit-soin', 'nouvelle-peau', 'leve-tot', 'mille-yeux', 'brume-epaisse', 'poils-electriques',
];

const familyRoot = (id: string) => {
  let sp = creature(id);
  while (sp.evolvesFrom) sp = creature(sp.evolvesFrom);
  return sp.id;
};

let learned: Map<string, Set<string>> | null = null;
/** For each move, the families that learn it by levelling up. */
function learners() {
  if (learned) return learned;
  learned = new Map();
  for (const sp of CREATURES) {
    for (const [, id] of sp.learnset) {
      if (!learned.has(id)) learned.set(id, new Set());
      learned.get(id)!.add(familyRoot(sp.id));
    }
  }
  return learned;
}

/** A family's own move: only one family learns it, and no stencil teaches it. */
export const isSignature = (id: string) => learners().get(id)?.size === 1 && !STENCIL_MOVES.includes(id);

/**
 * The moves it may pick: those of its types and Normal that a Bestiole learns or a stencil teaches, below 100
 * power, never another family's own move.
 */
export function customMovePool(types: readonly TypeId[]): string[] {
  const ok = new Set<TypeId>([...types, 'normal']);
  return MOVES
    .filter((m) => ok.has(m.type) && m.power < 100 && (learners().has(m.id) || STENCIL_MOVES.includes(m.id)) && !isSignature(m.id))
    .map((m) => m.id);
}

const STATS: StatKey[] = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
export const statTotal = (b: Stats) => STATS.reduce((s, k) => s + b[k], 0);
export const typesOfDesign = (d: Pick<CustomDesign, 'type' | 'type2'>): TypeId[] => (d.type2 ? [d.type, d.type2] : [d.type]);

/** What still keeps the design from being finished (empty when it is valid). */
export function designProblems(d: CustomDesign): LText[] {
  const out: LText[] = [];
  if (!d.art || !d.mini) out.push(L('Dessine-la d’abord.', 'Draw it first.'));
  if (d.type2 === d.type) out.push(L('Deux types différents, ou un seul.', 'Two different types, or just one.'));
  const total = statTotal(d.base);
  if (total !== STAT_TOTAL) out.push(L(`Répartis exactement ${STAT_TOTAL} points (${total} pour l’instant).`, `Spread exactly ${STAT_TOTAL} points (${total} so far).`));
  if (STATS.some((k) => d.base[k] < STAT_MIN || d.base[k] > STAT_MAX || d.base[k] % STAT_STEP)) out.push(L(`Chaque stat entre ${STAT_MIN} et ${STAT_MAX}.`, `Each stat between ${STAT_MIN} and ${STAT_MAX}.`));
  if (!CUSTOM_TALENTS.includes(d.talent)) out.push(L('Choisis un talent.', 'Pick a talent.'));
  const pool = customMovePool(typesOfDesign(d));
  const own = typesOfDesign(d);
  if (!d.moves.length || d.moves.length > 4 || new Set(d.moves).size !== d.moves.length || d.moves.some((m) => !pool.includes(m))) out.push(L('Choisis de 1 à 4 capacités.', 'Pick 1 to 4 moves.'));
  else if (!d.moves.some((m) => move(m).cat !== 'status' && own.includes(move(m).type))) out.push(L('Il lui faut au moins une attaque de son type.', 'It needs at least one attacking move of its own type.'));
  if (!d.name.trim() || d.name.length > NAME_MAX) out.push(L('Donne-lui un nom.', 'Give it a name.'));
  if (!d.kind.trim() || d.kind.length > NAME_MAX) out.push(L('Dis quelle Bestiole c’est.', 'Say what kind of Critter it is.'));
  return out;
}

export const validDesign = (d: CustomDesign) => !designProblems(d).length;

/** The species made from the design: a single-stage Bestiole, drawn turned to the left. */
export function customSpecies(d: CustomDesign): SpeciesDef {
  const types = typesOfDesign(d);
  const top = STATS.reduce((a, k) => (d.base[k] > d.base[a] ? k : a), 'hp' as StatKey);
  return {
    id: CUSTOM_ID, slug: 'atelier', faces: 'left',
    name: L(d.name.trim(), d.name.trim()), kind: L(`Bestiole ${d.kind.trim()}`, `${d.kind.trim()} Critter`),
    type: d.type, ...(d.type2 ? { type2: d.type2 } : {}),
    base: { ...d.base },
    catchRate: 45, baseExp: 170, evYield: { [top]: 2 }, rarity: 'rare',
    // stencils of its types and Normal, and the Paper Shield anyone can learn
    stencils: STENCIL_MOVES.flatMap((id, i) => (types.includes(move(id).type) || move(id).type === 'normal' || id === 'bouclier-papier' ? [stencilId(i + 1)] : [])),
    learnset: d.moves.map((id): [number, string] => [1, id]),
    talents: [d.talent], hiddenTalent: d.talent,
    dex: L(
      'Dessinée par {name} à l’Atelier des Brouillons. Elle n’existe nulle part ailleurs : c’est la seule de son espèce.',
      'Drawn by {name} at the Draft Workshop. It exists nowhere else: it is the only one of its kind.',
    ),
  };
}

/**
 * Puts the save's design among the species (or takes it out when there is none). A design saved under older rules
 * still loads: unknown moves are left out and an unknown talent replaced, so its Bestiole never breaks.
 */
export function registerCustom(d?: CustomDesign) {
  if (!d) return setCustomSpecies();
  const moves = d.moves.filter((id) => id in MOVE_BY_ID);
  const fixed = { ...d, moves: moves.length ? moves : ['bousculade'], talent: TALENT_IDS.has(d.talent) ? d.talent : CUSTOM_TALENTS[0] };
  setCustomSpecies(customSpecies(fixed), d.art, d.mini);
}

/** The level it joins at: the strongest teammate's minus two, never below JOIN_LEVEL. */
export function joinLevel(levels: readonly number[]): number {
  return Math.max(JOIN_LEVEL, ...levels.map((l) => l - 2));
}

/** A design to start from: balanced stats, Normal type, its first moves picked. */
export function blankDesign(): CustomDesign {
  return {
    name: '', kind: '', type: 'normal', base: { hp: 80, atk: 80, def: 80, spa: 80, spd: 80, spe: 80 },
    talent: CUSTOM_TALENTS[0], moves: [], art: '', mini: '',
  };
}

/** Stat spreads to start from (each adds up to STAT_TOTAL). */
export const STAT_PRESETS: { name: LText; base: Stats }[] = [
  { name: L('Équilibrée', 'Balanced'), base: { hp: 80, atk: 80, def: 80, spa: 80, spd: 80, spe: 80 } },
  { name: L('Rapide', 'Swift'), base: { hp: 65, atk: 100, def: 60, spa: 70, spd: 60, spe: 125 } },
  { name: L('Costaude', 'Sturdy'), base: { hp: 110, atk: 95, def: 115, spa: 40, spd: 85, spe: 35 } },
  { name: L('Mage', 'Mage'), base: { hp: 70, atk: 35, def: 60, spa: 125, spd: 100, spe: 90 } },
];

/** Talents of the list, for the workshop. */
export const customTalents = () => CUSTOM_TALENTS.map(talent);
