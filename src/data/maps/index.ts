import type { MapDef } from '../../overworld/mapTypes';
import { HOME_MAPS } from './home';
import { PASTEL_MAPS } from './pastel';
import { PLUME_MAPS } from './plume';
import { INTERIOR_MAPS } from './interiors';
import { DUNGEON_MAPS } from './dungeons';
import { AQUARELLE_MAPS } from './aquarelle';
import { FEUTRE_MAPS } from './feutre';
import { BRAISE_MAPS } from './braise';

/*
 * Legend: . grass  , grass2  " tall grass  : path  * flowers  ~ water  = bridge  e erased paper  T tree
 * B bush  # fence  S sign  M mailbox  R rock  _ ledge  s sand | f floor  W wall  w window  C counter
 * c carpet  X exit mat  b bookshelf  t table  p plant  P pc  h bed  v tv  m machine  H healer  U stairs
 * K cave wall  k cave floor  r cave rock  E cave exit  Q tower wall  o tower floor  D stairs down
 */
export const MAPS: Record<string, MapDef> = {
  ...HOME_MAPS,
  ...PASTEL_MAPS,
  ...PLUME_MAPS,
  ...INTERIOR_MAPS,
  ...DUNGEON_MAPS,
  ...AQUARELLE_MAPS,
  ...FEUTRE_MAPS,
  ...BRAISE_MAPS,
};
