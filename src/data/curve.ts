/**
 * The level curve: how strong a player's team is at each trainer of the story, without grinding.
 * The team fights every trainer on the way and the wild Bestioles it can't avoid (the tall grass it
 * has to cross, every step in a cave), catches its teammates where they live, and shares the XP
 * evenly (a player who rotates the team), each Bestiole with the catch-up factor of `xpYield`.
 * `npm run curve` prints it, `tools/balance.ts` fights at these levels and `curve.test.ts` keeps the
 * story's trainers within reach.
 */
import type { Difficulty } from '../state/prefs';
import { createMon, xpAt, xpYield, MAX_LEVEL, type Mon } from '../engine/pk/creature';
import { footprint } from '../overworld/buildings';
import { LEGEND, type MapDef } from '../overworld/mapTypes';
import { TILES } from '../overworld/tiles';
import { meanSteps } from '../overworld/encounterRate';
import { MAPS } from './maps';
import { rivalFinalTeam, rivalLacTeam, TRAINERS, trainerLevel, type TrainerDef } from './trainers';

export interface CurveStep {
  map: string;
  /** For a map you cross: where you come in from and where you go (neighbouring map ids). */
  from?: string;
  to?: string;
  /** Teammates caught here (they join at the local wild level). */
  join?: number;
  /** Battles started by a story script rather than a trainer's sight (after the map's trainers). */
  fights?: string[];
}

/** The story's path on the way to each badge (optional places and trainers left out). */
export const CURVE_PATH: CurveStep[] = [
  { map: 'route1', from: 'bourg', to: 'ville', join: 1, fights: ['r1gomme'] },
  { map: 'atelierPastel' },
  { map: 'route2', from: 'ville', to: 'bois' },
  { map: 'bois', from: 'route2', to: 'plume', join: 1 },
  { map: 'atelierPlume' },
  { map: 'grotte1', from: 'ville', to: 'grotte2' },
  { map: 'grotte2', from: 'grotte1', to: 'port', join: 1 },
  { map: 'route3', from: 'plume', to: 'port' },
  { map: 'atelierAquarelle' },
  // the Lac des Couleurs: its islands, the blue spring's cave, then the rival
  { map: 'lac' },
  { map: 'sourceBleue', fights: ['rivalLac'] },
  { map: 'route4', from: 'port', to: 'feutre', join: 1 },
  { map: 'entrepot1' },
  { map: 'entrepot2' },
  { map: 'atelierFluo' },
  { map: 'montFusain1', from: 'feutre', to: 'montFusain2' },
  { map: 'montFusain2', from: 'montFusain1', to: 'braise' },
  { map: 'atelierBraise' },
  { map: 'route6', from: 'braise', to: 'paillette' },
  { map: 'atelierPaillette' },
  { map: 'tour1', from: 'bois', to: 'tour2' },
  { map: 'tour2', from: 'tour1', to: 'tour3' },
  { map: 'tour3' },
  { map: 'route7', from: 'paillette', to: 'gouache' },
  { map: 'atelierGouache' },
  { map: 'route8', from: 'gouache', to: 'encre' },
  { map: 'phare1' },
  { map: 'phare2' },
  { map: 'phare3', fights: ['buvard'] },
  { map: 'atelierEncre' },
  { map: 'usine1' },
  { map: 'usine2', fights: ['rature2'] },
  { map: 'usine3', fights: ['blanche2'] },
  // Act 4, beyond the margin
  { map: 'route9', from: 'encre', to: 'brouillon' },
  { map: 'esquisses', from: 'brouillon', to: 'forteresse1' },
  { map: 'forteresse1' },
  { map: 'forteresse2' },
  { map: 'forteresse3' },
  { map: 'routeBlanche', from: 'encre', to: 'bordPage', fights: ['rivalFinal'] },
  { map: 'bordPage', fights: ['effaceur'] },
];

/** Trainers you can walk around or that are extras (the strong cave guard, the tower's shadow). */
const OPTIONAL = new Set(['gardien', 'ombre']);
/** Team Gomme's officers and the finale: like the Atelier Masters, a boss may stand a little above the team. */
const ADMINS = new Set(['lacChef', 'rivalLac', 'rature', 'blanche', 'buvard', 'rature2', 'blanche2', 'buvard2', 'rature3', 'blanche3', 'rivalFinal', 'effaceur']);

/** A trainer of the path: the rival's lake and final teams are built by the story, the others are in TRAINERS. */
const trainerOf = (id: string): Pick<TrainerDef, 'party' | 'badge'> =>
  id === 'rivalFinal' ? { party: rivalFinalTeam('001'), badge: undefined } : id === 'rivalLac' ? { party: rivalLacTeam('001'), badge: undefined } : TRAINERS[id];

const solid = (def: MapDef, x: number, y: number, blocked: Set<string>) => {
  const row = def.rows[y];
  if (!row || x < 0 || x >= row.length || blocked.has(`${x},${y}`)) return true;
  return !!TILES[LEGEND[row[x]]]?.solid;
};

/**
 * The fewest encounter steps between the tiles where you come in from `from` and the warps to `to`:
 * tall-grass steps, or every step in a cave (`anyTile`). A 0-1 search over walkable tiles; ledges
 * can only be jumped going down. -1 when there is no way through.
 */
export function forcedSteps(mapId: string, from: string, to: string): number {
  const def = MAPS[mapId];
  const fromDef = MAPS[from];
  if (!def || !fromDef) return -1;
  // warps on the edges, and doors (a cave's mouth is a building)
  const links = (m: MapDef) => [
    ...(m.warps ?? []).flatMap((w) => (w.to === 'back' ? [] : [{ x: w.x, y: w.y, to: w.to }])),
    ...(m.buildings ?? []).flatMap((b) => (b.to ? [{ x: b.x + b.door, y: b.y + b.h - 1, to: b.to }] : [])),
  ];
  let starts = links(fromDef).filter((l) => l.to.map === mapId).map((l) => ({ x: l.to.x, y: l.to.y }));
  // a door run by a script (the tower's gate): start from this map's way back instead
  if (!starts.length) starts = links(def).filter((l) => l.to.map === from).map((l) => ({ x: l.x, y: l.y }));
  const goals = new Set(links(def).filter((l) => l.to.map === to).map((l) => `${l.x},${l.y}`));
  if (!starts.length || !goals.size) return -1;
  // buildings, and bushes, boulders and rocks: on the story's path the tool that clears them may not be in the bag yet
  const blocked = new Set([
    ...(def.buildings ?? []).flatMap((b) => footprint(b).filter((f) => !f.door).map((f) => `${f.x},${f.y}`)),
    ...(def.obstacles ?? []).map((o) => `${o.x},${o.y}`),
  ]);
  const cost = (x: number, y: number) => (def.encounters?.anyTile || TILES[LEGEND[def.rows[y][x]]]?.encounter ? 1 : 0);
  const best = new Map<string, number>();
  const dq: [number, number, number][] = starts.map((s) => [s.x, s.y, 0]);
  for (const s of starts) best.set(`${s.x},${s.y}`, 0);
  while (dq.length) {
    const [x, y, d] = dq.shift()!;
    if (d > (best.get(`${x},${y}`) ?? Infinity)) continue;
    if (goals.has(`${x},${y}`)) return d;
    for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) {
      let nx = x + dx, ny = y + dy;
      const t = TILES[LEGEND[def.rows[ny]?.[nx]]];
      if (t?.ledge) {
        if (dy !== 1) continue;
        ny += 1;
      } else if (solid(def, nx, ny, blocked)) continue;
      if (solid(def, nx, ny, blocked) && !goals.has(`${nx},${ny}`)) continue;
      const nd = d + cost(nx, ny);
      if (nd >= (best.get(`${nx},${ny}`) ?? Infinity)) continue;
      best.set(`${nx},${ny}`, nd);
      if (nd === d) dq.unshift([nx, ny, nd]);
      else dq.push([nx, ny, nd]);
    }
  }
  return -1;
}

/** Trainers of a map on the story's path, in the order you meet them (south to north, then west to east). */
export function pathTrainers(mapId: string): string[] {
  return (MAPS[mapId]?.npcs ?? [])
    .filter((n) => n.trainer && TRAINERS[n.trainer] && !OPTIONAL.has(n.trainer))
    .sort((a, b) => b.y - a.y || a.x - b.x)
    .map((n) => n.trainer!);
}

export interface CurveRow {
  map: string;
  trainer: string;
  /** Its strongest Bestiole at this difficulty. */
  ace: number;
  leader: boolean;
  /** An Atelier Master or a Team Gomme admin. */
  boss: boolean;
  /** The team's levels when you meet it: the starter first. */
  starter: number;
  mates: number[];
}

export interface Curve {
  rows: CurveRow[];
  /** Wild battles you can't avoid, per map crossed. */
  wild: Record<string, number>;
}

const levelOf = (xp: number) => {
  let l = 1;
  while (l < MAX_LEVEL && xpAt(l + 1) <= xp) l++;
  return l;
};

/** Walks the path; the starter begins at L5 after the lab battle (a L4 rival). */
export function curve(difficulty: Difficulty = 'normal'): Curve {
  const team: { xp: number }[] = [{ xp: xpAt(5) }];
  const rows: CurveRow[] = [];
  const wild: Record<string, number> = {};
  // a defeated (or caught) Bestiole's XP, shared evenly, each share scaled by its earner's level
  const win = (foe: Mon) => {
    for (const m of team) m.xp += Math.floor(xpYield(foe, team.length, levelOf(m.xp)));
  };
  win(createMon('003', 4, { rng: 1 }));
  for (const step of CURVE_PATH) {
    const def = MAPS[step.map];
    const table = (def?.encounters?.table ?? []).filter((e) => (!e.time || e.time === 'day') && !e.if);
    const avg = table.length ? Math.round(table.reduce((s, e) => s + (e.min + e.max) / 2, 0) / table.length) : 0;
    const typical = table.length ? [...table].sort((a, b) => b.w - a.w)[0].id : '';
    if (step.from && step.to && def?.encounters) {
      const n = Math.max(0, forcedSteps(step.map, step.from, step.to)) / meanSteps(def.encounters.rate);
      wild[step.map] = Math.round(n * 10) / 10;
      for (let k = 0; k < Math.round(n); k++) win(createMon(typical, avg, { rng: k }));
    }
    for (let j = 0; j < (step.join ?? 0) && typical; j++) {
      // catching it counts as a win, then it joins at its own level
      win(createMon(typical, avg, { rng: 99 }));
      team.push({ xp: xpAt(avg) });
    }
    for (const id of [...pathTrainers(step.map), ...(step.fights ?? [])]) {
      const t = trainerOf(id);
      rows.push({
        map: step.map, trainer: id, leader: !!t.badge, boss: !!t.badge || ADMINS.has(id),
        ace: Math.max(...t.party.map((p) => trainerLevel(p.level, difficulty))),
        starter: levelOf(team[0].xp), mates: team.slice(1).map((m) => levelOf(m.xp)),
      });
      for (const p of t.party) win(createMon(p.species, trainerLevel(p.level, difficulty), { rng: 7 }));
    }
  }
  return { rows, wild };
}
