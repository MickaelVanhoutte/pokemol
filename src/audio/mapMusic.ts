import type { MapDef } from '../overworld/mapTypes';
import type { TrackId } from './music';

const BY_MAP: Record<string, TrackId> = {
  routeBlanche: 'edge', bordPage: 'edge', chambre: 'ending',
  entrepot1: 'gomme', entrepot2: 'gomme', usine1: 'gomme', usine2: 'gomme', usine3: 'gomme',
  centre: 'center', boutique: 'center', tombola: 'center',
  phare1: 'gomme', phare2: 'gomme', phare3: 'gomme',
};

/** Which tune plays on a map: towns and houses, routes, caves and towers, Team Gomme hideouts… */
export function trackForMap(def: MapDef): TrackId {
  if (BY_MAP[def.id]) return BY_MAP[def.id];
  if (def.backdrop === 'cave' || def.backdrop === 'tower' || def.border === 'cavewall') return 'cave';
  if (def.onEnter === 'visitTown' || def.indoor) return 'town';
  return 'route';
}
