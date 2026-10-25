import { nextRandom, pickWeighted, randomInt, shuffle } from '../rng';

export type NodeKind = 'combat' | 'elite' | 'rest' | 'shop' | 'event' | 'treasure' | 'wild' | 'boss';

export interface MapNode {
  id: number;
  row: number;
  /** Horizontal position 0..LANES-1. */
  col: number;
  kind: NodeKind;
  next: number[];
}

export interface DungeonMap {
  rows: number;
  nodes: MapNode[];
}

export interface RunMember {
  defId: string;
  level: number;
  hp: number;
}

/** Pending choice the run screen must show when resumed. */
export type RunPending =
  | { kind: 'reward'; cards: string[]; coins: number; glitter: number; talisman?: string }
  | { kind: 'treasure'; talisman: string }
  | { kind: 'event'; event: string }
  | { kind: 'shop'; cards: string[]; sold: number[] }
  | { kind: 'rest' }
  | { kind: 'victory'; keep: string | null }
  | { kind: 'defeat' };

export interface RunState {
  dungeonId: string;
  seed: number;
  rng: number;
  map: DungeonMap;
  /** Current node id, null before the first step. */
  at: number | null;
  visited: number[];
  team: RunMember[];
  deck: string[];
  gained: string[];
  talismans: string[];
  coins: number;
  glitter: number;
  captured: string[];
  /** XP earned so far, shared by the run team when the run ends. */
  xp: number;
  pending: RunPending | null;
}

export const LANES = 4;

const WEIGHTS: [NodeKind, number][] = [
  ['combat', 46], ['event', 14], ['wild', 10], ['shop', 8], ['rest', 10], ['elite', 8], ['treasure', 4],
];

/**
 * Builds a Slay-the-Spire-like map: `rows` rows of 2–4 nodes, every node reachable,
 * each row linked to the next by non-crossing edges, then a boss row.
 */
export function generateMap(seed: number, rows: number): DungeonMap {
  const st = { rng: seed >>> 0 };
  const nodes: MapNode[] = [];
  const byRow: MapNode[][] = [];
  for (let r = 0; r < rows; r++) {
    const count = r === 0 ? 3 : 2 + randomInt(st, LANES - 1);
    const cols = shuffle(st, Array.from({ length: LANES }, (_, i) => i)).slice(0, count).sort((a, b) => a - b);
    const row = cols.map((col) => {
      let kind: NodeKind;
      if (r === 0) kind = 'combat';
      else if (r === rows - 1) kind = 'rest';
      else if (r === Math.floor(rows / 2)) kind = nextRandom(st) < 0.5 ? 'treasure' : 'elite';
      else kind = pickWeighted(st, WEIGHTS.filter(([k]) => !(r < 2 && (k === 'elite' || k === 'shop'))), ([, w]) => w)[0];
      const n: MapNode = { id: nodes.length, row: r, col, kind, next: [] };
      nodes.push(n);
      return n;
    });
    byRow.push(row);
  }
  const boss: MapNode = { id: nodes.length, row: rows, col: 1.5, kind: 'boss', next: [] };
  nodes.push(boss);

  // non-crossing links: walk both rows left→right like a merge
  for (let r = 0; r < rows - 1; r++) {
    const a = byRow[r], b = byRow[r + 1];
    let i = 0, j = 0;
    a[0].next.push(b[0].id);
    while (i < a.length - 1 || j < b.length - 1) {
      const canI = i < a.length - 1, canJ = j < b.length - 1;
      if (canI && canJ) {
        const step = nextRandom(st);
        if (step < 0.4) i++;
        else if (step < 0.8) j++;
        else { i++; j++; }
      } else if (canI) i++;
      else j++;
      if (!a[i].next.includes(b[j].id)) a[i].next.push(b[j].id);
    }
  }
  byRow[rows - 1].forEach((n) => n.next.push(boss.id));
  return { rows: rows + 1, nodes };
}

/** Nodes the player may step on next. */
export function reachable(run: RunState): number[] {
  if (run.at === null) return run.map.nodes.filter((n) => n.row === 0).map((n) => n.id);
  return run.map.nodes[run.at].next;
}
