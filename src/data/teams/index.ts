import type { TrainerDef } from '../trainers';
import { TEAMS as PASTEL } from './pastel';
import { TEAMS as PLUME } from './plume';
import { TEAMS as AQUARELLE } from './aquarelle';
import { TEAMS as FEUTRE } from './feutre';
import { TEAMS as BRAISE } from './braise';
import { TEAMS as PAILLETTE } from './paillette';
import { TEAMS as GOUACHE } from './gouache';
import { TEAMS as ENCRE } from './encre';

/** The Ateliers' own trainers, one file per town so each can be worked on apart. */
export const ATELIER_TEAMS: TrainerDef[] = [...PASTEL, ...PLUME, ...AQUARELLE, ...FEUTRE, ...BRAISE, ...PAILLETTE, ...GOUACHE, ...ENCRE];
