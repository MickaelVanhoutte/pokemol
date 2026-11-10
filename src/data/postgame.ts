import { L, type LText } from '../i18n';
import { nextRandom, randomInt } from '../engine/rng';
import { createMon, healMon, xpAt, type Mon } from '../engine/pk/creature';
import { NEUTRAL_NATURE } from './natures';
import { move } from './moves';
import { CREATURE_BY_ID, CUSTOM_ID, creature } from './creatures';
import { ITEM_BY_ID } from './items';
import { planTeam, POSTGAME_ACE, rivalFinalTeam, type TrainerDef, type TrainerMon } from './trainers';

// ------------------------------------------------------------------ Grand Concours

/** One opponent of the Grand Concours, fought in a row without resting at an Inn. */
export interface ConcoursStage {
  /** Index in the hall (1–4 Grands Maîtres, 5 the champion). */
  n: number;
  trainer: TrainerDef;
  look: string;
}

const stage = (n: number, look: string, t: Omit<TrainerDef, 'money'> & { money?: number }): ConcoursStage =>
  ({ n, look, trainer: { money: 5000 + n * 1000, fairCopy: true, items: ['super-potion', 'super-potion'], ...t, party: planTeam(t.party) } });

/**
 * Four Atelier Masters at their best, then Prof. Fusain. Levels are for Normal (Easy and Hard
 * shift them like any trainer).
 */
export const CONCOURS: ConcoursStage[] = [
  stage(1, 'leaderAqua', {
    id: 'gcMarine', name: L('Grande Maîtresse Marine', 'Grand Master Marine'),
    party: [
      { species: '005', level: 53 }, { species: '006', level: 53, item: 'clochette' }, { species: '060', level: 54 },
      { species: '017', level: 53 }, { species: '003', level: 55, item: 'baie-doree' },
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
      { species: '081', level: 52 }, { species: '004', level: 53 }, { species: '008', level: 51 },
      { species: '018', level: 51 }, { species: '002', level: 56, item: 'bille-ardente' },
    ],
    before: [L('Tu as éteint l’aquarelle de Marine ? Voyons si tu tiens la chaleur de mon crayon rouge !', 'You put out Marine’s watercolours? Let’s see if you can take the heat of my red crayon!')],
    after: [L('Mes braises sont froides… Bravo !', 'My embers have gone cold… Well done!')],
  }),
  stage(3, 'leaderPaillette', {
    id: 'gcCelestine', name: L('Grande Maîtresse Célestine', 'Grand Master Celestine'),
    party: [
      { species: '005', level: 54, item: 'baie-reveil' }, { species: '086', level: 54 }, { species: '053', level: 52 },
      { species: '006', level: 55 }, { species: '014', level: 54, item: 'baie-doree' },
    ],
    before: [L('Les paillettes brillent même au fond d’une trousse. Montre-moi les tiennes !', 'Glitter shines even at the bottom of a pencil case. Show me yours!')],
    after: [L('Éblouissant ! Il ne reste plus que Nocturne… et lui.', 'Dazzling! Only Nocturne is left… and him.')],
  }),
  stage(4, 'leaderEncre', {
    id: 'gcNocturne', name: L('Grande Maîtresse Nocturne', 'Grand Master Nocturne'),
    party: [
      { species: '055', level: 53 }, { species: '010', level: 53 }, { species: '008', level: 53, item: 'baie-menthe' },
      { species: '007', level: 53 }, { species: '011', level: 57, item: 'baie-doree' },
    ],
    before: [L('L’encre de minuit efface les hésitations. Tu es là pour la dernière page ? Il faudra passer par moi.', 'Midnight ink washes away doubts. Here for the last page? You’ll have to get past me.')],
    after: [L('Ton trait est sûr. Va. Il t’attend depuis le début.', 'Your line is steady. Go. He has been waiting for you from the start.')],
  }),
  stage(5, 'prof', {
    id: 'gcFusain', name: L('Prof. Fusain', 'Prof. Charcoal'), money: 20000,
    party: [
      { species: '008', level: 53 }, { species: '014', level: 53 }, { species: '007', level: 53 },
      { species: '024', level: 53 }, { species: '023', level: 53 }, { species: '025', level: 52 },
    ],
    before: [
      L('Te voilà, {name}. Clic-clac : je voulais une photo de toi ici, au sommet du Concours.', 'Here you are, {name}. Click-clack: I wanted a picture of you here, at the top of the Contest.'),
      L('Tu te souviens des trois Bestioles de mon labo ? Je les ai toutes dessinées… enfin, toi, tu les as dessinées. Je les ai gardées en photo.', 'Remember the three Critters in my lab? I drew them all… well, you drew them. I kept them in photos.'),
      L('Montre-moi jusqu’où tes dessins peuvent aller !', 'Show me how far your drawings can go!'),
    ],
    after: [L('Voilà la plus belle photo de ma collection.', 'That’s the finest picture in my collection.')],
  }),
];

// ------------------------------------------------------------------ the Concours grows with you

/**
 * A Bestiole as grown as it can be by `level`: level, Magic Pencil and friendship evolutions (the first one listed),
 * never a story one (Coconfus).
 */
export function fullyGrown(id: string, level: number): string {
  const next = creature(id).evolutions?.find((e) => !e.story && (e.level === undefined || e.level <= level));
  return next ? fullyGrown(next.to, level) : id;
}

/** No Grand Master grows past this level (Normal; the difficulty shifts it like any trainer). */
export const CONCOURS_MAX_LEVEL = 70;

/**
 * How a Grand Master's team changes as you keep winning: a sixth Bestiole from the second win (`wins` 2), then
 * one of two other teams of her type from the third, turn and turn about (the ace stays last).
 */
interface ConcoursPlan { sixth: string; variants: [string[], string[]] }
const PLANS: Record<string, ConcoursPlan> = {
  gcMarine: { sixth: '070', variants: [['102', '042', '114', '095', '023'], ['100', '060', '017', '042', '023']] },
  gcAmbre: { sixth: '077', variants: [['122', '081', '018', '040', '025'], ['081', '122', '027', '050', '025']] },
  gcCelestine: { sixth: '047', variants: [['028', '086', '119', '129', '014'], ['083', '087', '053', '028', '014']] },
  gcNocturne: { sixth: '097', variants: [['066', '088', '075', '098', '011'], ['055', '057', '100', '128', '011']] },
};

const AGAIN = L('Te revoilà au Concours ! Depuis ta victoire, mes Bestioles ont grandi, elles aussi.', 'Back at the Contest! Since your win, my Critters have grown too.');
const PROF_AGAIN = [
  L('Te revoilà, {name}. Clic-clac : mes photos ont pris des couleurs depuis ta dernière victoire.', 'Here you are again, {name}. Click-clack: my photos have gained colour since your last win.'),
  L('Montre-moi encore jusqu’où tes dessins peuvent aller !', 'Show me again how far your drawings can go!'),
];
const PROF_MIRROR = [
  L('Te revoilà, {name}. Cette fois, j’ai pris en photo ton équipe du Panthéon… et je l’ai redessinée.', 'Here you are again, {name}. This time I photographed your Hall of Fame team… and drew it again.'),
  L('Voyons si tu bats tes propres dessins !', 'Let’s see if you can beat your own drawings!'),
];

/**
 * Stage `n` of the Grand Concours after `wins` wins (`hallOfFame.length`). The first time it is `CONCOURS` as
 * written; after that every Bestiole is fully grown and two levels stronger per win (up to `CONCOURS_MAX_LEVEL`),
 * the Grand Masters get a sixth Bestiole and then other teams, and from the fourth win the Prof brings your
 * own last Hall of Fame team, redrawn.
 */
export function concoursStage(n: number, wins: number, hall: HallEntry[] = []): ConcoursStage {
  const base = CONCOURS[n - 1];
  if (wins <= 0) return base;
  const up = 2 * Math.min(wins, 8);
  const lv = (l: number) => Math.min(CONCOURS_MAX_LEVEL, l + up);
  const plan = PLANS[base.trainer.id];
  const champion = n === CONCOURS.length;
  const mirror = champion && wins >= 4 ? (hall.at(-1)?.team ?? []).filter((m) => m.species in CREATURE_BY_ID && m.species !== CUSTOM_ID).slice(0, 6) : [];
  let party: TrainerMon[];
  if (mirror.length) party = mirror.map((m) => ({ species: m.species, level: 53 }));
  else {
    const species = plan && wins >= 3 ? plan.variants[wins % 2] : base.trainer.party.map((m) => m.species);
    party = base.trainer.party.map((m, i) => ({ ...m, species: species[i] ?? m.species }));
    if (plan && wins >= 2) party.splice(party.length - 1, 0, { species: plan.sixth, level: Math.min(...base.trainer.party.map((m) => m.level)) });
  }
  // grown and stronger: their moves and natures are planned again for what they became
  party = planTeam(party.map((m) => ({ ...m, level: lv(m.level), species: fullyGrown(m.species, lv(m.level)) })));
  const before = champion ? (mirror.length ? PROF_MIRROR : PROF_AGAIN) : n === 1 ? [base.trainer.before[0], AGAIN] : [AGAIN];
  return { ...base, trainer: { ...base.trainer, party, before, money: base.trainer.money + 1000 * Math.min(wins, 10) } };
}

// ------------------------------------------------------------------ Atelier Masters' rematches

/** No Master's rematch team grows past this level (Normal). */
export const REMATCH_MAX_LEVEL = 75;

/** Each Atelier Master's team for rematches after the story: six Bestioles of her type, her ace last. */
export const MASTER_REMATCH: Record<string, string[]> = {
  mireille: ['092', '090', '048', '038', '104', '007'],
  gaspard: ['026', '049', '120', '047', '008', '036'],
  marine: ['070', '042', '114', '102', '060', '023'],
  zelie: ['046', '083', '079', '019', '092', '027'],
  ambre: ['018', '081', '122', '077', '050', '025'],
  celestine: ['047', '014', '086', '129', '119', '028'],
  basile: ['094', '098', '064', '125', '124', '024'],
  nocturne: ['097', '128', '066', '098', '088', '011'],
};

/**
 * A Master's rematch team (`times`: rematches already won): six fully grown Bestioles, the ace at the player's
 * team's level (`level`, `teamLevel`), at least `POSTGAME_ACE` (L48), two more per rematch won (five times at most), up to
 * `REMATCH_MAX_LEVEL`; its teammates two or three levels below. The ace keeps the item of her first battle.
 */
export function masterRematchParty(t: TrainerDef, times: number, level: number): TrainerMon[] {
  const team = MASTER_REMATCH[t.id] ?? t.party.map((m) => m.species);
  const ace = Math.min(REMATCH_MAX_LEVEL, Math.max(POSTGAME_ACE, level) + 2 * Math.min(times, 5));
  const item = t.party.at(-1)?.item;
  return planTeam(team.map((sp, i) => {
    const last = i === team.length - 1;
    const lv = last ? ace : ace - 3 + (i % 2);
    return { species: fullyGrown(sp, lv), level: lv, ...(last && item ? { item } : {}) };
  }));
}

// ------------------------------------------------------------------ the rival, after the story

/** No rival rematch team grows past this level (Normal). */
export const RIVAL_MAX_LEVEL = 80;

/**
 * The rival's team for his weekly rematch at Masterpiece Square (`wins`: rematches the player won): his finale team
 * (with choice 5's touches), fully grown, fifteen levels higher (a little under a Concours winner) and two more per win (ten wins at most), up to
 * `RIVAL_MAX_LEVEL`; `extra` levels on top (he trains harder after the epilogue).
 */
export function rivalPostTeam(rivalStarter: string, wins: number, choice?: 'a' | 'b', extra = 0): TrainerMon[] {
  const up = 15 + 2 * Math.min(wins, 10) + extra;
  return planTeam(rivalFinalTeam(rivalStarter, choice).map((m) => {
    const level = Math.min(RIVAL_MAX_LEVEL, m.level + up);
    return { ...m, level, species: fullyGrown(m.species, level) };
  }));
}

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
export const TOWER_POOL = ['117', '119', '120', '001', '020', '024', '002', '021', '025', '003', '022', '023', '027', '028', '029', '030', '031', '032', '033', '034', '035', '036', '038', '040', '041', '042', '043', '045', '046', '047', '048', '049', '050', '004', '005', '006', '007', '008', '010', '013', '014', '016', '017', '018', '019',
  '053', '055', '057', '059', '060', '061', '064', '066', '068', '070', '075', '077', '079', '081', '083', '086', '087', '088',
  '090', '092', '094', '095', '097', '098', '100', '102', '104', '106', '107', '109', '110', '111', '122', '124'];
const LEGENDS = ['071', '072'];
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
  'plume-vive': 12, 'loupe': 12, 'couronne-carton': 12, 'clochette': 12, 'ruban-tenace': 16, 'casque-pointes': 16,
  'bille-ardente': 16, 'tablier-peintre': 16, 'bandeau-tetu': 24, 'lunettes-tetues': 24, 'echarpe-tetue': 24,
  // only the Magic Pencils some Bestiole evolves with
  'crayon-magique-feu': 16, 'crayon-magique-eau': 16, 'crayon-magique-electrique': 16, 'crayon-magique-glace': 16,
};
