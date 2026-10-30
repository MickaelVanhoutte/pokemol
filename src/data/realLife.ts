/**
 * Days in the real house, after the ending: once a real day, the first night at an Inn wakes the player up in
 * their real bedroom (src/story/realLife.ts). There they do one thing, then go back to bed and to Papeterre;
 * each thing done grows a level (5 at most) that helps in the dream for good. Levels live in the flags
 * `reel:<id>`; `reel:jour` is the real day of the last wake-up, `reel:visite` is set while in the house,
 * `reel:fait` once the day's thing is done.
 */
import { L, type LText } from '../i18n';
import { SHINY_CHANCE } from '../engine/pk/creature';

export type ActivityId = 'dessin' | 'fenetre' | 'livre' | 'parents';
export const REAL_MAX = 5;

export interface Activity {
  id: ActivityId;
  /** Its name with its level: « Dessin ●●○○○ ». */
  name: LText;
  /** The question asked at its spot. */
  ask: LText;
  /** What it gives at a level, `{p}` the amount. */
  effect: LText;
  /** The amount at a level (shown with `effect`, in the player's language). */
  amount: (level: number) => number;
  /** The short scene, then what grows. */
  scene: LText[];
  /** Said once it is at its best. */
  maxed: LText;
}

export const ACTIVITIES: Activity[] = [
  {
    id: 'dessin', name: L('Dessin', 'Drawing'), ask: L('S’entraîner au dessin ?', 'Practise drawing?'),
    effect: L('capture +{p} %', 'catching +{p}%'), amount: (l) => 3 * l,
    scene: [L('Tu t’installes au bureau et tu dessines une Bestiole, encore et encore, jusqu’à ce que le trait soit juste.', 'You sit at the desk and draw a Critter, again and again, until the line is just right.')],
    maxed: L('Tu dessines déjà comme {g:une grande artiste|un grand artiste}. Tes Croque-Carnets n’ont plus rien à apprendre !', 'You already draw like a real artist. Your Snapbooks have nothing left to learn!'),
  },
  {
    id: 'fenetre', name: L('Imagination', 'Imagination'), ask: L('Regarder par la fenêtre et rêvasser ?', 'Look out of the window and daydream?'),
    effect: L('Bestioles pailletées {p} %', 'sparkly Critters {p}%'), amount: (l) => Math.round((SHINY_CHANCE + 0.004 * l) * 1000) / 10,
    scene: [L('Tu regardes passer les nuages. Celui-là ressemble à un Piafou… et celui-là, à une Bestiole qui n’existe pas encore, toute pailletée !', 'You watch the clouds go by. That one looks like a Chirpie… and that one, like a Critter that doesn’t exist yet, all sparkly!')],
    maxed: L('Ton imagination déborde déjà de partout. Les nuages n’ont plus de secrets pour toi !', 'Your imagination is already overflowing. The clouds have no secrets left for you!'),
  },
  {
    id: 'livre', name: L('Lecture', 'Reading'), ask: L('Lire un livre ?', 'Read a book?'),
    effect: L('expérience +{p} %', 'experience +{p}%'), amount: (l) => 4 * l,
    scene: [L('Tu lis une histoire de dragons et de chevaliers, {g:blottie|blotti} sur ton lit, jusqu’à la toute dernière page.', 'You read a story about dragons and knights, curled up on your bed, right to the very last page.')],
    maxed: L('Tu as déjà lu tous tes livres trois fois. Il en faudrait des nouveaux !', 'You’ve already read all your books three times. You’d need new ones!'),
  },
  {
    id: 'parents', name: L('Argent de poche', 'Pocket money'), ask: L('Raconter ton rêve à Papa et Maman ?', 'Tell Mummy and Daddy about your dream?'),
    effect: L('argent des combats +{p} %', 'battle money +{p}%'), amount: (l) => 5 * l,
    scene: [
      L('Tu leur racontes tout : les Bestioles, les Ateliers, la grande gomme… Ils écoutent jusqu’au bout, les yeux ronds.', 'You tell them everything: the Critters, the Ateliers, the giant eraser… They listen to the very end, wide-eyed.'),
      L('« Quelle aventure ! Tiens, ton argent de poche. Tu nous rapporteras un dessin ? »', '“What an adventure! Here’s your pocket money. Will you bring us back a drawing?”'),
    ],
    maxed: L('« Ton cochon tirelire est déjà plein à craquer ! » rit Maman.', '“Your piggy bank is already full to bursting!” laughs Mummy.'),
  },
];
export const ACTIVITY = Object.fromEntries(ACTIVITIES.map((a) => [a.id, a])) as Record<ActivityId, Activity>;

type Flags = Record<string, number>;
export const realLevel = (flags: Flags, id: ActivityId) => Math.max(0, Math.min(REAL_MAX, flags[`reel:${id}`] ?? 0));
/** Five pencil dots, filled up to the level. */
export const pips = (level: number) => '●'.repeat(level) + '○'.repeat(REAL_MAX - level);

/** Multiplies the catch rate (drawing practice). */
export const catchBoost = (flags: Flags) => 1 + 0.03 * realLevel(flags, 'dessin');
/** The chance a wild Bestiole is sparkly (daydreaming at the window): 1 %, up to 3 %. */
export const shinyChance = (flags: Flags) => SHINY_CHANCE + 0.004 * realLevel(flags, 'fenetre');
/** Multiplies the experience won (reading). */
export const xpBoost = (flags: Flags) => 1 + 0.04 * realLevel(flags, 'livre');
/** Multiplies the prize money of trainer battles (pocket money). */
export const moneyBoost = (flags: Flags) => 1 + 0.05 * realLevel(flags, 'parents');

/** The real house's spots (their scripts, src/data/maps/dream.ts) and the activity each offers. */
export const ACTIVITY_SPOTS: Record<string, ActivityId> = { desk: 'dessin', fenetre: 'fenetre', livresReel: 'livre', papa: 'parents', mamanReelle: 'parents' };

/** The tiles that glow softly in the house: during a day there, until the day's thing is done, where a level can still grow. */
export function glowingSpots(def: { interact?: { x: number; y: number; script: string }[]; npcs?: { x: number; y: number; script?: string }[] }, flags: Flags) {
  if (!flags['reel:visite'] || flags['reel:fait']) return [];
  const open = (script?: string) => !!script && script in ACTIVITY_SPOTS && realLevel(flags, ACTIVITY_SPOTS[script]) < REAL_MAX;
  return [...(def.interact ?? []), ...(def.npcs ?? [])].filter((s) => open(s.script)).map(({ x, y }) => ({ x, y }));
}

/**
 * Whether a rest at an Inn wakes the player up at home: once a real day, after the ending, while a level can still
 * grow. (Being at an Inn after the ending means being back in Papeterre: games that ended before `reveil:dodo`
 * existed never had it set.)
 */
export const wakesAtHome = (flags: Flags, today: number) =>
  !!flags.ending && flags['reel:jour'] !== today && ACTIVITIES.some((a) => realLevel(flags, a.id) < REAL_MAX);
