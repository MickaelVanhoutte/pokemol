/**
 * The Progress page of the trainer card: tracks of milestones (Bestiodex, Ateliers, trainers, and after the
 * story the rematches, the Grand Concours and the tower), each with a reward the player collects there. A
 * collected milestone sets the flag `prix:<track>:<id>`. Rewards grow along the way: balls and potions first,
 * then held items (no shop sells them), biscuit packs, Magic Lollipops and the last four stencils.
 */
import { L, type LText } from '../i18n';
import type { SaveData } from '../save/schema';
import { BADGES } from './badges';
import { CREATURES, dexCount } from './creatures';
import { TRAINERS } from './trainers';

export interface Reward { item: string; n: number }
export interface Milestone {
  /** Stable id inside its track (the flag is `prix:<track>:<id>`). */
  id: string;
  goal: number;
  reward: Reward[];
  /** In place of the track's « {n} … » line. */
  label?: LText;
}
export interface Track {
  id: string;
  name: LText;
  /** « Attrape {n} Bestioles »: {n} is the milestone's goal. */
  label: LText;
  count: (s: SaveData) => number;
  /** Only shown once the story is over. */
  post?: boolean;
  steps: Milestone[];
}

const at = (goal: number, reward: Reward[], label?: LText): Milestone => ({ id: String(goal), goal, reward, label });
const of = (item: string, n = 1): Reward => ({ item, n });
/** One biscuit of each stat (n of each). */
export const biscuits = (n = 1): Reward[] => ['pv', 'attaque', 'defense', 'atq-spe', 'def-spe', 'vitesse'].map((s) => of(`biscuit-${s}`, n));

/** Every species but the player's own counts for the Bestiodex. */
export const DEX_GOAL = CREATURES.length;

const leaders = BADGES.map((b) => Object.values(TRAINERS).find((t) => t.badge === b.id)!.id);

export const TRACKS: Track[] = [
  {
    id: 'dex', name: L('Bestiodex', 'Critterdex'), label: L('Attrape {n} Bestioles', 'Catch {n} Critters'),
    count: (s) => dexCount(s.dex.caught),
    steps: [
      at(5, [of('crayon-ball', 5)]),
      at(10, [of('potion', 5)]),
      at(20, [of('super-crayon-ball', 5)]),
      at(30, [of('plume-vive')]),
      at(40, [of('rappel', 3)]),
      at(50, [of('clochette')]),
      at(60, biscuits()),
      at(70, [of('ruban-tenace')]),
      at(80, [of('sucette-magique', 3)]),
      at(90, [of('lunettes-tetues')]),
      at(100, [of('pochoir-21')]),
      { id: 'tout', goal: DEX_GOAL, reward: [of('sucette-magique', 5)], label: L('Complète le Bestiodex', 'Complete the Critterdex') },
    ],
  },
  {
    id: 'aventure', name: L('Aventure', 'Adventure'), label: L('Gagne {n} badges', 'Win {n} badges'),
    // the end of the story comes after the eighth badge
    count: (s) => Math.min(8, BADGES.filter((b) => s.badges.includes(b.id)).length) + (s.flags.ending ? 1 : 0),
    steps: [
      at(1, [of('retouche', 3)], L('Gagne ton premier badge', 'Win your first badge')),
      at(2, [of('super-potion', 3)]),
      at(3, [of('rappel', 2)]),
      at(4, [of('couronne-carton')]),
      at(5, [of('casque-pointes')]),
      at(6, [of('bandeau-tetu')]),
      at(7, [of('echarpe-tetue')]),
      at(8, [of('tablier-peintre')], L('Gagne les 8 badges', 'Win all 8 badges')),
      { id: 'fin', goal: 9, reward: [of('pochoir-22'), of('sucette-magique', 3)], label: L('Termine l’histoire', 'Finish the story') },
    ],
  },
  {
    id: 'dresseurs', name: L('Dresseurs', 'Trainers'), label: L('Bats {n} dresseurs', 'Beat {n} trainers'),
    count: (s) => Object.keys(TRAINERS).filter((id) => s.flags[`tr:${id}`]).length,
    steps: [
      at(10, [of('crayon-ball', 10)]),
      at(25, [of('super-potion', 5)]),
      at(40, [of('crayon-ciel')]),
      at(55, [of('loupe')]),
      at(70, [of('crayon-marron')]),
      at(85, [of('bille-ardente')]),
      at(100, [of('crayon-ocre')]),
    ],
  },
  {
    id: 'revanches', name: L('Revanches', 'Rematches'), post: true,
    label: L('Rebats {n} Maîtres d’Atelier', 'Beat {n} Atelier Masters again'),
    count: (s) => leaders.filter((id) => s.flags[`rematch:${id}`]).length,
    steps: [
      at(1, [of('crayon-lilas')], L('Rebats un Maître d’Atelier', 'Beat an Atelier Master again')),
      at(4, biscuits()),
      at(8, [of('pochoir-23'), of('sucette-magique', 3)], L('Rebats les 8 Maîtres d’Atelier', 'Beat all 8 Atelier Masters again')),
    ],
  },
  {
    id: 'concours', name: L('Grand Concours', 'Grand Contest'), post: true,
    label: L('Remporte le Grand Concours {n} fois', 'Win the Grand Contest {n} times'),
    count: (s) => s.hallOfFame?.length ?? 0,
    steps: [
      at(1, [of('pochoir-24')], L('Remporte le Grand Concours', 'Win the Grand Contest')),
      at(3, biscuits(2)),
      at(5, [of('sucette-magique', 5)]),
    ],
  },
  {
    id: 'tour', name: L('Tour des Défis', 'Challenge Tower'), post: true,
    label: L('Gagne {n} combats d’affilée à la Tour', 'Win {n} battles in a row at the Tower'),
    count: (s) => s.tower?.best ?? 0,
    steps: [
      at(7, [of('sucette-magique', 2)]),
      at(14, biscuits()),
      at(21, [of('sucette-magique', 5)]),
    ],
  },
];

export const prizeFlag = (track: string, step: string) => `prix:${track}:${step}`;

/** The tracks this save shows: the post-game ones once the story is over. */
export const tracksFor = (s: SaveData) => TRACKS.filter((t) => !t.post || !!s.flags.ending);

export interface TrackState {
  track: Track;
  count: number;
  /** The first milestone not collected yet (null when all are). */
  next: Milestone | null;
  /** That milestone is reached: its reward waits to be collected. */
  ready: boolean;
  /** Milestones collected. */
  done: number;
}

export function trackState(s: SaveData, track: Track): TrackState {
  const count = track.count(s);
  const next = track.steps.find((m) => !s.flags[prizeFlag(track.id, m.id)]) ?? null;
  const done = track.steps.filter((m) => s.flags[prizeFlag(track.id, m.id)]).length;
  return { track, count, next, ready: !!next && count >= next.goal, done };
}

/** Rewards reached and not collected yet, over every shown track. */
export const waiting = (s: SaveData) =>
  tracksFor(s).reduce((n, t) => n + t.steps.filter((m) => t.count(s) >= m.goal && !s.flags[prizeFlag(t.id, m.id)]).length, 0);

/** Collects a track's next reward when it is reached; returns it (or null). */
export function collect(s: SaveData, trackId: string, add: (s: SaveData, item: string, n: number) => void): Milestone | null {
  const track = TRACKS.find((t) => t.id === trackId);
  if (!track || (track.post && !s.flags.ending)) return null;
  const st = trackState(s, track);
  if (!st.ready || !st.next) return null;
  s.flags[prizeFlag(track.id, st.next.id)] = 1;
  for (const r of st.next.reward) add(s, r.item, r.n);
  return st.next;
}
