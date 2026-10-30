import type { LText } from '../i18n';
import type { Place } from '../save/schema';
import { MAPS } from './maps';

export type CellKind = 'town' | 'route' | 'cave' | 'tower' | 'building' | 'lake';
export interface Rect { x: number; y: number; w: number; h: number }
export interface WorldCell {
  kind: CellKind;
  /** Cells covered on the Town Map: one rect, or two for an L-shaped route. */
  rects: Rect[];
  /** Pencil Balloon landing tile: by the town's balloon, next to its basket (src/data/balloons.ts). */
  fly?: { x: number; y: number };
  /** Another floor of this place: not a separate stop for the map cursor. */
  of?: string;
}

/** Size of the Town Map grid (cells). */
export const WORLD_W = 24;
export const WORLD_H = 20;

const at = (x: number, y: number, w = 1, h = 1): Rect[] => [{ x, y, w, h }];

/**
 * Papeterre on one sheet: the south (home) at the bottom, the Edge of the Page at the top.
 * Positions follow the real exits of every map (tested in worldmap.test.ts). In story order: the
 * balloon lists the `fly` towns in this order.
 */
export const WORLD: Record<string, WorldCell> = {
  bourg: { kind: 'town', rects: at(11, 18), fly: { x: 7, y: 6 } },
  route1: { kind: 'route', rects: at(11, 15, 1, 3) },
  ville: { kind: 'town', rects: at(11, 14), fly: { x: 8, y: 8 } },
  route2: { kind: 'route', rects: at(7, 14, 4, 1) },
  bois: { kind: 'route', rects: at(5, 13, 2, 2) },
  tour1: { kind: 'tower', rects: at(4, 13) },
  tour2: { kind: 'tower', rects: at(4, 13), of: 'tour1' },
  tour3: { kind: 'tower', rects: at(4, 13), of: 'tour1' },
  plume: { kind: 'town', rects: at(6, 12), fly: { x: 4, y: 6 } },
  route3: { kind: 'route', rects: [{ x: 7, y: 12, w: 9, h: 1 }, { x: 15, y: 13, w: 1, h: 1 }] },
  grotte1: { kind: 'cave', rects: at(12, 14, 2, 1) },
  grotte2: { kind: 'cave', rects: at(14, 14), of: 'grotte1' },
  port: { kind: 'town', rects: at(15, 14, 3, 1), fly: { x: 15, y: 10 } },
  route4: { kind: 'route', rects: at(17, 12, 1, 2) },
  feutre: { kind: 'town', rects: at(17, 11), fly: { x: 11, y: 9 } },
  entrepot1: { kind: 'building', rects: at(16, 11) },
  entrepot2: { kind: 'building', rects: at(16, 11), of: 'entrepot1' },
  montFusain1: { kind: 'cave', rects: at(17, 10) },
  montFusain2: { kind: 'cave', rects: at(18, 10), of: 'montFusain1' },
  braise: { kind: 'town', rects: at(18, 9), fly: { x: 8, y: 6 } },
  route6: { kind: 'route', rects: at(18, 8) },
  paillette: { kind: 'town', rects: at(18, 7), fly: { x: 8, y: 6 } },
  route7: { kind: 'route', rects: at(18, 6) },
  gouache: { kind: 'town', rects: at(18, 5), fly: { x: 8, y: 6 } },
  route8: { kind: 'route', rects: at(18, 4) },
  ratures1: { kind: 'cave', rects: at(17, 4) },
  ratures2: { kind: 'cave', rects: at(17, 4), of: 'ratures1' },
  ratures3: { kind: 'cave', rects: at(17, 4), of: 'ratures1' },
  encre: { kind: 'town', rects: at(18, 3), fly: { x: 8, y: 6 } },
  usine1: { kind: 'building', rects: at(19, 3) },
  usine2: { kind: 'building', rects: at(19, 3), of: 'usine1' },
  usine3: { kind: 'building', rects: at(19, 3), of: 'usine1' },
  // Act 4: west of Cité-Encre, beyond the margin
  route9: { kind: 'route', rects: at(13, 3, 5, 1) },
  brouillon: { kind: 'town', rects: at(12, 3), fly: { x: 8, y: 8 } },
  esquisses: { kind: 'route', rects: at(9, 3, 3, 2) },
  forteresse1: { kind: 'tower', rects: at(8, 4) },
  forteresse2: { kind: 'tower', rects: at(8, 4), of: 'forteresse1' },
  forteresse3: { kind: 'tower', rects: at(8, 4), of: 'forteresse1' },
  routeBlanche: { kind: 'route', rects: at(18, 2) },
  bordPage: { kind: 'town', rects: at(17, 1, 3, 1) },
  galerie: { kind: 'town', rects: at(18, 0), fly: { x: 7, y: 9 } },
  // reached by the ferry from Port-Aquarelle
  phareIle: { kind: 'tower', rects: at(16, 16) },
  // farther south, seen only once the Bestiodex is complete (the ferry again)
  ilePage: { kind: 'route', rects: at(18, 18) },
  // the Piste Cyclable runs down the east side, from Gouache to Ville-Feutre
  piste: { kind: 'route', rects: [{ x: 19, y: 5, w: 1, h: 6 }, { x: 18, y: 11, w: 2, h: 1 }] },
  grotteEchos: { kind: 'cave', rects: at(19, 4) },
  // north of Village-Plume, up its river: the Lac des Couleurs, and the hidden valley through the tunnel under it
  lac: { kind: 'lake', rects: at(3, 6, 8, 6) },
  vallon: { kind: 'route', rects: at(1, 8, 2, 3) },
  // the depths under the water, dived to with the Bocal-Scaphandre
  lacFonds: { kind: 'lake', rects: at(3, 6, 8, 6), of: 'lac' },
  portFonds: { kind: 'town', rects: at(15, 14, 3, 1), of: 'port' },
  phareFonds: { kind: 'tower', rects: at(16, 16), of: 'phareIle' },
  encreFonds: { kind: 'town', rects: at(18, 3), of: 'encre' },
};

/** Maps with no place on the Town Map (the real house of the ending). */
export const UNMAPPED = new Set(['chambre', 'salon']);

/** Towns the Pencil Balloon can land in, in story order. */
export const TOWNS: { map: string; name: LText; x: number; y: number }[] = Object.entries(WORLD)
  .flatMap(([map, c]) => (c.fly ? [{ map, name: MAPS[map].name, ...c.fly }] : []));

const exitsOf = (id: string) => (MAPS[id].warps ?? []).flatMap((w) => (w.to === 'back' ? [] : [w.to.map]));
const doorsOf = (id: string) => [...(MAPS[id].buildings ?? []).flatMap((b) => (b.to ? [b.to.map] : [])), ...exitsOf(id)];

/** Map not on the grid → the map that holds its door (its own exit first, else whoever has a door into it). */
const PARENT: Record<string, string> = {};
for (const def of Object.values(MAPS)) {
  if (WORLD[def.id] || def.generic || UNMAPPED.has(def.id)) continue;
  const out = exitsOf(def.id);
  const into = Object.keys(MAPS).filter((p) => p !== def.id && doorsOf(p).includes(def.id));
  const pick = [...out, ...into].find((id) => WORLD[id]) ?? out[0] ?? into[0];
  if (pick) PARENT[def.id] = pick;
}

/** Place on the Town Map for a map; shared interiors (Inn, shop) use the door they were entered by. */
export function regionOf(mapId: string, returnTo?: Pick<Place, 'map'>): string | null {
  const seen = new Set<string>();
  for (let id: string | undefined = mapId; id && !seen.has(id); ) {
    if (WORLD[id]) return id;
    seen.add(id);
    id = MAPS[id]?.generic ? returnTo?.map : PARENT[id];
  }
  return null;
}

/**
 * Where to blink the player on the Town Map, in grid cells (centre of a cell). Outdoors the spot
 * follows the player inside a long route or a wide town; indoors it is the building's place.
 */
export function playerSpot(p: Pick<Place, 'map' | 'x' | 'y'> & { returnTo?: Pick<Place, 'map'> }): { place: string; x: number; y: number } | null {
  const place = regionOf(p.map, p.returnTo);
  if (!place) return null;
  const cell = WORLD[place];
  let r = cell.rects[0];
  if (place === p.map) {
    const def = MAPS[p.map];
    const fx = p.x / def.rows[0].length, fy = p.y / def.rows.length;
    // L-shaped routes: the second rect is the far end of the route
    if (cell.rects.length > 1 && fy > 0.5) r = cell.rects[1];
    return { place, x: r.x + Math.min(r.w - 1, Math.floor(fx * r.w)) + 0.5, y: r.y + Math.min(r.h - 1, Math.floor(fy * r.h)) + 0.5 };
  }
  return { place, x: r.x + r.w / 2, y: r.y + r.h / 2 };
}

/** Town of the map where a trainer stands (Atelier Masters → their town). */
export const townOfTrainer = (trainerId: string) => {
  const map = Object.values(MAPS).find((m) => m.npcs?.some((n) => n.trainer === trainerId));
  return map ? regionOf(map.id) : null;
};

/** The place a map belongs to for the cursor and its name (other floors point to the first one). */
export const placeOf = (id: string) => WORLD[id]?.of ?? id;
