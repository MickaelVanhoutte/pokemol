import type { Dir } from '../save/schema';
import type { Look } from '../overworld/sprites';

/**
 * The Pencil Balloon moored by each town's Inn (by the house in Bourg-Gribouille): its basket's left tile (two
 * tiles wide, solid; the envelope rises two tiles above it) and its pilot standing by it. The player lands on the
 * town's `fly` tile in `WORLD` (src/data/worldmap.ts), next to the basket. `src/data/maps/index.ts` puts both on
 * the town's map; the flight itself is `scripts.balloon` (src/story/act3.ts).
 */
export interface Balloon {
  basket: { x: number; y: number };
  pilot: { x: number; y: number; facing: Dir };
}

export const PILOT_LOOK: Look = { hair: '#c0582a', shirt: '#f2c14e', pants: '#5a3a20', hat: '#d64545' };

export const BALLOONS: Record<string, Balloon> = {
  bourg: { basket: { x: 7, y: 5 }, pilot: { x: 9, y: 5, facing: 'left' } },
  ville: { basket: { x: 8, y: 7 }, pilot: { x: 10, y: 7, facing: 'left' } },
  plume: { basket: { x: 2, y: 6 }, pilot: { x: 1, y: 6, facing: 'right' } },
  port: { basket: { x: 15, y: 9 }, pilot: { x: 17, y: 9, facing: 'left' } },
  feutre: { basket: { x: 11, y: 8 }, pilot: { x: 13, y: 8, facing: 'left' } },
  braise: { basket: { x: 8, y: 5 }, pilot: { x: 10, y: 5, facing: 'left' } },
  paillette: { basket: { x: 8, y: 5 }, pilot: { x: 10, y: 5, facing: 'left' } },
  gouache: { basket: { x: 8, y: 5 }, pilot: { x: 10, y: 5, facing: 'left' } },
  encre: { basket: { x: 8, y: 5 }, pilot: { x: 10, y: 5, facing: 'left' } },
  brouillon: { basket: { x: 8, y: 7 }, pilot: { x: 10, y: 7, facing: 'left' } },
  galerie: { basket: { x: 7, y: 8 }, pilot: { x: 9, y: 8, facing: 'left' } },
};
