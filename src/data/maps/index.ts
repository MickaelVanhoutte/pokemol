import type { MapDef } from '../../overworld/mapTypes';
import { HOME_MAPS } from './home';
import { PASTEL_MAPS } from './pastel';
import { PLUME_MAPS } from './plume';
import { INTERIOR_MAPS } from './interiors';
import { DUNGEON_MAPS } from './dungeons';
import { AQUARELLE_MAPS } from './aquarelle';
import { FEUTRE_MAPS } from './feutre';
import { BRAISE_MAPS } from './braise';
import { PAILLETTE_MAPS } from './paillette';
import { GOUACHE_MAPS } from './gouache';
import { ENCRE_MAPS } from './encre';
import { DREAM_MAPS } from './dream';
import { GALERIE_MAPS } from './galerie';
import { PHARE_MAPS } from './phare';
import { PISTE_MAPS } from './piste';
import { ECHOS_MAPS } from './echos';

/*
 * Legend: . grass  , grass2  " tall grass  : path  * flowers  ~ water  = bridge  e erased paper  T tree
 * B bush  # fence  S sign  M mailbox  R rock  _ ledge  s sand | f floor  W wall  w window  C counter
 * c carpet  X exit mat  b bookshelf  t table  p plant  P pc  h bed  v tv  m machine  H key rack  U stairs
 * K cave wall  k cave floor  r cave rock  E cave exit  Q tower wall  o tower floor  D stairs down
 * n blank paper  Y sketched tree  | notebook margin  q framed drawing
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
  ...PAILLETTE_MAPS,
  ...GOUACHE_MAPS,
  ...ENCRE_MAPS,
  ...DREAM_MAPS,
  ...GALERIE_MAPS,
  ...PHARE_MAPS,
  ...PISTE_MAPS,
  ...ECHOS_MAPS,
};
