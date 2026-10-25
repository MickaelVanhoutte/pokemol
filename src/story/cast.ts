import { L } from '../i18n';
import { save } from '../state/game';

/** Speaker names shown above dialog boxes. */
export const PROF = L('Prof. Fusain', 'Prof. Charcoal');
export const MOM = L('Maman', 'Mom');
export const RIVAL = L('{rival}', '{rival}');
export const NURSE = L('Infirmière', 'Nurse');
export const GRUNT = L('Sbire Gomme', 'Eraser Grunt');

export const hasTeam = () => (save.value?.party.length ?? 0) > 0;
