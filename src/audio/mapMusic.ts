import type { MapDef } from '../overworld/mapTypes';
import type { Place } from '../save/schema';
import { regionOf } from '../data/worldmap';
import type { TrackId } from './music';

const BY_MAP: Record<string, TrackId> = {
  routeBlanche: 'edge', bordPage: 'edge', chambre: 'ending', salon: 'ending', ilePage: 'ending',
  entrepot1: 'gomme', entrepot2: 'gomme', usine1: 'gomme', usine2: 'gomme', usine3: 'gomme',
  centre: 'center', boutique: 'center', tombola: 'center',
  phare1: 'gomme', phare2: 'gomme', phare3: 'gomme',
  concours: 'atelier',
  // Act 4: the half-drawn places beyond the margin, then Team Gomme's fortress
  brouillon: 'edge', esquisses: 'edge', forteresse1: 'gomme', forteresse2: 'gomme', forteresse3: 'gomme',
};

/** Every town has its own theme, which also plays in its houses. */
const TOWN_THEMES: Record<string, TrackId> = {
  bourg: 'bourg', ville: 'pastel', plume: 'plume', port: 'port', feutre: 'feutre', braise: 'braise',
  paillette: 'paillette', gouache: 'gouache', encre: 'encre', galerie: 'galerie',
};

/**
 * Which tune plays on a map: the town's theme (in its houses too), the Atelier theme inside the
 * Ateliers, routes, caves and towers, Team Gomme hideouts… `returnTo` tells which town a shared
 * interior belongs to.
 */
export function trackForMap(def: MapDef, returnTo?: Pick<Place, 'map'>): TrackId {
  if (BY_MAP[def.id]) return BY_MAP[def.id];
  if (def.id.startsWith('atelier')) return 'atelier';
  if (TOWN_THEMES[def.id]) return TOWN_THEMES[def.id];
  if (def.backdrop === 'cave' || def.backdrop === 'tower' || def.border === 'cavewall') return 'cave';
  if (def.indoor) return TOWN_THEMES[regionOf(def.id, returnTo) ?? ''] ?? 'town';
  if (def.onEnter === 'visitTown') return 'town';
  return 'route';
}
