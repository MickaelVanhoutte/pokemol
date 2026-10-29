import { L } from '../../i18n';
import type { TrainerDef } from '../trainers';

/** The trainers of the Atelier Braise (Village-Braise) besides its Master (TRAINERS, src/data/trainers.ts, merges them). */
export const TEAMS: TrainerDef[] = [
  {
    id: 'braiseT3', name: L('Apprenti Noé', 'Apprentice Noah'), party: [{ species: '076', level: 22 }, { species: '021', level: 23 }], money: 560,
    before: [L('Ma Bestiole fait griller les guimauves. Tu veux voir comment elle grille les adversaires ?', 'My Critter toasts marshmallows. Want to see how it toasts opponents?')],
    after: [L('Bon… je retourne aux guimauves.', 'Right… back to the marshmallows.')],
  },
  {
    id: 'braiseT4', name: L('Cracheuse de feu Lila', 'Fire-breather Lila'), party: [{ species: '080', level: 23 }, { species: '018', level: 23 }, { species: '021', level: 24 }], money: 660,
    before: [L('Pour voir Ambre, il faut passer à travers mes flammes !', 'To see Amber, you’ll have to get through my flames!')],
    after: [L('Tu as éteint mon feu d’artifice…', 'You put out my fireworks…')],
  },
];
