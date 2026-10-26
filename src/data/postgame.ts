import { L, type LText } from '../i18n';
import { nextRandom, randomInt } from '../engine/rng';
import { createMon, healMon, xpAt, type Mon } from '../engine/pk/creature';
import { NEUTRAL_NATURE } from './natures';
import { move } from './moves';
import { creature } from './creatures';
import { ITEM_BY_ID } from './items';
import type { TrainerDef } from './trainers';

// ------------------------------------------------------------------ Grand Concours

/** One opponent of the Grand Concours, fought in a row without resting at an Inn. */
export interface ConcoursStage {
  /** Index in the hall (1–4 Grands Maîtres, 5 the champion). */
  n: number;
  trainer: TrainerDef;
  look: string;
}

const stage = (n: number, look: string, t: Omit<TrainerDef, 'money'> & { money?: number }): ConcoursStage =>
  ({ n, look, trainer: { money: 5000 + n * 1000, ...t } });

/**
 * Four Atelier Masters at their best, then Prof. Fusain. Levels are for Normal (Easy and Hard
 * shift them like any trainer).
 */
export const CONCOURS: ConcoursStage[] = [
  stage(1, 'leaderAqua', {
    id: 'gcMarine', name: L('Grande Maîtresse Marine', 'Grand Master Marine'),
    party: [
      { species: '005', level: 45 }, { species: '006', level: 45, item: 'clochette' }, { species: '014', level: 46 },
      { species: '017', level: 46, item: 'crayon-bleu' }, { species: '003', level: 47, item: 'baie-doree' },
    ],
    before: [
      L('Bienvenue au Grand Concours ! Ici, quatre Grandes Maîtresses et un dernier artiste t’attendent, l’un après l’autre.', 'Welcome to the Grand Contest! Four Grand Masters and one last artist are waiting for you, one after the other.'),
      L('Pas d’Auberge entre nous : seulement ton sac et ton courage. Que l’aquarelle déborde !', 'No Inn between us: only your bag and your courage. Let the watercolours run!'),
    ],
    after: [L('Quelle vague ! Passe, la suite t’attend.', 'What a wave! Go on, the next one is waiting.')],
  }),
  stage(2, 'leaderBraise', {
    id: 'gcAmbre', name: L('Grande Maîtresse Ambre', 'Grand Master Amber'),
    party: [
      { species: '013', level: 45 }, { species: '004', level: 45 }, { species: '008', level: 46 },
      { species: '018', level: 45, item: 'plume-vive' }, { species: '002', level: 48, item: 'bille-ardente' },
    ],
    before: [L('Tu as éteint l’aquarelle de Marine ? Voyons si tu tiens la chaleur de mon crayon rouge !', 'You put out Marine’s watercolours? Let’s see if you can take the heat of my red crayon!')],
    after: [L('Mes braises sont froides… Bravo !', 'My embers have gone cold… Well done!')],
  }),
  stage(3, 'leaderPaillette', {
    id: 'gcCelestine', name: L('Grande Maîtresse Célestine', 'Grand Master Celestine'),
    party: [
      { species: '005', level: 46, item: 'baie-reveil' }, { species: '007', level: 46 }, { species: '016', level: 46, item: 'ruban-tenace' },
      { species: '006', level: 47 }, { species: '014', level: 48, item: 'baie-doree' },
    ],
    before: [L('Les paillettes brillent même au fond d’une trousse. Montre-moi les tiennes !', 'Glitter shines even at the bottom of a pencil case. Show me yours!')],
    after: [L('Éblouissant ! Il ne reste plus que Nocturne… et lui.', 'Dazzling! Only Nocturne is left… and him.')],
  }),
  stage(4, 'leaderEncre', {
    id: 'gcNocturne', name: L('Grande Maîtresse Nocturne', 'Grand Master Nocturne'),
    party: [
      { species: '006', level: 45 }, { species: '010', level: 45 }, { species: '008', level: 45, item: 'baie-menthe' },
      { species: '007', level: 45, item: 'echarpe-tetue' }, { species: '011', level: 46, item: 'baie-doree' },
    ],
    before: [L('L’encre de minuit efface les hésitations. Tu es là pour la dernière page ? Il faudra passer par moi.', 'Midnight ink washes away doubts. Here for the last page? You’ll have to get past me.')],
    after: [L('Ton trait est sûr. Va. Il t’attend depuis le début.', 'Your line is steady. Go. He has been waiting for you from the start.')],
  }),
  stage(5, 'prof', {
    id: 'gcFusain', name: L('Prof. Fusain', 'Prof. Charcoal'), money: 20000,
    party: [
      { species: '008', level: 44 }, { species: '014', level: 44, item: 'baie-doree' }, { species: '007', level: 44 },
      { species: '024', level: 44 }, { species: '023', level: 44 }, { species: '025', level: 45, item: 'baie-doree' },
    ],
    before: [
      L('Te voilà, {name}. Clic-clac : je voulais une photo de toi ici, au sommet du Concours.', 'Here you are, {name}. Click-clack: I wanted a picture of you here, at the top of the Contest.'),
      L('Tu te souviens des trois Bestioles de mon labo ? Je les ai toutes dessinées… enfin, toi, tu les as dessinées. Je les ai gardées en photo.', 'Remember the three Critters in my lab? I drew them all… well, you drew them. I kept them in photos.'),
      L('Montre-moi jusqu’où tes dessins peuvent aller !', 'Show me how far your drawings can go!'),
    ],
    after: [L('Voilà la plus belle photo de ma collection.', 'That’s the finest picture in my collection.')],
  }),
];

// ------------------------------------------------------------------ Hall of Fame

export interface HallEntry {
  /** When the champion was beaten (ms). */
  date: number;
  team: { species: string; nickname?: string; level: number; shiny?: boolean }[];
}

export function hallEntry(party: Mon[], date: number): HallEntry {
  return {
    date,
    team: party.filter((m) => !m.egg).map((m) => ({ species: m.species, nickname: m.nickname, level: m.level, shiny: m.shiny || undefined })),
  };
}

// ------------------------------------------------------------------ Tour des Défis

/** Battles in a round of the Tour des Défis. */
export const TOWER_ROUND = 7;
export const TOWER_TEAM = 3;
export const TOWER_LEVEL = 50;

/** Bestioles strong enough for the tower (first forms that evolve are left out). */
export const TOWER_POOL = ['001', '020', '024', '002', '021', '025', '003', '022', '023', '027', '028', '029', '030', '031', '032', '033', '034', '035', '036', '038', '040', '041', '042', '043', '045', '046', '047', '048', '049', '050', '004', '005', '006', '007', '008', '010', '013', '014', '016', '017', '018', '019'];
const LEGENDS = ['011'];
const TOWER_ITEMS = [
  'baie-doree', 'baie-prisme', 'baie-menthe', 'gouter', 'plume-vive', 'loupe', 'clochette', 'ruban-tenace',
  'casque-pointes', 'bandeau-tetu', 'lunettes-tetues', 'echarpe-tetue', 'bille-ardente', 'tablier-peintre',
];
const CLASSES: LText[] = [
  L('Dessinatrice', 'Sketcher'), L('Peintre', 'Painter'), L('Sculpteur', 'Sculptor'), L('Graphiste', 'Designer'),
  L('Illustratrice', 'Illustrator'), L('Calligraphe', 'Calligrapher'), L('Aquarelliste', 'Watercolourist'), L('Pastelliste', 'Pastellist'),
];
const NAMES = ['Alma', 'Bruno', 'Coline', 'Dorian', 'Elsa', 'Fabien', 'Gaïa', 'Hugo', 'Inès', 'Jade', 'Kilian', 'Lina', 'Milo', 'Nina', 'Oscar', 'Prune', 'Rose', 'Simon', 'Tess', 'Ugo', 'Vera', 'Yuna', 'Zoé'];
const LOOKS = ['kid', 'girl', 'hiker', 'granny', 'sailor', 'ghostgirl', 'grandma', 'clerk'];

/** Round of the tower the next battle belongs to (1 for the first seven wins of a streak). */
export const towerRound = (streak: number) => Math.floor(streak / TOWER_ROUND) + 1;

export interface TowerFoe {
  name: LText;
  look: string;
  party: Mon[];
}

/** A random tower opponent: three different Bestioles at level 50, tougher round after round. */
export function towerFoe(streak: number, st: { rng: number }): TowerFoe {
  const round = towerRound(streak);
  const iv = Math.min(31, 6 + 4 * round);
  const pool = round >= 3 ? [...TOWER_POOL, ...LEGENDS] : [...TOWER_POOL];
  const party: Mon[] = [];
  const usedItems = new Set<string>();
  while (party.length < TOWER_TEAM) {
    const species = pool.splice(randomInt(st, pool.length), 1)[0];
    const m = createMon(species, TOWER_LEVEL, st, { hp: iv, atk: iv, def: iv, spa: iv, spd: iv, spe: iv });
    m.nature = round >= 2 ? m.nature : NEUTRAL_NATURE;
    m.shiny = false;
    // later rounds: a held item (each once) and sometimes a stencil move
    if (nextRandom(st) < 0.25 * round) {
      const free = TOWER_ITEMS.filter((i) => !usedItems.has(i));
      const it = free[randomInt(st, free.length)];
      usedItems.add(it);
      m.item = it;
    }
    const stencils = creature(species).stencils;
    if (round >= 2 && stencils.length && nextRandom(st) < 0.5) {
      const mv = ITEM_BY_ID[stencils[randomInt(st, stencils.length)]]?.move;
      if (mv && !m.moves.some((s) => s.id === mv)) m.moves[randomInt(st, m.moves.length)] = { id: mv, pp: move(mv).pp };
    }
    party.push(m);
  }
  const cls = CLASSES[randomInt(st, CLASSES.length)];
  const who = NAMES[randomInt(st, NAMES.length)];
  return { name: L(`${cls.fr} ${who}`, `${cls.en} ${who}`), look: LOOKS[randomInt(st, LOOKS.length)], party };
}

/** The player's Bestiole for a tower battle: a full-health copy at level 50 (the real one is unchanged). */
export function towerCopy(m: Mon): Mon {
  const c: Mon = structuredClone(m);
  c.level = TOWER_LEVEL;
  c.xp = xpAt(c.level);
  healMon(c);
  return c;
}

/** Points for a win: one per battle, plus a bonus for finishing a round (bigger later on). */
export function towerPoints(streak: number): number {
  return streak % TOWER_ROUND === 0 ? 1 + 2 + Math.min(towerRound(streak - 1), 5) : 1;
}

/** What the tower exchanges for points. */
export const TOWER_STOCK: Record<string, number> = {
  'super-spray': 2, 'baie-doree': 4, 'baie-prisme': 4, 'pierre-immuable': 8, 'papier-calque': 12,
  'plume-vive': 12, 'loupe': 12, 'clochette': 12, 'ruban-tenace': 16, 'casque-pointes': 16,
  'bille-ardente': 16, 'tablier-peintre': 16, 'bandeau-tetu': 24, 'lunettes-tetues': 24, 'echarpe-tetue': 24,
  'crayon-magique-feu': 16, 'crayon-magique-eau': 16, 'crayon-magique-electrique': 16, 'crayon-magique-plante': 16,
  'crayon-magique-glace': 16, 'crayon-magique-fee': 16, 'crayon-magique-psy': 16, 'crayon-magique-tenebres': 16,
};
