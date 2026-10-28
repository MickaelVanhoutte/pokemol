import { L } from '../../i18n';
import type { TrainerDef } from '../trainers';

/** The trainers of the Atelier Plume (Village-Plume) besides its Master (TRAINERS, src/data/trainers.ts, merges them). */
export const TEAMS: TrainerDef[] = [
  {
    id: 'plumeT3', name: L('Cerf-voliste Lou', 'Kite Flyer Lou'), party: [{ species: '005', level: 10 }, { species: '013', level: 11 }], money: 300,
    before: [L('Sur mon perchoir, le vent me décoiffe toute la journée. Et toi, tu tiens debout ?', 'On my perch the wind ruffles my hair all day long. And you, can you keep your feet?')],
    after: [L('Mon cerf-volant s’est envolé… avec ma victoire.', 'My kite flew away… and my win with it.')],
  },
  {
    id: 'plumeT4', name: L('Apprenti Hector', 'Apprentice Hector'), party: [{ species: '016', level: 10 }, { species: '013', level: 11 }], money: 340,
    before: [L('Je fais la sieste à côté du Maître : c’est ça, l’entraînement ! … Hein ? Un combat ?', 'I nap next to the Master: that’s my training! … Huh? A battle?')],
    after: [L('Bon, je retourne m’entraîner. Bonne nuit !', 'Right, back to training. Good night!')],
  },
];
